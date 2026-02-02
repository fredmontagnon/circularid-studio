/**
 * CircularID Studio — Seed / Test Script
 *
 * Tests the AI extraction logic with a tricky edge case:
 * "Men's Jacket, made in Turkey (sewing). Fabric is 60% Cotton, 35% Polyester,
 *  5% Elastane. Fabric woven in China. Zips contain Nickel."
 *
 * Expected Results:
 * - weaving_country: "CN", manufacturing_country: "TR", dyeing_country: null
 * - microplastic_warning: false (synthetic = 35% < 50%)
 * - recyclability: false (blockers: Elastane + multi-material)
 * - hazardous: true (Nickel in zips)
 *
 * Run with: npm run seed
 * Requires ANTHROPIC_API_KEY in environment
 */

import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// Inline the schema to avoid path alias issues in tsx
const complianceDataSchema = z.object({
  product_identity: z.object({
    name: z.string(),
    gtin: z.string().nullable(),
    sku: z.string(),
  }),
  agec_compliance: z.object({
    traceability: z.object({
      weaving_knitting_country: z.string().nullable(),
      dyeing_printing_country: z.string().nullable(),
      manufacturing_country: z.string().nullable(),
    }),
    recyclability: z.object({
      is_majority_recyclable: z.boolean(),
      blockers: z.array(z.string()),
    }),
    material_analysis: z.object({
      synthetic_fiber_percentage: z.number(),
      microplastic_warning_required: z.boolean(),
      recycled_content_percentage: z.number(),
    }),
    hazardous_substances: z.object({
      contains_svhc: z.boolean(),
      substance_names: z.array(z.string()),
    }),
  }),
  iso_59040_pcds: z.object({
    section_2_inputs: z.object({
      statement_2503_post_consumer: z.boolean(),
      statement_2301_reach_compliant: z.boolean(),
    }),
    section_3_better_use: z.object({
      statement_3000_repairable: z.boolean(),
    }),
    section_5_end_of_life: z.object({
      statement_5032_closed_loop: z.boolean(),
    }),
  }),
  meta_scoring: z.object({
    data_completeness_score: z.number(),
    circularity_performance_score: z.number(),
    gap_analysis_advice: z.array(z.string()),
  }),
});

const TRICKY_INPUT = `Men's Jacket, made in Turkey (sewing). Fabric is 60% Cotton, 35% Polyester, 5% Elastane. Fabric woven in China. Zips contain Nickel.`;

const SYSTEM_PROMPT = `You are a textile compliance analyst AI. Your task is to extract structured compliance data from unstructured textile product descriptions.

## CRITICAL RULES:

1. **The "Unknown" Rule:** If a data field cannot be determined from the input, set it to null. NEVER invent or guess data.

2. **Traceability Logic:**
   - If the product is footwear/shoes: look for "Stitching", "Assembly", "Finishing" locations.
   - If the product is clothing/apparel: look for "Weaving/Knitting", "Dyeing/Printing", "Manufacturing/Sewing" locations.
   - Always use ISO 3166-1 alpha-2 country codes.

3. **The Microplastic Rule:** If synthetic fibers total > 50%, microplastic_warning_required = true. Otherwise false.

4. **Recyclability Assessment (French AGEC 5 criteria):**
   - is_majority_recyclable = true ONLY if ALL 5 criteria met.
   - List ALL blockers (elastane content, multi-material, inseparable trims, etc.)

5. **Hazardous Substances (REACH/SVHC):**
   - Check for nickel, lead, chromium, cadmium, formaldehyde, PFAS, phthalates, azo dyes, antimony.
   - Metal zippers often contain nickel → set contains_svhc to true.

6. **ISO 59040:**
   - statement_2503_post_consumer: true only if post-consumer recycled >25%.
   - statement_2301_reach_compliant: true only if NO SVHC detected.
   - statement_3000_repairable: true if product design suggests easy repair.
   - statement_5032_closed_loop: true only if mono-material or designed for fiber-to-fiber recycling.

7. **Scoring:**
   - data_completeness_score: non-null fields / total fields × 100.
   - circularity_performance_score: recycled >25% (+25), recyclable (+25), no SVHC (+20), all traceability (+15), closed-loop (+15).

8. **Gap Analysis:** For every null field or gap, generate specific advice.`;

// === VALIDATION LOGIC ===
interface ValidationResult {
  field: string;
  expected: string;
  actual: string;
  passed: boolean;
}

function validate(data: z.infer<typeof complianceDataSchema>): ValidationResult[] {
  const results: ValidationResult[] = [];

  // 1. Traceability checks
  results.push({
    field: "weaving_knitting_country",
    expected: "CN",
    actual: String(data.agec_compliance.traceability.weaving_knitting_country),
    passed: data.agec_compliance.traceability.weaving_knitting_country === "CN",
  });

  results.push({
    field: "manufacturing_country",
    expected: "TR",
    actual: String(data.agec_compliance.traceability.manufacturing_country),
    passed: data.agec_compliance.traceability.manufacturing_country === "TR",
  });

  results.push({
    field: "dyeing_printing_country",
    expected: "null (gap detected)",
    actual: String(data.agec_compliance.traceability.dyeing_printing_country),
    passed: data.agec_compliance.traceability.dyeing_printing_country === null,
  });

  // 2. Microplastic check (synthetic = 35%, should be false)
  results.push({
    field: "microplastic_warning_required",
    expected: "false (synthetic 35% < 50%)",
    actual: String(data.agec_compliance.material_analysis.microplastic_warning_required),
    passed: data.agec_compliance.material_analysis.microplastic_warning_required === false,
  });

  // 3. Synthetic percentage
  results.push({
    field: "synthetic_fiber_percentage",
    expected: "35-40 (35% Polyester + 5% Elastane are both synthetic)",
    actual: String(data.agec_compliance.material_analysis.synthetic_fiber_percentage),
    passed:
      data.agec_compliance.material_analysis.synthetic_fiber_percentage >= 35 &&
      data.agec_compliance.material_analysis.synthetic_fiber_percentage <= 40,
  });

  // 4. Recyclability (should be false)
  results.push({
    field: "is_majority_recyclable",
    expected: "false (Elastane + multi-material blockers)",
    actual: String(data.agec_compliance.recyclability.is_majority_recyclable),
    passed: data.agec_compliance.recyclability.is_majority_recyclable === false,
  });

  // 5. Blockers should exist
  results.push({
    field: "recyclability.blockers",
    expected: "Non-empty array with elastane/multi-material mentions",
    actual: JSON.stringify(data.agec_compliance.recyclability.blockers),
    passed: data.agec_compliance.recyclability.blockers.length > 0,
  });

  // 6. Hazardous substances (Nickel)
  results.push({
    field: "contains_svhc",
    expected: "true (Nickel in zips)",
    actual: String(data.agec_compliance.hazardous_substances.contains_svhc),
    passed: data.agec_compliance.hazardous_substances.contains_svhc === true,
  });

  results.push({
    field: "substance_names",
    expected: "Contains 'Nickel' or 'nickel'",
    actual: JSON.stringify(data.agec_compliance.hazardous_substances.substance_names),
    passed: data.agec_compliance.hazardous_substances.substance_names.some((s) =>
      s.toLowerCase().includes("nickel")
    ),
  });

  // 7. ISO checks
  results.push({
    field: "statement_2301_reach_compliant",
    expected: "false (SVHC detected)",
    actual: String(data.iso_59040_pcds.section_2_inputs.statement_2301_reach_compliant),
    passed: data.iso_59040_pcds.section_2_inputs.statement_2301_reach_compliant === false,
  });

  results.push({
    field: "statement_5032_closed_loop",
    expected: "false (multi-material, not mono-material)",
    actual: String(data.iso_59040_pcds.section_5_end_of_life.statement_5032_closed_loop),
    passed: data.iso_59040_pcds.section_5_end_of_life.statement_5032_closed_loop === false,
  });

  // 8. Gap analysis should mention missing dyeing country
  results.push({
    field: "gap_analysis_advice",
    expected: "Should contain advice about missing dyeing/printing country",
    actual: `${data.meta_scoring.gap_analysis_advice.length} advice items`,
    passed: data.meta_scoring.gap_analysis_advice.some(
      (a) => a.toLowerCase().includes("dye") || a.toLowerCase().includes("print")
    ),
  });

  return results;
}

// === MAIN ===
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║      CircularID Studio — Seed Test Runner           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log("📝 Input:");
  console.log(`   "${TRICKY_INPUT}"\n`);
  console.log("⏳ Sending to AI extraction engine...\n");

  try {
    const { object } = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: complianceDataSchema,
      prompt: `${SYSTEM_PROMPT}\n\n## INPUT TO ANALYZE:\n\`\`\`\n${TRICKY_INPUT}\n\`\`\`\n\nExtract and return the compliance data as structured JSON matching the schema exactly.`,
      temperature: 0.1,
    });

    console.log("✅ AI Response received. Running validation...\n");
    console.log("─".repeat(60));

    const results = validate(object);
    let passed = 0;
    let failed = 0;

    for (const r of results) {
      const icon = r.passed ? "✅" : "❌";
      const status = r.passed ? "PASS" : "FAIL";
      console.log(`${icon} [${status}] ${r.field}`);
      console.log(`   Expected: ${r.expected}`);
      console.log(`   Actual:   ${r.actual}`);
      console.log("");

      if (r.passed) passed++;
      else failed++;
    }

    console.log("─".repeat(60));
    console.log(`\n📊 Results: ${passed}/${results.length} passed, ${failed} failed\n`);

    if (failed === 0) {
      console.log("🎉 ALL TESTS PASSED — The compliance engine is working correctly!\n");
    } else {
      console.log("⚠️  Some tests failed. Review the AI extraction prompt.\n");
    }

    // Print the full extracted data
    console.log("─".repeat(60));
    console.log("\n📋 Full Extracted Data:\n");
    console.log(JSON.stringify(object, null, 2));
  } catch (error) {
    console.error("\n❌ Error running seed test:", error);
    process.exit(1);
  }
}

main();
