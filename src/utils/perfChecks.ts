export async function checkDexieSnapshotRead(timeout = 1500){
  const start = performance.now()
  try {
    const snap = localStorage.getItem('flowy:booksSnapshot')
    if (!snap) return { ok: false, elapsed: performance.now() - start }
    const parsed = JSON.parse(snap)
    return { ok: Array.isArray(parsed), elapsed: performance.now() - start }
  } catch (err) {
    return { ok: false, elapsed: performance.now() - start }
  }
}

export async function checkDropZoneImmediate(node: HTMLElement | null){
  if (!node) return { ok: false, elapsed: Infinity }
  const start = performance.now()
  // simulate immediate UI change
  node.classList.add('drop-loading')
  const elapsed = performance.now() - start
  node.classList.remove('drop-loading')
  return { ok: elapsed < 16, elapsed }
}
