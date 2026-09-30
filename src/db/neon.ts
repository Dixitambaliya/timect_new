import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing. Please set it in your .env or .env.local file.");
}

export const sql = neon(process.env.DATABASE_URL);
