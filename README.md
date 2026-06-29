<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

# InjecTune Backend

NestJS REST API for [InjecTune](https://github.com/RS-Champions/InjecTune) — a music streaming app powered by the Jamendo API.

## Tech Stack

- **NestJS** (TypeScript)
- **Supabase** (PostgreSQL)
- **Swagger** — API documentation at `/api`

## Features

- Playlist CRUD (create, read, update, delete)
- Playlist track management (add, remove, reorder)
- Favorites (Liked Songs) — add, remove, list

## Prerequisites

- Node.js v22+
- A [Supabase](https://supabase.com) project with the schema from [`supabase-schema.sql`](./supabase-schema.sql)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RS-Champions/InjecTune-backend.git
cd InjecTune-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (see `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

> ⚠️ Never commit `.env` to version control. The `SUPABASE_SERVICE_ROLE_KEY` has full database access and must be kept secret.

### 4. Run in development mode

```bash
npm run start:dev
```

The server starts at `http://localhost:3000`.
Swagger UI is available at `http://localhost:3000/api`.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/playlists` | Get all playlists for current user |
| `POST` | `/playlists` | Create a playlist |
| `GET` | `/playlists/:id` | Get playlist with tracks |
| `PATCH` | `/playlists/:id` | Update playlist name/description |
| `DELETE` | `/playlists/:id` | Delete a playlist |
| `POST` | `/playlists/:id/tracks` | Add a track to a playlist |
| `DELETE` | `/playlists/:id/tracks/:trackId` | Remove a track from a playlist |
| `PATCH` | `/playlists/:id/reorder` | Reorder playlist tracks |
| `GET` | `/favorites` | Get all liked tracks |
| `POST` | `/favorites/:trackId` | Like a track |
| `DELETE` | `/favorites/:trackId` | Unlike a track |

Full interactive documentation: `/api` (Swagger UI).

## Database Schema

The Supabase schema is defined in [`supabase-schema.sql`](./supabase-schema.sql).

Tables:
- `users` — application users (stub during development, replaced by real auth later)
- `playlists` — user playlists
- `playlist_tracks` — tracks within playlists; `source` field supports `'jamendo'` and `'own'` (for future upload feature)
- `favorites` — liked tracks
- `recently_played` — listening history (endpoint coming in next milestone)

## Development Notes

### Authentication

Auth is currently stubbed: all requests use a hardcoded `STUB_USER_ID`.
Real JWT-based authentication will replace this once the auth module is implemented.

> See `TODO(auth)` comments throughout the codebase.

### Track Sources

`playlist_tracks.source` supports two values:
- `'jamendo'` — tracks from the [Jamendo API](https://developer.jamendo.com/v3.0)
- `'own'` — user-uploaded tracks (planned feature, not yet implemented)

## Deployment

The API is deployed on [Render](https://render.com).

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:prod` |
| Environment | Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT` in Render dashboard |

## Related

- [InjecTune Frontend](https://github.com/RS-Champions/InjecTune) — Angular 21 app
- [Jamendo API](https://developer.jamendo.com/v3.0) — music source
- [Supabase](https://supabase.com) — database and storage

## Stay in touch

- Author - [AlenaVP](https://github.com/AlenaVP)
