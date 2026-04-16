import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../drizzle/schema";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL\!,
  connectionLimit: 10,
  waitForConnections: true,
});

export const db = drizzle(pool, { schema, mode: "default" });
export type DB = typeof db;
