export interface Report {
  id: string
  name: string
  path: string
  files: string[]
  fileDetails?: FileInfo[]
  createdAt: string
  updatedAt: string
}

export interface FileInfo {
  name: string
  size: number
  lastModified: string
  extension: string
}

export interface FileData {
  fileName: string
  headers: string[]
  data: Record<string, any>[]
  totalRows: number
}

export interface TableColumn {
  key: string
  label: string
  sortable: boolean
  filterable: boolean
}

export interface UserPreferences {
  sidebarCollapsed: boolean
  columnFilters: Record<string, string>
  sortOrder: {
    column: string
    direction: 'asc' | 'desc'
  }
  columnsVisible: Record<string, boolean>
}

export interface CreateReportRequest {
  name: string
  path: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface FolderItem {
  name: string
  path: string
  isDirectory: boolean
  hasSubfolders: boolean
  size?: number
  lastModified?: string
}
