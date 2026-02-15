# Hospital Medical Analysis System

A comprehensive hospital web application for uploading and analyzing medical images and therapeutic data.

## Features

- **User Authentication**
  - Secure login and registration system
  - User session management with localStorage
  - Password validation and matching

- **Medical Image Upload**
  - Support for common image formats (JPG, PNG, etc.)
  - Real-time image preview
  - File metadata display

- **Therapeutic Data Upload**
  - Support for text, PDF, and DOCX files
  - Data preview functionality
  - File metadata tracking

- **Data Analysis**
  - Mock analysis for medical images
  - Mock analysis for therapeutic data
  - Results display with confidence scores
  - Loading spinner during analysis

## Project Structure

```
Hospital_system/
├── index.html          # Authentication page (login/register)
├── dashboard.html      # Main application dashboard
├── styles.css          # All CSS styling
├── auth.js            # Authentication logic
├── dashboard.js       # Dashboard functionality
├── server.js          # Backend Express server
├── package.json       # Node.js dependencies
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── .env.example       # Environment variables template
```

## Installation

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application runs on `http://localhost:3000`

## Usage Guide

### 1. Authentication
- Navigate to the login page (index.html)
- **New Users:** Click "Register here" to create an account
- **Returning Users:** Enter credentials and click Login

### 2. Dashboard
- After successful login, users are redirected to the dashboard
- Three-column layout:
  - **Left:** File upload inputs
  - **Middle:** File preview area
  - **Right:** Analysis results

### 3. File Upload
- Click file input to select medical image or therapeutic data
- File name appears below the input
- Preview auto-loads after selection

### 4. Analysis
- Click "Analyze Data" button
- View loading spinner during processing
- Results appear in right panel after completion

## Technologies

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Storage:** LocalStorage (user data), Multer (file uploads)
- **Styling:** CSS Grid & Flexbox responsive design

## Data Flow

1. User registers/logs in → data stored in localStorage
2. User uploads file → FileReader API processes file
3. Preview generated → image rendered or text truncated
4. Analysis triggered → mock analysis simulated
5. Results displayed → formatted output shown

## Security Notes

**Current Implementation:**
- Client-side only authentication using localStorage
- Passwords stored in plain text (for development only)

**Production Recommendations:**
- Implement server-side authentication with JWT tokens
- Use bcrypt for password hashing
- Add HTTPS encryption
- Implement database for persistent storage
- Add server-side file validation
- Implement rate limiting
- Use environment variables for sensitive data

## API Endpoints (Planned)

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/upload/medical-image` - Upload medical image
- `POST /api/upload/therapeutic-data` - Upload therapeutic data
- `POST /api/analyze` - Analyze uploaded files

## Future Enhancements

- [ ] Backend database integration (MongoDB/PostgreSQL)
- [ ] Real medical image analysis using ML models
- [ ] PDF report generation
- [ ] User roles and permissions
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] File history and archive
- [ ] Advanced search functionality
- [ ] Data export (CSV, PDF)
- [ ] Real-time WebSocket updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
