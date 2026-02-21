import type { APIRoute, GetStaticPaths } from "astro";
// @ts-expect-error - Node built-ins available at build time in Astro
import fs from "node:fs";
import { getAvailablePdfs } from "../../data/enterprises";

export const getStaticPaths: GetStaticPaths = () => {
  return getAvailablePdfs().map(({ id, year, sourcePath }) => ({
    params: { path: `${id}/${year}.pdf` },
    props: { sourcePath },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const buffer = fs.readFileSync((props as { sourcePath: string }).sourcePath);
  return new Response(buffer, {
    headers: { "Content-Type": "application/pdf" },
  });
};
