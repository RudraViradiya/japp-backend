import express from "express";
import path from "path";
import cors from "cors";
import routes from "./src/routes/index.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "./src/db/conn.js";
import responseHandler from "./src/utils/responseHandler.js";
import { fileURLToPath } from "url";

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS for all origins`
const corsOptions = { origin: process.env.ALLOW_ORIGIN };

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(responseHandler);

app.use(routes);

// Serve static files from 'assets' folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
