import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

import { dataset, isSanityConfigured, projectId } from "@/sanity/env";

const builder = isSanityConfigured
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

/**
 * Absolute cdn.sanity.io URL for an image reference, or null when Sanity is not
 * configured or the field is empty.
 *
 * Always pass a width: the raw asset is whatever the editor uploaded, which on
 * a phone camera can be several megabytes.
 */
export function urlForImage(
  source: SanityImageSource | null | undefined,
  options: { width?: number; height?: number; quality?: number } = {},
): string | null {
  if (!builder || !source) return null;

  let image = builder.image(source).auto("format").fit("max");
  if (options.width) image = image.width(options.width);
  if (options.height) image = image.height(options.height);
  image = image.quality(options.quality ?? 82);

  return image.url();
}
