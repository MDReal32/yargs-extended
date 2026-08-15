/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

export type Wrapper<S extends string> = S extends `<${infer R}>`
  ? { wrappedRequired: true; rest: Trim<R> }
  : S extends `[${infer R}]`
    ? { wrappedRequired: false; rest: Trim<R> }
    : { wrappedRequired: undefined; rest: S };
