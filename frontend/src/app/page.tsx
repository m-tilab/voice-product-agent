"use client";

import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import ProductResults from "@/components/ProductResults";
import type { AgentResponse, RecordingState } from "@/lib/types";

export default function HomePage() {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudioCaptured = async (audio: { blob: Blob; sampleRate: number }) => {
    setError(null);
    setState("processing");
    setTranscript("");
    setLanguage("");
    setAgentResponse(null);

    try {
      // Step 1: Transcribe audio via AWS Transcribe
      const formData = new FormData();
      formData.append("audio", audio.blob, "recording.pcm");
      formData.append("sampleRate", String(audio.sampleRate));

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        const payload = await transcribeRes.json().catch(() => null);
        throw new Error(payload?.detail ?? payload?.error ?? "Transcription failed");
      }

      const { transcript: text, detectedLanguage } = await transcribeRes.json();
      setTranscript(text);
      setLanguage(detectedLanguage);

      // Step 2: Send transcript to Koog agent
      const agentRes = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, language: detectedLanguage }),
      });

      if (!agentRes.ok) {
        const payload = await agentRes.json().catch(() => null);
        throw new Error(payload?.detail ?? payload?.error ?? "Agent request failed");
      }

      const response: AgentResponse = await agentRes.json();
      setAgentResponse(response);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setTranscript("");
    setLanguage("");
    setAgentResponse(null);
    setError(null);
  };

  const showTranscriptPanel = transcript || state === "processing";

  return (
    <main className="relative h-screen overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(234,88,12,0.14),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.24))]" />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
        <header className="shrink-0 px-1 py-1">
          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Find the right part faster with voice search.
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Record your request, review the recognized query on the left, and browse matching products on the right.
              </p>
            </div>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
              {state.toUpperCase()}
            </span>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="grid min-h-0 gap-3">
            <div className="min-h-0 rounded-[24px] border border-white/10 bg-black/45 p-4 shadow-xl shadow-black/30 backdrop-blur">
              <VoiceRecorder
                state={state}
                onAudioCaptured={handleAudioCaptured}
                onRecordingChange={(isRecording) => setState(isRecording ? "recording" : "idle")}
                onReset={handleReset}
              />
            </div>

            <div className="shrink-0 rounded-[24px] border border-white/10 bg-black/35 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-300/70">Search request</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Transcript and summary</h2>
                </div>
                {state === "processing" && (
                  <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-100">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                    Working...
                  </div>
                )}
              </div>

              {showTranscriptPanel ? (
                <div className="mt-3 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Transcript</p>
                      {language && (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
                          {language.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-100">
                      {transcript ? `"${transcript}"` : "Listening for speech and preparing your request..."}
                    </p>
                  </div>

                  {agentResponse?.message && (
                    <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3 text-sm leading-5 text-orange-50">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-orange-200/70">Search insight</p>
                      {agentResponse.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-4 text-sm leading-5 text-slate-400">
                  The recognized query and search summary will appear here after you record.
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-5 text-red-200">
                  <p className="mb-1 font-medium text-red-100">Request failed</p>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0">
            <ProductResults response={agentResponse} />
          </div>
        </section>
      </div>
    </main>
  );
}
