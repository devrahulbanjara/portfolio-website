import type { ComponentType, SVGProps } from "react";
import { Icons } from "@/components/icons";
import { HuggingFaceMark } from "@/components/brand-marks";
import type { IconKey } from "@/lib/content/types";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Maps the string keys used in src/lib/content to renderable components.
 *
 * This indirection is the reason the content modules are plain `.ts` with no
 * React import: data stays serializable, and swapping an icon never means
 * touching content.
 */
const registry: Record<string, ComponentType<IconProps>> = {
  ...Icons,
  huggingface: HuggingFaceMark,
};

/** Returns the icon for `key`, falling back to a globe for unknown keys. */
export function resolveIcon(key: IconKey): ComponentType<IconProps> {
  return registry[key] ?? Icons.globe;
}
