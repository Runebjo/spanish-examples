// actions/spanishStoryActions.ts
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const MODEL = "gpt-4o-mini";

export interface ExampleSentence {
  text: string;
  textTranslated: string;
}
export async function getExamples(word: string, context: string) {
  const stream = createStreamableValue();

  const examplesSchema = z.object({
    examples: z.array(
      z.object({
        text: z.string(),
        textTranslated: z.string(),
      })
    ),
  });

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai(MODEL),
      system:
        "You are a Spanish language tutor providing example sentences with consistent translations.",
      prompt: `
        Provide 5 example sentences in Spanish using the word "**${word}**". 
        Context: The word appears in this translated sentence: "${context}"

        Instructions:
        1. Determine the most likely meaning of "**${word}**" based on the given context.
        2. Provide the English translation of "**${word}**" that fits this specific context.
        3. Create 3 example sentences in Spanish using "**${word}**" with the same meaning as in the context.
        4. Translate each example sentence to English, ensuring that "**${word}**" is consistently translated in all examples.
        5. The translation of "**${word}**" should be the same in all example translations and should match the meaning in the original context.
        6. Surround the translated word with "**" to indicate the translation.

        Output format:
        {
          "translatedWord": "**English translation of the word**",
          "examples": [
            {
              "text": "En esta ciudad hay una niña **llamada** Ana.",
              "textTranslated": "In this city, there is a girl **named** Ana."
            },
            {
              "text": "Ella tiene un amigo **llamado** Carlos.",
              "textTranslated": "She has a friend **named** Carlos."
            },
            {
              "text": "Conocí a un hombre **llamado** Juan en la fiesta.",
              "textTranslated": "I met a man **named** Juan at the party."
            }
          ]
        }
        `,
      schema: examplesSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }
    stream.done();
  })();

  return { object: stream.value };
}
