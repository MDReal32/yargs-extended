/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

export type SplitByComma<S extends string> = S extends `${infer A},${infer B}`
  ? [Trim<A>, ...SplitByComma<Trim<B>>]
  : [Trim<S>];
