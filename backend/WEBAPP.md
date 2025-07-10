# Reporter Java Web App

This is a Java web application built with Spring Boot and Thymeleaf that provides the same functionality as the frontend, but hosted directly within the backend project.

## Features

- **Report Management**: View, add, and delete reports
- **File Browser**: Browse file system (specifically `/Volumes` on macOS)
- **File Viewer**: View the contents of CSV, Excel, and text files
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### Starting the Application

1. Navigate to the backend directory:
   ```bash
   cd /Users/roberto_farfan/code/reporter/backend
   ```

2. Build the project:
   ```bash
   ./gradlew build
   ```

3. Run the application:
   ```bash
   ./gradlew bootRun
   ```

4. Open your browser and navigate to: `http://localhost:8080`

### Using the Web Interface

#### Home Page (Reports)
- View all existing reports
- Add new reports using the "Add New Report" button
- Delete reports using the "Delete" button on each report card
- Click "View" to see report details and files

#### Browse Files
- Navigate to `/browse` to explore the file system
- Browse through directories by clicking on folders
- Use the "Up" button to go to parent directories
- Use the breadcrumb navigation to understand your current location

#### Add Report
- Navigate to `/add-report` to create a new report
- Fill in the report name and description
- Use the "Browse" button to select a folder path
- Submit the form to create the report

#### View Report
- Click on any report to view its details
- See report information (name, description, path, creation date)
- Browse files within the report directory
- Click "View" on any file to see its contents in a modal

### API Endpoints

The web application uses the same REST API endpoints as the frontend:

- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create a new report
- `GET /api/reports/{id}` - Get report by ID
- `DELETE /api/reports/{id}` - Delete report by ID
- `GET /api/folders?path={path}` - Browse folders
- `GET /api/files/{reportId}/{fileName}` - Get file content

### Web Routes

- `/` - Home page (reports list)
- `/report/{id}` - View specific report
- `/browse` - File browser
- `/add-report` - Add new report form

## Technical Details

### Technologies Used

- **Backend**: Spring Boot 3.2.0
- **Template Engine**: Thymeleaf
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Gradle
- **Java Version**: 17+

### File Structure

```
backend/src/main/
├── java/com/reporter/
│   ├── controller/
│   │   ├── WebController.java       # Web UI controllers
│   │   ├── ReportController.java    # REST API controllers
│   │   ├── FileController.java
│   │   └── FolderController.java
│   ├── service/                     # Business logic
│   ├── model/                       # Data models
│   └── config/                      # Configuration
├── resources/
│   ├── templates/                   # Thymeleaf templates
│   │   ├── index.html              # Home page
│   │   ├── report.html             # Report view
│   │   ├── browse.html             # File browser
│   │   ├── add-report.html         # Add report form
│   │   └── error.html              # Error page
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css           # Main stylesheet
│   │   └── js/
│   │       └── app.js              # JavaScript functionality
│   └── application.yml             # Application configuration
```

## Configuration

The application uses the same configuration as the REST API:
- Base path for browsing: `/Volumes` (configurable in `application.yml`)
- Server port: 8080 (default)
- CORS enabled for API access

## Error Handling

- User-friendly error pages for common issues
- JavaScript error handling with alert messages
- API error responses with meaningful messages

## Development

To make changes to the web UI:

1. **Templates**: Edit files in `src/main/resources/templates/`
2. **Styles**: Edit `src/main/resources/static/css/style.css`
3. **JavaScript**: Edit `src/main/resources/static/js/app.js`
4. **Controllers**: Edit `src/main/java/com/reporter/controller/WebController.java`

After making changes, restart the application:
```bash
./gradlew bootRun
```

The web UI will be available at `http://localhost:8080`
