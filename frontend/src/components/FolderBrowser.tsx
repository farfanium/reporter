'use client'

import { useState, useEffect } from 'react'
import { reportService } from '@/services/reportService'
import { FolderItem } from '@/types/types'

interface FolderBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
  currentPath: string
}

export default function FolderBrowser({ isOpen, onClose, onSelect, currentPath }: FolderBrowserProps) {
  const [currentDir, setCurrentDir] = useState('/')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pathHistory, setPathHistory] = useState<string[]>(['/'])
  const [selectedPath, setSelectedPath] = useState(currentPath || '/')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadFolders(currentDir)
    }
  }, [isOpen, currentDir])

  const loadFolders = async (dirPath: string) => {
    setLoading(true)
    setError('')
    
    try {
      const folders = await reportService.getFolders(dirPath)
      setFolders(folders)
    } catch (error: any) {
      console.error('Error loading folders:', error)
      setError(error.message || 'Failed to load folders. Check your connection and try again.')
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  const navigateToFolder = (folderPath: string) => {
    setCurrentDir(folderPath)
    setPathHistory(prev => [...prev, folderPath])
    setSelectedPath(folderPath)
  }

  const navigateUp = () => {
    const parentPath = currentDir.split('/').slice(0, -1).join('/') || '/'
    setCurrentDir(parentPath)
    setPathHistory(prev => prev.slice(0, -1))
    setSelectedPath(parentPath)
  }

  const navigateToPath = (path: string) => {
    setCurrentDir(path)
    const pathParts = path === '/' ? ['/'] : path.split('/').filter(Boolean)
    const newHistory = ['/', ...pathParts.slice(1).map((_, index) => 
      '/' + pathParts.slice(1, index + 2).join('/')
    )]
    setPathHistory(newHistory)
    setSelectedPath(path)
  }

  const handleSelect = () => {
    onSelect(selectedPath)
    onClose()
  }

  const pathParts = currentDir === '/' ? ['/'] : currentDir.split('/').filter(Boolean)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-2/3 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Browse Folders</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigateToPath('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Root
            </button>
            {pathParts.slice(1).map((part, index) => {
              const path = '/' + pathParts.slice(1, index + 2).join('/')
              return (
                <div key={path} className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <button
                    onClick={() => navigateToPath(path)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {part}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Path Display */}
        <div className="px-4 py-2 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              <strong>Selected:</strong> {selectedPath}
            </span>
            {currentDir !== '/' && (
              <button
                onClick={navigateUp}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => loadFolders(currentDir)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p>No folders found in this directory</p>
              <p className="text-sm text-gray-400 mt-1">This directory may be empty or you may not have access to it</p>
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => {
                    if (folder.hasSubfolders) {
                      navigateToFolder(folder.path)
                    } else {
                      setSelectedPath(folder.path)
                    }
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left ${
                    selectedPath === folder.path ? 'bg-blue-50 border-2 border-blue-200' : 'border-2 border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{folder.name}</p>
                    <p className="text-sm text-gray-500">{folder.path}</p>
                  </div>
                  {folder.hasSubfolders && (
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedPath}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Select Folder
          </button>
        </div>
      </div>
    </div>
  )
}
