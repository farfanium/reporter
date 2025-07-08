The Reporter
Create a minimalistic Next.js web application with the following layout and features:

UI Layout:
- A collapsible left sidebar listing available reports (pulled from backend).
- Main content area on the right displays selected report as a sortable, filterable table.
- When a user selects a report, the app loads a list of files in the current NAS folder.
- Clicking on a file displays its tabular data (from Excel, CSV, or TXT format).
- Allow navigation across reports/files smoothly (e.g., tab switching or breadcrumb).

User Interactions:
- User can add a new report by specifying NAS path and report name.
- Save user-specific preferences (UI config, column filters, sort order) in localStorage.
- Report configuration should be stored on the backend using a concurrent-safe format like JSON or YAML.

Backend Details:
- Use Java 17, Spring Boot 3+, Gradle 8.8, and Lombok.
- Expose REST endpoints to:
   1. List available reports and associated files from NAS folders.
   2. Read and parse Excel, CSV, TXT files into tabular JSON format.
   3. Save and update report configurations on the filesystem in a concurrent-safe way.

Other Requirements:
- Support basic error handling for missing files or inaccessible NAS paths.
- Ensure frontend uses minimal dependencies and clean styling (Tailwind optional).
- Ensure backend reads files using NIO or Streams, avoids concurrency issues.

Add basic placeholder data and mock backend initially to simulate file listing and parsing.