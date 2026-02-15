let uploadedImage = null;
let uploadedData = null;

// Check if user is logged in
window.addEventListener('load', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
    }
});

// Handle Medical Image Upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedImage = file;
        document.getElementById('imageFileName').textContent = file.name;
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewContent').innerHTML = 
                `<img src="${e.target.result}" alt="Medical Image">`;
        };
        reader.readAsDataURL(file);
    }
}

// Handle Therapeutic Data Upload
function handleDataUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedData = file;
        document.getElementById('dataFileName').textContent = file.name;
        
        // Preview text data
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = e.target.result.substring(0, 500);
            document.getElementById('previewContent').innerHTML = 
                `<div style="text-align: left; white-space: pre-wrap;">${preview}...</div>`;
        };
        reader.readAsText(file);
    }
}

// Analyze Data
function analyzeData() {
    if (!uploadedImage && !uploadedData) {
        alert('Please upload either a medical image or therapeutic data first!');
        return;
    }
    
    // Show loading spinner
    document.getElementById('resultsContent').innerHTML = 
        '<div class="loading"><div class="spinner"></div><p>Analyzing data...</p></div>';
    
    // Simulate analysis (replace with actual API call later)
    setTimeout(() => {
        const results = generateMockResults();
        document.getElementById('resultsContent').innerHTML = results;
    }, 3000);
}

// Generate Mock Results
function generateMockResults() {
    const imageAnalysis = uploadedImage ? 
        `<h3>Medical Image Analysis:</h3>
         <ul>
             <li><strong>File:</strong> ${uploadedImage.name}</li>
             <li><strong>Size:</strong> ${(uploadedImage.size / 1024).toFixed(2)} KB</li>
             <li><strong>Scan Type:</strong> X-Ray / CT Scan</li>
             <li><strong>Confidence:</strong> 94.2%</li>
             <li><strong>Status:</strong> Analysis Complete</li>
         </ul>` : '';
    
    const dataAnalysis = uploadedData ? 
        `<h3>Therapeutic Data Analysis:</h3>
         <ul>
             <li><strong>File:</strong> ${uploadedData.name}</li>
             <li><strong>Size:</strong> ${(uploadedData.size / 1024).toFixed(2)} KB</li>
             <li><strong>Records Found:</strong> 25</li>
             <li><strong>Data Quality:</strong> Good</li>
             <li><strong>Status:</strong> Analysis Complete</li>
         </ul>` : '';
    
    return `${imageAnalysis}${dataAnalysis}<p style="margin-top: 20px; color: #667eea;"><strong>✓ Analysis completed successfully!</strong></p>`;
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
