// Global state management
const state = {
    reports: [],
    selectedReport: null,
    selectedFile: null,
    selectedFileName: '',
    sidebarCollapsed: false,
    currentPath: '/',
    currentFolders: [],
    loading: false,
    tableData: [],
    filteredData: [],
    currentHeaders: null,
    sortColumn: null,
    sortDirection: 'asc',
    columnFilters: {},
    currentPage: 1,
    itemsPerPage: 50,
    filtersVisible: false,
    // File list pagination
    fileCurrentPage: 1,
    fileItemsPerPage: 50,
    allFiles: [],
    filteredFiles: []
};

// API Configuration
const API_BASE = '/api';

// Toast Notification System
function createToast(type, title, message, duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastId = Date.now() + Math.random();
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = `toast-${toastId}`;
    
    toast.innerHTML = `
        <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toastId);
        }, duration);
    }
    
    return toastId;
}

function removeToast(toastId) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (!toast) return;
    
    toast.classList.add('hide');
    toast.classList.remove('show');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Utility functions
function showError(message) {
    createToast('error', 'Error', message);
}

function showSuccess(message) {
    createToast('success', 'Success', message);
}

function showWarning(message) {
    createToast('warning', 'Warning', message);
}

function showInfo(message) {
    createToast('info', 'Info', message);
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// API functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(API_BASE + url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error || 'API request failed');
        }
    } catch (error) {
        throw error;
    }
}

async function getAllReports() {
    return await apiRequest('/reports');
}

async function getReportById(id) {
    return await apiRequest(`/reports/${id}`);
}

async function refreshReportById(id) {
    return await apiRequest(`/reports/${id}/refresh`, {
        method: 'POST'
    });
}

async function createReport(reportData) {
    return await apiRequest('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
    });
}

async function deleteReport(id) {
    return await apiRequest(`/reports/${id}`, {
        method: 'DELETE'
    });
}

async function getFolders(path = '/') {
    return await apiRequest(`/folders?path=${encodeURIComponent(path)}`);
}

async function getFileData(reportId, fileName) {
    return await apiRequest(`/files/${reportId}/${fileName}`);
}

// UI State Management
function showWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('dataView').style.display = 'none';
    updateBreadcrumb(['Reports']);
}

function showReportView() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('reportView').style.display = 'block';
    document.getElementById('dataView').style.display = 'none';
    
    // Clear filters when returning to report view from file view
    if (state.selectedFile) {
        clearFiltersState();
        state.selectedFile = null;
        state.selectedFileName = '';
    }
    
    if (state.selectedReport) {
        updateBreadcrumb(['Reports', state.selectedReport.name]);
    }
}

function showDataView() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('dataView').style.display = 'block';
    if (state.selectedReport && state.selectedFileName) {
        updateBreadcrumb(['Reports', state.selectedReport.name, state.selectedFileName]);
    }
}

function updateBreadcrumb(items) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    breadcrumb.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !isLast && index > 0;
        
        return `<span class="breadcrumb-item ${isLast ? 'active' : ''} ${isClickable ? 'clickable' : ''}" 
                      ${isClickable ? `onclick="navigateToBreadcrumb(${index})"` : ''}>
                    ${item}
                </span>`;
    }).join('<span class="breadcrumb-separator">›</span>');
}

function navigateToBreadcrumb(index) {
    if (index === 0) {
        showWelcomeScreen();
        clearSelection();
    } else if (index === 1 && state.selectedReport) {
        showReportView();
        state.selectedFile = null;
        state.selectedFileName = '';
    }
}

// Sidebar functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    state.sidebarCollapsed = !state.sidebarCollapsed;
    
    if (state.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
}

function clearSelection() {
    state.selectedReport = null;
    state.selectedFile = null;
    state.selectedFileName = '';
    
    // Update UI
    document.querySelectorAll('.report-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// Report management
async function loadReports() {
    try {
        state.loading = true;
        updateLoadingState();
        
        const reports = await getAllReports();
        state.reports = reports;
        renderReportsList();
        
    } catch (error) {
        showError('Failed to load reports: ' + error.message);
    } finally {
        state.loading = false;
        updateLoadingState();
    }
}

function renderReportsList() {
    const container = document.querySelector('.reports-container');
    const loadingEl = document.getElementById('loadingReports');
    const noReportsEl = document.getElementById('noReports');
    
    if (!container) return;
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (noReportsEl) noReportsEl.style.display = 'none';
    
    if (!state.reports || state.reports.length === 0) {
        if (noReportsEl) noReportsEl.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = state.reports.map(report => `
        <div class="report-item ${state.selectedReport?.id === report.id ? 'selected' : ''}" 
             data-report-id="${report.id}">
            <div class="report-main" onclick="selectReport('${report.id}')">
                <div class="report-info">
                    <h3 class="report-name" title="${report.name}">${report.name}</h3>
                    <p class="report-path" title="${report.path}">${report.path}</p>
                    <div class="report-meta">
                        <span class="file-count">${(report.files || []).length} files</span>
                        <span class="report-date">${formatDate(report.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div class="report-actions">
                <button class="btn-refresh" onclick="refreshReport('${report.id}')" title="Refresh">
                    <span class="refresh-icon">🔄</span>
                </button>
                <button class="btn-delete" onclick="deleteReportConfirm('${report.id}')" title="Delete">
                    <span class="delete-icon">🗑️</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Helper functions for data attribute event handlers
function selectReportFromData(element) {
    const reportId = element.getAttribute('data-report-id');
    if (reportId) {
        selectReport(reportId);
    }
}

function refreshReportFromData(element) {
    const reportId = element.getAttribute('data-report-id');
    if (reportId) {
        refreshReport(reportId);
    }
}

function deleteReportFromData(element) {
    const reportId = element.getAttribute('data-report-id');
    if (reportId) {
        deleteReportConfirm(reportId);
    }
}

async function selectReport(reportId) {
    try {
        state.loading = true;
        updateLoadingState();
        
        const report = await getReportById(reportId);
        state.selectedReport = report;
        state.selectedFile = null;
        state.selectedFileName = '';
        
        // Reset filters when switching reports
        clearFiltersState();
        
        // Update UI
        renderReportsList(); // Update selection
        showReportView();
        renderReportDetails();
        loadReportFiles();
        
    } catch (error) {
        showError('Failed to load report: ' + error.message);
    } finally {
        state.loading = false;
        updateLoadingState();
    }
}

function renderReportDetails() {
    if (!state.selectedReport) return;
    
    const titleEl = document.getElementById('reportTitle');
    const fileCountEl = document.getElementById('fileCount');
    const pathEl = document.getElementById('reportPath');
    
    if (titleEl) titleEl.textContent = state.selectedReport.name;
    if (fileCountEl) fileCountEl.textContent = (state.selectedReport.files || []).length;
    if (pathEl) pathEl.textContent = state.selectedReport.path;
}

async function loadReportFiles() {
    if (!state.selectedReport) return;
    
    const fileListEl = document.getElementById('fileList');
    if (!fileListEl) return;
    
    try {
        const files = state.selectedReport.fileDetails || [];
        
        if (files.length === 0) {
            fileListEl.innerHTML = `
                <div class="file-list-empty">
                    <div class="file-list-empty-icon">📄</div>
                    <h3>No files found</h3>
                    <p>This report directory appears to be empty.</p>
                </div>
            `;
            return;
        }
        
        // Store all files and reset pagination - sort by most recent first
        state.allFiles = [...files].sort((a, b) => {
            // Sort by last modified date (most recent first)
            const dateA = new Date(a.lastModified || 0);
            const dateB = new Date(b.lastModified || 0);
            return dateB - dateA; // Descending order (newest first)
        });
        state.filteredFiles = [...state.allFiles];
        state.fileCurrentPage = 1;
        
        // Reset file sorting state to match the default sort
        fileSortColumn = 'lastModified';
        fileSortDirection = 'desc';
        
        renderFileList();
        
    } catch (error) {
        fileListEl.innerHTML = `<div class="error">Error loading files: ${error.message}</div>`;
    }
}

function renderFileList() {
    const fileListEl = document.getElementById('fileList');
    if (!fileListEl) return;
    
    const totalFiles = state.filteredFiles.length;
    const totalPages = state.fileItemsPerPage === -1 ? 1 : Math.ceil(totalFiles / state.fileItemsPerPage);
    
    // Calculate pagination
    let startIndex = 0;
    let endIndex = totalFiles;
    if (state.fileItemsPerPage !== -1) {
        startIndex = (state.fileCurrentPage - 1) * state.fileItemsPerPage;
        endIndex = Math.min(startIndex + state.fileItemsPerPage, totalFiles);
    }
    
    const currentPageFiles = state.filteredFiles.slice(startIndex, endIndex);
    
    fileListEl.innerHTML = `
        <div class="file-list-controls">
            <div class="file-list-info">
                Showing ${startIndex + 1} to ${endIndex} of ${totalFiles} files
            </div>
            <div class="file-list-settings">
                <label class="page-size-label">Files per page:</label>
                <select class="page-size-select" onchange="changeFilePageSize(this.value)">
                    <option value="20" ${state.fileItemsPerPage === 20 ? 'selected' : ''}>20</option>
                    <option value="50" ${state.fileItemsPerPage === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${state.fileItemsPerPage === 100 ? 'selected' : ''}>100</option>
                    <option value="-1" ${state.fileItemsPerPage === -1 ? 'selected' : ''}>Show All</option>
                </select>
            </div>
        </div>
        <div class="file-list-header">
            <div class="header-cell"></div>
            <div class="header-cell sortable ${fileSortColumn === 'name' ? 'sorted-' + fileSortDirection : ''}" onclick="sortFiles('name')">Name</div>
            <div class="header-cell sortable ${fileSortColumn === 'extension' ? 'sorted-' + fileSortDirection : ''}" onclick="sortFiles('extension')">Type</div>
            <div class="header-cell sortable ${fileSortColumn === 'size' ? 'sorted-' + fileSortDirection : ''}" onclick="sortFiles('size')">Size</div>
            <div class="header-cell sortable ${fileSortColumn === 'lastModified' ? 'sorted-' + fileSortDirection : ''}" onclick="sortFiles('lastModified')">Modified</div>
        </div>
        <div class="file-list-body">
            ${currentPageFiles.map(file => {
                const icon = getFileIcon(file.name);
                const extension = getFileExtension(file.name);
                return `
                    <div class="file-item" data-extension="${extension}" onclick="selectFile('${file.name}')">
                        <div class="file-icon">${icon}</div>
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-extension">${extension || 'FILE'}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                        <div class="file-date">${formatDateTime(file.lastModified)}</div>
                    </div>
                `;
            }).join('')}
        </div>
        ${state.fileItemsPerPage !== -1 && totalPages > 1 ? renderFilePagination(totalPages) : ''}
    `;
}

function renderFilePagination(totalPages) {
    const startPage = Math.max(1, state.fileCurrentPage - 2);
    const endPage = Math.min(totalPages, state.fileCurrentPage + 2);
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(`
            <button class="file-btn-page ${i === state.fileCurrentPage ? 'active' : ''}" 
                    onclick="goToFilePage(${i})">${i}</button>
        `);
    }
    
    return `
        <div class="file-list-pagination">
            <div class="file-pagination-info">
                Page ${state.fileCurrentPage} of ${totalPages}
            </div>
            <div class="file-pagination-controls">
                <button class="file-btn-page" onclick="goToFilePage(1)" 
                        ${state.fileCurrentPage === 1 ? 'disabled' : ''}>First</button>
                <button class="file-btn-page" onclick="goToFilePage(${state.fileCurrentPage - 1})" 
                        ${state.fileCurrentPage === 1 ? 'disabled' : ''}>‹</button>
                <div class="file-page-numbers">
                    ${pageNumbers.join('')}
                </div>
                <button class="file-btn-page" onclick="goToFilePage(${state.fileCurrentPage + 1})" 
                        ${state.fileCurrentPage === totalPages ? 'disabled' : ''}>›</button>
                <button class="file-btn-page" onclick="goToFilePage(${totalPages})" 
                        ${state.fileCurrentPage === totalPages ? 'disabled' : ''}>Last</button>
            </div>
        </div>
    `;
}

function changeFilePageSize(size) {
    state.fileItemsPerPage = parseInt(size);
    state.fileCurrentPage = 1;
    renderFileList();
}

function goToFilePage(page) {
    if (state.fileItemsPerPage === -1) return;
    
    const totalPages = Math.ceil(state.filteredFiles.length / state.fileItemsPerPage);
    state.fileCurrentPage = Math.max(1, Math.min(page, totalPages));
    renderFileList();
}

function getFileExtension(fileName) {
    return fileName.split('.').pop()?.toLowerCase() || '';
}

function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    } catch (e) {
        return dateString;
    }
}

// File sorting functionality
let fileSortColumn = 'lastModified';
let fileSortDirection = 'desc';

function sortFiles(column) {
    if (!state.filteredFiles.length) return;
    
    // Toggle direction if same column, otherwise default to ascending
    if (fileSortColumn === column) {
        fileSortDirection = fileSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        fileSortColumn = column;
        fileSortDirection = 'asc';
    }
    
    state.filteredFiles.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'extension':
                aVal = getFileExtension(a.name);
                bVal = getFileExtension(b.name);
                break;
            case 'size':
                aVal = a.size || 0;
                bVal = b.size || 0;
                break;
            case 'lastModified':
                aVal = new Date(a.lastModified || 0);
                bVal = new Date(b.lastModified || 0);
                break;
            default:
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
        }
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        
        return fileSortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Reset to first page after sorting
    state.fileCurrentPage = 1;
    renderFileList();
    updateFileSortIndicators(column);
}

function updateFileSortIndicators(activeColumn) {
    const headers = document.querySelectorAll('.file-list-header .header-cell');
    headers.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    const activeHeader = Array.from(headers).find(header => 
        header.textContent.toLowerCase().includes(activeColumn.toLowerCase()) ||
        (activeColumn === 'lastModified' && header.textContent.includes('Modified'))
    );
    
    if (activeHeader) {
        activeHeader.classList.add(fileSortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'xlsx':
        case 'xls':
            return '📊';
        case 'csv':
            return '📋';
        case 'txt':
            return '📄';
        case 'json':
            return '📋';
        case 'xml':
            return '🏷️';
        case 'pdf':
            return '📕';
        case 'doc':
        case 'docx':
            return '📘';
        case 'zip':
        case 'rar':
        case '7z':
            return '📦';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
            return '🖼️';
        default:
            return '📄';
    }
}

async function selectFile(fileName) {
    if (!state.selectedReport) return;
    
    try {
        state.loading = true;
        updateLoadingState();
        
        state.selectedFileName = fileName;
        const fileData = await getFileData(state.selectedReport.id, fileName);
        state.selectedFile = fileData;
        
        // Reset filters when switching files
        clearFiltersState();
        
        showDataView();
        renderFileData();
        
    } catch (error) {
        showError('Failed to load file: ' + error.message);
    } finally {
        state.loading = false;
        updateLoadingState();
    }
}

function renderFileData() {
    if (!state.selectedFile) return;
    
    const fileNameEl = document.getElementById('fileName');
    if (fileNameEl) fileNameEl.textContent = state.selectedFileName;
    
    // Check if file has tabular data (CSV, Excel, etc.)
    if (state.selectedFile.data && state.selectedFile.data.length > 0) {
        state.tableData = state.selectedFile.data;
        renderDataTable();
    } else if (state.selectedFile.headers && state.selectedFile.headers.length > 0) {
        // File has headers but no data rows
        state.tableData = [];
        renderDataTable();
    } else {
        // Handle files without tabular data
        const tableContainer = document.querySelector('.data-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="file-content">
                    <div class="file-info">
                        <h3>File: ${state.selectedFile.fileName || state.selectedFileName}</h3>
                        <p>No tabular data available for this file type.</p>
                    </div>
                </div>
            `;
        }
    }
}

function renderDataTable() {
    // Handle empty data case
    if (!state.tableData || state.tableData.length === 0) {
        const tableContainer = document.querySelector('.data-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="file-content">
                    <div class="file-info">
                        <h3>File: ${state.selectedFile.fileName || state.selectedFileName}</h3>
                        <p>No data rows found in this file.</p>
                        ${state.selectedFile.headers && state.selectedFile.headers.length > 0 ? 
                            `<p>Headers found: ${state.selectedFile.headers.join(', ')}</p>` : ''}
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Use headers from backend if available (preserves original file order), otherwise fall back to Object.keys
    const headers = (state.selectedFile.headers && state.selectedFile.headers.length > 0) 
        ? state.selectedFile.headers 
        : Object.keys(state.tableData[0]);
    
    // Store headers in state for consistent use across functions
    state.currentHeaders = headers;
    
    state.filteredData = [...state.tableData];
    
    // Apply filters
    applyFilters();
    
    // Render table headers
    renderTableHeaders(headers);
    
    // Render filter panel
    renderFilterPanel(headers);
    
    // Render table body
    renderTableBody();
    
    // Update pagination
    updatePagination();
    
    // Update table info
    updateTableInfo();
}

function renderTableHeaders(headers) {
    const tableHead = document.getElementById('tableHead');
    if (!tableHead) return;
    
    const headerRow = headers.map(header => `
        <th class="sortable" onclick="sortTable('${header}')">
            ${header}
            ${state.sortColumn === header ? 
                `<span class="sort-indicator">${state.sortDirection === 'asc' ? '↑' : '↓'}</span>` : 
                '<span class="sort-indicator"></span>'
            }
        </th>
    `).join('');
    
    tableHead.innerHTML = `<tr>${headerRow}</tr>`;
}

function renderFilterPanel(headers) {
    const filtersGrid = document.getElementById('filtersGrid');
    if (!filtersGrid) return;
    
    filtersGrid.innerHTML = headers.map(header => `
        <div class="filter-item">
            <label for="filter-${header}">${header}</label>
            <input type="text" id="filter-${header}" placeholder="Filter ${header}..." 
                   value="${state.columnFilters[header] || ''}"
                   oninput="updateFilter('${header}', this.value)">
        </div>
    `).join('');
}

function renderTableBody() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageData = state.filteredData.slice(startIndex, endIndex);
    
    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center">No data found</td>
            </tr>
        `;
        return;
    }
    
    const headers = state.currentHeaders || Object.keys(state.tableData[0]);
    tableBody.innerHTML = pageData.map(row => `
        <tr>
            ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
        </tr>
    `).join('');
}

function sortTable(column) {
    if (state.sortColumn === column) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortColumn = column;
        state.sortDirection = 'asc';
    }
    
    state.filteredData.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (aVal === bVal) return 0;
        
        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
        } else {
            comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return state.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    state.currentPage = 1;
    renderDataTable();
}

function updateFilter(column, value) {
    state.columnFilters[column] = value;
    applyFilters();
    state.currentPage = 1;
    renderTableBody();
    updatePagination();
    updateTableInfo();
}

function applyFilters() {
    state.filteredData = state.tableData.filter(row => {
        return Object.entries(state.columnFilters).every(([column, filterValue]) => {
            if (!filterValue) return true;
            return String(row[column]).toLowerCase().includes(filterValue.toLowerCase());
        });
    });
}

function clearFilters() {
    state.columnFilters = {};
    document.querySelectorAll('#filtersGrid input').forEach(input => {
        input.value = '';
    });
    applyFilters();
    state.currentPage = 1;
    renderTableBody();
    updatePagination();
    updateTableInfo();
}

function clearFiltersState() {
    // Clear all filter-related state
    state.columnFilters = {};
    state.currentHeaders = null;
    state.currentPage = 1;
    state.sortColumn = null;
    state.sortDirection = 'asc';
    state.filtersVisible = false;
    
    // Hide filters panel if it's visible
    const filtersPanel = document.getElementById('filtersPanel');
    const filterBtn = document.querySelector('.btn-filter');
    
    if (filtersPanel) {
        filtersPanel.style.display = 'none';
    }
    
    if (filterBtn) {
        filterBtn.classList.remove('active');
    }
    
    // Clear any filter inputs when they exist
    const filterInputs = document.querySelectorAll('#filtersGrid input');
    filterInputs.forEach(input => {
        input.value = '';
    });
}

function toggleFilters() {
    const filtersPanel = document.getElementById('filtersPanel');
    const filterBtn = document.querySelector('.btn-filter');
    
    if (!filtersPanel || !filterBtn) return;
    
    state.filtersVisible = !state.filtersVisible;
    
    if (state.filtersVisible) {
        filtersPanel.style.display = 'block';
        filterBtn.classList.add('active');
    } else {
        filtersPanel.style.display = 'none';
        filterBtn.classList.remove('active');
    }
}

function updatePagination() {
    const totalPages = Math.ceil(state.filteredData.length / state.itemsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (!pageNumbers) return;
    
    // Update button states
    const btnFirst = document.getElementById('btnFirst');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnLast = document.getElementById('btnLast');
    
    if (btnFirst) btnFirst.disabled = state.currentPage === 1;
    if (btnPrev) btnPrev.disabled = state.currentPage === 1;
    if (btnNext) btnNext.disabled = state.currentPage === totalPages;
    if (btnLast) btnLast.disabled = state.currentPage === totalPages;
    
    // Generate page numbers
    const pageNumbersHtml = [];
    const startPage = Math.max(1, state.currentPage - 2);
    const endPage = Math.min(totalPages, state.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbersHtml.push(`
            <button class="btn-page ${i === state.currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `);
    }
    
    pageNumbers.innerHTML = pageNumbersHtml.join('');
}

function updateTableInfo() {
    const tableInfo = document.getElementById('tableInfo');
    const paginationInfo = document.getElementById('paginationInfo');
    
    const totalRows = state.filteredData.length;
    const startIndex = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endIndex = Math.min(startIndex + state.itemsPerPage - 1, totalRows);
    
    const infoText = `Showing ${startIndex} to ${endIndex} of ${totalRows} entries`;
    
    if (tableInfo) tableInfo.textContent = infoText;
    if (paginationInfo) paginationInfo.textContent = infoText;
}

function goToPage(page) {
    state.currentPage = page;
    renderTableBody();
    updatePagination();
    updateTableInfo();
}

function previousPage() {
    if (state.currentPage > 1) {
        goToPage(state.currentPage - 1);
    }
}

function nextPage() {
    const totalPages = Math.ceil(state.filteredData.length / state.itemsPerPage);
    if (state.currentPage < totalPages) {
        goToPage(state.currentPage + 1);
    }
}

function goToLastPage() {
    const totalPages = Math.ceil(state.filteredData.length / state.itemsPerPage);
    goToPage(totalPages);
}

function exportToCsv() {
    if (!state.filteredData || state.filteredData.length === 0) return;
    
    const headers = Object.keys(state.filteredData[0]);
    const csvContent = [
        headers.join(','),
        ...state.filteredData.map(row => 
            headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.selectedReport?.name || 'data'}-${state.selectedFileName || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Report operations
async function refreshReport(reportId) {
    try {
        // Find the refresh button and show loading state
        const refreshButton = document.querySelector(`button[onclick="refreshReport('${reportId}')"]`);
        if (refreshButton) {
            refreshButton.disabled = true;
            refreshButton.innerHTML = '<span class="refresh-icon">⟳</span>';
            refreshButton.style.animation = 'spin 1s linear infinite';
        }
        
        const report = await refreshReportById(reportId);
        const index = state.reports.findIndex(r => r.id === reportId);
        if (index !== -1) {
            state.reports[index] = report;
            renderReportsList();
            
            if (state.selectedReport?.id === reportId) {
                state.selectedReport = report;
                renderReportDetails();
                loadReportFiles();
            }
        }
        showSuccess('Report refreshed successfully');
    } catch (error) {
        showError('Failed to refresh report: ' + error.message);
    } finally {
        // Reset refresh button state
        const refreshButton = document.querySelector(`button[onclick="refreshReport('${reportId}')"]`);
        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<span class="refresh-icon">🔄</span>';
            refreshButton.style.animation = '';
        }
    }
}

// Delete confirmation modal management
let pendingDeleteReportId = null;

function openDeleteConfirmModal(reportId) {
    pendingDeleteReportId = reportId;
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'block';
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
    pendingDeleteReportId = null;
}

async function confirmDeleteReport() {
    if (!pendingDeleteReportId) return;
    
    try {
        await deleteReport(pendingDeleteReportId);
        state.reports = state.reports.filter(r => r.id !== pendingDeleteReportId);
        
        if (state.selectedReport?.id === pendingDeleteReportId) {
            clearSelection();
            showWelcomeScreen();
        }
        
        renderReportsList();
        closeDeleteConfirmModal();
        showSuccess('Report deleted successfully');
    } catch (error) {
        showError('Failed to delete report: ' + error.message);
        closeDeleteConfirmModal();
    }
}

async function deleteReportConfirm(reportId) {
    openDeleteConfirmModal(reportId);
}

// Modal functions
function openAddReportModal() {
    const modal = document.getElementById('addReportModal');
    if (modal) {
        modal.style.display = 'block';
        // Reset form
        document.getElementById('addReportForm').reset();
        document.getElementById('addReportError').style.display = 'none';
    }
}

function closeAddReportModal() {
    const modal = document.getElementById('addReportModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handleAddReport(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const reportData = {
        name: formData.get('name'),
        path: formData.get('path')
    };
    
    try {
        const errorEl = document.getElementById('addReportError');
        const submitBtn = document.getElementById('submitReportBtn');
        
        if (submitBtn) submitBtn.disabled = true;
        if (errorEl) errorEl.style.display = 'none';
        
        const newReport = await createReport(reportData);
        state.reports.push(newReport);
        renderReportsList();
        closeAddReportModal();
        showSuccess('Report created successfully');
        
    } catch (error) {
        const errorEl = document.getElementById('addReportError');
        if (errorEl) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
        }
        showError('Failed to create report: ' + error.message);
    } finally {
        const submitBtn = document.getElementById('submitReportBtn');
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Folder browser functions
function openFolderBrowser() {
    const modal = document.getElementById('folderBrowserModal');
    if (modal) {
        modal.style.display = 'block';
        state.currentPath = '/';
        loadFolderBrowser('/');
    }
}

function closeFolderBrowser() {
    const modal = document.getElementById('folderBrowserModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function loadFolderBrowser(path) {
    const folderList = document.getElementById('folderList');
    const currentPathEl = document.getElementById('currentPath');
    const btnUp = document.getElementById('btnUp');
    
    if (!folderList) return;
    
    try {
        state.currentPath = path;
        if (currentPathEl) currentPathEl.textContent = path;
        if (btnUp) btnUp.disabled = path === '/';
        
        folderList.innerHTML = `
            <div class="loading-folders">
                <div class="spinner"></div>
                <span>Loading folders...</span>
            </div>
        `;
        
        const folders = await getFolders(path);
        
        if (folders.length === 0) {
            folderList.innerHTML = `
                <div class="folder-item">
                    <span class="folder-name">No folders found</span>
                </div>
            `;
            return;
        }
        
        folderList.innerHTML = folders.map(folder => `
            <div class="folder-item ${folder.directory ? '' : 'file'}" 
                 onclick="${folder.directory ? `navigateToFolder('${folder.path}')` : ''}"
                 style="${folder.directory ? '' : 'opacity: 0.6; cursor: default;'}">
                <span class="folder-icon">${folder.directory ? '📁' : '📄'}</span>
                <span class="folder-name">${folder.name}</span>
                <span class="folder-meta">${folder.directory ? 'Folder' : formatFileSize(folder.size)}</span>
            </div>
        `).join('');
        
    } catch (error) {
        folderList.innerHTML = `
            <div class="folder-item">
                <span class="folder-name" style="color: #ef4444;">Error: ${error.message}</span>
            </div>
        `;
    }
}

function navigateToFolder(path) {
    loadFolderBrowser(path);
}

function navigateUp() {
    if (state.currentPath === '/') return;
    
    const parentPath = state.currentPath.substring(0, state.currentPath.lastIndexOf('/')) || '/';
    loadFolderBrowser(parentPath);
}

function refreshBrowser() {
    loadFolderBrowser(state.currentPath);
}

function selectCurrentFolder() {
    const pathInput = document.getElementById('reportPathInput');
    
    if (pathInput) {
        // Clear any existing value first
        pathInput.value = '';
        
        // Temporarily remove readonly and set value
        const wasReadOnly = pathInput.readOnly;
        pathInput.readOnly = false;
        pathInput.value = state.currentPath;
        pathInput.readOnly = wasReadOnly;
        
        // Also set the attribute
        pathInput.setAttribute('value', state.currentPath);
        
        // Trigger events
        pathInput.dispatchEvent(new Event('change', { bubbles: true }));
        pathInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Force repaint
        pathInput.style.display = 'none';
        pathInput.offsetHeight; // Force reflow
        pathInput.style.display = '';
    }
    closeFolderBrowser();
}

// Loading state management
function updateLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = state.loading ? 'block' : 'none';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadReports();
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
    
    // Show welcome screen initially
    showWelcomeScreen();
});

// Export functions for global use
window.selectReport = selectReport;
window.selectFile = selectFile;
window.toggleSidebar = toggleSidebar;
window.showReportView = showReportView;
window.showDataView = showDataView;
window.refreshReport = refreshReport;
window.deleteReportConfirm = deleteReportConfirm;
window.openAddReportModal = openAddReportModal;
window.closeAddReportModal = closeAddReportModal;
window.handleAddReport = handleAddReport;
window.openFolderBrowser = openFolderBrowser;
window.closeFolderBrowser = closeFolderBrowser;
window.navigateToFolder = navigateToFolder;
window.navigateUp = navigateUp;
window.refreshBrowser = refreshBrowser;
window.selectCurrentFolder = selectCurrentFolder;
window.sortTable = sortTable;
window.updateFilter = updateFilter;
window.clearFilters = clearFilters;
window.clearFiltersState = clearFiltersState;
window.toggleFilters = toggleFilters;
window.exportToCsv = exportToCsv;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.goToLastPage = goToLastPage;
window.navigateToBreadcrumb = navigateToBreadcrumb;
window.openDeleteConfirmModal = openDeleteConfirmModal;
window.closeDeleteConfirmModal = closeDeleteConfirmModal;
window.confirmDeleteReport = confirmDeleteReport;
window.selectReportFromData = selectReportFromData;
window.refreshReportFromData = refreshReportFromData;
window.deleteReportFromData = deleteReportFromData;
window.removeToast = removeToast;
window.sortFiles = sortFiles;
window.changeFilePageSize = changeFilePageSize;
window.goToFilePage = goToFilePage;
