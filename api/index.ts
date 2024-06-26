import express from "express";
import routes from "../src/routes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  credentials: true,
  origin: "*", // Allows all domains
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify the allowed method
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/api", routes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
