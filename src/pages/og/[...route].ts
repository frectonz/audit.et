import { OGImageRoute } from "astro-og-canvas";
import {
  getAllEnterprises,
  getAllYearPaths,
  getYearDetail,
  formatETB,
} from "../../data/enterprises";

const enterprises = getAllEnterprises();
const yearPaths = getAllYearPaths();

const pages = Object.fromEntries([
  // Static pages
  [
    "index",
    {
      title: "audit.et",
      description:
        "Transparency for Ethiopia's state-owned enterprises. Visualizing public audit data from enterprises under Ethiopian Investment Holdings.",
    },
  ],
  [
    "about",
    {
      title: "About",
      description:
        "An independent civic project making public audit data accessible and understandable.",
    },
  ],
  [
    "enterprises",
    {
      title: "Enterprises",
      description: `Browse audit reports for ${enterprises.length} Ethiopian state-owned enterprises.`,
    },
  ],

  // Dynamic: each enterprise
  ...enterprises.map((e) => {
    const minYear = e.years[0]?.year;
    const maxYear = e.years.at(-1)?.year;
    const yearRange = minYear && maxYear ? `${minYear}–${maxYear} EC` : "";
    return [
      `enterprise/${e.id}`,
      {
        title: e.shortName,
        description: `${e.name} · ${e.sector}${yearRange ? ` · ${yearRange}` : ""}`,
      },
    ];
  }),

  // Dynamic: each enterprise-year
  ...yearPaths.map((p) => {
    const detail = getYearDetail(p.id, parseInt(p.year));
    const enterprise = enterprises.find((e) => e.id === p.id);
    const shortName = enterprise?.shortName ?? p.id;
    const opinion = detail?.summary.auditOpinion ?? "";
    const rev =
      detail?.summary.revenue != null
        ? `Revenue: ${formatETB(detail.summary.revenue, true)}`
        : "";
    return [
      `enterprise/${p.id}/${p.year}`,
      {
        title: `${shortName} — FY ${p.year}`,
        description: [opinion, rev].filter(Boolean).join(" · "),
      },
    ];
  }),
]);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgImage: {
      path: "./src/assets/og-bg.png",
      fit: "cover" as const,
    },
    logo: {
      path: "./src/assets/og-logo.png",
      size: [80],
    },
    padding: 70,
    fonts: [
      "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf",
      "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf",
    ],
    font: {
      title: {
        color: [175, 158, 110],
        families: ["Lora"],
        weight: "Bold",
      },
      description: {
        color: [230, 225, 215],
        families: ["Lora"],
      },
    },
    border: {
      color: [175, 158, 110],
      width: 10,
      side: "inline-start",
    },
  }),
});
