import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventPersistenceService } from './event-persistence.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmbeddingModule } from '../embeddings/embedding.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [AuthModule, NotificationsModule, EmbeddingModule, SearchModule],
  controllers: [EventsController],
  providers: [EventsService, EventPersistenceService],
  exports: [EventsService, EventPersistenceService]
})
export class EventsModule {}
