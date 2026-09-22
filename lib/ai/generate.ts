"use server";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AIGenerateParamsSchema } from "../validations";
import Question from "@/database/question.model";
import Answer from "@/database/answer.model";
import { getOpenAI } from "./openai";

const MAX_ANSWERS = 3;
const MAX_OUTPUT_LENGTH = 1200;

export async function generateAIAnswer(
  params: GenerateAnswerParams,
): Promise<ActionResponse<{ content: string }>> {
  const validatedResult = await action({
    params,
    schema: AIGenerateParamsSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { questionId } = validatedResult.params!;

  try {
    const question = await Question.findById(questionId).lean();
    if (!question) {
      throw new Error("Question not found");
    }

    const answers = await Answer.find({ question: questionId })
      .sort({ upvotes: -1 })
      .limit(MAX_ANSWERS)
      .lean();

    const content = await generateAnswerMarkdown(
      question.title,
      question.content,
      answers.map((answer) => answer.content),
    );

    return { success: true, data: { content } };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

async function generateAnswerMarkdown(
  title: string,
  questionContent: string,
  existingAnswers: string[],
): Promise<string> {
  const openai = getOpenAI();

  const systemPrompt = `
You are an expert developer answering questions on a developer Q&A platform called DevFlow.

Write a comprehensive, well-structured answer in Markdown for the following question.
- Be direct and practical; lead with a short summary.
- Use headings, bullet points, and code blocks where they improve clarity.
- Include a runnable code example when relevant.
- Keep the answer to about 400-700 words.

Important: return ONLY the Markdown answer. Do not wrap it in code fences and do not add any commentary outside the Markdown.
`;

  const userPrompt = `
Question title: ${title}

Question content:
${questionContent || "(The author did not add any details.)"}
${
  existingAnswers.length > 0
    ? `
Existing answers from the community (use them as context, do not copy verbatim):
${existingAnswers
        .map((answer, index) => `Answer ${index + 1}:
${answer}`)
        .join("\n\n")}`
    : ""
}
`;

  const completion = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_output_tokens: MAX_OUTPUT_LENGTH,
  });

  const text = completion.output_text?.trim() ?? "";

  if (!text) {
    throw new Error("AI returned an empty answer.");
  }

  return text;
}
