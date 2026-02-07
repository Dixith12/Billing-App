// utils/invoiceUtil.ts
export function cleanUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}