import { isFocusItem, withFocus, type Board, type Item } from "./model";

const FOCUS_ORDER = [
  "cream-batch",
  "cream-stability",
  "shampoo-pair",
  "shampoo-nozzle",
  "shampoo-batch",
];

function item(entry: Omit<Item, "due"> & { due?: string | null }): Item {
  return { due: null, ...entry };
}

function buildSeed(): Board {
  const items: Item[] = [
    item({
      id: "shampoo-pair",
      title: "Rice-water shampoo + conditioner",
      area: "Shampoo + Conditioner",
      status: "Next",
      priority: "High",
      note: `Priority next product. Rice-water based, as clean as practical, modeled on pre-acquisition Native. Should leave hair soft, almost a 2-in-1. Thickening shampoo for thinning hair: biotin, rosemary, caffeine. No copper in the shampoo. The spray stays the copper product. Light, clean, low-allergen scent. Launch as a pair.

Dao makes small batches in-house. No contract manufacturer. Dao uses and likes F.A.S.T. shampoo.

Shelved earlier: a 1% ketoconazole private-label foam (a drug, and it needs an FDA-registered maker) and a plain gentle shampoo (too competitive).

Claims stay cosmetic-safe only. No regrow, treats, repairs, regenerates, shedding, or minoxidil comparisons.

Positioning: clean yet clinical, short honest lists at real doses, independent, never sell out. For women 35-60, thinning hair, midlife. "Made for midlife hair." "Skincare for your scalp." Drug-free, no grease.

Research: top-brand-shampoo-formulas-2026-10.md, native-clean-gap-2026-10.md, reddit-thickening-shampoo-2026-10.md, shampoo-mist-wants-2026-10.md, keto-shampoo-market-2026-10.md, hair-market-gaps-2026-10.md`,
    }),
    item({
      id: "shampoo-nozzle",
      title: "Source nozzle bottle for conditioner",
      area: "Shampoo + Conditioner",
      status: "Next",
      priority: "High",
      note: `Open gap to lead marketing: a thinner conditioner in a Graza-style squeeze bottle with a nozzle.

Research: nozzle-bottle-haircare-2026-10.md`,
    }),
    item({
      id: "shampoo-batch",
      title: "First small test batch",
      area: "Shampoo + Conditioner",
      status: "Next",
      priority: "High",
      note: `First shampoo and conditioner batch, made in-house, small size. Lead estimated about $800-1,500 to start. Keep the upfront spend low.`,
    }),
    item({
      id: "cream-batch",
      title: "Copper Peptide + Growth Factor Cream test batch",
      area: "Copper Cream",
      status: "Doing",
      priority: "High",
      note: `Name: Copper Peptide + Growth Factor Cream. Modeled on ZO Skin Health Growth Factor. Dao's read: "growth factor" sells the copper, because people do not know copper yet.

100 g test formula.

Water phase
- Distilled water to 100%
- Glycerin 3%
- Sodium hyaluronate 0.1-0.2%
- Xanthan 0.2%

Oil phase
- Olivem 1000 4-5%
- Cetearyl alcohol 1.5-2%
- Squalane 5%

Cool-down, under 40°C
- Panthenol 1%
- GHK-Cu, supplier dose, pre-dissolved (GHK-Cu supplier is already on hand)
- Preservative 1%: phenoxyethanol + ethylhexylglycerin, Euxyl PE 9010 type, on hand
- Tocopherol 0.2%
- Lotioncrafter LCPeptide EGF about 0.25%, added last

pH 6-6.5. Adjust with a tiny amount of citric acid or 10% NaOH.
Never EDTA, vitamin C, or acids. Tapioca starch was dropped.

Research: cream-shopping-list-2026-10.md`,
    }),
    item({
      id: "cream-stability",
      title: "Stability test, 4-8 weeks",
      area: "Copper Cream",
      status: "Doing",
      priority: "High",
      note: `Keep the copper bound.

- Quality GHK-Cu with a COA
- pH 5.5-7 (this formula targets 6-6.5)
- No chelators. Never EDTA, vitamin C, or acids
- Heat-sensitive pieces go in under 40°C
- Glass or stainless tools
- Watch the batch for green, brown, or gray
- Hold 4-8 weeks at room temp and at 40°C`,
    }),
    item({
      id: "cream-egf",
      title: "Test growth factor ingredient",
      area: "Copper Cream",
      status: "Next",
      priority: "Med",
      note: `EGF is epidermal growth factor. INCI sh-Oligopeptide-1: 53 amino acids, about 6.2 kDa, recombinant. The raw material needs refrigeration. The finished cream usually does not.

Test with Lotioncrafter LCPeptide EGF, $25.95 / 2 g.
https://lotioncrafter.com/products/lcpeptide-egf

Later, FormulateLabs EGF 0.08% concentrate, $2,220 / 50 g.
https://www.formulatelabs.ai/materials/epidermal-growth-factor

YTBIO (Shaanxi Yuantai), the Chinese supplier, offered "Oligopeptide-1" CAS 49557-75-7. That CAS is GHK tripeptide (340 Da, synthetic), not EGF. They treat real EGF as an API. Dao may ask them for cosmetic-grade sh-Oligopeptide-1.

For hair: no controlled human trials. Some lab and animal data show EGF slows hair growth. A 2023 review doubts that cosmetic EGF is active. Use it only as a marketing plus. Caffeine has better scalp evidence.

Research: egf-ghkcu-suppliers-2026-10.md, egf-hair-products-2026-10.md`,
    }),
    item({
      id: "cream-price",
      title: "Set price",
      area: "Copper Cream",
      status: "Idea",
      priority: "Med",
      note: `Packaging: $3 a jar, $1.50 a box. Ingredients about $6.50 per 1.7 oz jar without EGF. Shopping list about $258 with a pH meter, or about $187 with strips.

Dao feels $38 is too high. Market median is about $14.65/oz, roughly $25-28 a jar. TOSOWOONG is $28. COSRX is $19.60. Lead recommended a $29.99 list price, with a coupon down to $24.99-26.99. At $28 without EGF: about 77% gross margin, about $15 left after fees and shipping.

Research: copper-cream-prices-2026-10.md, cream-shopping-list-2026-10.md`,
    }),
    item({
      id: "spray-nozzle",
      title: "Precision nozzle for part/crown",
      area: "Scalp Spray",
      status: "Next",
      priority: "Med",
      note: `Existing product: 2.5% Copper Peptide Hair & Scalp Spray, AHK-Cu. 4 oz / 120 ml is $45 on Shopify, lowered from $55 on Oct 8, 2026. Amazon sells 2 oz at $34.99. Feel and look timeline is 8-12 weeks.

Packaging: HDPE is fine if the bottle is opaque or tinted. pH 5-7. Run the stability test in the real bottle.

Biggest concern is thinning and a wider part, scalp showing at the crown or part. The nozzle should let someone aim at the part and crown.

Other page notes from Oct 22: "Drug-free. No minoxidil." near the top. A water-light, no-residue demo. Panthenol for a calmer scalp. An edges and hairline section.

Customer picture: thinning plus a wider part is the biggest issue. Also flat fine hair, wanting to avoid minoxidil, no greasiness, a calmer scalp (itch or flakes), and edges. People buy when it is gentle, clean, and an easy routine. They quit if nothing changes by 8-12 weeks, if it feels greasy, or if the price feels high.

UglyBaby PDP test, 10 people: 5 would buy, 2 undecided, 3 would leave, 0 would subscribe upfront. Notes: uglybaby/full_1.txt through full_10.txt. A new PDP mockup is in progress.`,
    }),
    item({
      id: "spray-bundle",
      title: "12-week 3-bottle bundle",
      area: "Scalp Spray",
      status: "Idea",
      priority: "Med",
      note: `A 3-bottle bundle covers the 12-week run. The spray's feel and look timeline is 8-12 weeks, and people quit when one bottle is not enough time. Shopify is $45 / 4 oz. Amazon is $34.99 / 2 oz.`,
    }),
    item({
      id: "spray-emails",
      title: "Reminder emails at week 2, 6, 10",
      area: "Scalp Spray",
      status: "Idea",
      priority: "Med",
      note: `Reminder emails at week 2, week 6, and week 10, so the 8-12 week timeline stays in view. People quit when nothing looks different before then.`,
    }),
    item({
      id: "spray-guarantee",
      title: "Money-back guarantee",
      area: "Scalp Spray",
      status: "Idea",
      priority: "Low",
      note: `Proposal only, not approved: a 60-90 day money-back guarantee lined up with the 8-12 week timeline. Do not promise regrowth. Claims stay cosmetic-safe only. No regrow, treats, repairs, regenerates, shedding, or minoxidil comparisons.`,
    }),
    item({
      id: "ferment-line",
      title: "Ferment essence and cream",
      area: "Ferment Line",
      status: "On hold",
      priority: "Low",
      note: `On hold until the shampoo pays for itself.

Ferment essence that can stand next to Missha at $31 and SK-II at $99 / 2.5 oz, plus a fermented cream and lotion. Optional PDRN. Clean / organic. A ZO-like light silky texture.

Market: Anua Rice 70 does 20K+ orders a month, haruharu 10K+ a month, rice toner interest up 79.9%. No US-made rice or galactomyces cream turned up. The $30-50 band looks open. Cream comes before any sunscreen. Sunscreen is an OTC drug in the US.

Research: fermented-rice-essence-market-2026-10.md, ferment-cream-sunscreen-market-2026-10.md`,
    }),
    item({
      id: "other-soaps",
      title: "Brightening soaps",
      area: "Other",
      status: "Idea",
      priority: "Low",
      note: `Explored, not in focus. DIY topical brightening: glutathione, kojic, rosehip soaps, a 5-minute lather.

Research: glutathione-brightening, brightening-soap-ingredients, jk-brightening-soaps, diy-brightening-topicals, brightening-decision-brief.`,
    }),
    item({
      id: "other-mist",
      title: "Leave-in mist",
      area: "Other",
      status: "Idea",
      priority: "Low",
      note: `Leave-in mist, and a vitamin C mist, separate from the scalp spray.

Research: mist-vitc-bemt-2026-10.md. Nearby, not this item: amazon-estrogen-face-cream-2026-10.md.`,
    }),
  ];

  return withFocus({ items, focusOrder: FOCUS_ORDER });
}

const SEED = buildSeed();

function assertSeed(board: Board): void {
  const ids = new Set<string>();
  for (const entry of board.items) {
    if (ids.has(entry.id)) throw new Error(`Duplicate seed id: ${entry.id}`);
    ids.add(entry.id);
  }
  const eligible = board.items.filter(isFocusItem).map((entry) => entry.id);
  const sameSize = eligible.length === board.focusOrder.length;
  const sameIds = eligible.every((id) => board.focusOrder.includes(id));
  if (!sameSize || !sameIds) {
    throw new Error("Seed focus list does not match High + Next or Doing.");
  }
}

assertSeed(SEED);

export function seedBoard(): Board {
  return structuredClone(SEED);
}
