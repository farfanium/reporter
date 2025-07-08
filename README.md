# The Reporter

A minimalistic web application for viewing and managing reports stored on NAS (Network Attached Storage).

## Project Structure

```
reporter/
├── frontend/           # Next.js React application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # React components
│   │   ├── services/  # API service layer
│   │   └── types/     # TypeScript type definitions
│   ├── package.json
│   └── ...
├── backend/            # Java Spring Boot application
│   ├── src/main/java/com/reporter/
│   │   ├── controller/ # REST controllers
│   │   ├── service/   # Business logic
│   │   ├── model/     # Data models
│   │   ├── dto/       # Data transfer objects
│   │   └── exception/ # Custom exceptions
│   ├── build.gradle
│   └── ...
└── README.md
```

## Features

### Frontend (Next.js)
- **Collapsible sidebar** with report listings
- **Sortable and filterable data tables** for viewing file contents
- **File navigation** within NAS folders
- **Add new reports** functionality
- **Export data** to CSV
- **Responsive design** with Tailwind CSS
- **Local storage** for user preferences

### Backend (Java Spring Boot)
- **REST API** for report management
- **File parsing** for Excel (.xlsx, .xls), CSV, and TXT formats
- **Concurrent-safe configuration** storage using YAML
- **NAS file system integration** with proper error handling
- **CORS support** for frontend integration

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Java 17+ (for backend)
- Access to NAS storage (or local directory for testing)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the application:
   ```bash
   ./gradlew build
   ```

3. Run the application:
   ```bash
   ./gradlew bootRun
   ```

The backend API will be available at `http://localhost:8080`

## Production Deployment

### Quick Start (Unix/Linux/macOS)

1. **Build for production:**
   ```bash
   ./build-production.sh
   ```

2. **Mount your NAS directory:**
   ```bash
   # Option 1: Symbolic link
   ln -s /path/to/your/nas ./nas
   
   # Option 2: Mount point
   sudo mount -t nfs your-nas-server:/volume1/reports ./nas
   ```

3. **Deploy with Docker:**
   ```bash
   ./deploy-production.sh
   ```

4. **Or deploy manually:**
   ```bash
   ./start-production.sh
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Health Check: http://localhost:8080/actuator/health

### Quick Start (Windows)

1. **Build for production:**
   ```cmd
   build-production.bat
   ```

2. **Mount your NAS directory:**
   ```cmd
   # Option 1: Create junction
   mklink /J nas C:\path\to\your\nas
   
   # Option 2: Map network drive and create junction
   net use Z: \\your-nas-server\reports
   mklink /J nas Z:\
   ```

3. **Deploy manually:**
   ```cmd
   start-production.bat
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Health Check: http://localhost:8080/actuator/health

### Management Commands

#### Unix/Linux/macOS
- **Start services:** `./start-production.sh`
- **Stop services:** `./stop-production.sh`
- **Check status:** `./status-production.sh`
- **View logs:** `tail -f data/logs/backend.log`

#### Windows
- **Start services:** `start-production.bat`
- **Stop services:** `stop-production.bat`
- **Check status:** `status-production.bat`
- **View logs:** `type data\logs\backend.log`

### Manual Production Deployment

#### Backend (Java Spring Boot)

1. **Build the application:**
   ```bash
   cd backend
   ./gradlew clean build -x test
   ```

2. **Set environment variables:**
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   export NAS_BASE_PATH=/nas/reports
   export CONFIG_PATH=/app/config/reports.yaml
   export LOG_LEVEL=INFO
   ```

3. **Run the application:**
   ```bash
   java -jar build/libs/reporter-backend-0.0.1-SNAPSHOT.jar
   ```

#### Frontend (Next.js)

1. **Build the application:**
   ```bash
   cd frontend
   npm ci --only=production
   npm run build:prod
   ```

2. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

3. **Run the application:**
   ```bash
   npm run start:prod
   ```

### Environment Variables

#### Backend Configuration
- `SPRING_PROFILES_ACTIVE`: Spring profile (default: prod)
- `NAS_BASE_PATH`: Path to NAS reports directory (default: /nas/reports)
- `CONFIG_PATH`: Path to store reports configuration (default: /app/config/reports.yaml)
- `LOG_LEVEL`: Application log level (default: INFO)
- `WEB_LOG_LEVEL`: Web framework log level (default: WARN)
- `CORS_ORIGINS`: Allowed CORS origins (default: http://localhost:3000)
- `ALLOWED_EXTENSIONS`: File extensions to process (default: xlsx,xls,csv,txt,tsv)
- `MAX_FILE_SIZE`: Maximum file size (default: 50MB)
- `MAX_REQUEST_SIZE`: Maximum request size (default: 50MB)

#### Frontend Configuration
- `NODE_ENV`: Node environment (production)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8080/api)

### Docker Deployment

The application includes production-ready Docker configurations:

1. **Backend Dockerfile**: Multi-stage build with security-focused runtime
2. **Frontend Dockerfile**: Optimized Next.js standalone build
3. **docker-compose.yml**: Complete orchestration with health checks

#### Docker Compose Services

```yaml
services:
  backend:
    - Runs on port 8080
    - Health checks enabled
    - Volume mounts for NAS, config, and logs
    
  frontend:
    - Runs on port 3000
    - Depends on backend health
    - Optimized production build
```

### Production Features

- **No mock data**: All sample/development data removed
- **Environment-based configuration**: Full environment variable support
- **Security hardening**: Non-root containers, read-only NAS mounts
- **Health checks**: Comprehensive monitoring endpoints
- **Logging**: Structured logging with configurable levels
- **Error handling**: Production-ready error responses
- **Performance**: Optimized builds and resource usage

### Monitoring and Maintenance

#### Health Checks
- Backend: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost:3000` (returns 200 when healthy)

#### Logs
- Backend logs: `./data/logs/reporter.log`
- Docker logs: `docker-compose logs -f`

#### Configuration
- Reports configuration: `./data/config/reports.yaml`
- Environment: `.env.production`

### Security Considerations

1. **Path Security**: All file paths are validated server-side
2. **CORS Configuration**: Restricted to specified origins
3. **Non-root Containers**: Docker containers run as non-root users
4. **Input Validation**: All user inputs are sanitized
5. **Error Handling**: No sensitive information in error responses

### Troubleshooting

#### Common Issues

1. **NAS Mount Issues:**
   
   **Unix/Linux/macOS:**
   ```bash
   # Check NAS connectivity
   ls -la ./nas/reports/
   
   # Fix permissions
   sudo chown -R $USER:$USER ./nas/
   ```
   
   **Windows:**
   ```cmd
   # Check NAS connectivity
   dir nas\reports\
   
   # Fix junction if needed
   rmdir nas
   mklink /J nas C:\path\to\your\nas
   ```

2. **Backend Connection Issues:**
   
   **Unix/Linux/macOS:**
   ```bash
   # Check backend health
   curl http://localhost:8080/actuator/health
   
   # Check logs
   tail -f data/logs/backend.log
   ```
   
   **Windows:**
   ```cmd
   # Check backend health
   curl http://localhost:8080/actuator/health
   
   # Check logs
   type data\logs\backend.log
   ```

3. **Frontend Build Issues:**
   
   **Unix/Linux/macOS:**
   ```bash
   # Clear cache and rebuild
   cd frontend
   rm -rf .next node_modules
   npm install
   npm run build:prod
   ```
   
   **Windows:**
   ```cmd
   # Clear cache and rebuild
   cd frontend
   rmdir /s /q .next node_modules
   npm install
   npm run build:prod
   ```

4. **Port Already in Use:**
   
   **Unix/Linux/macOS:**
   ```bash
   # Find process using port 8080
   lsof -i :8080
   
   # Kill process
   kill -9 <PID>
   ```
   
   **Windows:**
   ```cmd
   # Find process using port 8080
   netstat -ano | findstr :8080
   
   # Kill process
   taskkill /PID <PID> /F
   ```

### Prerequisites

#### Unix/Linux/macOS
- Node.js 18+ (for frontend)
- Java 17+ (for backend)
- curl (for health checks)
- Access to NAS storage

#### Windows
- Node.js 18+ (for frontend)
- Java 17+ (for backend)
- curl (for health checks) - Available in Windows 10/11 or install via chocolatey
- Access to NAS storage

### Scaling and Performance

For production scaling considerations:

1. **Database**: Consider adding PostgreSQL for report metadata
2. **File Storage**: Implement chunked file reading for large files
3. **Caching**: Add Redis for frequently accessed data
4. **Load Balancing**: Use nginx for multiple backend instances
5. **Monitoring**: Add Prometheus/Grafana for metrics

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
app:
  nas:
    base-path: /nas/reports  # Change to your NAS mount point
    allowed-extensions: xlsx,xls,csv,txt,tsv
  storage:
    config-path: /app/config/reports.yaml  # Report configuration storage
  cors:
    allowed-origins: http://localhost:3000  # Frontend URL
```

### Frontend Configuration

The frontend automatically proxies API requests to the backend. You can modify the API base URL in `frontend/src/services/reportService.ts` if needed.

## API Endpoints

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/{id}` - Get specific report
- `POST /api/reports` - Create new report
- `PUT /api/reports/{id}` - Update report
- `DELETE /api/reports/{id}` - Delete report
- `GET /api/reports/{id}/files` - Get files in report

### Files
- `GET /api/files/{reportId}/{fileName}` - Get parsed file data

### Folders (New)
- `GET /api/folders?path={path}` - Browse folders at specified path
- `GET /api/folders/validate?path={path}` - Validate if path exists and is accessible

## Usage

1. **Add a Report**: Click "Add" in the sidebar to create a new report by specifying:
   - Report name
   - NAS path (e.g., `/nas/reports/sales`)
   - Use the **Browse** button to visually select folders from your NAS

2. **Browse Folders**: When adding a report, click the folder icon to:
   - Navigate through your NAS folder structure
   - View folder hierarchy with breadcrumb navigation
   - Select folders with visual feedback
   - Get real-time path validation

3. **View Files**: Select a report to see available files in the NAS folder

4. **Analyze Data**: Click on a file to view its contents in a sortable, filterable table

5. **Filter Data**: Use the filter inputs above each column to narrow down results

6. **Export Data**: Click "Export CSV" to download filtered data

## File Format Support

- **Excel Files** (.xlsx, .xls): Reads the first worksheet
- **CSV Files** (.csv): Standard comma-separated format
- **Text Files** (.txt): Auto-detects tab, pipe, semicolon, or space delimiters

## Development

### Adding New File Formats

To support additional file formats:

1. Update `allowedExtensions` in `application.yml`
2. Add parsing logic in `FileParsingService.java`
3. Update the file icon logic in `FileList.tsx`

### Error Handling

The application includes comprehensive error handling:

- **File Access Errors**: Invalid paths, permission issues
- **Parsing Errors**: Corrupted or unsupported files
- **Network Errors**: Backend connectivity issues
- **Validation Errors**: Invalid input data
- **Path Security**: Prevents directory traversal attacks
- **Folder Browsing Errors**: Real-time feedback when folders can't be accessed

### Security Features

- **Path Validation**: All paths are validated server-side before access
- **Directory Traversal Protection**: Prevents access outside the configured base path
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Sanitization**: All user inputs are validated and sanitized

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
