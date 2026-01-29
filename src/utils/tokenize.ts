import type { Token } from '../types/token'

const CLEAN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[\u2018\u2019\u201A\u201B\u2032]/g, "'"], // smart single quotes
  [/[\u201C\u201D\u201E\u201F\u2033]/g, '"'], // smart double quotes
  [/\u2013|\u2014/g, '-'], // dashes
  [/\u00A0/g, ' '], // non-breaking space
  [/\r\n?/g, '\n'],
  [/\n{3,}/g, '\n\n'] // collapse long gaps
]

function cleanText(src: string){
  let s = String(src)
  for (const [re, sub] of CLEAN_REPLACEMENTS) s = s.replace(re, sub)
  // remove page-number lines (lines that are only digits or small roman numerals)
  s = s.split('\n').filter(line => {
    const t = line.trim()
    if (!t) return false
    if (/^\d{1,4}$/.test(t)) return false
    if (/^[ivxlcdmIVXLCDM]{1,4}$/.test(t)) return false
    return true
  }).join('\n')
  return s.trim()
}

export function tokenizeText(src: string, maxTokens = Infinity): Token[] {
  const cleaned = cleanText(src)
  const paragraphs = cleaned.split(/\n{2,}/g)
  const tokens: Token[] = []
  let idx = 0
  for (const p of paragraphs) {
    const words = Array.from(p.trim().split(/\s+/g).filter(Boolean))
    for (const w of words) {
      const hasPunct = /[.,:;!?]$/.test(w)
      tokens.push({ text: w, isParagraphBreak: false, hasPunctuation: hasPunct, index: idx++ })
      if (tokens.length >= maxTokens) return tokens
    }
    // mark paragraph break as a special token
    tokens.push({ text: '\n', isParagraphBreak: true, hasPunctuation: false, index: idx++ })
    if (tokens.length >= maxTokens) break
  }
  return tokens
}

export { cleanText }
