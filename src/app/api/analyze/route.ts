import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { complianceDataSchema } from "@/lib/schema";
import { buildExtractionPrompt } from "@/lib/prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
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
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      {
        error: "Failed to analyze input",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
