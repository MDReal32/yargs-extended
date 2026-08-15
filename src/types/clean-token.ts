/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Trim } from "type-fest";

import type { StripTrailingComma } from "./strip-trailing-comma";
import type { StripValueToken } from "./strip-value-token";

export type CleanToken<S extends string> = StripTrailingComma<Trim<StripValueToken<S>>>;
