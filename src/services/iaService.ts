import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function gerarInsightIA(mensagens: string[]): Promise<string> {
  if (!GROQ_API_KEY) {
    return "Análise indisponível por falta de chave de IA.";
  }

  if (!mensagens || mensagens.length === 0) {
    return "Sem dados suficientes para análise.";
  }

  const texto = mensagens.join("\n");

  try {
    const resposta = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Você é um analista de atendimento. Analise a conversa de WhatsApp e gere UM PARÁGRAFO apenas, em português, destacando: 1) Se a venda foi concluída ou perdida. 2) Quantas mensagens trocadas até a decisão. 3) O principal fator que levou ao sucesso ou fracasso. 4) Uma recomendação objetiva para o dono da empresa. Seja direto. Nada de introduções ou conclusões genéricas.",
        },
        { role: "user", content: texto },
      ],
      max_tokens: 200,
    });

    return resposta.choices?.[0]?.message?.content?.trim() || "Análise indisponível.";
  } catch (erro) {
    console.error("Erro ao chamar Groq:", erro);
    return "Análise indisponível.";
  }
}