// actions/spanishStoryActions.ts
'use server';

import { createStreamableValue } from 'ai/rsc';
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const MODEL = 'gpt-4o-mini';

export interface ExampleSentence {
  text: string;
  textTranslated: string;
}
export async function getExamples(word: string, context: string) {
  const stream = createStreamableValue();

  const examplesSchema = z.object({
    examples: z.array(
      z.object({
        text: z
          .string()
          .describe(
            'The example sentence in Spanish with the word surrounded by double asterisks.'
          ),
        textTranslated: z
          .string()
          .describe(
            'The English translation of the example sentence with the word surrounded by double asterisks.'
          ),
      })
    ),
  });

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai(MODEL),
      system:
        'You are a Spanish language tutor providing example sentences with consistent translations.',
      prompt: `
        Provide 5 example sentences in Spanish using the word "**${word}**". 
        Context: The word appears in this translated sentence: "${context}"

        Instructions:
        1. Determine the most likely meaning of "**${word}**" based on the given context.
        2. Provide the English translation of "**${word}**" that fits this specific context.
        3. Create 5 example sentences in Spanish using "**${word}**" with the same meaning as in the context.
        4. Translate each example sentence to English, ensuring that "**${word}**" is consistently translated in all examples.
        5. The translation of "**${word}**" should be the same in all example translations and should match the meaning in the original context.
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
