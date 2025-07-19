# Sidebar Path Overflow Fix

## Problem
The report path text in the sidebar was overflowing and hiding the action buttons (refresh and delete) when paths were too long.

## Solution
Applied CSS ellipsis styling and proper flex layout constraints to handle long paths gracefully.

### CSS Changes Made

1. **Added `min-width: 0` to flex containers** - Allows flex items to shrink below their content size
2. **Applied ellipsis styling** - Truncates long text with "..." when it overflows
3. **Added title attributes** - Shows full path on hover for accessibility
4. **Prevented action button shrinking** - Ensures buttons remain visible and accessible

### Specific Changes

#### CSS (style.css)
```css
.report-main {
    flex: 1;
    cursor: pointer;
    min-width: 0; /* Allow flex item to shrink */
}

.report-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0; /* Allow flex item to shrink */
}

.report-name {
    /* ...existing styles... */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.report-path {
    /* ...existing styles... */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.report-item {
    /* ...existing styles... */
    gap: 0.75rem; /* Add gap between content and actions */
}

.report-actions {
    /* ...existing styles... */
    flex-shrink: 0; /* Prevent actions from shrinking */
    min-width: 5rem; /* Ensure minimum width */
}
```

#### HTML (index.html)
```html
<!-- Added title attributes for hover tooltips -->
<h3 class="report-name" th:text="${report.name}" th:title="${report.name}">Report Name</h3>
<p class="report-path" th:text="${report.path}" th:title="${report.path}">Report Path</p>
```

#### JavaScript (app.js)
```javascript
// Added title attributes to dynamically created reports
<h3 class="report-name" title="${report.name}">${report.name}</h3>
<p class="report-path" title="${report.path}">${report.path}</p>
```

#### Mobile Responsive Improvements
```css
@media (max-width: 768px) {
    .report-item {
        padding: 0.75rem;
        gap: 0.5rem;
    }
    
    .report-main {
        min-width: 0;
        flex: 1;
    }
    
    .report-name,
    .report-path {
        max-width: 100%;
    }
    
    .report-actions {
        min-width: 4rem;
    }
}
```

## Result
- ✅ Long paths are truncated with ellipsis ("...")
- ✅ Action buttons remain visible and accessible
- ✅ Full path shown on hover (tooltip)
- ✅ Responsive design works on mobile devices
- ✅ Maintains professional appearance and usability

## Testing
Test with paths like:
- `/old/respaldos/respaldo epam/Documents`
- `/very/long/path/structure/that/would/normally/overflow`

The sidebar now gracefully handles paths of any length while keeping the interface functional.
