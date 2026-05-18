import { Router, Request, Response } from "express";
import authMiddleware from "../middlewares/authMiddlewares";
import prisma from "../config/prisma";

const router = Router();

router.get("/dashboard", authMiddleware, async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;

  const conversas = await prisma.conversa.findMany({
    where: { empresa_id: empresaId },
    include: { metrica: true },
    orderBy: { data_import: "desc" },
  });

  const total = conversas.length;
  const analisadas = conversas.filter(c => c.metrica).length;
  const tempoMedio = conversas.reduce((acc, c) => acc + (c.metrica?.tempo_resposta || 0), 0) / (analisadas || 1);

  res.json({
    total_conversas: total,
    conversas_analisadas: analisadas,
    tempo_medio_resposta: Math.round(tempoMedio),
    conversas,
  });
});

export default router;