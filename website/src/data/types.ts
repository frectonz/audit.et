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

export interface LineItem {
  label: string;
  amount: number | null;
  isSubtotal?: boolean;
  indent?: number;
}

export interface StatementSection {
  title: string;
  groups: { heading: string; items: LineItem[] }[];
}

export interface CashFlowStatement {
  operating: LineItem[];
  investing: LineItem[];
  financing: LineItem[];
  netChange: number | null;
  closingCash: number | null;
}

export interface YearDetail {
  enterpriseId: string;
  year: number;
  summary: YearData;
  incomeStatement: StatementSection | null;
  balanceSheet: StatementSection | null;
  cashFlow: CashFlowStatement | null;
  auditFindings: AuditFinding[];
  currency: string;
  unitLabel: string;
  previousYear: number | null;
  nextYear: number | null;
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
