import type { Enterprise, YearData, YearDetail } from "./types";
// @ts-expect-error - Node built-ins available at build time in Astro
import fs from "node:fs";
// @ts-expect-error - Node built-ins available at build time in Astro
import path from "node:path";

const STANDARDIZED_DIR = path.resolve(
  // @ts-expect-error - import.meta.dirname available in Node 21+
  import.meta.dirname,
  "../../../standardized"
);

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

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    if (Array.isArray(data.auditFindings) && data.auditFindings.length > 0) {
      return data.auditFindings;
    }
  }
  return [];
}

const enterprises: Enterprise[] = [
  {
    id: "ethiopian-electric-power",
    name: "Ethiopian Electric Power",
    shortName: "EEP",
    sector: "Energy",
    sectorIcon: "zap",
    description:
      "Responsible for generation, transmission and wholesale of electricity in Ethiopia. Manages major hydroelectric dams including the Grand Ethiopian Renaissance Dam.",
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
      "Distributes and sells electricity to end consumers across Ethiopia. The largest utility company in the country with nationwide infrastructure.",
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
      "Oversees sugar production across multiple factories including Wonji, Metehara, Fincha, and development projects. One of the largest state enterprises by asset base.",
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
      "Produces and distributes vaccines and veterinary drugs for livestock disease prevention across Ethiopia. A key institution for the country's agricultural sector and food security.",
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
      "Handles the import, export, and domestic distribution of agricultural products including coffee, oilseeds, pulses, and other commodities on behalf of the Ethiopian government.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("ethioagri"),
    auditFindings: loadFindings("ethioagri"),
    fiscalYearEnd: "Hamle 7",
  },
  {
    id: "eeu-eleap",
    name: "EEU - Ethiopia Electrification Program (ELEAP)",
    shortName: "ELEAP",
    sector: "Energy",
    sectorIcon: "bolt",
    description:
      "World Bank-funded Ethiopia Electrification Program managed by EEU. Uses modified cash basis accounting. Financed through IDA credits totaling over $400M USD.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (modified cash basis)",
    years: loadYears("eeu-eleap"),
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
  } satisfies YearDetail;
}

export function getAllYearPaths(): { id: string; year: string }[] {
  return enterprises.flatMap((e) =>
    e.years.map((y) => ({ id: e.id, year: String(y.year) }))
  );
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
