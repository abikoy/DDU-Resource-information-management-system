const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception! 💥 Shutting down...");
  process.exit(1);
});

// Use MongoDB Atlas connection
const DB = process.env.DATABASE_ONLINE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const port = process.env.PORT || 5000;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Database connection successful! 😍"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} 🚀`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled error Rejection! 💥 Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});