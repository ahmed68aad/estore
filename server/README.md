# estore-server

Express API server for the estore project.

## Requirements

- Node.js 18 or newer
- npm

## Commands

```sh
npm install
npm start
```

For local development with automatic restarts:

```sh
npm run dev
```

The server reads `PORT` from `.env` and falls back to `5005` if it is not set.

Health check:

```sh
curl http://localhost:5005/health
```
