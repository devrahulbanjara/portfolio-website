// Per-icon subpaths. @sanity/icons v5's root entry exports only `Icon` and the
// `icons` map at runtime, even though its type declarations suggest otherwise.
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { TagIcon } from "@sanity/icons/Tag";
import type { StructureResolver } from "sanity/structure";

/**
 * Studio sidebar.
 *
 * Explicit rather than automatic so that blockContent, which is an object type
 * and not something you ever open on its own, does not show up as a list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("post").title("Posts").icon(DocumentTextIcon),
      S.documentTypeListItem("tag").title("Tags").icon(TagIcon),
    ]);
