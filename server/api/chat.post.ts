import { defineEventHandler } from "h3";
import { Ollama } from "@langchain/community/llms/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export default defineEventHandler(async (event) => {
  const req = await readBody(event);
  console.log("body: ", req.comment);
  const result = await handleOllamaMessage(req.comment)
  return {
    hello: "world",
    answer: result || ''
  };
});

async function handleOllamaMessage(value: String):Promise<String> {
  // prompt template
  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "llama3",
  });

  const systemTemplate =
    "你是一个专业的翻译员，你的任务是将文本从{source_lang}翻译成{target_lang}。";
  const humanTemplate = "请翻译这句话：{text}";

  const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate],
  ]);
  const outputPraser = new StringOutputParser();
  const chain = chatPrompt.pipe(ollama).pipe(outputPraser);
  const result = await chain.invoke({
    source_lang: "英文",
    target_lang: "法语",
    text: value,
  });
  console.log(result, 'result')
  return result || "" ;
}
