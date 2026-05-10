const path = require("path");
const dotenv = require("dotenv");

// Vercel injects environment variables at runtime. This loader is for local
// commands such as npm run dev, npm start, and npm run seed.
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}
