import { Injectable, Logger } from '@nestjs/common';
import { RetrievalResult } from './retrieval.service';
import { QueryIntent } from './query-router.service';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  /**
   * Deduplicates events and assembles a structured markdown context injection block.
   */
  assembleContext(
    intent: QueryIntent,
    events: RetrievalResult[],
    analyticsData?: any,
  ): string {
    const contextParts: string[] = [];

    // 1. Enforce Event Context injection
    if (events.length > 0) {
      contextParts.push('### [RETRIEVED CAMPUS EVENTS]');
      
      // Deduplicate by ID
      const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());

      uniqueEvents.forEach((e, idx) => {
        const dateStr = new Date(e.date).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
        });
        
        contextParts.push(
          `${idx + 1}. **${e.title}**
   - Type: ${e.eventType}
   - Department: ${e.department || 'General'}
   - Date & Time: ${dateStr} at ${e.time}
   - Venue: ${e.venue}
   - Priority: ${e.priority} (AI Confidence: ${Math.round(e.confidence * 100)}%)
   - Tags: ${e.tags.join(', ') || 'None'}
   - Similarity Score: ${Math.round(e.score * 100)}%`
        );
      });
      contextParts.push('\n');
    }

    // 2. Intent-specific Context overlays
    if (intent === QueryIntent.ANALYTICS && analyticsData) {
      contextParts.push('### [CAMPUS METRICS SUMMARY]');
      contextParts.push(`- Total Active Events: ${analyticsData.totalEvents}`);
      contextParts.push(`- Average AI Confidence Baseline: ${analyticsData.avgConfidence}%`);
      contextParts.push(`- In-app Notification Open Rate: ${analyticsData.notificationEngagement?.ratePercent}%`);
      contextParts.push('- Active Engineering Departments:');
      analyticsData.departmentsActivity?.slice(0, 5).forEach((d: any) => {
        contextParts.push(`  * ${d.name}: ${d.count} published listings`);
      });
      contextParts.push('\n');
    }

    if (intent === QueryIntent.TRENDS && analyticsData) {
      contextParts.push('### [ACADEMIC RESEARCH TRENDS]');
      contextParts.push('- Highly Searched Tags / Core Research Domains:');
      analyticsData.trendingDomains?.slice(0, 5).forEach((t: any) => {
        contextParts.push(`  * "${t.name}": tracked ${t.count} times recently`);
      });
      contextParts.push('- Rapidly Growing Academic Domains:');
      analyticsData.growingDepartments?.slice(0, 3).forEach((d: any) => {
        contextParts.push(`  * ${d.department}: +${d.growthPercent}% output compared to preceding month`);
      });
      contextParts.push('- Statistically Detected Shifts:');
      analyticsData.insights?.forEach((ins: string) => {
        contextParts.push(`  * "${ins}"`);
      });
      contextParts.push('\n');
    }

    if (intent === QueryIntent.RESEARCH && analyticsData) {
      contextParts.push('### [SEMANTIC RESEARCH CLUSTERS]');
      analyticsData.slice(0, 4).forEach((cluster: any, idx: number) => {
        contextParts.push(
          `${idx + 1}. **${cluster.name}** (Total Events: ${cluster.eventCount})
   - Description: ${cluster.description}
   - Core Topics: ${cluster.members?.slice(0, 3).map((m: any) => m.event.title).join(', ') || 'General'}`
        );
      });
      contextParts.push('\n');
    }

    const compiledContext = contextParts.join('\n');
    
    // Safety check: Token truncation approximation (1 word ~= 1.3 tokens)
    const words = compiledContext.split(/\s+/).length;
    if (words > 2200) {
      this.logger.warn(`Context payload exceeds budget (${words} words) — truncating`);
      return compiledContext.split(/\s+/).slice(0, 2200).join(' ') + '\n... [Context truncated to fit token limits]';
    }

    return compiledContext;
  }
}
