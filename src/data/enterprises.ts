import type { Enterprise, YearData, YearDetail } from "./types";
// @ts-expect-error - Node built-ins available at build time in Astro
import fs from "node:fs";
// @ts-expect-error - Node built-ins available at build time in Astro
import path from "node:path";

const STANDARDIZED_DIR = path.resolve(
  // @ts-expect-error - import.meta.dirname available in Node 21+
  import.meta.dirname,
  "../../standardized"
);

const DATA_DIR = path.resolve(
  // @ts-expect-error - import.meta.dirname available in Node 21+
  import.meta.dirname,
  "../../data"
);

// Enterprises whose data/ subdirectory differs from their ID
const PDF_DIR_MAP: Record<string, string> = {
  "ethiopian-electric-utility": "ethiopian-electric-utility/main",
  "eeu-eleap": "ethiopian-electric-utility/eleap",
};

function getPdfSourcePath(enterpriseId: string, ecYear: number): string | null {
  const subdir = PDF_DIR_MAP[enterpriseId] ?? enterpriseId;
  const filePath = path.join(DATA_DIR, subdir, `${ecYear}.pdf`);
  return fs.existsSync(filePath) ? filePath : null;
}

function loadYears(enterpriseId: string): YearData[] {
  const dir = path.join(STANDARDIZED_DIR, enterpriseId);
  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .sort();

  return files.map((file: string) => {
    const ecYear = parseInt(file);
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    return {
      year: ecYear,
      revenue: data.revenue,
      costOfSales: data.costOfSales,
      grossProfit: data.grossProfit,
      operatingProfit: data.operatingProfit,
      netProfit: data.netProfit,
      totalAssets: data.totalAssets,
      totalLiabilities: data.totalLiabilities,
      totalEquity: data.totalEquity,
      auditOpinion: data.auditOpinion ?? "Unmodified",
    } satisfies YearData;
  });
}

function loadFindings(enterpriseId: string) {
  const dir = path.join(STANDARDIZED_DIR, enterpriseId);
  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .sort();

  if (files.length === 0) return [];

  const latest = files[files.length - 1];
  const data = JSON.parse(fs.readFileSync(path.join(dir, latest), "utf-8"));
  return Array.isArray(data.auditFindings) ? data.auditFindings : [];
}

const enterprises: Enterprise[] = [
  {
    id: "ethiopian-electric-power",
    name: "Ethiopian Electric Power",
    shortName: "EEP",
    sector: "Energy",
    sectorIcon: "zap",
    description:
      "Generates, transmits, and wholesales electricity across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (originally reported in Birr'000)",
    years: loadYears("ethiopian-electric-power"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "ethiopian-electric-utility",
    name: "Ethiopian Electric Utility",
    shortName: "EEU",
    sector: "Energy",
    sectorIcon: "plug",
    description:
      "Distributes and sells electricity to end consumers across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ethiopian-electric-utility"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "ethiopian-sugar-corporation",
    name: "Ethiopian Sugar Corporation",
    shortName: "ESC",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Oversees sugar production across multiple factories including Wonji, Metehara, and Finchaa.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ethiopian-sugar-corporation"),
    auditFindings: loadFindings("ethiopian-sugar-corporation"),
    fiscalYearEnd: "Sene 23",
  },
  {
    id: "ethiopian-postal-service",
    name: "Ethiopian Postal Service Enterprise",
    shortName: "EPS",
    sector: "Logistics",
    sectorIcon: "mail",
    description:
      "Provides postal, parcel/EMS, international mailing, and transport/logistics services across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ethiopian-postal-service"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "national-veterinary-institute",
    name: "National Veterinary Institute",
    shortName: "NVI",
    sector: "Agriculture",
    sectorIcon: "syringe",
    description:
      "Produces and distributes veterinary vaccines and drugs for livestock disease prevention.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("national-veterinary-institute"),
    auditFindings: loadFindings("national-veterinary-institute"),
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "empde",
    name: "Educational Materials Production and Distribution Enterprise",
    shortName: "EMPDE",
    sector: "Publishing",
    sectorIcon: "book-open",
    description:
      "Produces and distributes educational materials including textbooks and teaching aids for schools across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("empde"),
    auditFindings: loadFindings("empde"),
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "ethioagri",
    name: "Ethiopian Agricultural Businesses Corporation",
    shortName: "EABC",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Imports and distributes agricultural inputs including fertilizer, machinery, agrochemicals, and improved seeds.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ethioagri"),
    auditFindings: loadFindings("ethioagri"),
    fiscalYearEnd: "Hamle 7",
  },
  {
    id: "nalf",
    name: "National Alcohol and Liquor Factory",
    shortName: "NALF",
    sector: "Manufacturing",
    sectorIcon: "factory",
    description:
      "Produces and distributes extra neutral alcohol and liquor products for domestic and export markets.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("nalf"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "eppsc",
    name: "Ethiopian Pulp & Paper Share Company",
    shortName: "EPPSC",
    sector: "Manufacturing",
    sectorIcon: "factory",
    description:
      "Produces kraft paper, corrugated boxes, and tissue paper, primarily from recycled materials.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("eppsc"),
    auditFindings: loadFindings("eppsc"),
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "bspe",
    name: "Berhanena Selam Printing Enterprise",
    shortName: "BSPE",
    sector: "Publishing",
    sectorIcon: "printer",
    description:
      "Provides commercial printing services and publishes the Federal Negarit Gazette and other government security prints.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("bspe"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
    dataNote:
      "The audit reports for EC 2012 and 2013 only contained income statements — balance sheet and cash flow data were not included in the available documents.",
  },
  {
    id: "ipdc",
    name: "Industrial Parks Development Corporation",
    shortName: "IPDC",
    sector: "Real Estate",
    sectorIcon: "building",
    description:
      "Develops and manages industrial parks across Ethiopia, providing infrastructure for manufacturing and export-oriented industries.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ipdc"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
    dataNote:
      "Audit reports for EC 2013 were not available. IPDC has no traditional cost of sales — operating expenses represent direct costs of industrial park operations.",
  },
  {
    id: "eec",
    name: "Ethiopian Engineering Corporation",
    shortName: "EEC",
    sector: "Construction",
    sectorIcon: "hard-hat",
    description:
      "Provides engineering design and supervision services for water, energy, transport, and building projects.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("eec"),
    auditFindings: loadFindings("eec"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "Audit report for EC 2014 was not available. The enterprise was renamed from Ethiopian Construction Design and Supervision Works Corporation to Ethiopian Engineering Corporation by Ethiopian Investment Holdings (EIH).",
  },
  {
    id: "eeu-eleap",
    name: "EEU - Ethiopia Electrification Program (ELEAP)",
    shortName: "ELEAP",
    sector: "Energy",
    sectorIcon: "bolt",
    description:
      "A World Bank-funded program managed by EEU to expand electricity access through grid connections and mini-grids.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (modified cash basis)",
    years: loadYears("eeu-eleap"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "enla",
    name: "Ethiopian National Lottery Administration",
    shortName: "ENLA",
    sector: "Gaming",
    sectorIcon: "ticket",
    description:
      "Manages and supervises lottery activities in Ethiopia, operating lotto, tombola, and scratch card games.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("enla"),
    auditFindings: loadFindings("enla"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "The National Lottery Administration has a unique P&L structure: revenue is ticket sales, cost of sales comprises sales commissions and prize payments. The Administration is not subject to income tax. Profit is due to the Ministry of Finance / Ethiopian Investment Holdings.",
  },
  {
    id: "eide",
    name: "Ethiopian Industrial Inputs Development Enterprise",
    shortName: "EIDE",
    sector: "Trading",
    sectorIcon: "warehouse",
    description:
      "Imports and distributes industrial inputs including chemicals, construction materials, and metals.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("eide"),
    auditFindings: loadFindings("eide"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "The audit reports for EC 2010–2012 are condensed financial statements — balance sheet data was not included. EC 2013–2014 reports follow IFRS. The EC 2013 balance sheet and cash flow are sourced from the EC 2014 report's comparative column.",
  },
  {
    id: "ethio-telecom",
    name: "Ethio Telecom",
    shortName: "ET",
    sector: "Telecommunications",
    sectorIcon: "phone",
    description:
      "Provides voice, data, internet, and mobile money (telebirr) services across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (originally reported in Birr'000)",
    years: loadYears("ethio-telecom"),
    auditFindings: loadFindings("ethio-telecom"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "All amounts were originally reported in Birr'000 and have been converted to full ETB. Ethio Telecom uses a non-traditional P&L format — direct costs serve as the cost of sales equivalent, and EBITDA is reported as an intermediate line. Some early years (EC 2010–2012) lack auditor opinion pages in the available reports.",
  },
  {
    id: "ette",
    name: "Ethiopian Tourist Trading Enterprise",
    shortName: "ETTE",
    sector: "Trading",
    sectorIcon: "shopping-bag",
    description:
      "Operates duty-free shops, duty-paid retail outlets, and handicraft and souvenir production and sales.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ette"),
    auditFindings: loadFindings("ette"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "The EC 2014 audit report only contained financial statements — the independent auditor's report was not included in the available document. EC filenames: 2014 EC = FY ended June 30, 2022.",
  },
  {
    id: "eic",
    name: "Ethiopian Insurance Corporation",
    shortName: "EIC",
    sector: "Insurance",
    sectorIcon: "shield",
    description:
      "Provides life and non-life insurance products through a nationwide distribution network.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("eic"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
    dataNote:
      "EIC uses an insurance-specific P&L format (IFRS 17): revenue is insurance premium revenue, cost of sales comprises insurance service expenses and net reinsurance expenses. The combined business figures (life + non-life) are used. EC filenames: 2015 EC = FY ended 30 June 2023.",
  },
  {
    id: "dbe",
    name: "Development Bank of Ethiopia",
    shortName: "DBE",
    sector: "Banking",
    sectorIcon: "landmark",
    description:
      "Provides medium and long-term development loans for agriculture, manufacturing, and agro-processing.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("dbe"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
    dataNote:
      "DBE uses a banking P&L format: revenue is total operating income (net interest income + fees + other income), cost of sales is interest expense, and gross profit is net interest income. Some years are missing cost of sales and gross profit breakdowns. EC filenames: 2010 EC = FY ended 30 June 2018.",
  },
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia",
    shortName: "CBE",
    sector: "Banking",
    sectorIcon: "landmark",
    description:
      "Provides deposits, loans, foreign exchange, and digital banking services across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("cbe"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
    dataNote:
      "CBE uses a banking P&L format: revenue is total operating income (interest income + non-interest income + forex gains + associate income), cost of sales is interest expense, and gross profit is net interest income. Consolidated financial statements include CBE and its subsidiary. EC filenames: 2011 EC = FY ended 30 June 2019.",
  },
  {
    id: "cic",
    name: "Chemical Industry Corporation",
    shortName: "CIC",
    sector: "Manufacturing",
    sectorIcon: "flask-conical",
    description:
      "Manufactures cement, caustic soda, chemicals, pesticides, and rubber products through five factory branches.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("cic"),
    auditFindings: loadFindings("cic"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "EC filenames: 2015 EC = FY ended 30 June 2023. The Corporation holds land and buildings in Addis Ababa (Gotera area) taken back by the government and demolished — these assets remain on the balance sheet pending compensation determination.",
  },
  {
    id: "genet",
    name: "Catering and Tourism Training Institute - Genet Hotel",
    shortName: "Genet",
    sector: "Hospitality",
    sectorIcon: "utensils",
    description:
      "A hotel in Addis Ababa operating as both a commercial hotel and a training facility for hospitality students.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("genet"),
    auditFindings: loadFindings("genet"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "EC filenames: 2014 EC = FY ended 30 June 2022. The EC 2015 report marks the first-time IFRS adoption (transition date: 30 June 2021), which recognized a Right of Use Land asset of ETB 1.3 billion and revalued PP&E. The EC 2014 figures shown here are the IFRS-restated comparatives as presented in the EC 2015 report — they differ materially from the original local GAAP report for that year.",
  },
  {
    id: "ghion",
    name: "Ghion Hotels Enterprise",
    shortName: "Ghion",
    sector: "Hospitality",
    sectorIcon: "utensils",
    description:
      "Provides accommodation, food and beverage, and conference services at the Ghion Hotel in Addis Ababa.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ghion"),
    auditFindings: loadFindings("ghion"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "EC filenames: 2014 EC = FY ended 30 June 2022. The EC 2014 audit report was scanned upside down and has been digitally corrected. Cash flow line items for EC 2014 were not individually readable due to image quality — net change and closing cash are derived from note disclosures.",
  },
  {
    id: "emc",
    name: "Ethiopian Minerals Corporation",
    shortName: "EMC",
    sector: "Mining",
    sectorIcon: "pickaxe",
    description:
      "Explores, develops, and processes mineral resources including gold and tantalum.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("emc"),
    auditFindings: loadFindings("emc"),
    fiscalYearEnd: "Hamle 30",
    dataNote:
      "Consolidated financial statements including subsidiary Afar Salt Production Share Company. The corporation has significant land use rights (freehold land) valued at Br. 647 billion on the balance sheet. EC filenames: 2015 EC = FY ended 7 July 2023.",
  },
  {
    id: "hilton",
    name: "Development & Hotel Company (Hilton Addis)",
    shortName: "DHC",
    sector: "Hospitality",
    sectorIcon: "hotel",
    description:
      "Owns the Hilton Addis Ababa hotel property and leases it to Hilton International under a management agreement.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("hilton"),
    auditFindings: loadFindings("hilton"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "DHC is a holding/leasing company with no cost of sales — all expenses are administrative. EC filenames: 2014 EC = FY ended 30 June 2022. Revenue represents DHC's 75% share of the hotel's gross operating profit as per the lease agreement.",
  },
  {
    id: "eslse",
    name: "Ethiopian Shipping and Logistics Services Enterprise",
    shortName: "ESLSE",
    sector: "Logistics",
    sectorIcon: "ship",
    description:
      "Provides shipping, freight forwarding, dry port, and warehousing services for import and export goods.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (originally reported in Birr'000)",
    years: loadYears("eslse"),
    auditFindings: loadFindings("eslse"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "All amounts were originally reported in Birr'000 and have been converted to full ETB. ESLSE received Qualified audit opinions for both years due to issues with trade receivables/payables, bank reconciliation discrepancies, and other matters. EC filenames: 2015 EC = FY ended 30 June 2023.",
  },
  {
    id: "etre",
    name: "Ethiopian Toll Roads Enterprise",
    shortName: "ETRE",
    sector: "Transport",
    sectorIcon: "route",
    description:
      "Operates and maintains toll expressways including the Addis Ababa-Adama and Dire Dawa-Dawalle highways.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("etre"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
    dataNote:
      "ETRE has no traditional cost of sales — all operating expenses are personnel and administrative costs. Revenue is primarily from toll fee collections. EC filenames: 2015 EC = FY ended 30 June 2023.",
  },
  {
    id: "filwuha",
    name: "Filwuha Spa Service Enterprise",
    shortName: "Filwuha",
    sector: "Hospitality",
    sectorIcon: "waves",
    description:
      "A spa and hotel complex in Addis Ababa built on natural hot mineral springs, offering bath, sauna, and accommodation services.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("filwuha"),
    auditFindings: loadFindings("filwuha"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "EC filenames: 2014 EC = FY ended 30 June 2022. The EC 2016 audit received a Qualified opinion due to a prior year adjustment of Birr 26,957,483 for which the auditors could not obtain sufficient supporting evidence.",
  },
  {
    id: "ethiopian-airlines",
    name: "Ethiopian Airlines Group",
    shortName: "EAL",
    sector: "Aviation",
    sectorIcon: "plane",
    description:
      "Provides passenger, cargo, MRO, catering, and aviation training services across five continents.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ethiopian-airlines"),
    auditFindings: loadFindings("ethiopian-airlines"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "Ethiopian Airlines' functional currency is USD; financial statements are presented in ETB by translating at closing rates. The P&L uses an airline-specific format: Revenue + Other Income - Operating Expense = Gross Operating Profit, with no traditional cost of sales. EC filenames: 2010 EC = FY ended 30 June 2018.",
  },
  {
    id: "etbc",
    name: "Ethiopian Trading Businesses Corporation",
    shortName: "ETBC",
    sector: "Trading",
    sectorIcon: "warehouse",
    description:
      "Imports, exports, and distributes grain, coffee, and other commodities.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (originally reported in Birr'000)",
    years: loadYears("etbc"),
    auditFindings: loadFindings("etbc"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "All amounts were originally reported in Birr'000 and have been converted to full ETB. The EC 2013–2015 audit reports were scanned in landscape orientation and have been digitally rotated for processing.",
  },
  {
    id: "fhc",
    name: "Federal Housing Corporation",
    shortName: "FHC",
    sector: "Real Estate",
    sectorIcon: "building",
    description:
      "Constructs, administers, and maintains federal government-owned housing.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "ecwc",
    name: "Ethiopian Construction Works Corporation",
    shortName: "ECWC",
    sector: "Construction",
    sectorIcon: "hard-hat",
    description:
      "Builds highways, bridges, dams, water supply systems, and buildings across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "epse",
    name: "Ethiopian Petroleum Supply Enterprise",
    shortName: "EPSE",
    sector: "Energy",
    sectorIcon: "fuel",
    description:
      "Imports and distributes petroleum products across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "eeg",
    name: "Ethio Engineering Group",
    shortName: "EEG",
    sector: "Construction",
    sectorIcon: "hard-hat",
    description:
      "Manufactures automotive products, agricultural machinery, construction equipment, electronics, and metal products.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "erc",
    name: "Ethiopian Railways Corporation",
    shortName: "ERC",
    sector: "Transport",
    sectorIcon: "route",
    description:
      "Manages and operates Ethiopia's railway infrastructure, including the Addis Ababa–Djibouti Railway and the Addis Ababa Light Rail Transit.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "tana-beles-sugar",
    name: "Tana Beles Sugar Factory",
    shortName: "TBSF",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Produces sugar in the Amhara Region near Lake Tana.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "metehara-sugar",
    name: "Metehara Sugar Factory",
    shortName: "MSF",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Produces sugar and ethanol from sugarcane in the Rift Valley.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "kessem-sugar",
    name: "Kessem Sugar Factory",
    shortName: "KSF",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Produces sugar and ethanol in the Afar Region along the Kessem River.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "finchaa-sugar",
    name: "Finchaa Sugar Factory",
    shortName: "FSF",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Produces sugar and ethanol in Oromia Region near the Finchaa Valley.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "wonji-shewa-sugar",
    name: "Wonji Shoa Sugar Factory",
    shortName: "WSSF",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Produces sugar and ethanol in Oromia Region near Adama, Ethiopia's first sugar factory.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "shieldvax",
    name: "ShieldVax",
    shortName: "ShieldVax",
    sector: "Healthcare",
    sectorIcon: "syringe",
    description:
      "Manufactures vaccines, pharmaceuticals, and medical devices for human and animal use.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: [],
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
];

// ─── Export all enterprises ──────────────────────────────────────────
export function getAllEnterprises(): Enterprise[] {
  return enterprises;
}

export function getEnterprise(id: string): Enterprise | undefined {
  return enterprises.find((e) => e.id === id);
}

export function getYearDetail(
  enterpriseId: string,
  ecYear: number
): YearDetail | null {
  const enterprise = getEnterprise(enterpriseId);
  if (!enterprise) return null;

  const yearData = enterprise.years.find((y) => y.year === ecYear);
  if (!yearData) return null;

  const filePath = path.join(
    STANDARDIZED_DIR,
    enterpriseId,
    `${ecYear}.json`
  );
  if (!fs.existsSync(filePath)) return null;

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const years = enterprise.years.map((y) => y.year).sort((a, b) => a - b);
  const idx = years.indexOf(ecYear);

  return {
    enterpriseId,
    year: ecYear,
    summary: yearData,
    incomeStatement: data.incomeStatement ?? null,
    balanceSheet: data.balanceSheet ?? null,
    cashFlow: data.cashFlow ?? null,
    auditFindings: data.auditFindings ?? [],
    currency: enterprise.unit,
    unitLabel: enterprise.unitLabel,
    previousYear: idx > 0 ? years[idx - 1] : null,
    nextYear: idx < years.length - 1 ? years[idx + 1] : null,
    pdfUrl: getPdfSourcePath(enterpriseId, ecYear)
      ? `/audits/${enterpriseId}/${ecYear}.pdf`
      : null,
  } satisfies YearDetail;
}

export function getAllYearPaths(): { id: string; year: string }[] {
  return enterprises.flatMap((e) =>
    e.years.map((y) => ({ id: e.id, year: String(y.year) }))
  );
}

export function getAvailablePdfs(): {
  id: string;
  year: number;
  sourcePath: string;
}[] {
  const results: { id: string; year: number; sourcePath: string }[] = [];
  for (const e of enterprises) {
    for (const y of e.years) {
      const src = getPdfSourcePath(e.id, y.year);
      if (src) results.push({ id: e.id, year: y.year, sourcePath: src });
    }
  }
  return results;
}

export function formatCurrency(value: number, compact = false): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (compact) {
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`;
  }

  return `${sign}${abs.toLocaleString("en-US")}`;
}

export function formatETB(value: number, compact = false): string {
  return `ETB ${formatCurrency(value, compact)}`;
}
