export function is_void(val: any): val is null | undefined {
  return val == null;
}
