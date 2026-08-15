/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type NonEmpty<S extends string> = S extends "" ? never : S;
