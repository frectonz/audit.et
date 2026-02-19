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
    id: "nalf",
    name: "National Alcohol and Liquor Factory",
    shortName: "NALF",
    sector: "Manufacturing",
    sectorIcon: "factory",
    description:
      "A state-owned enterprise that produces extra neutral alcohol and liquor products for domestic and international markets. Operates distilleries at Mekanissa and Sebeta with over a century of manufacturing history.",
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
      "A leader in quality paper production since 1963, specializing in recycling paper to produce premium products. Implements Quality Management Systems (QMS) and Integrated Pest Management Systems (IPMS), with expanding operations in agriculture and community development.",
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
      "One of the largest and oldest printing enterprises in Ethiopia, founded in 1921. Publishes Amharic-language books, newspapers, and periodicals. Operates branches in Lideta, Awassa, and Merhatibeb with a Printing Technology Academy established in 2016.",
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
      "A Federal Government public enterprise established in 2007 EC to develop and operate industrial parks across Ethiopia. Manages flagship parks including Hawassa, Bole Lemi, and Kilinto, providing infrastructure for manufacturing and export-oriented industries.",
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
      "Formerly Ethiopian Construction Design and Supervision Works Corporation (ECDSWC). One of the largest state-owned construction enterprises, providing design, supervision, and construction services for major infrastructure projects across Ethiopia.",
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
      "World Bank-funded Ethiopia Electrification Program managed by EEU. Uses modified cash basis accounting. Financed through IDA credits totaling over $400M USD.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (modified cash basis)",
    years: loadYears("eeu-eleap"),
    auditFindings: [],
    fiscalYearEnd: "Sene 30",
  },
  {
    id: "enla",
    name: "National Lottery Administration",
    shortName: "ENLA",
    sector: "Gaming",
    sectorIcon: "ticket",
    description:
      "A federal agency established over 60 years ago and re-established in 2009 to undertake and supervise lottery activities in Ethiopia. Operates instant lottery tickets, regular draws, Tombola, Bingo, Enkutatash, and other lottery games through branches across the country.",
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
      "A state-owned enterprise responsible for importing and distributing essential industrial inputs including chemicals, construction materials, metals, and other raw materials for Ethiopia's manufacturing and construction sectors.",
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
      "Ethiopia's largest telecommunications operator, offering voice, data, internet, and mobile money (telebirr) services. One of the largest state-owned enterprises by revenue, serving tens of millions of subscribers nationwide.",
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
      "A state-owned enterprise established in 1964 to operate duty-free and duty-paid merchandise shops, as well as produce and retail handicrafts and souvenirs. Operates under the motto 'We Strive for Excellent Service' promoting tourism and economic growth.",
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
      "Ethiopia's sole state-owned insurance company, established in 1976 by taking over thirteen nationalized private insurers. Carries out life and non-life insurance business with over 100 distribution outlets nationwide, headquartered on Ras Mekonnen Street in Addis Ababa.",
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
      "Ethiopia's sole state-owned development finance institution, providing loans and technical support for priority sectors including agriculture, manufacturing, and agro-processing. One of the largest financial institutions in the country by asset base.",
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
      "The largest commercial bank in Ethiopia and one of the biggest in Africa, providing a full range of banking services including deposits, loans, foreign exchange, and digital banking (CBE Birr). A cornerstone of Ethiopia's financial system with thousands of branches nationwide.",
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
      "A fully state-owned public enterprise operating five manufacturing branches: Mugher Cement Factory, Batu Caustic Soda Factory, Awash Melkassa Chemical Factory, Adami Tulu Pesticides Factory, and a Rubber Tree Plantation and Processing project. One of Ethiopia's largest industrial conglomerates by asset base.",
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
      "A state-owned hospitality enterprise operating under the Catering and Tourism Training Institute. Provides hotel accommodation, food and beverage services, and catering in Addis Ababa. Previously under Ras Hotels Enterprise, it was transferred to the Institute in 1998. Serves as both a commercial hotel and a practical training ground for catering and tourism students.",
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
      "One of Ethiopia's iconic state-owned hotel enterprises, operating the historic Ghion Hotel in Addis Ababa. Named after one of the four rivers of Eden referenced in Genesis, the hotel has been a landmark of Ethiopian hospitality since the 1960s. Provides accommodation, food and beverage services, and conference facilities.",
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
    name: "Ethiopian Mineral, Petroleum and Biofuel Corporation",
    shortName: "EMC",
    sector: "Mining",
    sectorIcon: "pickaxe",
    description:
      "Re-established in 2020 to explore, develop, and exploit mineral resources, petroleum, and bio-fuel. Also provides consultancy, drilling, laboratory, and training services. Has mineral extraction sites in Oromia Regional State and offices in Dire Dawa and Shakiso.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years: loadYears("emc"),
    auditFindings: loadFindings("emc"),
    fiscalYearEnd: "Hamle 30",
    dataNote:
      "Consolidated financial statements including subsidiary Afar Salt Production Share Company. The corporation has significant land use rights (freehold land) valued at Br. 647 billion on the balance sheet. EC filenames: 2015 EC = FY ended 7 July 2023.",
  },
  {
    id: "etbc",
    name: "Ethiopian Trading Businesses Corporation",
    shortName: "ETBC",
    sector: "Trading",
    sectorIcon: "warehouse",
    description:
      "A public enterprise wholly owned by the Federal Government, established through Council of Ministers Regulation No. 369/2008. Handles the import, export, and domestic distribution of grain, coffee, and other commodities. One of the major subsidiaries of Ethiopian Investment Holdings.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (originally reported in Birr'000)",
    years: loadYears("etbc"),
    auditFindings: loadFindings("etbc"),
    fiscalYearEnd: "Sene 30",
    dataNote:
      "All amounts were originally reported in Birr'000 and have been converted to full ETB. The EC 2013–2015 audit reports were scanned in landscape orientation and have been digitally rotated for processing.",
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
