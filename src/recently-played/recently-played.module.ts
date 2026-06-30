import { Module } from '@nestjs/common';
import { RecentlyPlayedService } from './recently-played.service';
import { RecentlyPlayedController } from './recently-played.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [RecentlyPlayedService],
  controllers: [RecentlyPlayedController],
})
export class RecentlyPlayedModule {}
