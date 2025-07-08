'use client'

import { useState } from 'react'
import { Report } from '@/types/types'
import AddReportModal from './AddReportModal'

interface SidebarProps {
  reports: Report[]
  selectedReport: Report | null
  collapsed: boolean
  onReportSelect: (report: Report) => void
  onToggleCollapse: () => void
  onAddReport: (name: string, path: string) => void
  onDeleteReport: (reportId: string) => void
  onRefreshReport: (reportId: string) => void
  loading: boolean
}

export default function Sidebar({
  reports,
  selectedReport,
  collapsed,
  onReportSelect,
  onToggleCollapse,
  onAddReport,
  onDeleteReport,
  onRefreshReport,
  loading,
}: SidebarProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [refreshingReports, setRefreshingReports] = useState<Set<string>>(new Set())

  const handleDeleteClick = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation()
    setDeleteConfirm(reportId)
  }

  const handleRefreshClick = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation()
    setRefreshingReports(prev => {
      const newSet = new Set(prev)
      newSet.add(reportId)
      return newSet
    })
    try {
      await onRefreshReport(reportId)
    } finally {
      setRefreshingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDeleteReport(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirm(null)
  }

  return (
    <>
      <div className={`bg-white border-r border-gray-200 sidebar-transition ${collapsed ? 'w-16' : 'w-80'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h1 className="text-xl font-bold text-gray-800">The Reporter</h1>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          {!collapsed && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Reports</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Add new report"
              >
                + Add
              </button>
            </div>
          )}

          {collapsed && (
            <div className="mb-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Add new report"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          )}

          <div className="space-y-2">
            {loading ? (
              <div className="animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className={`relative group rounded-lg transition-colors ${
                    selectedReport?.id === report.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <button
                    onClick={() => onReportSelect(report)}
                    className={`w-full rounded-lg ${collapsed ? 'text-center p-3' : 'text-left p-3 pr-16'}`}
                    title={collapsed ? report.name : undefined}
                  >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      {!collapsed && (
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">{report.name}</div>
                          <div className="text-sm text-gray-500 truncate">{report.path}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {report.files.length} files
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Action buttons - only show when not collapsed */}
                  {!collapsed && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleRefreshClick(e, report.id)}
                        disabled={refreshingReports.has(report.id)}
                        className="p-1 rounded-full hover:bg-blue-100 text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh file list"
                      >
                        {refreshingReports.has(report.id) ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, report.id)}
                        className="p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700"
                        title="Delete report"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddReportModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={onAddReport}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Report</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
