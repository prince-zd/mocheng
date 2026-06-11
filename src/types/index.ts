export type WritingDirection = 'horizontal' | 'vertical'

export type ColorMode = 'light' | 'dark'

export interface FontOption {
  label: string
  value: string
  fileName?: string
  sourceWork?: string
  fallbackValue?: string
}

export interface WorkItem {
  id: number
  title: string
  author: string
  thumbnail: string
  image: string
}

export interface CharacterItem {
  id: string
  char: string
  pinyin: string
}

export interface SavedWorkForm {
  text: string
  fontFamily: string
  fontSize: number
  letterSpacing: number
  lineHeight: number
  direction: WritingDirection
  colorMode: ColorMode
}

export interface SavedWork {
  id: string
  title: string
  form: SavedWorkForm
  createdAt: string
  updatedAt: string
}
