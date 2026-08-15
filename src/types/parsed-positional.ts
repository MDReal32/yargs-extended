/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { PositionKind } from "./position-kind";

export interface ParsedPositional {
  name: string;
  type: PositionKind;
  array: boolean;
  isRequired: boolean;
  description?: string;
}
