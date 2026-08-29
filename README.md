# CollabBoard API

A NestJS backend for the CollabBoard application with MongoDB and WebSocket support.

## Tech stack

- Node.js
- NestJS
- TypeScript
- MongoDB with Mongoose
- Socket.IO / WebSockets
- pnpm

## Prerequisites

- Node.js 18+
- pnpm
- MongoDB running locally or a MongoDB Atlas connection string

## Getting started

1. Install dependencies:

```bash
pnpm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update the values in `.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/collabboard
```

## Run the app

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode
pnpm run start:prod
```

## Run tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Build

```bash
pnpm run build
```

## Project structure

```bash
src/
  app.module.ts
  app.controller.ts
  app.service.ts
  main.ts
```

## Notes

- The app uses `@nestjs/config` and reads env variables globally.
- MongoDB connection is configured through `MONGODB_URI`.
- WebSocket support is enabled via NestJS Socket.IO packages.

## License

This project is private and for portfolio use.
