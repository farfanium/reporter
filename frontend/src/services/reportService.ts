import axios from 'axios'
import { Report, FileData, CreateReportRequest, ApiResponse, FolderItem } from '@/types/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for logging in development
api.interceptors.request.use(
  (config) => {
    if (!IS_PRODUCTION) {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.params)
    }
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (!IS_PRODUCTION) {
      console.log('API Response:', response.status, response.data)
    }
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Mock data for initial development
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Sales Report',
    path: '/nas/reports/sales',
    files: ['sales_2024.xlsx', 'sales_2023.csv', 'quarterly_summary.txt'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Inventory Report',
    path: '/nas/reports/inventory',
    files: ['inventory_current.xlsx', 'stock_levels.csv'],
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: '3',
    name: 'Financial Report',
    path: '/nas/reports/financial',
    files: ['balance_sheet.xlsx', 'income_statement.csv', 'cash_flow.txt'],
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
  },
]

const mockFileData: Record<string, FileData> = {
  'sales_2024.xlsx': {
    fileName: 'sales_2024.xlsx',
    headers: ['Product', 'Revenue', 'Units Sold', 'Region', 'Sales Rep'],
    data: [
      { Product: 'Widget A', Revenue: 15000, 'Units Sold': 150, Region: 'North', 'Sales Rep': 'John Doe' },
      { Product: 'Widget B', Revenue: 22000, 'Units Sold': 220, Region: 'South', 'Sales Rep': 'Jane Smith' },
      { Product: 'Widget C', Revenue: 18000, 'Units Sold': 180, Region: 'East', 'Sales Rep': 'Bob Johnson' },
      { Product: 'Widget D', Revenue: 12000, 'Units Sold': 120, Region: 'West', 'Sales Rep': 'Alice Brown' },
    ],
    totalRows: 4,
  },
  'inventory_current.xlsx': {
    fileName: 'inventory_current.xlsx',
    headers: ['Item Code', 'Description', 'Current Stock', 'Min Level', 'Max Level', 'Location'],
    data: [
      { 'Item Code': 'A001', Description: 'Widget A', 'Current Stock': 500, 'Min Level': 100, 'Max Level': 1000, Location: 'Warehouse 1' },
      { 'Item Code': 'B002', Description: 'Widget B', 'Current Stock': 750, 'Min Level': 200, 'Max Level': 1500, Location: 'Warehouse 2' },
      { 'Item Code': 'C003', Description: 'Widget C', 'Current Stock': 300, 'Min Level': 150, 'Max Level': 800, Location: 'Warehouse 1' },
    ],
    totalRows: 3,
  },
  'balance_sheet.xlsx': {
    fileName: 'balance_sheet.xlsx',
    headers: ['Account', 'Type', 'Current Balance', 'Previous Balance', 'Change'],
    data: [
      { Account: 'Cash', Type: 'Asset', 'Current Balance': 50000, 'Previous Balance': 45000, Change: 5000 },
      { Account: 'Accounts Receivable', Type: 'Asset', 'Current Balance': 25000, 'Previous Balance': 30000, Change: -5000 },
      { Account: 'Inventory', Type: 'Asset', 'Current Balance': 40000, 'Previous Balance': 35000, Change: 5000 },
      { Account: 'Accounts Payable', Type: 'Liability', 'Current Balance': 15000, 'Previous Balance': 20000, Change: -5000 },
    ],
    totalRows: 4,
  },
}

export const reportService = {
  async getReports(): Promise<Report[]> {
    try {
      const response = await api.get<ApiResponse<Report[]>>('/reports')
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error getting reports:', response.data.error)
        return []
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error)
      // Only use mock data in development when backend is unavailable
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockReports
      }
      throw new Error('Failed to fetch reports. Please ensure the backend server is running.')
    }
  },

  async getReport(id: string): Promise<Report | null> {
    try {
      const response = await api.get<ApiResponse<Report>>(`/reports/${id}`)
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error getting report:', response.data.error)
        return null
      }
    } catch (error: any) {
      console.error('Error fetching report:', error)
      // Only use mock data in development
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockReports.find(report => report.id === id) || null
      }
      throw new Error('Failed to fetch report. Please ensure the backend server is running.')
    }
  },

  async getFileData(reportId: string, fileName: string): Promise<FileData | null> {
    try {
      const response = await api.get<ApiResponse<FileData>>(`/files/${reportId}/${fileName}`)
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error getting file data:', response.data.error)
        return null
      }
    } catch (error: any) {
      console.error('Error fetching file data:', error)
      // Only use mock data in development
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        await new Promise(resolve => setTimeout(resolve, 800))
        return mockFileData[fileName] || null
      }
      throw new Error('Failed to fetch file data. Please ensure the backend server is running.')
    }
  },

  async createReport(name: string, path: string): Promise<Report> {
    try {
      const response = await api.post<ApiResponse<Report>>('/reports', { name, path })
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error creating report:', response.data.error)
        throw new Error(response.data.error || 'Failed to create report')
      }
    } catch (error: any) {
      console.error('Error creating report:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to create report. Please check the path and try again.')
    }
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    try {
      const response = await api.put<ApiResponse<Report>>(`/reports/${id}`, updates)
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error updating report:', response.data.error)
        return null
      }
    } catch (error: any) {
      console.error('Error updating report:', error)
      // Only use mock data in development
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        await new Promise(resolve => setTimeout(resolve, 400))
        const report = mockReports.find(r => r.id === id)
        if (report) {
          return { ...report, ...updates, updatedAt: new Date().toISOString() }
        }
      }
      throw new Error('Failed to update report. Please ensure the backend server is running.')
    }
  },

  async deleteReport(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/reports/${id}`)
      if (response.data.success) {
        return true
      } else {
        console.error('Error deleting report:', response.data.error)
        return false
      }
    } catch (error: any) {
      console.error('Error deleting report:', error)
      // Only return success in development
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        await new Promise(resolve => setTimeout(resolve, 300))
        return true
      }
      throw new Error('Failed to delete report. Please ensure the backend server is running.')
    }
  },

  async refreshReport(id: string): Promise<Report | null> {
    try {
      const response = await api.post<ApiResponse<Report>>(`/reports/${id}/refresh`)
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error refreshing report:', response.data.error)
        return null
      }
    } catch (error: any) {
      console.error('Error refreshing report:', error)
      // Only use mock data in development
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        await new Promise(resolve => setTimeout(resolve, 800))
        const report = mockReports.find(r => r.id === id)
        if (report) {
          return { ...report, updatedAt: new Date().toISOString() }
        }
      }
      throw new Error('Failed to refresh report. Please ensure the backend server is running.')
    }
  },

  async getFolders(path: string = '/'): Promise<FolderItem[]> {
    try {
      const response = await api.get<ApiResponse<FolderItem[]>>('/folders', {
        params: { path }
      })
      
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.error('Error getting folders:', response.data.error)
        return []
      }
    } catch (error: any) {
      console.error('Error fetching folders:', error)
      
      // Only fallback to mock data in development
      if (!IS_PRODUCTION) {
        console.warn('Using mock data - backend unavailable')
        return getMockFolders(path)
      }
      throw new Error('Failed to browse folders. Please ensure the backend server is running and the NAS path is accessible.')
    }
  },

  async validatePath(path: string): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<boolean>>('/folders/validate', {
        params: { path }
      })
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data
      } else {
        console.error('Error validating path:', response.data.error)
        return false
      }
    } catch (error: any) {
      console.error('Error validating path:', error)
      // In production, always return false if validation fails
      return false
    }
  },
}

// Mock folder structure for fallback
const mockFolderStructure: Record<string, FolderItem[]> = {
  '/': [
    { name: 'nas', path: '/nas', isDirectory: true, hasSubfolders: true },
    { name: 'home', path: '/home', isDirectory: true, hasSubfolders: true },
    { name: 'data', path: '/data', isDirectory: true, hasSubfolders: true },
  ],
  '/nas': [
    { name: 'reports', path: '/nas/reports', isDirectory: true, hasSubfolders: true },
    { name: 'backups', path: '/nas/backups', isDirectory: true, hasSubfolders: true },
    { name: 'shared', path: '/nas/shared', isDirectory: true, hasSubfolders: true },
  ],
  '/nas/reports': [
    { name: 'sales', path: '/nas/reports/sales', isDirectory: true, hasSubfolders: false },
    { name: 'inventory', path: '/nas/reports/inventory', isDirectory: true, hasSubfolders: false },
    { name: 'financial', path: '/nas/reports/financial', isDirectory: true, hasSubfolders: false },
    { name: 'marketing', path: '/nas/reports/marketing', isDirectory: true, hasSubfolders: false },
    { name: 'hr', path: '/nas/reports/hr', isDirectory: true, hasSubfolders: false },
  ],
  '/home': [
    { name: 'user1', path: '/home/user1', isDirectory: true, hasSubfolders: true },
    { name: 'user2', path: '/home/user2', isDirectory: true, hasSubfolders: true },
  ],
  '/data': [
    { name: 'projects', path: '/data/projects', isDirectory: true, hasSubfolders: true },
    { name: 'archives', path: '/data/archives', isDirectory: true, hasSubfolders: true },
  ],
}

function getMockFolders(path: string): FolderItem[] {
  return mockFolderStructure[path] || []
}
