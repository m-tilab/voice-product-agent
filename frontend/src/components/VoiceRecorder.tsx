"use client";

import { useRef, useState } from "react";
import type { RecordingState } from "@/lib/types";

interface Props {
  state: RecordingState;
  onAudioCaptured: (audio: { blob: Blob; sampleRate: number }) => void;
  onRecordingChange: (isRecording: boolean) => void;
  onReset: () => void;
}

export default function VoiceRecorder({ state, onAudioCaptured, onRecordingChange, onReset }: Props) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const pcmChunks = useRef<Float32Array[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const processorNode = audioContext.createScriptProcessor(4096, 1, 1);

      pcmChunks.current = [];
      processorNode.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        pcmChunks.current.push(new Float32Array(channelData));
      };

      sourceNode.connect(processorNode);
      processorNode.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      sourceNodeRef.current = sourceNode;
      processorNodeRef.current = processorNode;
      setIsRecording(true);
      onRecordingChange(true);
    } catch {
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = async () => {
    const audioContext = audioContextRef.current;
    const sourceNode = sourceNodeRef.current;
    const processorNode = processorNodeRef.current;
    const mediaStream = mediaStreamRef.current;

    processorNode?.disconnect();
    sourceNode?.disconnect();
    mediaStream?.getTracks().forEach((track) => track.stop());

    if (audioContext) {
      await audioContext.close();
    }

    const merged = mergeChunks(pcmChunks.current);
    const downsampled = downsampleBuffer(merged, audioContext?.sampleRate ?? 44100, 16000);
    const blob = encodePcm16(downsampled);

    audioContextRef.current = null;
    mediaStreamRef.current = null;
    sourceNodeRef.current = null;
    processorNodeRef.current = null;
    pcmChunks.current = [];

    setIsRecording(false);
    onRecordingChange(false);
    onAudioCaptured({ blob, sampleRate: 16000 });
  };

  const isDisabled = state === "processing" || state === "done";

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/70">Voice capture</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Describe the part you need</h2>
          <p className="mt-1 max-w-lg text-sm leading-5 text-slate-300">
            Record a short query like &ldquo;brake pads for BMW 3 Series&rdquo; or
            &ldquo;engine oil filter for Audi A4.&rdquo; The spoken language will be detected automatically.
          </p>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
          Auto detect
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[28px] border border-white/10 bg-zinc-950/80 p-3 sm:p-4">
        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-slate-200">Language detection</label>
          <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-slate-300">
            AWS Transcribe will identify the spoken language from the recording and the detected language
            will be used for the transcript and agent response.
          </div>
        </div>

        <div className="flex min-h-0 flex-1 rounded-[28px] border border-white/10 bg-gradient-to-b from-zinc-900 to-black px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-sm text-slate-200">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isRecording ? "bg-red-400 animate-pulse" : state === "processing" ? "bg-amber-400 animate-pulse" : "bg-lime-400"
                }`}
              />
              {isRecording
                ? "Recording live"
                : state === "processing"
                  ? "Processing request"
                  : "Ready to record"}
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isDisabled}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-2xl transition duration-200 sm:h-24 sm:w-24 sm:text-4xl ${
                isRecording
                  ? "scale-105 bg-red-500 text-white shadow-red-500/30"
                  : "bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-orange-500/25 hover:scale-[1.02]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <span className="absolute inset-0 rounded-full border border-white/20" />
              {isRecording ? "■" : "🎙"}
            </button>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white sm:text-base">
                {isRecording ? "Tap again to stop recording" : "Tap to start speaking"}
              </p>
              <p className="text-sm leading-5 text-slate-400">
                Short, specific requests give better matches and faster recommendations.
              </p>
            </div>

            <div className="flex h-7 items-end gap-1 sm:h-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className={`voice-meter-bar w-1.5 rounded-full ${
                    isRecording ? "bg-red-400/90" : "bg-slate-700"
                  }`}
                  style={{
                    height: `${20 + ((index % 4) + 1) * 12}px`,
                    animationDelay: `${index * 80}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              Voice input
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              16 kHz PCM
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              Parts catalog search
            </span>
          </div>

          {(state === "done" || state === "error") && (
            <button
              onClick={onReset}
              className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-sm font-medium text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-400/15"
            >
              New search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function mergeChunks(chunks: Float32Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);

  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;

    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i += 1) {
      accum += buffer[i];
      count += 1;
    }

    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function encodePcm16(buffer: Float32Array) {
  const pcmBuffer = new ArrayBuffer(buffer.length * 2);
  const view = new DataView(pcmBuffer);

  for (let i = 0; i < buffer.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Blob([pcmBuffer], { type: "application/octet-stream" });
}
