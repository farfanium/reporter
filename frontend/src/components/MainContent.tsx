'use client'

import { useState, useEffect } from 'react'
import { Report, FileData } from '@/types/types'
import DataTable from './DataTable'
import FileList from './FileList'

interface MainContentProps {
  selectedReport: Report | null
  selectedFile: FileData | null
  selectedFileName: string
  onFileSelect: (fileName: string) => void
  sidebarCollapsed: boolean
  loading: boolean
}

export default function MainContent({
  selectedReport,
  selectedFile,
  selectedFileName,
  onFileSelect,
  sidebarCollapsed,
  loading,
}: MainContentProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])

  useEffect(() => {
    const newBreadcrumbs = []
    if (selectedReport) {
      newBreadcrumbs.push(selectedReport.name)
    }
    if (selectedFile) {
      newBreadcrumbs.push(selectedFile.fileName)
    }
    setBreadcrumbs(newBreadcrumbs)
  }, [selectedReport, selectedFile])

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0 && selectedReport) {
      // Navigate back to file list
      onFileSelect('')
    }
  }

  return (
    <div className={`flex-1 flex flex-col bg-gray-50 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                        index === breadcrumbs.length - 1 
                          ? 'text-gray-900 font-medium' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {crumb}
                    </button>
                    {index < breadcrumbs.length - 1 && (
                      <svg className="w-4 h-4 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
          
          {selectedFile && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{selectedFile.totalRows} rows</span>
              <span>•</span>
              <span>{selectedFile.headers.length} columns</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedReport ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to The Reporter</h2>
              <p className="text-gray-500">Select a report from the sidebar to get started</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Loading...</h2>
              <p className="text-gray-500">Processing your request, please wait</p>
            </div>
          </div>
        ) : selectedFile ? (
          <DataTable fileData={selectedFile} />
        ) : (
          <FileList 
            report={selectedReport} 
            onFileSelect={onFileSelect}
            selectedFile={selectedFileName}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
