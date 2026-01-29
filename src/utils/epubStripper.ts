import JSZip from 'jszip'
import { tokenizeText } from './tokenize'

export async function stripEpub(arrayBuffer: ArrayBuffer, maxTokens = Infinity){
  const zip = await JSZip.loadAsync(arrayBuffer)
  // find all xhtml / html files in the package (simple heuristic)
  const htmlFiles = Object.keys(zip.files).filter(k => /\.(x?html|html|htm|xml)$/i.test(k))
  // prefer content in OEBPS or Text folders
  const prefer = (arr: string[], pref: string) => arr.sort((a,b) => (a.includes(pref) ? -1 : 1))
  prefer(htmlFiles, 'OEBPS')
  prefer(htmlFiles, 'Text')

  let fullText = ''
  for (const path of htmlFiles) {
    try {
      const content = await zip.files[path].async('string')
      // extract <body> innerText using DOMParser
      const doc = new DOMParser().parseFromString(content, 'text/html')
      const body = doc.body
      if (body) {
        const txt = body.innerText || ''
        if (txt.trim()) fullText += '\n\n' + txt.trim()
      }
      if (fullText.length > 20000) break // avoid processing entire gigantic epubs here
    } catch (err) {
      // ignore
    }
  }

  // try to extract cover (common locations)
  let coverDataUrl: string | null = null
  const coverPaths = Object.keys(zip.files).filter(k => /cover.*\.(png|jpe?g|webp)/i.test(k))
  if (coverPaths.length) {
    try {
      const img = await zip.files[coverPaths[0]].async('base64')
      const ext = coverPaths[0].split('.').pop() || 'png'
      coverDataUrl = `data:image/${ext};base64,${img}`
    } catch (err) {
      coverDataUrl = null
    }
  }

  const tokens = tokenizeText(fullText || '', maxTokens)
  return { text: fullText, tokens, coverDataUrl }
}
