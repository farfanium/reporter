#!/bin/bash

# The Reporter - Development Setup Script

echo "🚀 Setting up The Reporter development environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists java; then
    echo "❌ Java is not installed. Please install Java 17+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

# Setup backend
echo "☕ Setting up backend..."
cd ../backend

# Create config directory
mkdir -p config

# Create sample NAS directory structure for testing
mkdir -p sample-nas/reports/sales
mkdir -p sample-nas/reports/inventory
mkdir -p sample-nas/reports/financial

# Create sample files (if they don't exist)
if [ ! -f "sample-nas/reports/sales/sales_2024.csv" ]; then
    echo "📄 Creating sample data files..."
    
    # Sales data
    cat > sample-nas/reports/sales/sales_2024.csv << EOF
Product,Revenue,Units Sold,Region,Sales Rep
Widget A,15000,150,North,John Doe
Widget B,22000,220,South,Jane Smith
Widget C,18000,180,East,Bob Johnson
Widget D,12000,120,West,Alice Brown
EOF

    # Inventory data
    cat > sample-nas/reports/inventory/inventory_current.csv << EOF
Item Code,Description,Current Stock,Min Level,Max Level,Location
A001,Widget A,500,100,1000,Warehouse 1
B002,Widget B,750,200,1500,Warehouse 2
C003,Widget C,300,150,800,Warehouse 1
EOF

    # Financial data
    cat > sample-nas/reports/financial/balance_sheet.csv << EOF
Account,Type,Current Balance,Previous Balance,Change
Cash,Asset,50000,45000,5000
Accounts Receivable,Asset,25000,30000,-5000
Inventory,Asset,40000,35000,5000
Accounts Payable,Liability,15000,20000,-5000
EOF

    echo "✅ Sample data files created"
fi

# Update application.yml to point to sample NAS
sed -i.bak 's|base-path: /nas/reports|base-path: ./sample-nas/reports|g' src/main/resources/application.yml

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  Frontend: cd frontend && npm run dev"
echo "  Backend:  cd backend && ./gradlew bootRun"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo ""
echo "Sample NAS data has been created in: backend/sample-nas/reports/"
