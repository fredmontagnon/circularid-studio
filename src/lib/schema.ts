import { z } from "zod";

// === COMPLIANCE DATA SCHEMA (Zod) ===
// This is the single source of truth for both ISO 59040 + AGEC compliance

export const productIdentitySchema = z.object({
  name: z.string().describe("Product name"),
  gtin: z.string().nullable().describe("Global Trade Item Number or null if unknown"),
  sku: z.string().describe("Stock Keeping Unit or internal reference"),
});

export const traceabilitySchema = z.object({
  weaving_knitting_country: z
    .string()
    .nullable()
    .describe("ISO 3166-1 alpha-2 country code for weaving/knitting. null if unknown."),
  dyeing_printing_country: z
    .string()
    .nullable()
    .describe("ISO 3166-1 alpha-2 country code for dyeing/printing. null if unknown."),
  manufacturing_country: z
    .string()
    .nullable()
    .describe("ISO 3166-1 alpha-2 country code for final manufacturing/assembly. null if unknown."),
});

export const recyclabilitySchema = z.object({
  is_majority_recyclable: z
    .boolean()
    .describe(
      "Based on 5 French criteria: 1) Collection infrastructure exists, 2) Sorting infrastructure exists, 3) No disruptors blocking recycling, 4) Recycling yield > 50%, 5) Recycling at industrial scale. True only if ALL criteria met."
    ),
  blockers: z
    .array(z.string())
    .describe(
      "List of detected recycling disruptors, e.g. 'Elastane > 5%', 'Multi-material construction', 'Non-separable trim'"
    ),
});

export const materialAnalysisSchema = z.object({
  synthetic_fiber_percentage: z
    .number()
    .describe("Total percentage of synthetic fibers (polyester, nylon, acrylic, etc.)"),
  microplastic_warning_required: z
    .boolean()
    .describe("MUST be true if synthetic_fiber_percentage > 50"),
  recycled_content_percentage: z
    .number()
    .describe("Percentage of recycled content in the product. 0 if unknown or none."),
});

export const hazardousSubstancesSchema = z.object({
  contains_svhc: z
    .boolean()
    .describe(
      "True if product likely contains Substances of Very High Concern per REACH regulation (>0.1% threshold). Check for: nickel, lead, chromium VI, formaldehyde, etc."
    ),
  substance_names: z
    .array(z.string())
    .describe("Names of potentially hazardous substances detected from input"),
});

export const agecComplianceSchema = z.object({
  traceability: traceabilitySchema,
  recyclability: recyclabilitySchema,
  material_analysis: materialAnalysisSchema,
  hazardous_substances: hazardousSubstancesSchema,
});

export const iso59040Section2Schema = z.object({
  statement_2503_post_consumer: z
    .boolean()
    .describe("True if product contains >25% post-consumer recycled content"),
  statement_2301_reach_compliant: z
    .boolean()
    .describe("True if product is REACH compliant (no SVHC above threshold)"),
});

export const iso59040Section3Schema = z.object({
  statement_3000_repairable: z
    .boolean()
    .describe("True if the product is designed to be repairable by a non-expert"),
});

export const iso59040Section5Schema = z.object({
  statement_5032_closed_loop: z
    .boolean()
    .describe("True if the product is designed for fiber-to-fiber (closed-loop) recycling"),
});

export const iso59040PcdsSchema = z.object({
  section_2_inputs: iso59040Section2Schema,
  section_3_better_use: iso59040Section3Schema,
  section_5_end_of_life: iso59040Section5Schema,
});

export const metaScoringSchema = z.object({
  data_completeness_score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Score from 0-100 representing how many fields were successfully extracted vs total fields. null fields reduce the score."
    ),
  circularity_performance_score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "AGEC compliance score 0-100: traceability complete (30pts), recyclability met (25pts), no SVHC (20pts), recycled content (15pts, +10 if >25%), no microplastic warning (10pts)"
    ),
  gap_analysis_advice: z
    .array(z.string())
    .describe(
      "Specific actionable advice for each null or problematic field. Format: 'Missing [Field]: [Action to take]'"
    ),
});

export const complianceDataSchema = z.object({
  product_identity: productIdentitySchema,
  agec_compliance: agecComplianceSchema,
  iso_59040_pcds: iso59040PcdsSchema,
  meta_scoring: metaScoringSchema,
});

export type ComplianceData = z.infer<typeof complianceDataSchema>;
export type ProductIdentity = z.infer<typeof productIdentitySchema>;
export type AGECCompliance = z.infer<typeof agecComplianceSchema>;
export type ISO59040PCDS = z.infer<typeof iso59040PcdsSchema>;
export type MetaScoring = z.infer<typeof metaScoringSchema>;
