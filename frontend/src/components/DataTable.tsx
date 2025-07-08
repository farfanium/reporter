'use client'

import { useState, useMemo } from 'react'
import { FileData } from '@/types/types'

interface DataTableProps {
  fileData: FileData
}

export default function DataTable({ fileData }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredData = useMemo(() => {
    let filtered = fileData.data

    // Apply filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => 
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        
        if (aValue === bValue) return 0
        
        let comparison = 0
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [fileData.data, filters, sortColumn, sortDirection])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleSort = (column: string) => {
    setIsProcessing(true)
    setTimeout(() => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortColumn(column)
        setSortDirection('asc')
      }
      setIsProcessing(false)
    }, 100)
  }

  const handleFilterChange = (column: string, value: string) => {
    setIsProcessing(true)
    setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        [column]: value
      }))
      setCurrentPage(1)
      setIsProcessing(false)
    }, 100)
  }

  const clearFilters = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setFilters({})
      setCurrentPage(1)
      setIsProcessing(false)
    }, 100)
  }

  const exportData = () => {
    const csvContent = [
      fileData.headers.join(','),
      ...filteredData.map(row => 
        fileData.headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileData.fileName}_filtered.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">{fileData.fileName}</h2>
            <span className="text-sm text-gray-500">
              {filteredData.length} of {fileData.totalRows} rows
              {fileData.headers.length > 10 && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {fileData.headers.length} columns
                </span>
              )}
            </span>
            {isProcessing && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Processing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filtersVisible 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <span>Filters</span>
                <svg className={`w-4 h-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <button
              onClick={clearFilters}
              disabled={isProcessing}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
            <button
              onClick={exportData}
              disabled={isProcessing}
              className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Collapsible Filter Section */}
        {filtersVisible && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filter Columns</h3>
              <span className="text-xs text-gray-500">
                {Object.values(filters).filter(v => v).length} active filters
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
              {fileData.headers.map((header) => (
                <div key={header} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1 truncate" title={header}>
                    {header}
                  </label>
                  <input
                    type="text"
                    value={filters[header] || ''}
                    onChange={(e) => handleFilterChange(header, e.target.value)}
                    placeholder={`Filter ${header}...`}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Processing data...</span>
            </div>
          </div>
        )}
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {fileData.headers.map((header) => (
                <th
                  key={header}
                  className="table-header cursor-pointer select-none hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(header)}
                  title={`Click to sort by ${header}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate" title={header}>{header}</span>
                    <div className="flex flex-col ml-2 flex-shrink-0">
                      <svg 
                        className={`w-3 h-3 ${
                          sortColumn === header && sortDirection === 'asc' 
                            ? 'text-blue-500' 
                            : 'text-gray-400'
                        }`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 8l5-5 5 5H5z"/>
                      </svg>
                      <svg 
                        className={`w-3 h-3 -mt-1 ${
                          sortColumn === header && sortDirection === 'desc' 
                            ? 'text-blue-500' 
                            : 'text-gray-400'
                        }`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M15 12l-5 5-5-5h10z"/>
                      </svg>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={fileData.headers.length} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm">Try adjusting your filters to see more results</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {fileData.headers.map((header) => (
                    <td key={header} className="table-cell max-w-xs">
                      <div className="truncate" title={String(row[header])}>
                        {row[header]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
              {filteredData.length !== fileData.totalRows && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Filtered from {fileData.totalRows} total
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isProcessing}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isProcessing}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isProcessing}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || isProcessing}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
          {filteredData.length > 1000 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-amber-800">
                  Large dataset detected ({filteredData.length.toLocaleString()} rows). Consider using filters to improve performance.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
