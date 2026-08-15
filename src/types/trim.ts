/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

type Whitespace = " " | "\n" | "\r" | "\t";

export type Trim<S extends string> = S extends `${Whitespace}${infer Rest}`
  ? Trim<Rest>
  : S extends `${infer Rest}${Whitespace}`
    ? Trim<Rest>
    : S;
