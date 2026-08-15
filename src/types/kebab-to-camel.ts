/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

import type { CapitalizeAscii } from "./capitalize-ascii";

export type KebabToCamel<S extends string> = S extends `${infer H}-${infer T}`
  ? `${H}${CapitalizeAscii<KebabToCamel<T>>}`
  : S;
