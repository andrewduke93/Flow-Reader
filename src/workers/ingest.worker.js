self.addEventListener('message', async (ev) => {
  const { id, file, meta } = ev.data
  try {
    const ab = await file.arrayBuffer()
    // keep worker minimal — don't do heavy JS work here
    self.postMessage({ id, ok: true, arrayBuffer: ab, fileName: file.name, fileType: file.type, meta })
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err) })
  }
})
