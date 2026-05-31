import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly OLLAMA_URL = 'http://localhost:11434/api/embeddings';
  private readonly EMBEDDING_MODEL = 'nomic-embed-text';

  /**
   * Generates a 768-dimensional vector embedding for a given text string.
   * Uses nomic-embed-text model running locally via Ollama.
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await axios.post(this.OLLAMA_URL, {
        model: this.EMBEDDING_MODEL,
        prompt: text,
      }, { timeout: 30000 });

      const embedding: number[] = response.data.embedding;
      if (!embedding || embedding.length !== 768) {
        this.logger.warn(`Unexpected embedding dimensions: ${embedding?.length}`);
        return null;
      }
      return embedding;
    } catch (error: any) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      return null;
    }
  }

  /**
   * Composes a rich semantic context string from event fields.
   */
  buildEventContext(event: {
    title: string;
    eventType: string;
    topic?: string | null;
    tags: string[];
    department?: string | null;
    venue?: string | null;
    description?: string | null;
  }): string {
    const parts = [
      event.title,
      event.eventType,
      event.topic,
      event.description,
      event.tags.join(', '),
      event.department,
      event.venue,
    ].filter(Boolean);
    return parts.join('. ');
  }
}
