import type { SavedWork, SavedWorkForm } from '@/types'

const STORAGE_KEY = 'moyun.savedWorks.v1'

const createWorkTitle = (text: string, customTitle = ''): string => {
  const trimmedTitle = customTitle.trim()
  if (trimmedTitle) {
    return Array.from(trimmedTitle).slice(0, 24).join('')
  }

  const title = Array.from(text.replace(/\s+/g, '')).slice(0, 10).join('')
  return title || '未命名作品'
}

const createWorkId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const readSavedWorks = (): SavedWork[] => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? parsedValue as SavedWork[] : []
  } catch {
    return []
  }
}

export const writeSavedWorks = (works: SavedWork[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works))
}

export const findSavedWork = (id: string): SavedWork | undefined =>
  readSavedWorks().find((work) => work.id === id)

export const saveWorkDraft = (form: SavedWorkForm, id?: string, title = ''): SavedWork => {
  const works = readSavedWorks()
  const now = new Date().toISOString()
  const existingWork = id ? works.find((work) => work.id === id) : undefined
  const nextWork: SavedWork = {
    id: existingWork?.id ?? createWorkId(),
    title: createWorkTitle(form.text, title),
    form: { ...form },
    createdAt: existingWork?.createdAt ?? now,
    updatedAt: now
  }

  const nextWorks = existingWork
    ? works.map((work) => (work.id === nextWork.id ? nextWork : work))
    : [nextWork, ...works]

  writeSavedWorks(nextWorks)
  return nextWork
}

export const deleteSavedWork = (id: string): void => {
  writeSavedWorks(readSavedWorks().filter((work) => work.id !== id))
}
