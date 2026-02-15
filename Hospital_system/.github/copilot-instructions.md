# Copilot Instructions for Hospital Medical Analysis System

## Project Overview

This is a full-stack healthcare web application for uploading and analyzing medical images and therapeutic data. It features client-side authentication, file uploads, and mock analysis functionality.

**Architecture Pattern:** Client-Side MVC with planned backend integration
- **Frontend:** Vanilla JavaScript with HTML5/CSS3 (no frameworks)
- **Backend:** Express.js with Multer for file handling
- **Data Storage:** LocalStorage for sessions, file system for uploads

## Core Components

### 1. Authentication Layer (`index.html` + `auth.js`)
- **Pattern:** Form-based auth with localStorage session persistence
- **Key Functions:**
  - `toggleForms()` - Switch between login/register with `.active` class
  - `handleLogin()` - Validates against localStorage `users` array
  - `handleRegister()` - Validates and stores new user objects
- **Session Management:** User data stored in localStorage as `currentUser`
- **Validation:** Client-side only (password matching, username uniqueness)
- **Note:** Production version must use server-side auth with JWT tokens

### 2. Dashboard UI (`dashboard.html` + `styles.css`)
- **Layout:** 3-column CSS Grid (fixed in responsive mode to single column)
  - Left column: File inputs (medical image, therapeutic data)
  - Middle column: File preview area
  - Right column: Analysis results
- **Styling Convention:** BEM-inspired with `.panel`, `.form-section`, `.active` classes
- **Color Scheme:** Gradient purple (#667eea to #764ba2) for headers, white panels on gray background
- **Responsive:** Breakpoints at 1024px and 768px

### 3. File Upload & Preview (`dashboard.js`)
- **Pattern:** FileReader API for client-side processing
- **Key Functions:**
  - `handleImageUpload(event)` - Stores in `uploadedImage`, shows preview
  - `handleDataUpload(event)` - Stores in `uploadedData`, truncates text preview
  - `analyzeData()` - Validates files exist, shows spinner, calls analysis
- **Preview Logic:** 
  - Images: Render via `e.target.result` data URL
  - Text: Display first 500 characters
- **State Management:** Module-level variables (`uploadedImage`, `uploadedData`)

### 4. Analysis Results (`dashboard.js` - `generateMockResults()`)
- **Pattern:** Mock data for demonstration
- **Return Format:** HTML string with `<h3>` headers and `<ul>` lists
- **Confidence Score:** Hard-coded at 94.2% for images, "Good" for data quality
- **Delay:** 3-second timeout to simulate processing

## Development Workflow

### Setup
```bash
npm install
npm start  # or npm run dev for nodemon
```

### Adding Features

**New page route:** Add to `server.js` with `app.get()`, reference in HTML links.

**New auth field:** 
1. Add `<input>` to `index.html`
2. Extract value in `handleRegister()` with `getElementById()`
3. Add property to `newUser` object
4. Update validation if needed

**New upload type:**
1. Add `<input type="file">` to `dashboard.html`
2. Create handler function copying pattern from `handleImageUpload()`
3. Update `analyzeData()` to include new type
4. Extend `generateMockResults()` with new analysis section

### Key Patterns to Follow

1. **Form Handling:** Prevent defaults with `event.preventDefault()`, validate before storage
2. **LocalStorage Access:** Always wrap in `JSON.parse()` and `JSON.stringify()`
3. **File Preview:** Use `FileReader.onload` with `readAsDataURL()` for images, `readAsText()` for text
4. **CSS Classes:** Toggle with `classList.toggle('active')` or `classList.add()`
5. **Alerts:** Currently use `alert()` and `confirm()` (plan modal dialogs for production)

## Integration Points

### Frontend-Backend Communication (Planned)
- POST `/api/register` - User registration
- POST `/api/login` - User authentication  
- POST `/api/upload/medical-image` - Image upload
- POST `/api/upload/therapeutic-data` - Data upload
- POST `/api/analyze` - Trigger real analysis

Currently, all functionality is client-side. Backend routes exist in `server.js` but are not wired to frontend.

### File Uploads
- **Current:** Files previewed in DOM only
- **Planned:** Use Multer middleware to save files to `uploads/` directory
- **Validation:** Check file size, type before storage

## Testing Considerations

**Current:** No test framework
**Manual Testing Flow:**
1. Register new user (test validation)
2. Login with correct credentials
3. Login with wrong credentials (should fail)
4. Upload image file, verify preview
5. Upload text file, verify truncation
6. Click analyze, verify spinner, verify results after 3s
7. Logout, verify redirect to login

## Common Modifications

### Change Color Scheme
- Update CSS variables or hex codes in `styles.css`
- Gradient colors in `.auth-container` and `.dashboard-header`
- Primary color used in buttons and borders (#667eea)

### Extend Analysis Results
- Modify `generateMockResults()` to add new analysis metrics
- Update result HTML structure while keeping the pattern

### Add Database Integration
- Replace localStorage with fetch calls to backend API
- Update `handleLogin()`, `handleRegister()`, `analyzeData()`
- Ensure backend routes in `server.js` are fully implemented

### Add File Type Support
- Update `accept` attribute in file inputs
- Validate MIME types server-side (when backend is active)
- Handle preview for new types in `handleDataUpload()`

## Security Warnings

- ⚠️ Passwords stored in plain text in localStorage - never use in production
- ⚠️ No input sanitization - vulnerable to XSS
- ⚠️ No server-side authentication - any file can access localStorage
- ⚠️ CORS is open - implement proper origin validation
- ⚠️ File uploads have no validation - add server-side checks

## Environment Setup

Create `.env` from `.env.example`:
```
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=50mb
UPLOAD_DIR=./uploads
```

## Dependencies

**Runtime:**
- `express` - HTTP server
- `body-parser` - JSON parsing
- `cors` - Cross-origin requests
- `multer` - File uploads
- `dotenv` - Environment variables

**Dev:**
- `nodemon` - Auto-restart on file changes

## File Organization Philosophy

- Frontend files (HTML, CSS, JS) in root for simplicity
- Backend configuration in root
- Uploaded files in `uploads/` directory (create manually or via API)
- Configuration in environment variables, not hardcoded
