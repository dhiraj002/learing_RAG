import dotenv from "dotenv";
dotenv.config();
import readine from "node:readline/promises";
import Groq from "groq-sdk";
import { vectorStore } from "./prepare.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat() {
  const rl = readine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userInput = await rl.question("You: ");
    if (userInput === "exit") {
      console.log("Exiting chat...");
      break;
    }

    const relevantChunks = await vectorStore.similaritySearchWithScore(
      userInput,
      3
    );

    const content = relevantChunks
      .map((chunk) => chunk[0].pageContent)
      .join("\n\n");

    console.log(content);

    const SYSTEM_PROMPT = ` 
    You are a helpful AI assistant that answers questions strictly using the provided information.

Guidelines:
- Answer using ONLY the given information.
- If the answer is not present, say: "I don't have enough information to answer this."
- Do NOT invent or assume details.
- Be clear, concise, and accurate.

Interpretation rules:
- If the user asks for "role", "role name", "job role", or "position",
  treat it as the job title mentioned in the information.
- If the question is short or vague, infer the most relevant meaning
  based on the provided information.

Response rules:
- Keep answers short and direct.
- Use bullet points only if helpful.
- Do not mention words like "context", "document", or "PDF".

`;

    const userQuery = `
Information:
${content}

User question:
${userInput}
`;

    const completions = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: userQuery,
        },
      ],
      model: "openai/gpt-oss-20b",
    });
    console.log(`AI: ${completions.choices[0].message.content}`);
  }
  rl.close();

  //
}

chat();
