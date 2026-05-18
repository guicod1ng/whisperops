import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "uma_frase_secreta_bem_longa";

router.post("/registro", async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });

  const existe = await prisma.empresa.findUnique({ where: { email } });
  if (existe) return res.status(400).json({ erro: "Email já cadastrado" });

  const hash = await bcrypt.hash(senha, 10);
  const empresa = await prisma.empresa.create({
    data: { nome, email, senha: hash },
  });

  res.status(201).json({ mensagem: "Empresa criada", empresa: { id: empresa.id, nome: empresa.nome, email: empresa.email } });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const empresa = await prisma.empresa.findUnique({ where: { email } });
  if (!empresa) return res.status(401).json({ erro: "Email ou senha inválidos" });

  const valida = await bcrypt.compare(senha, empresa.senha);
  if (!valida) return res.status(401).json({ erro: "Email ou senha inválidos" });

  const token = jwt.sign({ id: empresa.id, email: empresa.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ mensagem: "Login realizado", token });
});

export default router;