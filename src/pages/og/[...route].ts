import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import {
  getAllEnterprises,
  getAllYearPaths,
  getYearDetail,
  formatETB,
} from "../../data/enterprises";

// --- Data: build the page map (same as before) ---

const enterprises = getAllEnterprises();
const yearPaths = getAllYearPaths();

interface PageInfo {
  title: string;
  description: string;
}

const pages: Record<string, PageInfo> = Object.fromEntries([
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

// --- Fonts: fetched once at build time ---

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

const [instrumentSerifRegular, loraRegular, loraBold, notoEthiopic] =
  await Promise.all([
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-normal.ttf"
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf"
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf"
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-ethiopic@latest/ethiopic-400-normal.ttf"
    ),
  ]);

// --- Markup builder ---

function buildMarkup(page: PageInfo) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #1b3b34 0%, #0f2920 100%)",
      },
      children: [
        // Left gold accent bar
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: "0",
              top: "0",
              bottom: "0",
              width: "16px",
              background: "#af9e6e",
            },
          },
        },

        // Decorative Ethiopic characters (background texture)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "40px",
              right: "80px",
              fontSize: "280px",
              lineHeight: "1",
              color: "#af9e6e",
              opacity: 0.04,
              fontFamily: "Noto Sans Ethiopic",
            },
            children: "ኦ",
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "200px",
              right: "300px",
              fontSize: "200px",
              lineHeight: "1",
              color: "#af9e6e",
              opacity: 0.03,
              fontFamily: "Noto Sans Ethiopic",
            },
            children: "ዲ",
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "20px",
              left: "200px",
              fontSize: "240px",
              lineHeight: "1",
              color: "#af9e6e",
              opacity: 0.035,
              fontFamily: "Noto Sans Ethiopic",
            },
            children: "ት",
          },
        },

        // Top-right corner accent
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid #af9e6e",
              borderRight: "3px solid #af9e6e",
              opacity: 0.5,
            },
          },
        },

        // Bottom-right corner accent
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid #af9e6e",
              borderRight: "3px solid #af9e6e",
              opacity: 0.5,
            },
          },
        },

        // Main content area
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
              padding: "60px 70px 50px 56px",
            },
            children: [
              // Top: wordmark + logo badge
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  },
                  children: [
                    // Logo badge
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "44px",
                          height: "44px",
                          borderRadius: "10px",
                          background: "#af9e6e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "#0f2920",
                          fontFamily: "Noto Sans Ethiopic",
                          fontWeight: 700,
                        },
                        children: "ኦ",
                      },
                    },
                    // Wordmark
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "28px",
                          color: "#af9e6e",
                          fontFamily: "Instrument Serif",
                          letterSpacing: "0.02em",
                        },
                        children: "audit.et",
                      },
                    },
                  ],
                },
              },

              // Center: title + description
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    maxWidth: "900px",
                  },
                  children: [
                    // Title
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: page.title.length > 30 ? "52px" : "64px",
                          color: "#af9e6e",
                          fontFamily: "Instrument Serif",
                          lineHeight: "1.15",
                        },
                        children: page.title,
                      },
                    },
                    // Description
                    ...(page.description
                      ? [
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: "26px",
                                color: "#e6e1d7",
                                fontFamily: "Lora",
                                lineHeight: "1.5",
                                opacity: 0.85,
                              },
                              children: page.description,
                            },
                          },
                        ]
                      : []),
                  ],
                },
              },

              // Bottom: gold rule + ኦዲት
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  },
                  children: [
                    // Gold horizontal rule
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "100%",
                          height: "2px",
                          background: "#af9e6e",
                          opacity: 0.4,
                        },
                      },
                    },
                    // ኦዲት text
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "20px",
                          color: "#af9e6e",
                          fontFamily: "Noto Sans Ethiopic",
                          opacity: 0.4,
                          letterSpacing: "0.15em",
                        },
                        children: "ኦዲት · audit.et",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// --- Render pipeline ---

async function renderOgImage(page: PageInfo) {
  const markup = buildMarkup(page);

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Instrument Serif",
        data: instrumentSerifRegular,
        weight: 400,
        style: "normal",
      },
      { name: "Lora", data: loraRegular, weight: 400, style: "normal" },
      { name: "Lora", data: loraBold, weight: 700, style: "normal" },
      {
        name: "Noto Sans Ethiopic",
        data: notoEthiopic,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const png = resvg.render();
  return png.asPng();
}

// --- Astro static paths + GET handler ---

export const getStaticPaths: GetStaticPaths = () => {
  return Object.keys(pages).map((route) => ({
    params: { route: `${route}.png` },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const route = (params.route as string).replace(/\.png$/, "");
  const page = pages[route];

  if (!page) {
    return new Response("Not found", { status: 404 });
  }

  const png = await renderOgImage(page);

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
