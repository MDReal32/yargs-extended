/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { StripDots } from "./strip-dots";
import type { ValueToken } from "./value-token";

export type TokenBase<S extends string> = StripDots<
  ValueToken<S> extends never ? never : ValueToken<S>
>;
