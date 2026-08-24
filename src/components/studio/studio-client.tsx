"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

/**
 * Kept as its own client component so the Studio config — which is full of
 * functions and React components — never has to cross a server/client
 * boundary. The route's page.tsx stays a plain server component.
 */
export function StudioClient() {
  return <NextStudio config={config} />;
}
