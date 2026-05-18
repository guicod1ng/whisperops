import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import metricasRoutes from "./routes/metricasRoutes";
import errorHandler from "./middlewares/errorHandler";
import path from "path";

dotenv.config();

const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
const missingEnvs = requiredEnvs.filter((name) => !process.env[name]);
if (missingEnvs.length) {
  console.error(`Variáveis de ambiente obrigatórias não configuradas: ${missingEnvs.join(", ")}`);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "landingpage.html")));
app.get("/ping", (req, res) => res.json({ status: "online" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/metricas", metricasRoutes);
app.use(errorHandler);

const PORTA = process.env.PORTA || 3000;
app.listen(PORTA, () => console.log(`WhisperOps rodando na porta ${PORTA}`));

export default app;