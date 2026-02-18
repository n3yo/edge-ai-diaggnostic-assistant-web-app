const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

// Configure file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API Routes

// Register endpoint
app.post('/api/register', (req, res) => {
    const { fullname, email, username, password } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Here you would normally save to database
    res.status(201).json({
        message: 'User registered successfully',
        user: { fullname, email, username }
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Here you would normally verify against database
    res.status(200).json({
        message: 'Login successful',
        user: { username }
    });
});

// File upload endpoint for medical image
app.post('/api/upload/medical-image', upload.single('medicalImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
        message: 'Medical image uploaded successfully',
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            path: req.file.path
        }
    });
});

// File upload endpoint for therapeutic data
app.post('/api/upload/therapeutic-data', upload.single('therapeuticData'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
        message: 'Therapeutic data uploaded successfully',
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            path: req.file.path
        }
    });
});

// Analysis endpoint
app.post('/api/analyze', (req, res) => {
    const { imageFile, dataFile } = req.body;

    // Here you would implement actual analysis logic
    const results = {
        medicalImageAnalysis: {
            quality: 'Excellent',
            anomalies: 'None identified',
            confidence: '94.5%',
            recommendation: 'Further evaluation recommended'
        },
        therapeuticDataAnalysis: {
            dataPoints: 256,
            compliance: '92%',
            status: 'On Track',
            nextReview: 'In 7 days'
        }
    };

    res.status(200).json({
        message: 'Analysis completed successfully',
        results: results
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// ─── FastAPI Proxy Routes ─────────────────────────────────────────────────────
// These routes proxy requests to the FastAPI server so the frontend can use
// a single origin (localhost:3000) without CORS issues.

// Proxy: Vision analysis (multipart/form-data -> FastAPI)
app.post('/api/proxy/vision', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ detail: 'No image file uploaded' });
    }

    const conditions = req.body.conditions || '';
    const fs = require('fs');
    const FormData = require('form-data');

    // Dynamically require form-data (install separately if needed)
    let fd;
    try {
        fd = new FormData();
    } catch (e) {
        return res.status(500).json({ detail: 'form-data package not installed on proxy server. Call FastAPI directly.' });
    }

    fd.append('file', fs.createReadStream(req.file.path), req.file.originalname);
    fd.append('conditions', conditions);

    const targetUrl = new URL('/analyze/vision', FASTAPI_URL);
    const options = {
        method: 'POST',
        hostname: targetUrl.hostname,
        port: targetUrl.port || 8000,
        path: targetUrl.pathname,
        headers: fd.getHeaders()
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
        proxyRes.on('end', () => fs.unlink(req.file.path, () => {}));
    });

    proxyReq.on('error', (err) => {
        fs.unlink(req.file.path, () => {});
        res.status(502).json({ detail: `Could not reach FastAPI server: ${err.message}` });
    });

    fd.pipe(proxyReq);
});

// Proxy: Therapeutics analysis (JSON -> FastAPI)
app.post('/api/proxy/therapeutics', (req, res) => {
    const body = JSON.stringify(req.body);
    const targetUrl = new URL('/analyze/therapeutics', FASTAPI_URL);

    const options = {
        method: 'POST',
        hostname: targetUrl.hostname,
        port: targetUrl.port || 8000,
        path: targetUrl.pathname,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        res.status(502).json({ detail: `Could not reach FastAPI server: ${err.message}` });
    });

    proxyReq.write(body);
    proxyReq.end();
});

// FastAPI health check passthrough
app.get('/api/proxy/health', (req, res) => {
    const targetUrl = new URL('/health', FASTAPI_URL);
    const options = {
        method: 'GET',
        hostname: targetUrl.hostname,
        port: targetUrl.port || 8000,
        path: targetUrl.pathname
    };
    const proxyReq = http.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', () => res.status(502).json({ status: 'FastAPI server unreachable' }));
    proxyReq.end();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Medical Analysis System running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
