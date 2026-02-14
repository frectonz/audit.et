import type { Enterprise, YearData, AuditFinding } from "./types";
// @ts-expect-error - Node built-ins available at build time in Astro
import fs from "node:fs";
// @ts-expect-error - Node built-ins available at build time in Astro
import path from "node:path";

const JSON_DIR = path.resolve(
  // @ts-expect-error - import.meta.dirname available in Node 21+
  import.meta.dirname,
  "../../../json"
);

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ─── Ethiopian Electric Power ───────────────────────────────────────
function loadEEP(): Enterprise {
  const dir = path.join(JSON_DIR, "ethiopian-electric-power");
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json")).sort();
  const yearMap = new Map<number, YearData>();

  for (const file of files) {
    const data = readJson(path.join(dir, file));

    // Extract profit/loss items - structure varies by year
    // Can be: .line_items[], .rows[], or direct array under profit_or_loss_and_oci
    const plRaw = data.statements?.profit_or_loss_and_oci;
    const plSection = Array.isArray(plRaw)
      ? plRaw
      : plRaw?.line_items ??
        plRaw?.rows ??
        data.statements?.profit_or_loss_and_other_comprehensive_income?.rows ??
        [];

    const fpRaw = data.statements?.financial_position;
    const fpSection = Array.isArray(fpRaw)
      ? fpRaw
      : fpRaw?.line_items ?? [];

    // Helper to find a line item value (handles both "label" and "item" keys, and nested "values" or flat year keys)
    const findItems = (section: any[], searchTerms: string[]): Record<string, number> => {
      if (!Array.isArray(section)) return {};
      for (const item of section) {
        const label = (item.label ?? item.item ?? item.name ?? item.key ?? "").toLowerCase();
        if (searchTerms.some((t) => label.includes(t))) {
          return item.values ?? item;
        }
      }
      return {};
    };

    const findPL = (searchTerms: string[]) => findItems(plSection, searchTerms);
    const findFP = (searchTerms: string[]) => findItems(fpSection, searchTerms);

    const revenueVals = findPL(["revenue from contracts"]);
    const directCostsVals = findPL(["direct costs"]);
    const opProfitVals = findPL(["operating profit", "operating loss"]);
    const netProfitVals = findPL(["net profit", "net loss"]);
    const totalAssetsVals = findFP(["total assets"]);
    const totalLiabVals = findFP(["total liabilities"]);
    const totalEquityVals = findFP(["total equity"]);

    // Get all years from the data
    const allYears = new Set<number>();
    for (const vals of [revenueVals, totalAssetsVals]) {
      for (const k of Object.keys(vals)) {
        const y = parseInt(k);
        if (!isNaN(y) && y > 2000 && y < 2100) allYears.add(y);
      }
    }

    for (const yr of allYears) {
      const yStr = String(yr);
      const rev = revenueVals[yStr] ?? null;
      const dc = directCostsVals[yStr] ?? null;
      const newData: YearData = {
        year: yr,
        revenue: rev != null ? rev * 1000 : null,
        costOfSales: dc != null ? dc * 1000 : null,
        grossProfit:
          rev != null && dc != null ? (rev + dc) * 1000 : null,
        operatingProfit:
          opProfitVals[yStr] != null
            ? opProfitVals[yStr] * 1000
            : null,
        netProfit:
          netProfitVals[yStr] != null
            ? netProfitVals[yStr] * 1000
            : null,
        totalAssets:
          totalAssetsVals[yStr] != null
            ? totalAssetsVals[yStr] * 1000
            : null,
        totalLiabilities:
          totalLiabVals[yStr] != null
            ? totalLiabVals[yStr] * 1000
            : null,
        totalEquity:
          totalEquityVals[yStr] != null
            ? totalEquityVals[yStr] * 1000
            : null,
        auditOpinion: "Unmodified",
      };
      // Merge: fill null fields from existing data or update existing nulls
      const existing = yearMap.get(yr);
      if (existing) {
        for (const key of Object.keys(newData) as (keyof YearData)[]) {
          if (key === "year" || key === "auditOpinion") continue;
          if (existing[key] == null && newData[key] != null) {
            (existing as any)[key] = newData[key];
          }
        }
      } else {
        yearMap.set(yr, newData);
      }
    }
  }

  const years = [...yearMap.values()].sort((a, b) => a.year - b.year);

  return {
    id: "ethiopian-electric-power",
    name: "Ethiopian Electric Power",
    shortName: "EEP",
    sector: "Energy",
    sectorIcon: "zap",
    description:
      "Responsible for generation, transmission and wholesale of electricity in Ethiopia. Manages major hydroelectric dams including the Grand Ethiopian Renaissance Dam.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (originally reported in Birr'000)",
    years,
    auditFindings: [],
    fiscalYearEnd: "July 7",
  };
}

// ─── Ethiopian Electric Utility ──────────────────────────────────────
function loadEEU(): Enterprise {
  const dir = path.join(JSON_DIR, "ethiopian-electric-utility/main");
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json")).sort();
  const yearMap = new Map<number, YearData>();

  for (const file of files) {
    const data = readJson(path.join(dir, file));

    const plSection =
      data.financial_statements
        ?.statement_of_profit_or_loss_and_other_comprehensive_income ??
      data.financial_statements?.profit_or_loss_and_oci;

    const fpSection =
      data.financial_statements?.statement_of_financial_position;

    // P&L can be { items: { "Revenue": { 2023: val } } } or { items: [ { label, 2019: val } ] }
    const getPLVal = (
      searchTerms: string[],
      yr: number
    ): number | null => {
      if (!plSection) return null;

      // Object format: { items: { "Revenue": { "2023": val } } }
      if (plSection.items && !Array.isArray(plSection.items)) {
        for (const [key, vals] of Object.entries(plSection.items as Record<string, any>)) {
          if (searchTerms.some((t) => key.toLowerCase().includes(t))) {
            return (vals as any)[String(yr)] ?? null;
          }
        }
      }

      // Array format: { items: [ { label, 2019: val } ] }
      if (plSection.items && Array.isArray(plSection.items)) {
        for (const item of plSection.items) {
          const label = (item.label ?? "").toLowerCase();
          if (searchTerms.some((t) => label.includes(t))) {
            return item[String(yr)] ?? null;
          }
        }
      }

      return null;
    };

    // Financial position totals
    const getTotals = (yr: number) => {
      if (!fpSection) return { assets: null, liab: null, equity: null };
      const totals = fpSection.totals;
      if (totals) {
        return {
          assets: totals.total_assets?.[String(yr)] ?? null,
          liab: totals.total_liabilities?.[String(yr)] ?? null,
          equity: totals.total_equity?.[String(yr)] ?? null,
        };
      }
      return { assets: null, liab: null, equity: null };
    };

    // Determine what years this file covers
    const periods =
      plSection?.periods ??
      plSection?.years ??
      (plSection?.items && Array.isArray(plSection.items) && plSection.items[0]
        ? Object.keys(plSection.items[0]).filter(
            (k) => /^\d{4}$/.test(k)
          )
        : []);

    for (const p of periods) {
      const yr = parseInt(String(p));
      if (isNaN(yr) || yearMap.has(yr)) continue;

      const rev = getPLVal(["revenue"], yr);
      const cos = getPLVal(["cost of sales"], yr);
      const gp = getPLVal(["gross profit"], yr);
      const op = getPLVal(["operating profit"], yr);
      const np = getPLVal(["profit for the year", "profit/(loss) for"], yr);
      const { assets, liab, equity } = getTotals(yr);

      yearMap.set(yr, {
        year: yr,
        revenue: rev,
        costOfSales: cos,
        grossProfit: gp,
        operatingProfit: op,
        netProfit: np,
        totalAssets: assets,
        totalLiabilities: liab,
        totalEquity: equity,
        auditOpinion: "Unmodified",
      });
    }
  }

  const years = [...yearMap.values()].sort((a, b) => a.year - b.year);

  return {
    id: "ethiopian-electric-utility",
    name: "Ethiopian Electric Utility",
    shortName: "EEU",
    sector: "Energy",
    sectorIcon: "plug",
    description:
      "Distributes and sells electricity to end consumers across Ethiopia. The largest utility company in the country with nationwide infrastructure.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years,
    auditFindings: [],
    fiscalYearEnd: "July 7",
  };
}

// ─── Ethiopian Sugar Corporation ─────────────────────────────────────
function loadSugar(): Enterprise {
  const dir = path.join(JSON_DIR, "etsugar");
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json")).sort();
  const yearMap = new Map<number, YearData>();
  let findings: AuditFinding[] = [];

  for (const file of files) {
    const data = readJson(path.join(dir, file));

    // Sugar JSON files have 3 different formats:
    // 2018: financial_statements.income_statement = { "2018": {...}, "2017": {...} }
    // 2019: financial_statements.statement_of_profit_or_loss...items = [{ key, label, values: { year: val } }]
    // 2021: items = [{ label, "2021": val, "2020": val }] (direct year keys)
    const plRaw =
      data.financial_statements?.statement_of_profit_or_loss_and_other_comprehensive_income?.items ??
      [];
    const fpRaw =
      data.financial_statements?.statement_of_financial_position?.items ??
      [];

    // Normalize: find a value record for an item matching search terms
    const findSugarItem = (
      items: any[],
      searchTerms: string[]
    ): Record<string, number> => {
      if (!Array.isArray(items)) return {};
      for (const item of items) {
        const label = (item.label ?? item.key ?? "").toLowerCase();
        if (searchTerms.some((t) => label.includes(t))) {
          // If item has values sub-object, use it; otherwise use item itself (direct year keys)
          return item.values ?? item;
        }
      }
      return {};
    };

    const revVals = findSugarItem(plRaw, ["revenue"]);
    const cosVals = findSugarItem(plRaw, ["cost_of_sales", "cost of sales"]);
    const gpVals = findSugarItem(plRaw, ["gross_profit", "gross profit"]);
    const opVals = findSugarItem(plRaw, ["operating_profit", "operating profit"]);
    const npVals = findSugarItem(plRaw, [
      "profit_for_the_year",
      "profit for the year",
    ]);
    const taVals = findSugarItem(fpRaw, ["total_assets", "total assets"]);
    const tlVals = findSugarItem(fpRaw, [
      "total_liabilities",
      "total liabilities",
    ]);
    const teVals = findSugarItem(fpRaw, ["total_equity", "total equity"]);

    // Collect all year keys from revenue and assets
    const sugarYears = new Set<number>();
    for (const vals of [revVals, taVals]) {
      for (const k of Object.keys(vals)) {
        const y = parseInt(k);
        if (!isNaN(y) && y > 2000 && y < 2100) sugarYears.add(y);
      }
    }

    for (const yr of sugarYears) {
      const k = String(yr);
      if (yearMap.has(yr)) continue;

      yearMap.set(yr, {
        year: yr,
        revenue: revVals[k] ?? null,
        costOfSales: cosVals[k] ?? null,
        grossProfit: gpVals[k] ?? null,
        operatingProfit: opVals[k] ?? null,
        netProfit: npVals[k] ?? null,
        totalAssets: taVals[k] ?? null,
        totalLiabilities: tlVals[k] ?? null,
        totalEquity: teVals[k] ?? null,
        auditOpinion: data.auditor_report?.opinion_type?.includes("Qualified") ? "Qualified" : "Unmodified",
      });
    }

    // Extract audit findings from the most recent file
    if (
      data.basis_for_qualified_opinion_findings &&
      findings.length === 0
    ) {
      findings = data.basis_for_qualified_opinion_findings.map(
        (f: any) => ({
          number: f.number ?? f.item_no ?? 0,
          summary: (f.text ?? f.description ?? f.title ?? "")
            .replace(/\s+/g, " ")
            .replace(/[^\x20-\x7E]/g, "")
            .trim(),
          amount:
            f.amounts && f.amounts.length > 0
              ? f.amounts[0].value
              : f.amounts_ETB && f.amounts_ETB.length > 0
              ? f.amounts_ETB[0]
              : null,
        })
      );
    }
  }

  const years = [...yearMap.values()].sort((a, b) => a.year - b.year);

  return {
    id: "ethiopian-sugar-corporation",
    name: "Ethiopian Sugar Corporation",
    shortName: "ESC",
    sector: "Agriculture",
    sectorIcon: "wheat",
    description:
      "Oversees sugar production across multiple factories including Wonji, Metehara, Fincha, and development projects. One of the largest state enterprises by asset base.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years,
    auditFindings: findings,
    fiscalYearEnd: "June 30",
  };
}

// ─── Ethiopian Postal Service ────────────────────────────────────────
function loadPostal(): Enterprise {
  const dir = path.join(JSON_DIR, "ethio-post");
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json")).sort();
  const yearMap = new Map<number, YearData>();

  // EC to GC year-end mapping: EC 2013 → GC 2021 (July 7)
  const ecToGc: Record<number, number> = {
    2013: 2021,
    2014: 2022,
    2015: 2023,
    2016: 2024,
    2017: 2025,
  };

  for (const file of files) {
    const data = readJson(path.join(dir, file));

    // Determine Gregorian year from financial_year_end or filename
    let gcYear: number | null = null;
    if (data.financial_year_end) {
      gcYear = parseInt(data.financial_year_end.split("-")[0]);
    } else if (data.report?.reporting_period_end) {
      gcYear = parseInt(data.report.reporting_period_end.split("-")[0]);
    }

    if (!gcYear) {
      // Extract EC year from filename
      const match = file.match(/(\d{4})/);
      if (match) {
        const ecYear = parseInt(match[1]);
        gcYear = ecToGc[ecYear] ?? ecYear + 8;
      }
    }

    if (!gcYear) continue;

    // Try management summary first (2013 format)
    if (data.management_summary?.results_comparison) {
      for (const row of data.management_summary.results_comparison) {
        const yr = parseInt(String(row.period).split("-")[0]);
        if (isNaN(yr) || yearMap.has(yr)) continue;

        // Get balance sheet data
        const fp = data.financial_statements?.statement_of_financial_position;
        const yStr = String(yr);

        yearMap.set(yr, {
          year: yr,
          revenue: row.revenue_income ?? null,
          costOfSales: null,
          grossProfit: null,
          operatingProfit: null,
          netProfit: row.net_profit ?? null,
          totalAssets: fp?.assets?.total_assets?.[yStr] ?? null,
          totalLiabilities: fp?.liabilities?.total_liabilities?.[yStr] ?? null,
          totalEquity: fp?.equity?.total_equity?.[yStr] ?? null,
          auditOpinion:
            data.audit_opinion?.opinion_type?.includes("Qualified")
              ? "Qualified"
              : data.audit?.opinion?.type ?? "Unmodified",
        });
      }
      continue;
    }

    // Newer format with statements.profit_or_loss_and_oci
    const pl = data.statements?.profit_or_loss_and_oci;
    const fp = data.statements?.statement_of_financial_position;
    const opinion = data.audit?.opinion?.type ?? "Unmodified";

    if (pl?.line_items) {
      // Can be object or array
      const getVal = (
        searchTerms: string[],
        dateKey: string
      ): number | null => {
        if (typeof pl.line_items === "object" && !Array.isArray(pl.line_items)) {
          // Object format: { revenue: { label, values: { date: val } } }
          for (const [key, item] of Object.entries(pl.line_items as Record<string, any>)) {
            if (searchTerms.some((t) => key.toLowerCase().includes(t))) {
              return item.values?.[dateKey] ?? null;
            }
          }
        }
        if (Array.isArray(pl.line_items)) {
          for (const item of pl.line_items) {
            const label = (
              item.label ??
              item.description ??
              item.name ??
              ""
            ).toLowerCase();
            if (searchTerms.some((t) => label.includes(t))) {
              return (
                item.values?.[dateKey] ??
                item.current_year ??
                null
              );
            }
          }
        }
        return null;
      };

      // Get period dates
      const periodEnd =
        data.financial_year_end ?? data.comparative_year_end ?? "";
      const compEnd = data.comparative_year_end ?? data.financial_year_end ?? "";

      const dates = [periodEnd, compEnd].filter(Boolean);

      for (const dateKey of dates) {
        const yr = parseInt(dateKey.split("-")[0]);
        if (isNaN(yr) || yearMap.has(yr)) continue;

        // Get balance sheet values
        let totalAssets: number | null = null;
        let totalLiab: number | null = null;
        let totalEquity: number | null = null;

        if (fp?.line_items) {
          for (const [key, vals] of Object.entries(
            fp.line_items as Record<string, any>
          )) {
            const lk = key.toLowerCase();
            if (lk.includes("total assets")) {
              totalAssets = vals?.[dateKey] ?? null;
            }
            if (lk.includes("total liabilit")) {
              totalLiab = vals?.[dateKey] ?? null;
            }
            if (lk.includes("total equity")) {
              totalEquity = vals?.[dateKey] ?? null;
            }
          }
        }

        yearMap.set(yr, {
          year: yr,
          revenue: getVal(["revenue"], dateKey),
          costOfSales: getVal(["direct cost", "cost of sales"], dateKey),
          grossProfit: getVal(["gross profit"], dateKey),
          operatingProfit: getVal(["ebit", "operating profit"], dateKey),
          netProfit: getVal(
            ["profit after tax", "net profit", "profit for the year"],
            dateKey
          ),
          totalAssets,
          totalLiabilities: totalLiab,
          totalEquity,
          auditOpinion: opinion,
        });
      }
    }
  }

  const years = [...yearMap.values()].sort((a, b) => a.year - b.year);

  return {
    id: "ethiopian-postal-service",
    name: "Ethiopian Postal Service Enterprise",
    shortName: "EPS",
    sector: "Logistics",
    sectorIcon: "mail",
    description:
      "Provides postal, parcel/EMS, international mailing, and transport/logistics services across Ethiopia.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr",
    years,
    auditFindings: [],
    fiscalYearEnd: "July 7",
  };
}

// ─── ELEAP (World Bank Program) ──────────────────────────────────────
function loadELEAP(): Enterprise {
  const dir = path.join(JSON_DIR, "ethiopian-electric-utility/eleap");
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json")).sort();
  const yearMap = new Map<number, YearData>();

  for (const file of files) {
    const data = readJson(path.join(dir, file));
    const yearEnd = data.report?.financial_year_end ?? "";
    const yr = parseInt(yearEnd.split("-")[0]);
    if (isNaN(yr) || yearMap.has(yr)) continue;

    const suf = data.financial_statements?.statement_of_sources_and_uses_of_funds;
    const bs = data.financial_statements?.balance_sheet;

    const totalSources =
      suf?.totals?.total_sources?.current_year?.ETB ?? null;
    const totalUses = suf?.totals?.total_uses?.current_year?.ETB ?? null;

    yearMap.set(yr, {
      year: yr,
      revenue: totalSources,
      costOfSales: totalUses != null ? -Math.abs(totalUses) : null,
      grossProfit:
        totalSources != null && totalUses != null
          ? totalSources - totalUses
          : null,
      operatingProfit: suf?.totals?.source_over_uses?.current_year?.ETB ?? null,
      netProfit: suf?.totals?.source_over_uses?.current_year?.ETB ?? null,
      totalAssets: bs?.assets?.total_current_assets?.current_year?.ETB ?? null,
      totalLiabilities: null,
      totalEquity:
        bs?.represented_by?.fund_balance?.current_year?.ETB ?? null,
      auditOpinion: "Unmodified",
    });
  }

  const years = [...yearMap.values()].sort((a, b) => a.year - b.year);

  return {
    id: "eeu-eleap",
    name: "EEU - Ethiopia Electrification Program (ELEAP)",
    shortName: "ELEAP",
    sector: "Energy",
    sectorIcon: "bolt",
    description:
      "World Bank-funded Ethiopia Electrification Program managed by EEU. Uses modified cash basis accounting. Financed through IDA credits totaling over $400M USD.",
    unit: "ETB",
    unitLabel: "Ethiopian Birr (modified cash basis)",
    years,
    auditFindings: [],
    fiscalYearEnd: "July 7",
  };
}

// ─── Export all enterprises ──────────────────────────────────────────
let _cache: Enterprise[] | null = null;

export function getAllEnterprises(): Enterprise[] {
  if (_cache) return _cache;
  _cache = [loadEEP(), loadEEU(), loadSugar(), loadPostal(), loadELEAP()];
  return _cache;
}

export function getEnterprise(id: string): Enterprise | undefined {
  return getAllEnterprises().find((e) => e.id === id);
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
