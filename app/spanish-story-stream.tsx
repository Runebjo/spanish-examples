"use client";

import React, { useState, useEffect } from "react";
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
];

const SpanishStoryStreamComponent: React.FC = () => {
  const [showTranslations, setShowTranslations] = useState<boolean[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [examples, setExamples] = useState<ExampleSentence[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTranslation = (index: number) => {
    const newShowTranslations = [...showTranslations];
    newShowTranslations[index] = !newShowTranslations[index];
    setShowTranslations(newShowTranslations);
  };

  const handleWordClick = async (word: string, paragraphIndex: number) => {
    setSelectedWord(word);
    setExamples([]);
    const { object } = await getExamples(
      word,
      story[paragraphIndex].textTranslated
    );
    for await (const partialObject of readStreamableValue(object)) {
      if (partialObject && Array.isArray(partialObject.examples)) {
        setExamples(partialObject.examples);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
              {paragraph.text.split(" ").map((word, wordIndex) => (
                <span
                  key={wordIndex}
                  className="cursor-pointer hover:underline transition-colors duration-200 hover:text-blue-400"
                  onClick={() => handleWordClick(word, index)}
                >
                  {word}{" "}
                </span>
              ))}
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
          <div className="mt-4 flex-grow overflow-y-auto">
            {examples.map((example, index) => (
              <div key={index} className="mb-4">
                <p>{example.text}</p>
                <p className="text-gray-400 italic">{example.textTranslated}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpanishStoryStreamComponent;
