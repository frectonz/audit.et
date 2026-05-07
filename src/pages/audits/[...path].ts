import type { APIRoute, GetStaticPaths } from "astro";
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
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf" },
  });
};
