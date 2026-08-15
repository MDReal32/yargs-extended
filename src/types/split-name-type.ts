/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

export type SplitNameType<S extends string> = S extends `${infer N}:${infer T}`
  ? { head: Trim<N>; tail: Trim<T> }
  : { head: Trim<S>; tail: "" };
