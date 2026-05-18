import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ erro: "Token não fornecido" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    (req as any).empresa = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
}