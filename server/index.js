import http from "http";

import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/db.js";

const server = http.createServer(app);
const port = config.port;

await connectDB();

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Closing server...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
