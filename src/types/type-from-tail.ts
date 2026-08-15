/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

import type { KindToTs } from "./kind-to-ts";

export type TypeFromTail<TTail extends string, TArray extends boolean> = TTail extends ""
  ? { kind: "string"; ts: string }
  : TArray extends true
    ? TTail extends `${infer Base}[]`
      ? Trim<Base> extends infer B extends string
        ? KindToTs<B, true>
        : never
      : never
    : KindToTs<TTail, false>;
