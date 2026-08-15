/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

export type NameOptional<S extends string> = S extends `${infer N}?`
  ? { name: Trim<N>; nameOptional: true }
  : { name: Trim<S>; nameOptional: false };
