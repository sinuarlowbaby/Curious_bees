import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmbeddingModule } from '../embeddings/embedding.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchAnalyticsService } from './search-analytics.service';

@Module({
  imports: [AuthModule, EmbeddingModule],
  controllers: [SearchController],
  providers: [SearchService, SearchAnalyticsService],
  exports: [SearchService],
})
export class SearchModule {}
