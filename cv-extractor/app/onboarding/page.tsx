"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BuilderOnboarding from "@/components/BuilderOnboarding";

function OnboardingInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  function onComplete() {
    window.location.href = `/profile?token=${token}`;
  }

  return <BuilderOnboarding prefillEmail={email} onComplete={onComplete} />;
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
