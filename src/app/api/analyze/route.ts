import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { complianceDataSchema } from "@/lib/schema";
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

    const { object } = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: complianceDataSchema,
      prompt,
      temperature: 0.1,
    });

    return Response.json({
      success: true,
      data: object,
      raw_input: input.trim(),
    });
  } catch (error: unknown) {
    console.error("Analysis error:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
    const message =
      error instanceof Error
        ? error.message
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
