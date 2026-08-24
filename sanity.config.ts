"use client";

import { codeInput } from "@sanity/code-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId, studioBasePath } from "@/sanity/env";
import { resolve } from "@/sanity/presentation";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

/**
 * The Studio is a client-side React app mounted at /studio inside this same
 * Next app, so this file must stay a client module and basePath must match the
 * route in src/app/studio.
 */
export default defineConfig({
  basePath: studioBasePath,
  projectId,
  dataset,
  title: "Portfolio",
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      // No origin: the Studio and the site are the same deployment, so the
      // preview iframe just uses the current one. That is also why previews
      // work unchanged on Vercel preview deployments.
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    codeInput(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
