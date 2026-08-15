/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type StripValueToken<S extends string> = S extends `${infer Name} <${string}`
  ? Name
  : S extends `${infer Name} [${string}`
    ? Name
    : S;
