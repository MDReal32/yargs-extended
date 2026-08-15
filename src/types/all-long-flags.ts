/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { CleanToken } from "./clean-token";
import type { FirstWord } from "./first-word";
import type { NonEmpty } from "./non-empty";
import type { SplitByComma } from "./split-by-comma";

export type AllLongFlags<
  S extends string,
  Segs extends readonly string[] = SplitByComma<S>
> = NonEmpty<
  Segs[number] extends infer X extends string
    ? X extends `--${infer R}`
      ? CleanToken<FirstWord<R>>
      : ""
    : ""
>;
