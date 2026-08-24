import type { SchemaTypeDefinition } from "sanity";

import { blockContent } from "./blockContent";
import { post } from "./post";
import { tag } from "./tag";

export const schemaTypes: SchemaTypeDefinition[] = [post, tag, blockContent];
