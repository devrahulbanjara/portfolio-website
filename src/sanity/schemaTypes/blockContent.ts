import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The post body.
 *
 * Deliberately narrow. Every block type here has a matching renderer in
 * src/components/blog/portable-text.tsx — adding one to this list without
 * adding a renderer produces a silent gap in the article, so keep the two in
 * step. h1 is excluded because the page already renders the post title as the
 * single h1.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
          { title: "Strike", value: "strike-through" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (rule) =>
                  rule
                    .required()
                    .uri({ scheme: ["http", "https", "mailto", "tel"] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describe the image for screen readers and for when it fails to load. Leave blank only if it is purely decorative.",
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional. Rendered under the image.",
        }),
      ],
    }),
    defineArrayMember({
      name: "code",
      title: "Code block",
      type: "code",
      options: {
        withFilename: true,
        languageAlternatives: [
          { title: "Plain text", value: "text" },
          { title: "Bash", value: "bash" },
          { title: "TypeScript", value: "typescript" },
          { title: "JavaScript", value: "javascript" },
          { title: "TSX", value: "tsx" },
          { title: "JSX", value: "jsx" },
          { title: "Python", value: "python" },
          { title: "JSON", value: "json" },
          { title: "YAML", value: "yaml" },
          { title: "SQL", value: "sql" },
          { title: "Go", value: "go" },
          { title: "Rust", value: "rust" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
          { title: "Markdown", value: "markdown" },
          { title: "Dockerfile", value: "docker" },
        ],
      },
    }),
    defineArrayMember({
      name: "divider",
      title: "Divider",
      type: "object",
      fields: [
        defineField({
          name: "unused",
          type: "boolean",
          hidden: true,
        }),
      ],
      preview: { prepare: () => ({ title: "Divider" }) },
    }),
  ],
});
