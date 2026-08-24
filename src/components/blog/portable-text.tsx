import Image from "next/image";
import Link from "next/link";
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import { CodeBlock } from "@/components/blog/code-block";
import { urlForImage } from "@/sanity/lib/image";

/**
 * Renders a post body.
 *
 * Every type here has a matching entry in the blockContent schema
 * (src/sanity/schemaTypes/blockContent.ts). If an editor can insert it, it must
 * appear below — an unhandled type renders as a visible warning rather than
 * silently vanishing, which is the failure mode that actually loses content.
 *
 * Most typography comes from the `prose` class on the wrapping <article>, so
 * these overrides only cover what Tailwind Typography cannot express: the
 * custom divider, the scrollable table shell, and Sanity-specific media.
 */

interface ImageValue {
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
}

interface CodeValue {
  code?: string;
  language?: string;
  filename?: string;
}

function BodyImage({ value }: { value: ImageValue }) {
  const src = urlForImage(value, { width: 1400 });
  if (!src) return null;

  const alt = value.alt?.trim() || "";

  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-xl border border-border">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={0}
          sizes="(max-width: 768px) 100vw, 42rem"
          className="m-0! h-auto w-full"
        />
      </div>
      {value.caption ? (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: ImageValue }) => <BodyImage value={value} />,

    code: ({ value }: { value: CodeValue }) =>
      value?.code ? (
        <CodeBlock
          code={value.code}
          language={value.language}
          filename={value.filename}
        />
      ) : null,

    divider: () => (
      <div className="my-10 flex w-full items-center">
        <div
          className="h-px flex-1 bg-border"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        />
      </div>
    ),
  },

  marks: {
    code: ({ children }) => (
      <code className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-sm text-foreground/90 dark:bg-muted/40">
        {children}
      </code>
    ),

    link: ({ value, children }) => {
      const href: string = value?.href ?? "";
      const isInternal = href.startsWith("/");

      if (isInternal) {
        return (
          <Link href={href} className="underline underline-offset-4">
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          className="underline underline-offset-4"
          // noopener is the security half; noreferrer stops leaking the reading
          // URL to whatever the post links out to.
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
  },

  block: {
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-border pl-4 italic">
        {children}
      </blockquote>
    ),
  },

  unknownType: ({ value }) => (
    <div className="my-4 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
      Unsupported content block: <code>{String(value?._type)}</code>
    </div>
  ),
};

export function PostBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <PortableTextRenderer value={value} components={portableTextComponents} />
  );
}
