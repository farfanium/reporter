# Backend Build Guide

This guide explains how to build and run The Reporter backend with the necessary environment variables.

## Quick Start

### macOS/Linux
```bash
# Build the backend
./build-backend.sh

# Run the backend
./run-backend.sh
```

### Windows
```batch
# Build the backend
build-backend.bat

# Run the backend
run-backend.bat
```

## Environment Variables

The following environment variables are used by the backend:

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring profile to use |
| `SERVER_PORT` | `8080` | Port for the backend server |
| `NAS_BASE_PATH` | `/Volumes` (macOS)<br>`C:\nas` (Windows) | Base path for NAS/network storage |
| `CONFIG_PATH` | `./data/config/reports.yaml` | Path to the reports configuration file |
| `LOG_LEVEL` | `INFO` | Application logging level |
| `WEB_LOG_LEVEL` | `WARN` | Web/HTTP logging level |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `ALLOWED_EXTENSIONS` | `xlsx,xls,csv,txt,tsv` | Allowed file extensions |
| `MAX_FILE_SIZE` | `50MB` | Maximum file upload size |
| `MAX_REQUEST_SIZE` | `50MB` | Maximum request size |

## Configuration Files

### 1. `.env` File
The build script creates a `.env` file with default values. Customize it for your environment:

```bash
# Backend Environment Configuration
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
NAS_BASE_PATH=/Volumes/YourNASShare
CONFIG_PATH=./data/config/reports.yaml
LOG_LEVEL=INFO
WEB_LOG_LEVEL=WARN
CORS_ORIGINS=http://localhost:3000
ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
MAX_FILE_SIZE=50MB
MAX_REQUEST_SIZE=50MB
```

### 2. Reports Configuration (`data/config/reports.yaml`)
Define your reports in this YAML file:

```yaml
reports:
  - name: "Monthly Sales Report"
    path: "/nas/reports/sales"
    description: "Monthly sales data analysis"
    enabled: true
  - name: "Inventory Report"
    path: "/nas/reports/inventory"
    description: "Current inventory status"
    enabled: true
```

## NAS/Network Storage Setup

### macOS Examples
```bash
# SMB/CIFS share
NAS_BASE_PATH=/Volumes/Reports

# NFS mount
NAS_BASE_PATH=/mnt/nfs/reports

# Local directory (for testing)
NAS_BASE_PATH=./nas
```

### Windows Examples
```batch
# UNC path
NAS_BASE_PATH=\\server\share\reports

# Mapped network drive
NAS_BASE_PATH=Z:\reports

# Local directory (for testing)
NAS_BASE_PATH=C:\nas\reports
```

### Linux Examples
```bash
# NFS mount
NAS_BASE_PATH=/mnt/nas/reports

# CIFS mount
NAS_BASE_PATH=/mnt/cifs/reports

# Local directory (for testing)
NAS_BASE_PATH=./nas
```

## Build Process

The build scripts perform the following steps:

1. **Set Environment Variables**: Apply default values and load from `.env` if present
2. **Create Directories**: Create `data/config` and `data/logs` directories
3. **NAS Setup**: Create example NAS directory structure if not present
4. **Gradle Build**: Clean and build the backend using `./gradlew clean build -x test`
5. **Configuration**: Create template configuration files

## Running the Backend

### Option 1: Using the Run Script
```bash
# macOS/Linux
./run-backend.sh

# Windows
run-backend.bat
```

### Option 2: Direct Gradle
```bash
# Load environment variables first
source .env  # macOS/Linux only

# Run with Gradle
cd backend
./gradlew bootRun  # macOS/Linux
gradlew.bat bootRun  # Windows
```

### Option 3: JAR File
```bash
# If you've built the project, you can run the JAR directly
java -jar backend/build/libs/backend-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

### Build Issues
- **Gradle wrapper not found**: Ensure you're running from the project root
- **Permission denied**: Make scripts executable with `chmod +x *.sh`
- **Build fails**: Check that Java 17+ is installed

### Runtime Issues
- **NAS not accessible**: Verify the `NAS_BASE_PATH` and mount point
- **Port already in use**: Change `SERVER_PORT` in `.env`
- **Configuration not found**: Check `CONFIG_PATH` points to valid YAML file

### Environment Variable Issues
- **Variables not loaded**: Ensure `.env` file format is correct (no spaces around `=`)
- **Path issues on Windows**: Use double backslashes `\\` or forward slashes `/`

## API Endpoints

Once running, the backend provides:

- **Health Check**: `http://localhost:8080/health`
- **API Base**: `http://localhost:8080/api`
- **Reports**: `http://localhost:8080/api/reports`
- **Actuator**: `http://localhost:8080/actuator/health`

## Development vs Production

### Development
```bash
SPRING_PROFILES_ACTIVE=dev
LOG_LEVEL=DEBUG
NAS_BASE_PATH=./sample-nas
```

### Production
```bash
SPRING_PROFILES_ACTIVE=prod
LOG_LEVEL=INFO
NAS_BASE_PATH=/path/to/production/nas
```

## Security Considerations

For production deployments:

1. **Secure NAS Access**: Use proper authentication for network shares
2. **Firewall Rules**: Restrict access to the backend port
3. **HTTPS**: Use a reverse proxy (nginx, Apache) for HTTPS termination
4. **Environment Files**: Keep `.env` files secure and out of version control
5. **File Permissions**: Ensure proper read/write permissions on NAS paths
