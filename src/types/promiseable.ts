/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

interface Thenable<T> {
  then<TResult>(onfulfilled: (value: T) => TResult): Thenable<TResult>;
}

export type Promisable<T> = T | Thenable<T>;
