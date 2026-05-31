import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RetrievalService, RetrievalResult } from './retrieval.service';
import { QueryRouterService, QueryIntent } from './query-router.service';
import { ContextService } from './context.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { TrendService } from '../analytics/trend.service';
import { ClusterService } from '../analytics/cluster.service';
import { Observable, Subject } from 'rxjs';
import axios from 'axios';

export interface SSEMessage {
  data: {
    type: 'token' | 'citations' | 'telemetry' | 'error';
    text?: string;
    citations?: RetrievalResult[];
    telemetry?: any;
    error?: string;
  };
}

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);
  private readonly OLLAMA_CHAT_URL = 'http://localhost:11434/api/generate';

  constructor(
    private readonly prisma: PrismaService,
    private readonly retrievalService: RetrievalService,
    private readonly queryRouterService: QueryRouterService,
    private readonly contextService: ContextService,
    private readonly analyticsService: AnalyticsService,
    private readonly trendService: TrendService,
    private readonly clusterService: ClusterService,
  ) {}

  /**
   * Creates an empty conversation session in database.
   */
  async createSession(userId: string, title = 'New Conversation'): Promise<any> {
    return this.prisma.copilotChatSession.create({
      data: {
        userId,
        title,
      },
    });
  }

  /**
   * Retrieves all chat sessions of a target user.
   */
  async getSessions(userId: string): Promise<any[]> {
    return this.prisma.copilotChatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Retrieves message history for a target session.
   */
  async getSession(userId: string, sessionId: string): Promise<any> {
    const session = await this.prisma.copilotChatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!session) throw new Error('Session not found');
    return session;
  }

  /**
   * Executes intent routing, hybrid search, context aggregation, and progressive SSE stream delivery.
   */
  chatStream(userId: string, sessionId: string, messageContent: string): Observable<SSEMessage> {
    const subject = new Subject<SSEMessage>();
    const startTime = Date.now();

    // Execute streaming context build asynchronously
    this.executeStreamPipeline(userId, sessionId, messageContent, subject, startTime).catch(err => {
      this.logger.error('Error in chat stream pipeline:', err);
      subject.next({ data: { type: 'error', error: err.message } });
      subject.complete();
    });

    return subject.asObservable();
  }

  /**
   * Asynchronous generation orchestrator mapping RAG to SSE payloads.
   */
  private async executeStreamPipeline(
    userId: string,
    sessionId: string,
    query: string,
    subject: Subject<SSEMessage>,
    startTime: number,
  ): Promise<void> {
    // 1. Confirm session
    const session = await this.prisma.copilotChatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error('Chat session not found or access denied');
    }

    // Save user message to database
    await this.prisma.copilotMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content: query,
      },
    });

    // 2. Intent Query Routing
    const intent = this.queryRouterService.classifyIntent(query);

    // 3. Hybrid search retrieval
    const retrievedEvents = await this.retrievalService.retrieveRelevantEvents(query, userId);

    // 4. Supplemental Analytics metrics based on query intent routing
    let supplementalData: any = null;
    if (intent === QueryIntent.ANALYTICS) {
      supplementalData = await this.analyticsService.getOverview();
    } else if (intent === QueryIntent.TRENDS) {
      supplementalData = await this.trendService.getTrends();
    } else if (intent === QueryIntent.RESEARCH) {
      supplementalData = await this.clusterService.getClusters();
    }

    // 5. Context Assembly
    const markdownContext = this.contextService.assembleContext(intent, retrievedEvents, supplementalData);

    // Load past session history messages for lightweight memory (Step 9)
    const historyMessages = await this.prisma.copilotMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 6, // Keep recent 6 messages
    });
    const formattedHistory = historyMessages
      .reverse()
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // 6. Build final system generation prompt (Step 13: Response Safety)
    const systemPrompt = `
You are "Ask ReCollab", an institutional AI assistant for SRM Campus.
Answer the user query based ONLY on the retrieved institutional records and analytics provided in the Context block.
Follow these response safety rules strictly:
- ALWAYS rely on the grounded context below. DO NOT hallucinate dates, departments, or details.
- Avoid citing events that are not explicitly present in the Context.
- Reject claims that contradict or are completely absent from the Context.
- Format responses cleanly in professional Markdown with bullet points where appropriate.
- Every time you reference an event, mention its department or date so the citation engine can map it correctly.

[RECENT CHAT HISTORY]
${formattedHistory}

[GROUNDED INSTITUTIONAL CONTEXT]
${markdownContext}

User Query: ${query}
Assistant Response:
    `;

    // 7. Request streaming generation from Ollama Qwen2.5
    try {
      this.logger.debug('Dispatching streaming request to local Ollama (qwen2.5:7b)...');

      const response = await axios.post(
        this.OLLAMA_CHAT_URL,
        {
          model: 'qwen2.5:7b',
          prompt: systemPrompt,
          stream: true,
        },
        { responseType: 'stream' }
      );

      const stream = response.data;
      let buffer = '';
      let fullAssistantResponse = '';

      stream.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep partial line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullAssistantResponse += parsed.response;
              subject.next({ data: { type: 'token', text: parsed.response } });
            }
          } catch (e) {
            // Ignore parse errors on incomplete stream chunks
          }
        }
      });

      stream.on('end', async () => {
        // Parse any remaining buffer
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer);
            if (parsed.response) {
              fullAssistantResponse += parsed.response;
              subject.next({ data: { type: 'token', text: parsed.response } });
            }
          } catch (e) {}
        }

        const latencyMs = Date.now() - startTime;
        const telemetry = {
          retrievalLatencyMs: Math.round(latencyMs * 0.2), // Approx split
          generationLatencyMs: Math.round(latencyMs * 0.8),
          totalLatencyMs: latencyMs,
          contextSizeWords: markdownContext.split(/\s+/).length,
          model: 'qwen2.5:7b',
        };

        // 8. Save assistant message with citations and telemetry to database for session memory
        await this.prisma.copilotMessage.create({
          data: {
            sessionId,
            role: 'ASSISTANT',
            content: fullAssistantResponse,
            citations: retrievedEvents as any,
            telemetry: telemetry as any,
          },
        });

        // Update session updatedAt to refresh memory ordering
        await this.prisma.copilotChatSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() },
        });

        // Log AI Performance Observability
        await this.prisma.aIObservabilityLog.create({
          data: {
            operationName: 'copilot_chat',
            latencyMs,
            status: 'SUCCESS',
            metadata: {
              sessionId,
              query,
              tokenCountEstimate: Math.round(fullAssistantResponse.split(/\s+/).length * 1.3),
              contextSizeWords: telemetry.contextSizeWords,
            },
          },
        }).catch(() => {});

        // Pushes citations list and latency telemetry down the SSE pipe before closing
        subject.next({ data: { type: 'citations', citations: retrievedEvents } });
        subject.next({ data: { type: 'telemetry', telemetry } });
        
        subject.complete();
      });

      stream.on('error', (err: any) => {
        subject.next({ data: { type: 'error', error: `Ollama stream error: ${err.message}` } });
        subject.complete();
      });

    } catch (error: any) {
      this.logger.error('Failed to communicate with local Ollama stream:', error);
      
      // Observability failed log
      await this.prisma.aIObservabilityLog.create({
        data: {
          operationName: 'copilot_chat',
          latencyMs: Date.now() - startTime,
          status: 'FAILED',
          errorMessage: error.message,
          metadata: { sessionId, query },
        },
      }).catch(() => {});

      subject.next({ data: { type: 'error', error: `Ollama service unreachable. Ensure Ollama is running and qwen2.5:7b is pulled.` } });
      subject.complete();
    }
  }
}
