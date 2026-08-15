/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { StripTrailingComma } from "./strip-trailing-comma";
import type { StripValueToken } from "./strip-value-token";
import type { Trim } from "./trim";

export type CleanToken<S extends string> = StripTrailingComma<Trim<StripValueToken<S>>>;
