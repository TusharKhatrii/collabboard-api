# CollabBoard API

Real-time backend for [CollabBoard](https://github.com/TusharKhatrii/collabboard-web) — a collaborative whiteboard built with Excalidraw. Handles WebSocket-based presence, live cursor tracking, drawing synchronization, and room persistence.

[Live App](https://collabboard-web-seven.vercel.app/)

## Tech Stack

- **NestJS 11** — application framework
- **Socket.io** — real-time WebSocket communication
- **MongoDB Atlas** (Mongoose) — room persistence
- **Docker** — containerized deployment
- **Render** — hosting

## Features

- Room creation with auto-generated access codes
- Real-time presence tracking (who's in a room)
- Live drawing sync using Excalidraw's `reconcileElements` for conflict-safe merging
- Live named collaborator cursors
- REST endpoints for room creation and lookup

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms/:accessCode` | Look up a room by its access code |

## WebSocket Events

| Event (Client → Server) | Description |
|--------------------------|--------------|
| `join-room` | Join a room with `{ roomId, username }` |
| `leave-room` | Leave a room |
| `draw-update` | Broadcast Excalidraw scene changes |
| `cursor-move` | Broadcast live cursor position |

| Event (Server → Client) | Description |
|--------------------------|--------------|
| `presence-update` | Full list of current room participants |
| `draw-update` | Incoming scene changes from another client |
| `cursor-move` | Incoming cursor position from another client |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A MongoDB Atlas connection string

### Local Setup

```bash
pnpm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Run the dev server:

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3001`.

## Running with Docker

Build the image:

```bash
docker build -t collabboard-api .
```

Run the container (requires a `.env` file with `MONGODB_URI`, `PORT`, `CORS_ORIGIN`):

```bash
docker run -p 3001:3001 --env-file .env collabboard-api
```

## Deployment

Deployed on [Render](https://render.com) as a Docker-based web service, auto-deploying from the `main` branch.

Required environment variables on Render:

```
MONGODB_URI=<production connection string>
PORT=3001
NODE_ENV=production
CORS_ORIGIN=<deployed frontend URL>
```

## Related

- Frontend repo: [collabboard-web](https://github.com/TusharKhatrii/collabboard-web)