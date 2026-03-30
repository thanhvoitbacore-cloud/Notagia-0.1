"use client";

import { useState, useEffect } from "react";
import { submitTestAttempt } from "@/app/actions/tests";
import { CheckCircle2, XCircle, Timer, AlertCircle } from "lucide-react";
import Link from "next/link";

type Option = { id: string; optionText: string };
type Question = { id: string; questionText: string; correctAnswerId: string; options: Option[] };
type Test = { id: string; title: string; questions: Question[] };

export function TestPlayer({ test }: { test: Test }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isFinished) {
      timer = setInterval(() => setTimeTaken((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQ = test.questions[currentIdx];
  const isLastQ = currentIdx === test.questions.length - 1;

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleNext = () => {
    if (selectedAnswers[currentQ.id]) {
        if (!isLastQ) setCurrentIdx(currentIdx + 1);
        else finishTest();
    }
  };

  const finishTest = async () => {
    setIsFinished(true);
    
    // Calculate Score
    let finalScore = 0;
    test.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerId) finalScore += 1;
    });
    setScore(finalScore);

    setIsSubmitting(true);
    try {
      await submitTestAttempt(test.id, finalScore, timeTaken);
    } catch (error) {
      console.error("Failed to save attempt", error);
    }
    setIsSubmitting(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / test.questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-10 w-full max-w-3xl mx-auto mt-4">
        
        {/* Score Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center w-full mb-8">
          <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Test Completed!</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            {percentage >= 80 ? "Excellent work! " : percentage >= 50 ? "Good effort! " : "Keep studying! "}
            You have finished "{test.title}".
          </p>

          <div className="grid grid-cols-3 gap-4 w-full mb-8">
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Score</span>
              <div className="text-3xl font-black mt-1 text-indigo-400">{score} <span className="text-lg text-zinc-500">/ {test.questions.length}</span></div>
            </div>
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Accuracy</span>
              <div className="text-3xl font-black mt-1">{percentage}%</div>
            </div>
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Time</span>
              <div className="text-3xl font-black mt-1">{timeTaken}s</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/dashboard/tests" className="rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/5 transition">
              Back to Tests
            </Link>
            <Link href={`/dashboard/community`} className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:bg-indigo-400 hover:scale-105 transition">
              View Leaderboards
            </Link>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="w-full flex flex-col gap-6">
          <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-2">Review Your Answers</h3>
          
          {test.questions.map((q, idx) => {
            const userPickId = selectedAnswers[q.id];
            const isCorrect = userPickId === q.correctAnswerId;
            const userPickText = q.options.find(o => o.id === userPickId)?.optionText || "No answer";
            const correctPickText = q.options.find(o => o.id === q.correctAnswerId)?.optionText || "";

            return (
              <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="font-semibold text-lg mb-4">
                  <span className="text-zinc-500 mr-2">{idx + 1}.</span> {q.questionText}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-4 rounded-xl border ${isCorrect ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Your Answer</span>
                    <span className={`font-medium ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>{userPickText}</span>
                  </div>
                  
                  {!isCorrect && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Correct Answer</span>
                      <span className="font-medium text-indigo-400">{correctPickText}</span>
                    </div>
                  )}
                </div>

                {/* AI Explanation logic */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-sm text-zinc-300">
                  <span className="text-indigo-400 font-bold block mb-1">AI Explanation:</span>
                  {(q as any).explanation || "No explanation provided for this question."}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full mt-4 h-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="font-bold text-xl">{test.title}</h2>
          <span className="text-sm text-zinc-400">Question {currentIdx + 1} of {test.questions.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg font-mono font-medium">
          <Timer className="h-4 w-4" />
          {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, "0")}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 flex-1">
        <h3 className="text-2xl font-semibold mb-8 leading-tight">{currentQ.questionText}</h3>

        <div className="flex flex-col gap-3">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedAnswers[currentQ.id] === option.id;
            const letter = String.fromCharCode(65 + i);

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? "border-indigo-500 bg-indigo-500/10" 
                    : "border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm ${
                  isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-zinc-400"
                }`}>
                  {letter}
                </div>
                <span className={`text-base flex-1 ${isSelected ? "text-indigo-100 font-medium" : "text-zinc-300"}`}>
                  {option.optionText}
                </span>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center px-2">
        <p className="text-sm text-zinc-500 flex items-center gap-2">
          {!selectedAnswers[currentQ.id] && <AlertCircle className="h-4 w-4" />}
          {selectedAnswers[currentQ.id] ? "Great, let's move on." : "Select an answer to continue."}
        </p>
        <button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQ.id] || isSubmitting}
          className="rounded-xl py-3 px-8 bg-white text-black font-bold disabled:opacity-50 transition hover:bg-zinc-200"
        >
          {isLastQ ? (isSubmitting ? "Finishing..." : "Finish Test") : "Next Question"}
        </button>
      </div>
    </div>
  );
}
