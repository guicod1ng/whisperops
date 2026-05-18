import prisma from "../config/prisma";
import { gerarInsightIA } from "./iaService";

export async function gerarMetricas(conversa_id: number) {
  const mensagens = await prisma.mensagem.findMany({
    where: { conversa_id },
    orderBy: { data_hora: "asc" },
  });

  if (mensagens.length < 2) {
    await prisma.metrica.create({
      data: {
        conversa_id,
        tempo_resposta: 0,
        palavras_chave: "",
        sentimento: "neutro",
        score: 0,
        resumo_ia: "Conversa muito curta para análise.",
      },
    });
    return;
  }

  let tempoTotal = 0;
  let respostas = 0;

  for (let i = 1; i < mensagens.length; i++) {
    if (mensagens[i].remetente !== mensagens[i - 1].remetente) {
      const diff =
        (new Date(mensagens[i].data_hora).getTime() -
          new Date(mensagens[i - 1].data_hora).getTime()) /
        1000;
      tempoTotal += diff;
      respostas++;
    }
  }

  const tempoMedio = respostas > 0 ? Math.round(tempoTotal / respostas) : 0;
  const textos = mensagens.map((m) => m.texto);
  const descricao = textos.join(" ").toLowerCase();

  const palavrasChave = ["orçamento", "prazo", "preço", "obrigado", "ok", "combinado"]
    .filter((palavra) => descricao.includes(palavra))
    .join(", ");

  const sentimento = descricao.includes("não") || descricao.includes("ruim") || descricao.includes("cancelado")
    ? "negativo"
    : descricao.includes("obrigado") || descricao.includes("combinado") || descricao.includes("perfeito")
    ? "positivo"
    : "neutro";

  const score = sentimento === "positivo" ? 8.2 : sentimento === "negativo" ? 3.8 : 5.7;

  let resumo_ia = "Análise indisponível.";
  try {
    resumo_ia = await gerarInsightIA(textos);
  } catch (erro) {
    console.error("Erro ao gerar insight IA", erro);
  }

  await prisma.metrica.create({
    data: {
      conversa_id,
      tempo_resposta: tempoMedio,
      palavras_chave: palavrasChave,
      sentimento,
      score,
      resumo_ia,
    },
  });
}