import type { ComplianceData } from "@/lib/schema";

export const maxDuration = 60;

interface SummaryRequest {
  products: Array<{
    data: ComplianceData;
    productName: string;
  }>;
  language?: "en" | "fr";
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { products, language = "en" }: SummaryRequest = await req.json();

    if (!products || products.length === 0) {
      return Response.json({ error: "No products provided" }, { status: 400 });
    }

    // Aggregate stats
    const totalProducts = products.length;
    const avgScore = Math.round(
      products.reduce((sum, p) => sum + p.data.meta_scoring.circularity_performance_score, 0) / totalProducts
    );
    const conformeCount = products.filter(p => p.data.meta_scoring.circularity_performance_score >= 80).length;
    const partielCount = products.filter(p => p.data.meta_scoring.circularity_performance_score >= 50 && p.data.meta_scoring.circularity_performance_score < 80).length;
    const aRevoirCount = products.filter(p => p.data.meta_scoring.circularity_performance_score < 50).length;

    // Count AGEC issues
    const missingTraceability = products.filter(p =>
      !p.data.agec_compliance.traceability.weaving_knitting_country ||
      !p.data.agec_compliance.traceability.dyeing_printing_country ||
      !p.data.agec_compliance.traceability.manufacturing_country
    ).length;

    const notRecyclable = products.filter(p => !p.data.agec_compliance.recyclability.is_majority_recyclable).length;
    const hasSVHC = products.filter(p => p.data.agec_compliance.hazardous_substances.contains_svhc).length;
    const needsMicroplasticWarning = products.filter(p => p.data.agec_compliance.material_analysis.microplastic_warning_required).length;
    const hasRecycledContent = products.filter(p => p.data.agec_compliance.material_analysis.recycled_content_percentage > 0).length;
    const hasHighRecycled = products.filter(p => p.data.agec_compliance.material_analysis.recycled_content_percentage > 25).length;

    // Count ISO 59040 PCDS completeness based on actual schema
    const hasPostConsumerRecycled = products.filter(p =>
      p.data.iso_59040_pcds.section_2_inputs.statement_2503_post_consumer
    ).length;

    const hasReachCompliant = products.filter(p =>
      p.data.iso_59040_pcds.section_2_inputs.statement_2301_reach_compliant
    ).length;

    const hasRepairable = products.filter(p =>
      p.data.iso_59040_pcds.section_3_better_use.statement_3000_repairable
    ).length;

    const hasClosedLoop = products.filter(p =>
      p.data.iso_59040_pcds.section_5_end_of_life.statement_5032_closed_loop
    ).length;

    // Calculate ISO 59040 completeness percentage (4 statements total)
    const iso59040Completeness = Math.round(
      products.reduce((sum, p) => {
        let score = 0;
        const total = 4;
        if (p.data.iso_59040_pcds.section_2_inputs.statement_2503_post_consumer) score++;
        if (p.data.iso_59040_pcds.section_2_inputs.statement_2301_reach_compliant) score++;
        if (p.data.iso_59040_pcds.section_3_better_use.statement_3000_repairable) score++;
        if (p.data.iso_59040_pcds.section_5_end_of_life.statement_5032_closed_loop) score++;
        return sum + (score / total) * 100;
      }, 0) / totalProducts
    );

    // Collect all unique blockers
    const allBlockers = new Set<string>();
    products.forEach(p => {
      p.data.agec_compliance.recyclability.blockers.forEach(b => allBlockers.add(b));
    });

    // Generate prompt based on language
    const prompt = language === "fr"
      ? `Tu es un expert en conformité textile AGEC (loi française) et ISO 59040 PCDS (Product Circularity Data Sheet - standard international). Rédige un résumé exécutif en français pour un lot de ${totalProducts} produits analysés.

## Données AGEC (loi française anti-gaspillage) :
- Score moyen de conformité AGEC : ${avgScore}/100
- Produits conformes (≥80%) : ${conformeCount}
- Produits partiellement conformes (50-79%) : ${partielCount}
- Produits à revoir (<50%) : ${aRevoirCount}

## Problèmes AGEC détectés :
- Traçabilité incomplète (3 pays requis) : ${missingTraceability} produits (sur ${totalProducts})
- Non recyclables (fibre-à-fibre) : ${notRecyclable} produits
- Contiennent des SVHC : ${hasSVHC} produits
- Nécessitent avertissement microplastique : ${needsMicroplasticWarning} produits
- Contenu recyclé >0% : ${hasRecycledContent} produits
- Contenu recyclé >25% : ${hasHighRecycled} produits

## Données ISO 59040 PCDS (circularité internationale) :
- Score moyen de complétude PCDS : ${iso59040Completeness}%
- §2503 Contenu recyclé post-consommation >25% : ${hasPostConsumerRecycled} produits
- §2301 Conformité REACH : ${hasReachCompliant} produits
- §3000 Réparabilité : ${hasRepairable} produits
- §5032 Recyclage en boucle fermée (fibre-à-fibre) : ${hasClosedLoop} produits

## Blockers de recyclabilité détectés :
${Array.from(allBlockers).slice(0, 10).join('\n') || 'Aucun'}

## Rédige un texte structuré avec :

1. **Synthèse** (2-3 phrases) : Vue d'ensemble couvrant AGEC ET ISO 59040

2. **Points forts** (liste à puces) : Ce qui est bien pour AGEC et ISO 59040 (max 4 points)

3. **Points d'amélioration** (liste à puces) : Ce qui manque pour AGEC et ISO 59040 (max 5 points)

4. **Plan d'action prioritaire** (liste numérotée) : 3-5 actions concrètes pour atteindre 100% de conformité AGEC ET PCDS, par ordre de priorité/impact

Sois concis, professionnel et actionnable. Mentionne clairement quand un point concerne AGEC vs ISO 59040.
Réponds en JSON avec cette structure exacte :
{
  "synthese": "texte",
  "pointsForts": ["point1", "point2"],
  "pointsAmelioration": ["point1", "point2"],
  "planAction": ["action1", "action2"]
}`
      : `You are an expert in textile compliance for AGEC (French law) and ISO 59040 PCDS (Product Circularity Data Sheet - international standard). Write an executive summary in English for a batch of ${totalProducts} analyzed products.

## AGEC Data (French anti-waste law):
- Average AGEC compliance score: ${avgScore}/100
- Compliant products (≥80%): ${conformeCount}
- Partially compliant products (50-79%): ${partielCount}
- Products to review (<50%): ${aRevoirCount}

## AGEC Issues Detected:
- Incomplete traceability (3 countries required): ${missingTraceability} products (out of ${totalProducts})
- Not recyclable (fiber-to-fiber): ${notRecyclable} products
- Contain SVHC: ${hasSVHC} products
- Require microplastic warning: ${needsMicroplasticWarning} products
- Recycled content >0%: ${hasRecycledContent} products
- Recycled content >25%: ${hasHighRecycled} products

## ISO 59040 PCDS Data (international circularity):
- Average PCDS completeness score: ${iso59040Completeness}%
- §2503 Post-consumer recycled content >25%: ${hasPostConsumerRecycled} products
- §2301 REACH compliance: ${hasReachCompliant} products
- §3000 Repairability: ${hasRepairable} products
- §5032 Closed-loop recycling (fiber-to-fiber): ${hasClosedLoop} products

## Recyclability Blockers Detected:
${Array.from(allBlockers).slice(0, 10).join('\n') || 'None'}

## Write a structured text with:

1. **Summary** (2-3 sentences): Overview covering both AGEC AND ISO 59040

2. **Strengths** (bullet list): What's good for AGEC and ISO 59040 (max 4 points)

3. **Areas for Improvement** (bullet list): What's missing for AGEC and ISO 59040 (max 5 points)

4. **Priority Action Plan** (numbered list): 3-5 concrete actions to reach 100% AGEC AND PCDS compliance, in order of priority/impact

Be concise, professional and actionable. Clearly mention when a point concerns AGEC vs ISO 59040.
Respond in JSON with this exact structure:
{
  "synthese": "text",
  "pointsForts": ["point1", "point2"],
  "pointsAmelioration": ["point1", "point2"],
  "planAction": ["action1", "action2"]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API error:", response.status, errorBody);
      return Response.json(
        { error: `API error: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text || "";

    // Parse JSON from response
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "");
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const summary = JSON.parse(jsonStr);

    return Response.json({
      success: true,
      summary,
      stats: {
        totalProducts,
        avgScore,
        conformeCount,
        partielCount,
        aRevoirCount,
        missingTraceability,
        notRecyclable,
        hasSVHC,
        needsMicroplasticWarning,
        hasRecycledContent,
        hasHighRecycled,
        // ISO 59040 stats
        iso59040Completeness,
        hasPostConsumerRecycled,
        hasReachCompliant,
        hasRepairable,
        hasClosedLoop,
      },
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
