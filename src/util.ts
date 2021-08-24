// TypeScript chooses not use generic types for Object.* utility methods
// I think that's dumb so here we are...
// https://github.com/microsoft/TypeScript/pull/12253#issuecomment-263132208

export const keys = Object.keys as <T>(object: T) => Extract<keyof T, string>[];

export const entries = Object.entries as <T>(
  object: T,
) => T extends ArrayLike<infer U>
  ? [string, U][]
  : { [K in keyof T]: [K, T[K]] }[keyof T][];

export const values = Object.values as <T>(
  object: T,
) => T extends ArrayLike<infer U> ? U[] : T[keyof T][];
