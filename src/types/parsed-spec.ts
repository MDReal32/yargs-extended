/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { ValueKind } from "./value-kind";

export interface ParsedSpec {
  type: ValueKind;
  longs: string[]; // e.g. ["port-d", "pd"]
  shorts: string[]; // e.g. ["p"]
  array: boolean;
  choices: string[];
  description?: string;
  defaultValue?: unknown;
  isRequired: boolean;
}
