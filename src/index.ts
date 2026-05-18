import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import metricasRoutes from "./routes/metricasRoutes";
import path from "path";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.sendFile("landing.html", { root: "public" }));
app.get("/ping", (req, res) => res.json({ status: "online" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/metricas", metricasRoutes);

const PORTA = process.env.PORTA || 3000;
app.listen(PORTA, () => console.log(`WhisperOps rodando na porta ${PORTA}`));

export default app;