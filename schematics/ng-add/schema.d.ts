export interface Schema {
  project?: string;
  routing?: boolean;
  // This actually will still infer to `number` type, this is done to specify
  // that `4200` is used by default.
  port?: 4200 | number;
}
