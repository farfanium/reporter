'use client'

import { useState } from 'react'
import FolderBrowser from './FolderBrowser'
import { reportService } from '@/services/reportService'
import { Report } from '@/types/types'

interface AddReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, path: string) => void
}

export default function AddReportModal({ isOpen, onClose, onSubmit }: AddReportModalProps) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFolderBrowser, setShowFolderBrowser] = useState(false)
  const [error, setError] = useState('')
  const [isValidatingPath, setIsValidatingPath] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !path.trim()) return

    setLoading(true)
    setError('')

    try {
      // Validate path first
      setIsValidatingPath(true)
      const isValidPath = await reportService.validatePath(path.trim())
      
      if (!isValidPath) {
        setError('The specified path does not exist or is not accessible')
        return
      }

      await onSubmit(name.trim(), path.trim())
      setName('')
      setPath('')
      setError('')
      onClose()
    } catch (error: any) {
      console.error('Error adding report:', error)
      setError(error.message || 'Failed to add report. Please try again.')
    } finally {
      setLoading(false)
      setIsValidatingPath(false)
    }
  }

  const handleBrowseFolder = () => {
    setShowFolderBrowser(true)
  }

  const handleFolderSelect = (selectedPath: string) => {
    setPath(selectedPath)
    setShowFolderBrowser(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-2">
              Report Name
            </label>
            <input
              type="text"
              id="reportName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter report name"
              required
            />
          </div>

          <div>
            <label htmlFor="reportPath" className="block text-sm font-medium text-gray-700 mb-2">
              NAS Path
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="reportPath"
                value={path}
                onChange={(e) => {
                  setPath(e.target.value)
                  setError('') // Clear error when user types
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="/nas/reports/example"
                required
              />
              <button
                type="button"
                onClick={handleBrowseFolder}
                disabled={loading}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Browse for folder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Specify the full path to the NAS folder containing the report files
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isValidatingPath || !name.trim() || !path.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidatingPath ? 'Validating...' : loading ? 'Adding...' : 'Add Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Folder Browser Modal */}
      {showFolderBrowser && (
        <FolderBrowser
          isOpen={showFolderBrowser}
          onClose={() => setShowFolderBrowser(false)}
          onSelect={handleFolderSelect}
          currentPath={path}
        />
      )}
    </div>
  )
}
