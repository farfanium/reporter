import axios from 'axios'
import { Report, FileData, CreateReportRequest, ApiResponse, FolderItem } from '@/types/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for production logging
api.interceptors.request.use(
  (config) => {
    // Only log errors in production
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
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

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
      throw new Error('Failed to delete report. Please ensure the backend server is running.')
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
      return false
    }
  },
}
