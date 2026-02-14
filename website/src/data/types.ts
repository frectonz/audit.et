export interface YearData {
  year: number;
  revenue: number | null;
  costOfSales: number | null;
  grossProfit: number | null;
  operatingProfit: number | null;
  netProfit: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  auditOpinion: string;
}

export interface AuditFinding {
  number: number;
  summary: string;
  amount: number | null;
}

export interface Enterprise {
  id: string;
  name: string;
  shortName: string;
  sector: string;
  sectorIcon: string;
  description: string;
  unit: string;
  unitLabel: string;
  years: YearData[];
  auditFindings: AuditFinding[];
  fiscalYearEnd: string;
}
