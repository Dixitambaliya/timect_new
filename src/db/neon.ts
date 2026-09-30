import { neon } from "@neondatabase/serverless";

export const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : neon("postgres://localhost:5432/placeholder");
