/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "./trim";

export type Variadic<S extends string> = S extends `...${infer R}`
  ? { array: true; rest: Trim<R> }
  : { array: false; rest: Trim<S> };
