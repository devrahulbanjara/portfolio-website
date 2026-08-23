import "server-only";

/**
 * Minimal Hashnode GraphQL client.
 *
 * `server-only` is load-bearing: HASHNODE_ACCESS_TOKEN grants full write access
 * to the publication, so importing this from a client component must be a build
 * error rather than a token leak.
 */

const DEFAULT_ENDPOINT = "https://gql-beta.hashnode.com/";

export class HashnodeError extends Error {
  constructor(
    message: string,
    readonly kind: "unconfigured" | "forbidden" | "network" | "graphql",
  ) {
    super(message);
    this.name = "HashnodeError";
  }
}

export function getPublicationHost(): string | null {
  return process.env.HASHNODE_PUBLICATION_HOST?.trim() || null;
}

/**
 * Executes a query. Public reads do not need the token; it is sent only when
 * present, so drafts and scheduled posts work once configured.
 */
export async function hashnodeRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidateSeconds: number,
): Promise<T> {
  const host = getPublicationHost();
  if (!host) {
    throw new HashnodeError(
      "HASHNODE_PUBLICATION_HOST is not set",
      "unconfigured",
    );
  }

  const endpoint = process.env.HASHNODE_API_ENDPOINT?.trim() || DEFAULT_ENDPOINT;
  const token = process.env.HASHNODE_ACCESS_TOKEN?.trim();

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: revalidateSeconds, tags: ["blog"] },
    });
  } catch (cause) {
    throw new HashnodeError(
      `Network error reaching Hashnode: ${(cause as Error).message}`,
      "network",
    );
  }

  if (!response.ok) {
    throw new HashnodeError(
      `Hashnode returned HTTP ${response.status}`,
      response.status === 403 ? "forbidden" : "network",
    );
  }

  const body = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    const message = body.errors.map((e) => e.message).join("; ");
    // The Pro paywall surfaces as a GraphQL error, not an HTTP status.
    const forbidden = /pro plan|forbidden/i.test(message);
    throw new HashnodeError(
      `Hashnode GraphQL error: ${message}`,
      forbidden ? "forbidden" : "graphql",
    );
  }

  if (!body.data) {
    throw new HashnodeError("Hashnode returned no data", "graphql");
  }

  return body.data;
}
