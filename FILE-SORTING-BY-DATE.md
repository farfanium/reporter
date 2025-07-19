# File Sorting by Most Recent

## Change Summary
Updated the default file sorting to show files by most recent modification date first, instead of alphabetical sorting by name.

## Changes Made

### 1. Updated Default Sort Order in `loadReportFiles()`
```javascript
// Before: Alphabetical by name
state.allFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

// After: By most recent date first
state.allFiles = [...files].sort((a, b) => {
    // Sort by last modified date (most recent first)
    const dateA = new Date(a.lastModified || 0);
    const dateB = new Date(b.lastModified || 0);
    return dateB - dateA; // Descending order (newest first)
});
```

### 2. Updated Default Sort Variables
```javascript
// Before
let fileSortColumn = 'name';
let fileSortDirection = 'asc';

// After
let fileSortColumn = 'lastModified';
let fileSortDirection = 'desc';
```

### 3. Added Sort State Reset
```javascript
// Reset file sorting state to match the default sort
fileSortColumn = 'lastModified';
fileSortDirection = 'desc';
```

### 4. Updated Header Sort Indicators
```javascript
// Added dynamic sort indicator classes
<div class="header-cell sortable ${fileSortColumn === 'lastModified' ? 'sorted-' + fileSortDirection : ''}" onclick="sortFiles('lastModified')">Modified</div>
```

## User Experience

### Before
- Files displayed alphabetically by name (A-Z)
- Users had to manually click "Modified" column to see recent files
- No visual indication of current sort order

### After
- Files displayed by modification date (newest first)
- Most recently modified files appear at the top automatically
- "Modified" column shows descending sort indicator (↓)
- Users can still sort by other columns as needed

## Benefits

✅ **Recent files first**: Most relevant (recently modified) files are immediately visible  
✅ **Better workflow**: Users typically want to see recent files first  
✅ **Visual feedback**: Sort indicator shows current sort state  
✅ **Maintained flexibility**: All other sorting options still available  
✅ **Consistent behavior**: Same sorting applies across all reports  

## File List Behavior

1. **On Report Load**: Files automatically sorted by date (newest → oldest)
2. **Sort Indicator**: "Modified" column shows ↓ (descending) by default
3. **User Sorting**: Clicking any column header changes sort, including direction toggle
4. **Sort Persistence**: Sort state maintained within the current report session
5. **Sort Reset**: Returns to date sorting when switching reports

## Example File Order

For files with these modification dates:
- `report_2025-07-10.xlsx` (July 10, 2025) ← **Appears first**
- `data_2025-07-08.csv` (July 8, 2025)
- `archive_2025-07-01.txt` (July 1, 2025)
- `old_file_2024-12-31.pdf` (Dec 31, 2024) ← **Appears last**

## Technical Notes

- Uses JavaScript `Date` object for proper date comparison
- Handles missing dates (defaults to `0` which sorts to bottom)
- Preserves original file list for re-sorting when user changes columns
- Compatible with existing pagination and filtering systems

This change makes the file list more user-friendly by showing the most relevant (recent) files first, which is typically what users are looking for when browsing report data.
