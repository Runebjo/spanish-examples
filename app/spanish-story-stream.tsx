"use client";

import React, { useState } from "react";
import { readStreamableValue } from "ai/rsc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { getExamples, ExampleSentence } from "@/app/actions/getExamplesStream";

type Paragraph = {
  text: string;
  textTranslated: string;
};

const story: Paragraph[] = [
  {
    text: "Había una vez un pequeño pueblo en las montañas.",
    textTranslated:
      "Once upon a time, there was a small village in the mountains.",
  },
  {
    text: "En este pueblo vivía una niña llamada María.",
    textTranslated: "In this village lived a girl named Maria.",
  },
  {
    text: "María amaba explorar los bosques cercanos.",
    textTranslated: "Maria loved exploring the nearby forests.",
  },
  {
    text: "Un día, mientras caminaba por el bosque, María se encontró con un viejo árbol hueco.",
    textTranslated:
      "One day, while walking through the forest, Maria came across an old hollow tree.",
  },
  {
    text: "Curiosa, echó un vistazo dentro del árbol y descubrió un pequeño cofre.",
    textTranslated:
      "Curious, she took a look inside the tree and discovered a small chest.",
  },
  {
    text: "Este descubrimiento marcaría el inicio de una gran aventura para María y todo el pueblo.",
    textTranslated:
      "This discovery would mark the beginning of a great adventure for Maria and the entire village.",
  },
];

const SpanishStoryStreamComponent: React.FC = () => {
  const [showTranslations, setShowTranslations] = useState<boolean[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [examples, setExamples] = useState<ExampleSentence[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTranslation = (index: number) => {
    const newShowTranslations = [...showTranslations];
    newShowTranslations[index] = !newShowTranslations[index];
    setShowTranslations(newShowTranslations);
  };

  const handleWordClick = async (word: string, paragraphIndex: number) => {
    const cleanWord = word.replace(/[.,!?;:()""'']/g, "").trim();
    if (cleanWord) {
      setSelectedWord(cleanWord);
      setExamples([]);
      setTranslatedWord(null);
      const { object } = await getExamples(
        cleanWord,
        story[paragraphIndex].textTranslated
      );
      for await (const partialObject of readStreamableValue(object)) {
        partialObject && setTranslatedWord(partialObject.translatedWord);
        if (partialObject && Array.isArray(partialObject.examples)) {
          setExamples(partialObject.examples);
        }
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const highlightWord = (
    text: string | undefined,
    textColor: string = "text-yellow-400"
  ) => {
    if (!text) return text || "";

    // Split the text by double asterisks
    const parts = text.split(/(\*\*.*?\*\*)/);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        // Remove the asterisks and highlight the word
        const word = part.slice(2, -2);
        return (
          <span key={index} className={`${textColor} font-bold`}>
            {word}
          </span>
        );
      } else {
        // For parts not surrounded by asterisks, return as is
        return part;
      }
    });
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Spanish Short Story</h1>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="icon"
            className={
              isDarkMode
                ? "border-gray-300 text-gray-300"
                : "border-gray-700 text-gray-700"
            }
          >
            {isDarkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>
        {story.map((paragraph, index) => (
          <div
            key={index}
            className={`mb-8 p-6 rounded-lg shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className="mb-4 text-lg leading-relaxed">
              {paragraph.text
                .split(/(\s+|[.,!?;:()""''])/g)
                .map((part, partIndex) => {
                  const cleanPart = part.trim();
                  if (cleanPart) {
                    return (
                      <span
                        key={partIndex}
                        className="cursor-pointer hover:underline transition-colors duration-200 hover:text-blue-400"
                        onClick={() => handleWordClick(cleanPart, index)}
                      >
                        {part}
                      </span>
                    );
                  } else {
                    return part; // Return whitespace and punctuation as-is
                  }
                })}
            </p>
            <Button
              onClick={() => toggleTranslation(index)}
              variant={isDarkMode ? "secondary" : "outline"}
              className={`transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {showTranslations[index] ? "Hide" : "Show"} Translation
            </Button>
            {showTranslations[index] && (
              <p
                className={`mt-4 italic ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {paragraph.textTranslated}
              </p>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedWord}
        onOpenChange={() => {
          setSelectedWord(null);
          setExamples([]);
        }}
      >
        <DialogContent
          className={`${
            isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          } max-w-2xl min-h-[500px] flex flex-col`}
        >
          <DialogHeader>
            <DialogTitle>Examples for: {selectedWord}</DialogTitle>
          </DialogHeader>
          <div>
            {translatedWord && (
              <p className="text-gray-400 italic">
                Translated word: {translatedWord}
              </p>
            )}
          </div>
          <div className="mt-4 flex-grow overflow-y-auto relative">
            {examples.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              examples.map((example, index) => (
                <div key={index} className="mb-4">
                  <p>{highlightWord(example.text)}</p>
                  <p className="text-gray-400 italic">
                    {highlightWord(example.textTranslated, "text-orange-300")}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpanishStoryStreamComponent;
