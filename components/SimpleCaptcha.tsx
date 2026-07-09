"use client";

import { useState, useEffect, useCallback } from "react";

interface CaptchaChallenge {
  question: string;
  answer: number;
}

function generateChallenge(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    question: `What is ${a} + ${b}?`,
    answer: a + b,
  };
}

interface SimpleCaptchaProps {
  onValidChange: (isValid: boolean, honeypotTriggered: boolean) => void;
  compact?: boolean;
}

export default function SimpleCaptcha({ onValidChange, compact = false }: SimpleCaptchaProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Generate challenge on mount (client-side only)
  useEffect(() => {
    setChallenge(generateChallenge());
  }, []);

  const validate = useCallback(() => {
    if (!challenge) return;

    const honeypotTriggered = honeypot.length > 0;
    const isCorrect = parseInt(userAnswer, 10) === challenge.answer;

    onValidChange(isCorrect && !honeypotTriggered, honeypotTriggered);
  }, [challenge, userAnswer, honeypot, onValidChange]);

  useEffect(() => {
    validate();
  }, [validate]);

  if (!challenge) {
    return null;
  }

  return (
    <div className={`captcha-wrapper ${compact ? "captcha-compact" : ""}`}>
      {/* Honeypot - hidden from humans, bots will fill it */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <label htmlFor="website-url">Website</label>
        <input
          id="website-url"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Math challenge */}
      <div className="form-group captcha-group">
        <label htmlFor="captcha-answer" className="form-label">
          {challenge.question}
        </label>
        <input
          id="captcha-answer"
          className="form-input captcha-input"
          type="number"
          inputMode="numeric"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          required
          autoComplete="off"
        />
      </div>
    </div>
  );
}
