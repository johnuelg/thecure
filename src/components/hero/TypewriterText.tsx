import { useState, useEffect, useCallback } from "react";

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypewriterText({
  words,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = words[currentWordIndex] || "";

  const tick = useCallback(() => {
    if (isDeleting) {
      setDisplayText((prev) => prev.slice(0, -1));
      if (displayText.length === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      setDisplayText(currentWord.slice(0, displayText.length + 1));
    }
  }, [isDeleting, displayText, currentWord, words.length]);

  useEffect(() => {
    if (words.length === 0) return;

    // Finished typing — pause then start deleting
    if (!isDeleting && displayText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    // Add slight randomness for natural feel
    const jitter = Math.random() * 40 - 20;
    const timeout = setTimeout(tick, speed + jitter);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWord, tick, typingSpeed, deletingSpeed, pauseDuration, words.length]);

  if (words.length === 0) return null;

  return (
    <span
      className="inline-block healthcare-gradient-text dark:drop-shadow-[0_0_8px_hsl(var(--healthcare-teal)/0.4)]"
    >
      {displayText}
      <span
        className="inline-block w-[3px] ml-0.5 align-middle animate-pulse"
        style={{
          height: "1em",
          background: "linear-gradient(to bottom, hsl(var(--healthcare-blue)), hsl(var(--healthcare-teal)))",
        }}
      >
        <span className="hidden dark:block w-full h-full" style={{ boxShadow: "0 0 6px hsl(var(--healthcare-teal) / 0.6)" }} />
      </span>
    </span>
  );
}
