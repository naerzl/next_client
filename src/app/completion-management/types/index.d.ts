export interface CompletionArchiveList {
  dir: string[]
  files: CompletionArchiveListFiles[]
}

export interface CompletionArchiveListFiles {
  e_tag: string
  key: string
  last_modified: string
  size: number
  storage_class: string
}

export interface CompletionArchiveListFilesObject {
  headers: { Host: string }
  url: string
}
