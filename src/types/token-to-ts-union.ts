/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

export type TokenToTsUnion<S extends string> = S extends `${infer First}|${infer Rest}`
  ? TokenToTsUnion<First> | TokenToTsUnion<Rest>
  : Trim<S>;
