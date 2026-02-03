import { buildExtractionPrompt } from "@/lib/prompt";

export const maxDuration = 300; // 5 minutes for batch processing (requires Vercel Pro)

interface BatchInput {
  rows: string[]; // Array of formatted row strings
  productNames: string[]; // Extracted product names for reference
}

async function analyzeRow(
  rowInput: string,
  productName: string,
  apiKey: string
): Promise<{
  success: boolean;
  productName: string;
  data?: unknown;
  error?: string;
  rawInput: string;
}> {
  try {
    const prompt = buildExtractionPrompt(rowInput);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content:
              prompt +
              "\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation. Just the raw JSON object.",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        productName,
        error: `API error: ${errorBody}`,
        rawInput: rowInput,
      };
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text || "";

    // Extract JSON from the response
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const data = JSON.parse(jsonStr);

    return {
      success: true,
      productName,
      data,
      rawInput: rowInput,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      productName,
      error: message,
      rawInput: rowInput,
    };
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { rows, productNames }: BatchInput = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json(
        { error: "CSV rows array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent timeouts
    const MAX_BATCH_SIZE = 10;
    const limitedRows = rows.slice(0, MAX_BATCH_SIZE);
    const limitedNames = productNames.slice(0, MAX_BATCH_SIZE);

    // Process rows in parallel (with concurrency limit of 3 to avoid rate limits)
    const CONCURRENCY = 3;
    const results: Array<{
      success: boolean;
      productName: string;
      data?: unknown;
      error?: string;
      rawInput: string;
    }> = [];

    for (let i = 0; i < limitedRows.length; i += CONCURRENCY) {
      const batch = limitedRows.slice(i, i + CONCURRENCY);
      const batchNames = limitedNames.slice(i, i + CONCURRENCY);

      const batchResults = await Promise.all(
        batch.map((row, idx) =>
          analyzeRow(row, batchNames[idx] || `Product ${i + idx + 1}`, apiKey)
        )
      );

      results.push(...batchResults);
    }

    return Response.json({
      success: true,
      total: rows.length,
      processed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      limited: rows.length > MAX_BATCH_SIZE,
      results,
    });
  } catch (error: unknown) {
    console.error("Batch analysis error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Failed to process batch", details: message },
      { status: 500 }
    );
  }
}
