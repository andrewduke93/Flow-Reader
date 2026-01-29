export async function fetchBlob(url: string, signal?: AbortSignal){
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Failed to fetch ${url} — ${res.status}`)
  return await res.blob()
}

export function blobToFile(blob: Blob, name = 'file'): File {
  return new File([blob], name, { type: blob.type || 'application/octet-stream' })
}
