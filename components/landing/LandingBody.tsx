"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  clearSurvey,
  loadSurvey,
  saveSurvey,
  type SurveyAnswers,
} from "@/lib/demo";
import SurveyCard from "@/components/landing/SurveyCard";
import LiveDemo from "@/components/landing/LiveDemo";
import { CtaSection, HowItWorks, Markets, WhyNow } from "@/components/landing/Sections";

export default function LandingBody({ cta }: { cta: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<SurveyAnswers | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted survey after hydration
    setAnswers(loadSurvey());
    setMounted(true);
  }, []);

  const teamFocus = answers?.priorities.includes("team") ?? false;

  return (
    <>
      <section className="pb-20" id="demo">
        {!mounted ? (
          <div className="min-h-[420px]" aria-hidden="true" />
        ) : answers ? (
          <LiveDemo
            answers={answers}
            onRetake={() => {
              clearSurvey();
              setAnswers(null);
            }}
          />
        ) : (
          <SurveyCard
            onDone={(a) => {
              saveSurvey(a);
              setAnswers(a);
            }}
          />
        )}
      </section>

      {teamFocus ? (
        <>
          <Markets />
          <HowItWorks />
        </>
      ) : (
        <>
          <HowItWorks />
          <Markets />
        </>
      )}
      <WhyNow />
      <CtaSection cta={cta} />
    </>
  );
}
