declare module 'pdfjs-dist/legacy/build/pdf'
declare module 'pdfjs-dist'
declare module 'react-virtuoso'

declare module 'virtual:pwa-register' {
  export function registerSW(opts?: any): { update(): Promise<void> }
}
