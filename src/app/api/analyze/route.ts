import { buildExtractionPrompt } from "@/lib/prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt + "\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation. Just the raw JSON object.",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return Response.json(
        { error: "Anthropic API error", details: errorBody },
        { status: response.status }
      );
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text || "";

    // Extract JSON from the response - handle various formats
    let jsonStr = textContent.trim();

    // Remove markdown code fences if present
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?\s*```$/, "");
    }

    // Try to find JSON object if there's extra text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
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
      error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Failed to analyze input", details: message },
      { status: 500 }
    );
  }
}
