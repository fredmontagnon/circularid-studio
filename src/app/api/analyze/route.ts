import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildExtractionPrompt } from "@/lib/prompt";

export const maxDuration = 60;

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { input } = await req.json();

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return Response.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    const prompt = buildExtractionPrompt(input.trim());

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-latest"),
      prompt: prompt + "\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation. Just the JSON object.",
    });

    // Extract JSON from the response (handle potential markdown code fences)
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(jsonStr);

    return Response.json({
      success: true,
      data,
      raw_input: input.trim(),
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error
        ? error.message + (error.cause ? ` | cause: ${JSON.stringify(error.cause)}` : "")
        : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
    return Response.json(
      {
        error: "Failed to analyze input",
        details: message,
      },
      { status: 500 }
    );
  }
}
