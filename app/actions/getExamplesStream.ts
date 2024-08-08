// actions/spanishStoryActions.ts
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export interface ExampleResponse {
  translatedWord: string;
  examples: ExampleSentence[];
}

export interface ExampleSentence {
  text: string;
  textTranslated: string;
}
export async function getExamples(word: string, context: string) {
  const stream = createStreamableValue();

  const examplesSchema = z.object({
    translatedWord: z.string(),
    examples: z.array(
      z.object({
        text: z.string(),
        textTranslated: z.string(),
      })
    ),
  });

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai("gpt-4o-mini"),
      system: "You are a Spanish language tutor providing example sentences.",
      prompt: `Provide 3 example sentences in Spanish using the word "${word}". Context: ${context}. Also provide the English translation of the word in the given context.`,
      schema: examplesSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }
    stream.done();
  })();

  return { object: stream.value };
}
