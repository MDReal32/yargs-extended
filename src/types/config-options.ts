/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { DefaultForSpec } from "./default-for-spec";

export interface ConfigOptions<TSpec extends string> {
  description?: string;
  required?: boolean;
  default?: DefaultForSpec<TSpec>;
}
