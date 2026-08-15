/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { ConfigOptions } from "./config-options";
import type { PositionKind } from "./position-kind";

export interface ParsedPositional extends Pick<ConfigOptions<string>, "description"> {
  name: string;
  type: PositionKind;
  array: boolean;
  isRequired: boolean;
}
