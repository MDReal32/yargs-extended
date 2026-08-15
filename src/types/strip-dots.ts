/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type StripDots<S extends string> = S extends `${infer T}...` ? T : S;
