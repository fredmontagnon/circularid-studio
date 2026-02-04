import type { ComplianceData } from "@/lib/schema";

export const maxDuration = 60;

interface SummaryRequest {
  products: Array<{
    data: ComplianceData;
    productName: string;
  }>;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { products }: SummaryRequest = await req.json();

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

    // Count issues
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

    // Collect all unique blockers
    const allBlockers = new Set<string>();
    products.forEach(p => {
      p.data.agec_compliance.recyclability.blockers.forEach(b => allBlockers.add(b));
    });

    // Collect all gap advice
    const allAdvice = new Set<string>();
    products.forEach(p => {
      p.data.meta_scoring.gap_analysis_advice.forEach(a => allAdvice.add(a));
    });

    const prompt = `Tu es un expert en conformité textile AGEC et ISO 59040. Rédige un résumé exécutif en français pour un lot de ${totalProducts} produits analysés.

## Données agrégées :
- Score moyen de conformité AGEC : ${avgScore}/100
- Produits conformes (≥80%) : ${conformeCount}
- Produits partiellement conformes (50-79%) : ${partielCount}
- Produits à revoir (<50%) : ${aRevoirCount}

## Problèmes détectés :
- Traçabilité incomplète : ${missingTraceability} produits (sur ${totalProducts})
- Non recyclables : ${notRecyclable} produits
- Contiennent des SVHC : ${hasSVHC} produits
- Nécessitent avertissement microplastique : ${needsMicroplasticWarning} produits
- Contenu recyclé >0% : ${hasRecycledContent} produits
- Contenu recyclé >25% : ${hasHighRecycled} produits

## Blockers de recyclabilité détectés :
${Array.from(allBlockers).slice(0, 10).join('\n') || 'Aucun'}

## Rédige un texte structuré avec :

1. **Synthèse** (2-3 phrases) : Vue d'ensemble de la conformité du lot

2. **Points forts** (liste à puces) : Ce qui est bien (max 4 points)

3. **Points d'amélioration** (liste à puces) : Ce qui manque ou pose problème (max 5 points)

4. **Plan d'action prioritaire** (liste numérotée) : 3-5 actions concrètes pour atteindre 100% de conformité, par ordre de priorité/impact

Sois concis, professionnel et actionnable. Utilise des pourcentages quand pertinent.
Réponds en JSON avec cette structure exacte :
{
  "synthese": "texte",
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
