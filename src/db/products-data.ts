export interface ProductSeed {
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  detailedDesc: string;
  benefits: string[];
  applications: string[];
  howItWorks: string;
  physicalForm: string;
  packaging: string;
  technicalSpecs: Record<string, string>;
  storageHandling: string;
  imageUrl: string;
  stockKg: number;
}

export const PRODUCTS_CATALOG: ProductSeed[] = [
  {
    name: "Royal – Desiccant Powder",
    slug: "royal-desiccant-powder",
    category: "Desiccant Powder",
    shortDesc: "High-reactivity moisture-absorbing active chemical powder formulated to eliminate pinholes and porosity in recycled and virgin plastic processing.",
    detailedDesc: "Royal Desiccant Powder is specifically engineered for compounders, masterbatch producers, and plastic manufacturers dealing with moisture-laden polymer raw materials. By rapidly scavenging entrapped moisture during high-temperature extrusion, blow molding, and injection molding, it preserves the mechanical integrity and aesthetic finish of the end article.",
    benefits: [
      "Prevents surface defects such as silver streaks, fish-eyes, and voids",
      "Reduces or eliminates the necessity for prolonged pre-drying ovens",
      "Enhances melt stability and minimizes polymer degradation during re-extrusion",
      "Optimized for high-throughput processing lines running recycled regrind"
    ],
    applications: [
      "Plastic recycling and reprocessing compounds",
      "PE and PP blown film extrusion",
      "Injection molding and rotational molding",
      "HDPE / PP raffia and woven sack manufacturing"
    ],
    howItWorks: "Under processing temperatures in the extruder barrel (150°C - 280°C), the active mineral constituents react chemically with water molecules dispersed throughout the polymer melt, chemically binding moisture into a benign, heat-stable compound that remains inert inside the polymer matrix.",
    physicalForm: "Ultra-fine, free-flowing dry white mineral powder",
    packaging: "25.00 KG moisture-resistant multilayer bags (industrial grade)",
    technicalSpecs: {
      "Appearance": "Uniform white dry powder",
      "Physical State": "Solid powder",
      "Moisture Absorption Active Agent": "Calcium-based active formulation",
      "Volatiles at 105°C": "Below 1.0%",
      "Bulk Density": "Contact us for details",
      "Recommended Dosage Range": "Contact us for details (typically 1.0% - 3.0% depending on moisture content)",
      "Mesh Size / Fineness": "Contact us for details"
    },
    storageHandling: "Store in a cool, dry, and well-ventilated warehouse. Keep bags sealed until immediate point of use to prevent atmospheric moisture pickup. Use no hooks during handling.",
    imageUrl: "/assets/aistudio/royal_desiccant_powder.png",
    stockKg: 35000
  },
  {
    name: "Lime Powder – White Bull",
    slug: "lime-powder-white-bull",
    category: "Industrial Lime Powder",
    shortDesc: "Premium white industrial lime powder designed for plastic compounding, rubber processing, and construction chemical formulations.",
    detailedDesc: "White Bull Lime Powder is a high-grade, calcined mineral powder packaged in robust 25 KG industrial bags. Manufactured from selected raw stone deposits, it serves as an efficient neutralizing, drying, and stabilization agent across polymer, rubber, and chemical applications in Dadra and surrounding industrial belts.",
    benefits: [
      "Uniform brightness and consistent chemical composition",
      "Effective moisture control and acid-neutralizing capability",
      "Excellent dispersibility in polymer compounding batches",
      "Reliable batch-to-batch consistency"
    ],
    applications: [
      "Plastic additive masterbatches and compounds",
      "Rubber processing and vulcanization compounding",
      "Industrial chemical neutralization and wastewater treatment",
      "Paints, sealants, and construction chemicals"
    ],
    howItWorks: "Acts as a reactive chemical scavenger that neutralizes acidic byproducts and captures free volatile moisture during high-shear compounding operations.",
    physicalForm: "Dry fine white powder",
    packaging: "25.00 KG woven polypropylene bags (Net Wt: 25.00 Kg, Gross Wt: 25.100 Kg)",
    technicalSpecs: {
      "Brand / Label": "White Bull (Industrial Use Only)",
      "Net Weight": "25.00 Kg",
      "Origin": "Product of India",
      "Purity / Assay": "Contact us for details",
      "Particle Size": "Contact us for details",
      "Residue on 300 Mesh": "Contact us for details"
    },
    storageHandling: "Keep dry. Keep away from water sources and humid environments. Do not puncture or use hooks. Use appropriate PPE (dust mask and gloves) when discharging.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.46_PM_776980b2.jpeg",
    stockKg: 42000
  },
  {
    name: "Lime Powder – Red Bull",
    slug: "lime-powder-red-bull",
    category: "Industrial Lime Powder",
    shortDesc: "Industrial grade reactive lime powder engineered for heavy-duty plastic compounding, recycling plants, and mineral filler blends.",
    detailedDesc: "Redbull Lime Powder is a dependable industrial mineral product supplied in 25 KG sealed bags. Specially processed for heavy-duty manufacturing environments, it assists compounders in regulating moisture and stabilizing melt flow when utilizing diverse scrap plastics and variable quality regrind.",
    benefits: [
      "High thermal stability during compounding",
      "Prevents gassing and bubble formation in extruded profiles",
      "Economical and high-yield raw material",
      "Strict packaging quality ensuring dry supply"
    ],
    applications: [
      "Polyolefin reprocessing and compounding",
      "Heavy industrial drainage pipes and conduit extrusion",
      "Agricultural film and geomembrane base batches",
      "Industrial desiccation and chemical drying"
    ],
    howItWorks: "Reacts vigorously with trace moisture and acidic impurities in industrial slurries and molten polymer blends, locking water into a solid mineral matrix.",
    physicalForm: "Dry fine powder (Industrial grade)",
    packaging: "25.00 KG woven sacks with inner liner (Net: 25.00 Kg)",
    technicalSpecs: {
      "Brand / Label": "Redbull (For Industrial Use Only)",
      "Net Weight": "25.00 Kg",
      "Origin": "Product of India",
      "Moisture Content": "Below 0.8% at dispatch",
      "Chemical Activity": "Contact us for details",
      "Specific Gravity": "Contact us for details"
    },
    storageHandling: "Store on pallets in an enclosed, dry storage shed. Avoid direct ground contact. Reseal unconsumed bags immediately.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.46_PM__1__5c8e60fa.jpeg",
    stockKg: 38000
  },
  {
    name: "Lime Powder – Supreme",
    slug: "lime-powder-supreme",
    category: "Industrial Lime Powder",
    shortDesc: "High-calcium micro-pulverized lime powder with superior fineness and brightness for critical plastic manufacturing requirements.",
    detailedDesc: "Supreme Lime Powder offers advanced fineness and minimal grit, making it the preferred choice for extrusion and injection molders who require clean filter screens and impeccable surface finishes without premature pack clogging.",
    benefits: [
      "Micro-pulverized grain structure minimizing extruder die buildup",
      "Superior brightness for color-critical plastic compounds",
      "Rapid reaction kinetics for instant moisture absorption",
      "Reduced abrasive wear on extruder screws and barrels"
    ],
    applications: [
      "High-speed blown film plants",
      "Thin-wall injection molding items",
      "Technical polymer compounds and alloys",
      "Refined masterbatch formulations"
    ],
    howItWorks: "Fine particle distribution allows thorough dispersion across resin granules, creating microscopic reaction zones that scavenge moisture before steam bubbles can nucleate.",
    physicalForm: "Micro-fine white mineral powder",
    packaging: "25.00 KG bags (Net: 25.00 Kg, Gross: 25.100 Kg)",
    technicalSpecs: {
      "Brand / Grade": "Supreme",
      "Net Weight": "25.00 Kg",
      "Origin": "Product of India",
      "Fineness D97": "Contact us for details",
      "Chemical Assay": "Contact us for details",
      "Loss on Ignition": "Contact us for details"
    },
    storageHandling: "Store in a humidity-controlled space. Do not store outdoors. Keep away from acids and volatile chemicals.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.46_PM__2__54016b74.jpeg",
    stockKg: 45000
  },
  {
    name: "Shine Addi – Desiccant Masterbatch",
    slug: "shine-addi-desiccant-masterbatch",
    category: "Desiccant Masterbatch",
    shortDesc: "Pelletized active desiccant masterbatch developed for direct hopper dosing in film blowing, blow molding, and pipe extrusion lines.",
    detailedDesc: "Shine Addi Desiccant Masterbatch combines ultra-active desiccant agents with a compatible polyolefin carrier resin in uniform pellet form. It solves moisture-related defects without requiring separate powder feeding equipment, blending seamlessly with PE and PP resins in existing production lines.",
    benefits: [
      "Clean pelletized form eliminates dust in the factory environment",
      "Direct dosing in resin hoppers without special powder feeders",
      "Improves gloss and surface clarity on recycled plastic products",
      "Prevents lamination delamination, bubbles, and pinholes",
      "Allows increased utilization of cost-effective recycled polymers"
    ],
    applications: [
      "LDPE, LLDPE, HDPE blown films and shopping bags",
      "PP woven sacks and jumbo bags (FIBC)",
      "Corrugated and smooth plastic pipes",
      "Household and industrial blow-molded containers"
    ],
    howItWorks: "Pellets melt homogeneously with the base polymer inside the barrel, releasing micro-dispersed chemical drying agents that neutralize entrapped water before it reaches the die exit.",
    physicalForm: "Cylindrical / spherical solid polymer granules / pellets",
    packaging: "25.00 KG moisture-barrier bags (Net Wt: 25.00 Kg, Gross: 25.100 Kg)",
    technicalSpecs: {
      "Product Name": "Shine addi Desiccant Masterbatch",
      "Carrier Resin": "Polyolefin compatible (PE / PP)",
      "Net Weight": "25.00 Kg",
      "Origin": "Product of India",
      "Recommended Dosage": "1.0% to 3.0% (adjustable based on regrind moisture)",
      "Melt Flow Index (MFI)": "Contact us for details",
      "Compatibility": "LDPE, LLDPE, HDPE, PP"
    },
    storageHandling: "Keep sealed in original hermetic packaging until immediate loading into extruder hoppers. Store in a dry warehouse.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.47_PM_7b8b9067.jpeg",
    stockKg: 50000
  },
  {
    name: "Filler Masterbatch",
    slug: "filler-masterbatch",
    category: "Filler Masterbatch",
    shortDesc: "High-loading calcium carbonate (CaCO3) filler masterbatch formulated for cost reduction and dimensional enhancement in plastic processing.",
    detailedDesc: "Our Filler Masterbatch incorporates surface-treated, ultra-fine calcium carbonate dispersed in high-grade carrier polymers. Designed to reduce formulation costs while enhancing stiffness, heat resistance, printability, and anti-slip properties across wide-ranging thermoplastic products.",
    benefits: [
      "Significantly reduces production costs by replacing expensive virgin resin",
      "Increases modulus, tensile stiffness, and dimensional stability",
      "Improves thermal conductivity, accelerating cooling and cycle times",
      "Enhances ink adhesion and surface printability on finished films"
    ],
    applications: [
      "Carry bags, trash bags, and liner films",
      "Molded furniture, crates, and containers",
      "Thermoformed sheets, trays, and disposable tableware",
      "Blow molded bottles and jerrycans"
    ],
    howItWorks: "The surface-treated mineral particles disperse cleanly into molten polyolefins, increasing density, stiffness, and heat deflection temperature while maintaining structural integrity.",
    physicalForm: "Evenly cut white polymer pellets",
    packaging: "25.00 KG heavy-duty bags",
    technicalSpecs: {
      "Base Mineral": "Surface-treated Calcium Carbonate",
      "Carrier Polymer": "PE / PP compatible matrix",
      "Loading Percentage": "Contact us for details",
      "Specific Gravity": "Contact us for details",
      "Thermal Stability": "Up to 300°C without discoloration"
    },
    storageHandling: "Store indoors in dry conditions. Protect from direct solar exposure and moisture condensation.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.47_PM__1__0c863718.jpeg",
    stockKg: 60000
  },
  {
    name: "G.C. Chem Mineral Powder",
    slug: "gc-chem-mineral-powder",
    category: "Industrial Mineral Powder",
    shortDesc: "High-purity specialized mineral powder designed for plastic compounding, PVC profiles, rubber goods, and cable compounds.",
    detailedDesc: "G.C. Chem Mineral Powder is a versatile industrial mineral product supplied in 25 KG heavy-gauge bags under the Star brand mark. Carefully classified for fine particle distribution, it functions as a functional extender, rheology modifier, and cost-efficiency additive across plastics and rubber factories.",
    benefits: [
      "Superior whiteness and brightness index",
      "Low oil absorption properties aiding efficient processing",
      "Good compatibility with plasticizers and processing aids",
      "Improves electrical insulation properties in wire and cable sheathing"
    ],
    applications: [
      "Rigid and flexible PVC compounding (pipes, fittings, cables)",
      "Rubber sole sheets, footwear, and conveyor belt blends",
      "Masterbatch manufacturing and compounding",
      "Adhesives, sealants, and coating formulations"
    ],
    howItWorks: "Provides high volumetric packing efficiency with minimal plasticizer demand, acting as a structural mineral reinforcement in polymer matrixes.",
    physicalForm: "Dry fine white mineral powder",
    packaging: "25.00 KG woven industrial bags with Star emblem (Net: 25 Kg)",
    technicalSpecs: {
      "Brand": "G.C. CHEM (Star Emblem)",
      "Net Weight": "25 KG",
      "Application": "Industrial Use",
      "Whiteness Index": "Contact us for details",
      "Moisture Content": "Below 0.5% at dispatch",
      "pH Range": "Contact us for details"
    },
    storageHandling: "Keep dry. Use no hooks. Store stacked on wooden pallets in a dry, covered industrial facility.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.47_PM__2__d7f05d89.jpeg",
    stockKg: 30000
  },
  {
    name: "Gold Magic Powder",
    slug: "gold-magic-powder",
    category: "Specialty Mineral Powder",
    shortDesc: "High-potency industrial drying and performance powder for specialized polymer, footwear, and reclaimed rubber manufacturing.",
    detailedDesc: "Gold Magic Powder is a proprietary industrial additive packaged in five-star branded 25 KG bags. Known for its rapid moisture capturing and processing stabilization capabilities, it is extensively used by plastic recyclers and compounders to upgrade difficult and highly moist raw materials.",
    benefits: [
      "High chemical reactivity with moisture and volatile contaminants",
      "Significantly improves surface quality on reclaimed scrap items",
      "Minimizes downtime caused by bubble ruptures on extrusion dies",
      "Consistent industrial-grade bulk packaging"
    ],
    applications: [
      "Plastic recycling and reclaim lines",
      "Footwear compounding (EVA and PVC soles)",
      "Heavy construction plastic liners and damp-proof sheeting",
      "Industrial rubber goods manufacturing"
    ],
    howItWorks: "Formulated with active calcined mineral components that undergo irreversible exothermic chemical binding with moisture, neutralizing gasses before shaping.",
    physicalForm: "Dry fine mineral powder",
    packaging: "25.00 KG bags with five-star Gold Magic Powder insignia (Net: 25 KG)",
    technicalSpecs: {
      "Brand": "Gold Magic Powder (5-Star Emblem)",
      "Net Weight": "25 KG",
      "Packaging Condition": "Moisture barrier lined bags",
      "Dosage": "Contact us for details",
      "Activity Level": "Contact us for details",
      "Bulk Density": "Contact us for details"
    },
    storageHandling: "Keep in a dry warehouse. Strictly avoid damp flooring. Use no hooks during transportation and offloading.",
    imageUrl: "/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.48_PM_fc2dcb72.jpeg",
    stockKg: 32000
  }
];
