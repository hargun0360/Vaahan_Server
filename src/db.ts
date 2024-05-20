import dotenv from "dotenv";
import knex from "knex";

dotenv.config();

const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

export const db = knex({
  client: "pg",
  connection: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME,
    port : dbPort,
  },
});
