# Shipment Tracking System

## Overview

The Shipment Tracking System is a comprehensive web application designed to efficiently manage and monitor shipment operations. This lightweight yet powerful solution allows users to create, edit, delete, and filter shipment records through an intuitive interface, providing real-time insights into shipment activities.

## Features

### Core Functionality
- **Complete CRUD Operations**: Create, read, update, and delete shipment records
- **Unique Shipment IDs**: Automatic validation to prevent duplicate entries
- **Responsive Design**: Optimized for both desktop and mobile devices

### Advanced Filtering
- **Date Range Selection**: Filter shipments by specific date periods
- **Quick Filters**: One-click access to current week's shipments
- **Real-time Updates**: Instant reflection of filter changes in the data view

### Data Visualization & Analytics
- **Summary Statistics**: Track total shipments, total amount, and average shipment value
- **Weekly Distribution Chart**: Visual representation of shipment amounts by week
- **Performance Metrics**: Monitor shipment trends over time

### Data Management
- **CSV Export**: Download filtered shipment data in CSV format
- **Persistent Storage**: SQLite database for reliable data retention
- **Data Integrity**: Validation rules to ensure data consistency

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (included with Node.js)
- Git (for cloning the repository)

### Setup Process

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/sevk-repo.git
   cd sevk-repo
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:
   ```bash
   node server.js
   ```
   You should see the message: "Server running at http://localhost:3000"

4. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage Guide

### Adding a New Shipment

1. Locate the "Add New Shipment" form on the left side of the interface
2. Fill in the required fields:
   - **Shipment ID**: A unique identifier for the shipment (required)
   - **Name**: The recipient's name (optional)
   - **Total Amount**: The monetary value of the shipment in local currency (required)
   - **Shipping Company**: The company handling the shipment (optional)
   - **Shipment Date**: The date when the shipment was sent (required)
3. Click the "Save" button to create the record
4. The system will validate your input and add the shipment to the database

### Editing Existing Shipments

1. Find the shipment you wish to modify in the shipment list table
2. Click the "Edit" button next to the relevant shipment
3. The form will be populated with the shipment's current information
4. Make your desired changes to any field
5. Click "Save" to update the record
6. To cancel the edit operation, click the "Cancel" button

### Deleting Shipments

1. Locate the shipment to be removed in the shipment list
2. Click the "Delete" button associated with that shipment
3. Confirm the deletion when prompted
4. The shipment will be permanently removed from the database

### Filtering Shipments

#### Quick Filters
- Click "All" to view all shipments in the database
- Click "This Week" to display only shipments from the current week

#### Custom Date Range
1. Select a start date in the first date picker
2. Select an end date in the second date picker
3. Click "Filter" to apply the date range filter
4. The shipment list will update to show only records within the specified period

### Exporting Data

1. Apply any desired filters to the shipment list
2. Click the "Download CSV" button
3. A CSV file containing the currently displayed shipments will be downloaded
4. This file can be opened in spreadsheet applications like Microsoft Excel or Google Sheets

## Database Information

The application uses SQLite as its database engine. The database file (`sevkiyat_veritabani.db`) is automatically created in the backend directory when the server starts for the first time. This file has been added to the `.gitignore` file to prevent it from being pushed to GitHub, ensuring that your local data remains private.

### Database Schema

The main table structure includes:

```sql
CREATE TABLE IF NOT EXISTS sevkiyatlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sevkiyat_id TEXT UNIQUE NOT NULL,
    ad_soyad TEXT,
    toplam_tutar REAL NOT NULL,
    sevk_eden_firma TEXT,
    sevk_tarihi TEXT NOT NULL
);
```

## Technical Architecture

### Frontend
- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with responsive design principles
- **JavaScript**: Vanilla JS for DOM manipulation and API interactions
- **Chart.js**: For data visualization components

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **SQLite3**: Lightweight, file-based database
- **CORS**: Cross-Origin Resource Sharing middleware

### API Endpoints

- **GET /api/sevkiyatlar**: Retrieve shipments with optional filtering
- **POST /api/sevkiyatlar**: Create a new shipment record
- **PUT /api/sevkiyatlar/:id**: Update an existing shipment
- **DELETE /api/sevkiyatlar/:id**: Remove a shipment from the database

## Development

### Project Structure

```
/
├── backend/               # Server-side code
│   ├── server.js         # Express server and API endpoints
│   ├── package.json      # Backend dependencies
│   └── sevkiyat_veritabani.db  # SQLite database (auto-generated)
├── public/               # Client-side code
│   ├── index.html        # Main HTML structure
│   ├── style.css         # CSS styling
│   └── app.js            # Frontend JavaScript
├── .gitignore            # Git ignore configuration
└── README.md             # Project documentation
```

### Extending the Application

To add new features or modify existing functionality:

1. **Backend Changes**: Modify `server.js` to add new API endpoints or alter existing ones
2. **Frontend Updates**: Edit `index.html`, `style.css`, and `app.js` as needed
3. **Database Modifications**: Add or modify table structures in the `createTableSql` section of `server.js`

## Troubleshooting

### Common Issues

- **Server Won't Start**: Ensure port 3000 is not in use by another application
- **Database Errors**: Check file permissions in the backend directory
- **API Connection Failures**: Verify that CORS is properly configured

### Solutions

- Restart the server with `node server.js`
- Check the console for error messages
- Ensure all dependencies are correctly installed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Express.js team for the robust web framework
- SQLite team for the efficient database engine
- All contributors who have helped improve this project