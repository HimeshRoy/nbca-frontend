"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import boy from "@/assets/loading-boy.png";

const loadingSteps = [
  "Authenticating your account...",
  "Loading your learning dashboard...",
  "Syncing your latest activities...",
  "Preparing your personalized workspace...",
];

export default function AppLoader() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messages = setInterval(() => {
      setStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }

        return prev + 1;
      });
    }, 35);

    return () => {
      clearInterval(messages);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="loader-fade fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-violet-50">
      <div className="w-full max-w-md px-6 text-center">
        <div className="flex justify-center">
          <Image
            src={boy}
            alt="Loading"
            priority
            className="h-44 w-auto animate-floating object-contain drop-shadow-2xl sm:h-52 md:h-60 lg:h-72"
          />
        </div>
        <div className="mx-auto -mt-3 h-3 w-28 rounded-full bg-black/10 blur-md" />

        <h2 className="mt-4 text-3xl font-bold text-slate-800">
           Welcome to NBCA
        </h2>

        <p className="mt-3 h-6 animate-pulse text-sm leading-6 text-slate-500 sm:text-base">
          {loadingSteps[step]}
        </p>

        <div className="mt-8">
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-[width] duration-300 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-right text-sm font-semibold text-slate-500">
            {progress}%
          </p>
        </div>

        <p className="mt-8 text-xs tracking-wide text-slate-400 sm:text-sm">
          North Bengal Cloud Academy
        </p>
      </div>
    </div>
  );
}
