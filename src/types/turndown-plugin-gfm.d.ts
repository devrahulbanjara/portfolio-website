/**
 * `turndown-plugin-gfm` ships no types and has no @types package. Only the
 * `gfm` aggregate plugin is used, so the surface declared here is deliberately
 * narrow rather than a full guess at the module.
 */
declare module "turndown-plugin-gfm" {
  import type TurndownService from "turndown";

  /** Tables, strikethrough, and task lists in one plugin. */
  export const gfm: TurndownService.Plugin;
  export const tables: TurndownService.Plugin;
  export const strikethrough: TurndownService.Plugin;
  export const taskListItems: TurndownService.Plugin;
}
