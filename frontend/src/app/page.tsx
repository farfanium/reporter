'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import { Report, FileData } from '@/types/types'
import { reportService } from '@/services/reportService'

export default function Home() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const reportsData = await reportService.getReports()
      setReports(reportsData)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportSelect = async (report: Report) => {
    setSelectedReport(report)
    setSelectedFile(null)
    setSelectedFileName('')
  }

  const handleFileSelect = async (fileName: string) => {
    if (!selectedReport) return
    
    if (!fileName) {
      // Clear selection
      setSelectedFile(null)
      setSelectedFileName('')
      return
    }
    
    try {
      setLoading(true)
      setSelectedFileName(fileName)
      const fileData = await reportService.getFileData(selectedReport.id, fileName)
      setSelectedFile(fileData)
    } catch (error) {
      console.error('Error loading file data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReport = async (name: string, path: string) => {
    try {
      const newReport = await reportService.createReport(name, path)
      setReports(prev => [...prev, newReport])
    } catch (error) {
      console.error('Error creating report:', error)
      throw error // Re-throw the error so the modal can handle it
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const success = await reportService.deleteReport(reportId)
      if (success) {
        setReports(prev => prev.filter(report => report.id !== reportId))
        // Clear selection if the deleted report was selected
        if (selectedReport?.id === reportId) {
          setSelectedReport(null)
          setSelectedFile(null)
        }
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const handleRefreshReport = async (reportId: string) => {
    try {
      const refreshedReport = await reportService.refreshReport(reportId)
      if (refreshedReport) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? refreshedReport : report
        ))
        // Update selected report if it's the one being refreshed
        if (selectedReport?.id === reportId) {
          setSelectedReport(refreshedReport)
          // Clear selected file as the file list might have changed
          setSelectedFile(null)
        }
      }
    } catch (error) {
      console.error('Error refreshing report:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        reports={reports}
        selectedReport={selectedReport}
        collapsed={sidebarCollapsed}
        onReportSelect={handleReportSelect}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onAddReport={handleAddReport}
        onDeleteReport={handleDeleteReport}
        onRefreshReport={handleRefreshReport}
        loading={loading}
      />
      <MainContent
        selectedReport={selectedReport}
        selectedFile={selectedFile}
        selectedFileName={selectedFileName}
        onFileSelect={handleFileSelect}
        sidebarCollapsed={sidebarCollapsed}
        loading={loading}
      />
    </div>
  )
}
