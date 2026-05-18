import { Request, Response, NextFunction } from "express";

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Erro interno do servidor";

  res.status(status).json({ erro: message });
}
