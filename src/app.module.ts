import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RecentlyPlayedModule } from './recently-played/recently-played.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    PlaylistsModule,
    FavoritesModule,
    RecentlyPlayedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
