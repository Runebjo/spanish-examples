'use server'

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ExampleSentence = {
  text: string;
  textTranslated: string;
};

export async function getExamples(word: string, context: string): Promise<ExampleSentence[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides example sentences in Spanish. " +
                   "Given a Spanish word and its context, provide four different example sentences " +
                   "using that word. Each sentence should be provided in Spanish with its English translation."
        },
        {
          role: "user",
          content: `Provide 4 example sentences in Spanish using the word "${word}" based on this context: "${context}". ` +
                   "Format your response as a JSON array of objects, where each object has 'text' (Spanish) and 'textTranslated' (English) properties. " +
                   "Do not include any explanations or additional text outside the JSON structure."
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content in the API response");
    }

    const parsedContent = JSON.parse(content);
    
    if (!Array.isArray(parsedContent.examples)) {
      throw new Error("Unexpected response format");
    }

    return parsedContent.examples;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return [{ text: 'Error fetching examples. Please try again.', textTranslated: 'Error al obtener ejemplos. Por favor, inténtelo de nuevo.' }];
  }
}