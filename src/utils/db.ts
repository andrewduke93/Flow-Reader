import Dexie, { Table } from 'dexie'

export interface Progress {
  wordIndex: number
  percentage: number
  lastRead: number // epoch ms
}

export interface BookRecord {
  id?: number
  title: string
  author?: string
  coverColor?: string
  coverDataUrl?: string | null
  fileBlob?: Blob | null
  fileName?: string
  fileType?: string
  category?: string
  addedAt: number
  progress?: Progress
}

export class FlowDB extends Dexie {
  books!: Table<BookRecord, number>

  constructor() {
    super('flow_rsvp_db')
    this.version(1).stores({
      books: '++id, title, author, category, addedAt, "progress.lastRead"'
    })
  }
}

export const db = new FlowDB()
