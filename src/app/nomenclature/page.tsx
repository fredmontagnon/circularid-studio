"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Scale,
  Globe,
  BookOpen,
  FileText,
  ShieldCheck,
  Recycle,
  MapPin,
  FlaskConical,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Package,
  ExternalLink,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

function SectionCard({
  icon: Icon,
  iconColor,
  title,
  badge,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div {...fadeIn} transition={{ delay }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon size={16} className={iconColor} />
            <span className="text-white/80">{title}</span>
            {badge && (
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {badge}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-white/60 leading-relaxed">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FieldRow({
  field,
  type,
  description,
}: {
  field: string;
  type: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="min-w-0 flex-1">
        <code className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded">
          {field}
        </code>
        <p className="mt-1 text-white/50">{description}</p>
      </div>
      <Badge variant="secondary" className="text-[9px] h-fit flex-shrink-0">
        {type}
      </Badge>
    </div>
  );
}

export default function NomenclaturePage() {
  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={14} />
                Back to Cleaner
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            <BookOpen
              size={28}
              className="inline-block text-cyan-400 mr-3 -mt-1"
            />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              Standards Nomenclature
            </span>
          </h1>
          <p className="text-white/40 text-sm max-w-2xl">
            Reference guide for the two compliance frameworks used by Arianee
            PCDS Cleaner: the French AGEC Law and the international ISO 59040
            standard for Product Circularity Data Sheets.
          </p>
        </motion.div>

        {/* ============================================================ */}
        {/*  AGEC LAW SECTION                                            */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale size={22} className="text-purple-400" />
            <h2 className="text-xl font-semibold text-white/90">
              Loi AGEC (Anti-Gaspillage pour une Economie Circulaire)
            </h2>
          </div>
          <div className="glass rounded-lg p-4 mb-6 text-xs text-white/50 leading-relaxed">
            <p>
              French law n&deg;2020-105 (February 10, 2020) aims to eliminate
              waste and promote a circular economy. For textile products,
              it imposes mandatory traceability, recyclability assessment,
              material disclosure, and hazardous substance labeling.
              Applicable since January 1, 2023.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <SectionCard
            icon={MapPin}
            iconColor="text-cyan-400"
            title="Traceability (Art. 13)"
            badge="AGEC"
            delay={0.15}
          >
            <p>
              Mandatory geographic traceability for 3 key production stages.
              Each step must be identified by its ISO 3166-1 alpha-2 country
              code.
            </p>
            <FieldRow
              field="weaving_knitting_country"
              type="ISO 3166-1"
              description="Country where the fabric was woven or knitted. For footwear: stitching country."
            />
            <FieldRow
              field="dyeing_printing_country"
              type="ISO 3166-1"
              description="Country where the fabric was dyed, printed or finished. For footwear: finishing country."
            />
            <FieldRow
              field="manufacturing_country"
              type="ISO 3166-1"
              description="Country where the final garment was cut, sewn and assembled. For footwear: final assembly."
            />
          </SectionCard>

          <SectionCard
            icon={Recycle}
            iconColor="text-green-400"
            title="Recyclability (5 French Criteria)"
            badge="AGEC"
            delay={0.2}
          >
            <p>
              A product is considered recyclable only if ALL 5 criteria are
              simultaneously met:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-white/50">
              <li>
                <strong className="text-white/70">Collection</strong> &mdash;
                A collection infrastructure exists for this product category
                (e.g., textile deposit bins in France via Re_fashion).
              </li>
              <li>
                <strong className="text-white/70">Sorting</strong> &mdash;
                Industrial sorting infrastructure is in place and operational.
              </li>
              <li>
                <strong className="text-white/70">No Disruptors</strong>{" "}
                &mdash; The product does not contain elements that block
                recycling: elastane &gt;3%, inseparable metal/plastic trims,
                bonded multi-layer materials, heavy coatings.
              </li>
              <li>
                <strong className="text-white/70">Yield &gt;50%</strong>{" "}
                &mdash; The recycling process must recover more than 50% of
                the product weight as usable material.
              </li>
              <li>
                <strong className="text-white/70">Industrial Scale</strong>{" "}
                &mdash; The recycling pathway must operate at industrial scale,
                not just pilot or laboratory.
              </li>
            </ol>
            <FieldRow
              field="is_majority_recyclable"
              type="Boolean"
              description="True only if all 5 criteria above are satisfied."
            />
            <FieldRow
              field="blockers"
              type="String[]"
              description="List of specific recycling disruptors detected (e.g., 'Elastane 5%', 'Metal zippers non-separable')."
            />
          </SectionCard>

          <SectionCard
            icon={FlaskConical}
            iconColor="text-purple-400"
            title="Material Analysis"
            badge="AGEC"
            delay={0.25}
          >
            <p>
              Mandatory disclosure of fiber composition, including synthetic
              content and microplastic warning obligations.
            </p>
            <FieldRow
              field="synthetic_fiber_percentage"
              type="Number"
              description="Total % of synthetic fibers (polyester, nylon, acrylic, polypropylene, elastane). Includes all petroleum-derived fibers."
            />
            <FieldRow
              field="microplastic_warning_required"
              type="Boolean"
              description="If synthetic fibers exceed 50%, the product MUST carry a microplastic release warning label per AGEC Article L541-9-3."
            />
            <FieldRow
              field="recycled_content_percentage"
              type="Number"
              description="% of the product made from recycled materials (post-consumer or post-industrial). 0 if none or unknown."
            />
          </SectionCard>

          <SectionCard
            icon={AlertTriangle}
            iconColor="text-orange-400"
            title="Hazardous Substances (REACH / SVHC)"
            badge="AGEC + EU"
            delay={0.3}
          >
            <p>
              Cross-references the EU REACH regulation (EC 1907/2006). Products
              containing Substances of Very High Concern (SVHC) above 0.1%
              w/w must be declared.
            </p>
            <FieldRow
              field="contains_svhc"
              type="Boolean"
              description="True if any SVHC is present above 0.1% threshold. Common textile SVHCs: nickel (zippers, rivets), lead, chromium VI, formaldehyde, PFAS (water-repellent coatings), phthalates, certain azo dyes, antimony trioxide."
            />
            <FieldRow
              field="substance_names"
              type="String[]"
              description="List of specific SVHC substances detected or strongly implied from the product description."
            />
            <div className="mt-2 p-2 rounded bg-orange-500/5 border border-orange-500/10 text-orange-300/70">
              <strong>ECHA Candidate List</strong>: The European Chemicals
              Agency maintains the official SVHC candidate list, updated
              biannually. Currently 240+ substances.
            </div>
          </SectionCard>
        </div>

        {/* ============================================================ */}
        {/*  ISO 59040 SECTION                                           */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={22} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white/90">
              ISO 59040 &mdash; Product Circularity Data Sheet (PCDS)
            </h2>
          </div>
          <div className="glass rounded-lg p-4 mb-6 text-xs text-white/50 leading-relaxed">
            <p>
              ISO 59040:2024 defines a standardized framework for communicating
              product circularity information across the value chain. It uses a
              &ldquo;Statement&rdquo; system organized in 6 sections covering
              the full product lifecycle: Inputs, Better Use, Value Recovery,
              End of Life, and Outputs.
            </p>
          </div>
        </motion.div>

        <div className="space-y-4 mb-12">
          <SectionCard
            icon={Package}
            iconColor="text-cyan-400"
            title="Section 2 &mdash; Circular Inputs"
            badge="ISO 59040"
            delay={0.4}
          >
            <p>
              Evaluates how circular the raw materials used in the product
              are.
            </p>
            <FieldRow
              field="statement_2503_post_consumer"
              type="Boolean"
              description="PCDS Statement 2503: Product contains >25% post-consumer recycled content. Post-consumer = material from end-user waste streams (used clothing, collected textiles). Distinguished from post-industrial (factory scraps)."
            />
            <FieldRow
              field="statement_2301_reach_compliant"
              type="Boolean"
              description="PCDS Statement 2301: Product is fully REACH compliant with no SVHC detected above the 0.1% threshold. This is the chemical safety gate for circular inputs."
            />
          </SectionCard>

          <SectionCard
            icon={Wrench}
            iconColor="text-purple-400"
            title="Section 3 &mdash; Better Use (Longevity)"
            badge="ISO 59040"
            delay={0.45}
          >
            <p>
              Measures whether the product is designed for extended use
              through repairability.
            </p>
            <FieldRow
              field="statement_3000_repairable"
              type="Boolean"
              description="PCDS Statement 3000: The product is designed so a non-expert consumer can repair it. Evaluated by: replaceable buttons/zippers, accessible seams, availability of repair kits, modular construction, repair instructions included."
            />
          </SectionCard>

          <SectionCard
            icon={RotateCcw}
            iconColor="text-green-400"
            title="Section 5 &mdash; End of Life"
            badge="ISO 59040"
            delay={0.5}
          >
            <p>
              Evaluates whether the product is designed to feed back into the
              material cycle at end of life.
            </p>
            <FieldRow
              field="statement_5032_closed_loop"
              type="Boolean"
              description="PCDS Statement 5032: Product is designed for fiber-to-fiber (closed-loop) recycling. Requires: mono-material composition OR easily separable components, no chemical disruptors, compatible with existing recycling infrastructure. Multi-material products with elastane, coatings or bonded layers fail this criterion."
            />
          </SectionCard>
        </div>

        {/* ============================================================ */}
        {/*  SCORING METHODOLOGY                                         */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} transition={{ delay: 0.55 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={22} className="text-yellow-400" />
            <h2 className="text-xl font-semibold text-white/90">
              Scoring Methodology
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <SectionCard
            icon={FileText}
            iconColor="text-cyan-400"
            title="Data Completeness Score"
            badge="0-100"
            delay={0.6}
          >
            <p>
              Measures how much data was successfully extracted from the
              unstructured input.
            </p>
            <div className="bg-white/[0.02] rounded-md p-3 font-mono text-[10px] text-white/50">
              <p className="text-white/70 mb-1">Formula:</p>
              <p>score = (non_null_fields / total_fields) &times; 100</p>
              <p className="mt-2 text-white/70">Key tracked fields:</p>
              <p>
                name, gtin, sku, weaving_country, dyeing_country,
                manufacturing_country, synthetic_%, recycled_%, svhc_status
              </p>
            </div>
          </SectionCard>

          <SectionCard
            icon={Recycle}
            iconColor="text-green-400"
            title="Circularity Performance Score"
            badge="0-100"
            delay={0.65}
          >
            <p>
              Weighted score reflecting the product&apos;s actual circular
              economy performance.
            </p>
            <div className="bg-white/[0.02] rounded-md p-3 space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-white/50">
                  Recycled content &gt;25%
                </span>
                <span className="text-green-400 font-mono">+25 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">
                  Majority recyclable (5 criteria)
                </span>
                <span className="text-green-400 font-mono">+25 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">No hazardous substances</span>
                <span className="text-green-400 font-mono">+20 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">
                  Full traceability (3/3 countries)
                </span>
                <span className="text-green-400 font-mono">+15 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Closed-loop design</span>
                <span className="text-green-400 font-mono">+15 pts</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5">
                <span className="text-white/70 font-semibold">Maximum</span>
                <span className="text-white/70 font-mono font-semibold">
                  100 pts
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* External References */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.7 }}
          className="glass rounded-xl p-6 mb-12"
        >
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <ExternalLink size={14} className="text-cyan-400" />
            Official References
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2 text-white/40">
              <p className="text-white/60 font-semibold">AGEC Law</p>
              <p>
                Loi n&deg;2020-105 du 10 f&eacute;vrier 2020 relative &agrave; la lutte
                contre le gaspillage et &agrave; l&apos;&eacute;conomie circulaire
              </p>
              <p>
                D&eacute;cret n&deg;2022-748 &mdash; Tra&ccedil;abilit&eacute; textile
              </p>
              <p>
                Re_fashion (formerly Eco-TLC) &mdash; French textile EPR
                scheme
              </p>
            </div>
            <div className="space-y-2 text-white/40">
              <p className="text-white/60 font-semibold">ISO 59040</p>
              <p>
                ISO 59040:2024 &mdash; Circular economy &mdash; Product
                circularity data sheet
              </p>
              <p>
                REACH Regulation (EC) No 1907/2006 &mdash; ECHA SVHC Candidate
                List
              </p>
              <p>
                ISO 3166-1 &mdash; Country codes (alpha-2)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
