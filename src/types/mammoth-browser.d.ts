declare module 'mammoth/mammoth.browser' {
  // Minimal typings to satisfy TS; the library returns HTML string in `value`
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }, options?: any): Promise<{ value: string; messages?: any[] }>
  const _default: any
  export default _default
}
