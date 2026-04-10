import { NextRequest, NextResponse } from "next/server";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";

const SUPPORTED_LANGUAGE_OPTIONS = ["en-US", "fa-IR", "ar-SA", "fr-FR", "de-DE", "es-ES", "zh-CN", "ja-JP"].join(
  ","
);

const client = new TranscribeStreamingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const sampleRate = Number(formData.get("sampleRate") ?? "16000");

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      return NextResponse.json({ error: "Invalid sample rate" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Stream audio to Amazon Transcribe
    const audioStream = async function* () {
      const chunkSize = 4096;
      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        yield { AudioEvent: { AudioChunk: audioBuffer.subarray(i, i + chunkSize) } };
      }
    };

    const command = new StartStreamTranscriptionCommand({
      IdentifyLanguage: true,
      LanguageOptions: SUPPORTED_LANGUAGE_OPTIONS,
      MediaEncoding: "pcm",
      MediaSampleRateHertz: sampleRate,
      AudioStream: audioStream(),
      ShowSpeakerLabel: false,
    });

    const response = await client.send(command);

    let fullTranscript = "";
    let detectedLanguage = "";
    let latestPartialTranscript = "";

    if (response.TranscriptResultStream) {
      for await (const event of response.TranscriptResultStream) {
        if (event.TranscriptEvent?.Transcript?.Results) {
          for (const result of event.TranscriptEvent.Transcript.Results) {
            const transcript = result.Alternatives?.[0]?.Transcript?.trim();

            if (transcript) {
              if (result.IsPartial) {
                latestPartialTranscript = transcript;
              } else {
                fullTranscript += transcript + " ";
                latestPartialTranscript = "";
              }
            }

            if (result.LanguageCode) {
              detectedLanguage = result.LanguageCode;
            }
          }
        }
      }
    }

    const resolvedTranscript = fullTranscript.trim() || latestPartialTranscript;

    return NextResponse.json({
      transcript: resolvedTranscript,
      detectedLanguage: detectedLanguage || "unknown",
      confidence: 1.0,
    });
  } catch (err) {
    console.error("[Transcribe] Error:", err);
    const detail =
      typeof err === "object" && err !== null
        ? Reflect.get(err, "Message") ??
          Reflect.get(err, "message") ??
          String(err)
        : String(err);

    return NextResponse.json(
      { error: "Transcription failed", detail: String(detail) },
      { status: 500 }
    );
  }
}
