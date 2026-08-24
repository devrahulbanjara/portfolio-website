import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./src/sanity/env";

/**
 * Only used by the `sanity` CLI (schema extract, typegen, dataset export).
 * The running Studio is configured by sanity.config.ts.
 *
 * autoUpdates is off because the Studio is bundled by Next, not served by
 * Sanity — the version that ships is whatever is in the lockfile.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: false,
});
