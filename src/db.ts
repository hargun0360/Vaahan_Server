import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

export const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl : process.env.POSTGRES_URL
  },
});
