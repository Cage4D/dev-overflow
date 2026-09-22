import OpenAI from "openai";

let _openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Add it to your .env file.",
      );
    }
    _openaiInstance = new OpenAI({ apiKey });
  }
  return _openaiInstance;
}
