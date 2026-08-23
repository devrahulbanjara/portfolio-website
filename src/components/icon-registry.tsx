import type { ComponentType, SVGProps } from "react";
import { Icons } from "@/components/icons";
import type { IconKey } from "@/lib/content/types";

type IconProps = SVGProps<SVGSVGElement>;

function HuggingFaceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-3.2 7.2a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zm6.4 0a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM12 18c-2.5 0-4.6-1.6-5.4-3.8a.6.6 0 01.56-.8h9.68a.6.6 0 01.56.8C16.6 16.4 14.5 18 12 18z" />
    </svg>
  );
}

/**
 * Maps the string keys used in src/lib/content to renderable components.
 *
 * This indirection is the reason the content modules are plain `.ts` with no
 * React import: data stays serializable, and swapping an icon never means
 * touching content.
 */
const registry: Record<string, ComponentType<IconProps>> = {
  ...Icons,
  huggingface: HuggingFaceIcon,
};

/** Returns the icon for `key`, falling back to a globe for unknown keys. */
export function resolveIcon(key: IconKey): ComponentType<IconProps> {
  return registry[key] ?? Icons.globe;
}
