/* eslint-disable no-restricted-globals */
// Web Worker to read large File objects off the main thread and compute a lightweight metadata payload.
// The worker posts back an ArrayBuffer for the main thread to persist into IndexedDB.

self.addEventListener('message', async (ev) => {
  const { id, file, meta } = ev.data as { id: string; file: File; meta?: any }
  try {
    // Read as arrayBuffer in worker to avoid main-thread jank
    const ab = await file.arrayBuffer()

    // return small metadata + arrayBuffer (transferable)
    // keep the worker minimal to ensure cross-environment stability
    (self as any).postMessage({ id, ok: true, arrayBuffer: ab, fileName: file.name, fileType: file.type, meta })
  } catch (err) {
    (self as any).postMessage({ id, ok: false, error: String(err) })
  }
})
