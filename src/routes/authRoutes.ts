import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post("/registro", async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });

  if (typeof nome !== "string" || nome.trim().length < 2)
    return res.status(400).json({ erro: "Nome deve ter pelo menos 2 caracteres" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email))
    return res.status(400).json({ erro: "Email inválido" });

  if (typeof senha !== "string" || senha.length < 6)
    return res.status(400).json({ erro: "Senha deve ter pelo menos 6 caracteres" });

  const existe = await prisma.empresa.findUnique({ where: { email } });
  if (existe) return res.status(400).json({ erro: "Email já cadastrado" });

  const hash = await bcrypt.hash(senha, 10);
  const empresa = await prisma.empresa.create({
    data: { nome: nome.trim(), email: email.toLowerCase().trim(), senha: hash },
  });

  res.status(201).json({ mensagem: "Empresa criada", empresa: { id: empresa.id, nome: empresa.nome, email: empresa.email } });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email))
    return res.status(400).json({ erro: "Email inválido" });

  const empresa = await prisma.empresa.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!empresa) return res.status(401).json({ erro: "Email ou senha inválidos" });

  const valida = await bcrypt.compare(senha, empresa.senha);
  if (!valida) return res.status(401).json({ erro: "Email ou senha inválidos" });

  const token = jwt.sign({ id: empresa.id, email: empresa.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    mensagem: "Login realizado",
    token,
    usuario: { id: empresa.id, nome: empresa.nome, email: empresa.email },
  });
});

export default router;