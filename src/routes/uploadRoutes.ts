import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/authMiddlewares";
import { gerarMetricas } from "../services/metricasService";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".txt") {
      return cb(new Error("Apenas arquivos .txt são permitidos"));
    }
    cb(null, true);
  },
});

router.post("/", authMiddleware, upload.single("conversa"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ erro: "Arquivo .txt obrigatório" });

  const empresaId = (req as any).empresa.id;
  const filePath = req.file.path;

  try {
    const conteudo = fs.readFileSync(filePath, "utf-8");
    const linhas = conteudo.split("\n").filter((l) => l.trim());

    let atendente = await prisma.atendente.findFirst({
      where: { empresa_id: empresaId },
    });

    if (!atendente) {
      atendente = await prisma.atendente.create({
        data: {
          nome: "Atendente Padrão",
          empresa_id: empresaId,
        },
      });
    }

    const conversa = await prisma.conversa.create({
      data: {
        cliente_nome: "Cliente via Upload",
        cliente_fone: "Desconhecido",
        atendente_id: atendente.id,
        empresa_id: empresaId,
      },
    });

    for (const linha of linhas) {
      await prisma.mensagem.create({
        data: {
          conversa_id: conversa.id,
          remetente: linha.includes(" - ") ? linha.split(" - ")[0] : "Desconhecido",
          texto: linha,
          data_hora: new Date(),
        },
      });
    }

    await gerarMetricas(conversa.id);
    res.json({ mensagem: "Conversa importada com sucesso", conversa_id: conversa.id });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao processar o arquivo" });
  }
});

export default router;