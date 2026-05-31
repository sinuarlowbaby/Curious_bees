import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClusterService {
  private readonly logger = new Logger(ClusterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes database-native semantic clustering using pgvector cosine similarity.
   */
  async clusterEvents(): Promise<any> {
    try {
      this.logger.log('Starting institutional event semantic clustering...');

      // 1. Fetch all published events with generated embeddings
      const events: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT id, title, department, tags, embedding::text AS embedding_str
        FROM "Event"
        WHERE embedding IS NOT NULL AND status = 'PUBLISHED'
      `);

      if (events.length === 0) {
        this.logger.warn('No published events with vector embeddings found — skipping clustering');
        return { success: false, reason: 'No events with embeddings' };
      }

      // 2. Clear old clusters
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "EventCluster" CASCADE');

      let clusterCount = 0;

      // 3. Dynamic Leader Clustering Loop
      for (const event of events) {
        const embeddingLiteral = event.embedding_str; // e.g. "[0.123, -0.456, ...]"

        let assignedClusterId: string | null = null;

        // Query database to find closest existing cluster
        if (clusterCount > 0) {
          const closest: any[] = await this.prisma.$queryRawUnsafe(`
            SELECT id, 1 - ("centerEmbedding" <=> '${embeddingLiteral}'::vector) AS similarity
            FROM "EventCluster"
            ORDER BY "centerEmbedding" <=> '${embeddingLiteral}'::vector ASC
            LIMIT 1
          `);

          if (closest.length > 0 && closest[0].similarity >= 0.81) {
            assignedClusterId = closest[0].id;
          }
        }

        if (assignedClusterId) {
          // Assign to existing cluster
          await this.prisma.eventClusterMember.create({
            data: {
              clusterId: assignedClusterId,
              eventId: event.id,
              similarity: 1.0, // Calculated after naming phase
            },
          });
        } else {
          // Create new cluster using this event's embedding as centroid
          const newClusterId = `cluster-${Math.random().toString(36).substring(2, 9)}`;
          
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO "EventCluster" (id, name, description, "centerEmbedding", eventCount, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, '${embeddingLiteral}'::vector, 1, NOW(), NOW())
          `, newClusterId, `Thematic Group ${clusterCount + 1}`, `Dynamic academic thematic research group.`);

          await this.prisma.eventClusterMember.create({
            data: {
              clusterId: newClusterId,
              eventId: event.id,
              similarity: 1.0,
            },
          });

          clusterCount++;
        }
      }

      // 4. Refine names & compute final membership similarity scores
      const activeClusters = await this.prisma.eventCluster.findMany({
        include: {
          members: {
            include: {
              event: true,
            },
          },
        },
      });

      for (const cluster of activeClusters) {
        const members = cluster.members;
        const totalMembers = members.length;

        // Collect tags and departments to auto-name the cluster dynamically
        const tags: string[] = [];
        const departments: Record<string, number> = {};

        members.forEach(m => {
          tags.push(...m.event.tags);
          if (m.event.department) {
            departments[m.event.department] = (departments[m.event.department] || 0) + 1;
          }
        });

        // Determine dominant department
        const dominantDept = Object.entries(departments)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Interdisciplinary';

        // Determine top tags
        const tagFreq: Record<string, number> = {};
        tags.forEach(t => {
          tagFreq[t] = (tagFreq[t] || 0) + 1;
        });
        const topTags = Object.entries(tagFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([name]) => name);

        // Form elegant naming
        let clusterName = `${dominantDept} Core`;
        if (topTags.length > 0) {
          clusterName = `${topTags.join(' & ')} Intelligence`;
        } else if (dominantDept) {
          clusterName = `${dominantDept} Research Group`;
        }

        // Standardize cluster names for campus visualization
        if (clusterName.toLowerCase().includes('computer') || clusterName.toLowerCase().includes('ai') || clusterName.toLowerCase().includes('learning')) {
          clusterName = 'AI & Advanced Computing Hub';
        } else if (clusterName.toLowerCase().includes('mechanical') || clusterName.toLowerCase().includes('fluid') || clusterName.toLowerCase().includes('thermo')) {
          clusterName = 'Applied Mechanical & Materials Research';
        } else if (clusterName.toLowerCase().includes('biotech') || clusterName.toLowerCase().includes('nano')) {
          clusterName = 'Nano & Biotechnology Exploration';
        } else if (clusterName.toLowerCase().includes('seminar') || clusterName.toLowerCase().includes('fdp')) {
          clusterName = 'Faculty Development & Research Seminars';
        }

        const clusterDescription = `Automated cluster aggregating ${totalMembers} events focusing primarily on ${topTags.join(', ') || dominantDept}.`;

        // Update name, description, eventCount
        await this.prisma.eventCluster.update({
          where: { id: cluster.id },
          data: {
            name: clusterName,
            description: clusterDescription,
            eventCount: totalMembers,
          },
        });

        // Recalculate true similarity against the center embedding for each member
        // Pull center embedding as text
        const centroidText: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT "centerEmbedding"::text FROM "EventCluster" WHERE id = $1
        `, cluster.id);
        const centerLiteral = centroidText[0]?.centerEmbedding;

        if (centerLiteral) {
          for (const member of members) {
            // Get event embedding
            const eventEmbeddingResult: any[] = await this.prisma.$queryRawUnsafe(`
              SELECT embedding::text FROM "Event" WHERE id = $1
            `, member.eventId);
            const eventEmbeddingLiteral = eventEmbeddingResult[0]?.embedding;

            if (eventEmbeddingLiteral) {
              const simResult: any[] = await this.prisma.$queryRawUnsafe(`
                SELECT 1 - ('${centerLiteral}'::vector <=> '${eventEmbeddingLiteral}'::vector) AS sim
              `);
              const score = parseFloat(simResult[0]?.sim?.toFixed(4) ?? '0.85');

              await this.prisma.eventClusterMember.update({
                where: {
                  clusterId_eventId: {
                    clusterId: cluster.id,
                    eventId: member.eventId,
                  },
                },
                data: {
                  similarity: score,
                },
              });
            }
          }
        }
      }

      this.logger.log(`Clustering successfully complete. Formed ${clusterCount} semantic groups.`);
      return { success: true, clustersFormed: clusterCount };

    } catch (error: any) {
      this.logger.error('Failed semantic clustering execution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieves active clusters and member events.
   */
  async getClusters(): Promise<any[]> {
    const clusters = await this.prisma.eventCluster.findMany({
      include: {
        members: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventType: true,
                department: true,
                date: true,
                venue: true,
                tags: true,
              },
            },
          },
          orderBy: { similarity: 'desc' },
        },
      },
      orderBy: { eventCount: 'desc' },
    });

    return clusters.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      eventCount: c.eventCount,
      members: c.members.map(m => ({
        eventId: m.eventId,
        similarityPercent: Math.round(m.similarity * 100),
        event: m.event,
      })),
    }));
  }
}
