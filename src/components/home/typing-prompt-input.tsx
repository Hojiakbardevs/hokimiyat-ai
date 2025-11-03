"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

// Keep prompts stable across renders to avoid re-creating the array on each render
const PROMPTS = [
 "Kelgan murojaatlar matnidan asosiy muammolar va takroriy mavzularni ajrating, so‘ng 5 ta tezkor chorani yozing...",
  "Yangi normativ-huquqiy hujjatlarni qisqacha jamlang: kuchga kirish sanasi, ta’sir doirasi va 7 bandlik amal rejasini ko‘rsating...",
  "Kiritilgan materiallardan rasmiy Ma’lumotnoma tuzing: qisqa mazmun, asosiy dalillar, xulosa va mas’ul ijrochilar...",
  "Yig‘ilish yozuvlaridan Bayonnoma tayyorlang: kun tartibi, qarorlar, muddatlar va javobgarlar ro‘yxatini bering...",
  "Davlat xaridi/RFP matniga javob loyihasini yozing: muvofiqlik, texnik taklif, jadvallar va kafolatlar bo‘yicha punktlar...",
];

export default function TypingPromptInput() {
  const [displayText, setDisplayText] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Controls the typing speed
  const typingSpeed = 50; // milliseconds per character
  const deletingSpeed = 20; // milliseconds per character
  const pauseBeforeDelete = 2000; // pause before deleting
  const pauseBeforeNextPrompt = 500; // pause before typing next prompt

  useEffect(() => {
    // In the browser, setTimeout returns a number; NodeJS.Timeout causes TS errors without Node types
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping) {
      // Typing animation
      if (currentCharIndex < PROMPTS[currentPromptIndex].length) {
        timeout = setTimeout(() => {
          setDisplayText(
            PROMPTS[currentPromptIndex].substring(0, currentCharIndex + 1)
          );
          setCurrentCharIndex(currentCharIndex + 1);
        }, typingSpeed);
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseBeforeDelete);
      }
    } else {
      // Deleting animation
      if (currentCharIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(
            PROMPTS[currentPromptIndex].substring(0, currentCharIndex - 1)
          );
          setCurrentCharIndex(currentCharIndex - 1);
        }, deletingSpeed);
      } else {
        // Finished deleting, move to next prompt
        timeout = setTimeout(() => {
          setCurrentPromptIndex((currentPromptIndex + 1) % PROMPTS.length);
          setIsTyping(true);
        }, pauseBeforeNextPrompt);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentCharIndex, currentPromptIndex, isTyping]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Outer glow effect */}
        <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-primary/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative">
          <Input
            className="pr-20 py-8 rounded-xl backdrop-blur-md border-2 focus-visible:ring-0 focus-visible:ring-offset-0 
            dark:bg-background/20 dark:border-white/5 dark:text-white
            bg-white/70 border-primary/10 text-gray-800 shadow-[0_4px_20px_rgba(36,101,237,0.2)]"
            placeholder=""
            value={displayText}
            readOnly
          />
          <Button
            size="icon"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 
            bg-primary/90 hover:bg-primary backdrop-blur-md shadow-md"
            aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
