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
        model: "claude-3-haiku-20240307",
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
      console.error(`API error for ${productName}:`, response.status, errorBody.substring(0, 200));
      return {
        success: false,
        productName,
        error: `API error (${response.status}): ${errorBody.substring(0, 100)}`,
        rawInput: rowInput,
      };
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text || "";

    if (!textContent) {
      return {
        success: false,
        productName,
        error: "Empty response from API",
        rawInput: rowInput,
      };
    }

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

    try {
      const data = JSON.parse(jsonStr);

      // Validate that the parsed data has the expected structure
      if (!data.product_identity || !data.agec_compliance || !data.meta_scoring) {
        return {
          success: false,
          productName,
          error: `Invalid response structure - missing required fields`,
          rawInput: rowInput,
        };
      }

      return {
        success: true,
        productName,
        data,
        rawInput: rowInput,
      };
    } catch (parseError) {
      console.error(`JSON parse error for ${productName}:`, jsonStr.substring(0, 500));
      return {
        success: false,
        productName,
        error: `JSON parse error: ${jsonStr.substring(0, 100)}...`,
        rawInput: rowInput,
      };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      productName,
      error: `Request error: ${message}`,
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

    const body = await req.json();
    const { rows, productNames }: BatchInput = body;

    console.log("Batch request received:", {
      rowCount: rows?.length,
      productNames: productNames?.slice(0, 3),
      firstRow: rows?.[0]?.substring(0, 100),
    });

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json(
        { error: "CSV rows array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent timeouts (Vercel Pro allows 5 min)
    const MAX_BATCH_SIZE = 100;
    const limitedRows = rows.slice(0, MAX_BATCH_SIZE);
    const limitedNames = productNames.slice(0, MAX_BATCH_SIZE);

    // Process rows in parallel (with concurrency limit of 5 to balance speed/rate limits)
    const CONCURRENCY = 5;
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

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log("Batch complete:", { total: rows.length, success: successCount, failed: failedCount });
    if (failedCount > 0) {
      console.log("First failure:", results.find((r) => !r.success)?.error);
    }

    return Response.json({
      success: true,
      total: rows.length,
      processed: successCount,
      failed: failedCount,
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
