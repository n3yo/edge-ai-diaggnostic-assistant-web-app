// ─── Configuration ───────────────────────────────────────────────────────────
const FASTAPI_BASE_URL = 'http://localhost:8000';

// ─── State ────────────────────────────────────────────────────────────────────
let uploadedImage = null;

// Page Switching Function
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.page-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Check if user is logged in
window.addEventListener('load', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
    }
    // Load tasks on page load
    updateTasksList();
    // Load available therapeutic tasks
    loadAvailableTasks();
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

// ─── Vision Analysis ──────────────────────────────────────────────────────────
// Analyze Data
async function analyzeData() {
    if (!uploadedImage) {
        alert('Please upload a medical image first!');
        return;
    }

    const rawConditions = document.getElementById('conditionsInput').value.trim();
    if (!rawConditions) {
        alert('Please enter at least one condition to check against.');
        return;
    }

    // Show loading spinner
    document.getElementById('resultsContent').innerHTML =
        '<div class="loading"><div class="spinner"></div><p>Sending image to MedSigLIP for zero-shot classification…</p></div>';
    setApiStatus('visionApiStatus', 'Connecting to FastAPI server…', 'info');

    try {
        const formData = new FormData();
        formData.append('file', uploadedImage);
        formData.append('conditions', rawConditions);          // comma-separated string

        const response = await fetch(`${FASTAPI_BASE_URL}/analyze/vision`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setApiStatus('visionApiStatus', '✅ Analysis complete', 'success');
        renderVisionResults(data);

    } catch (error) {
        setApiStatus('visionApiStatus', `❌ Error: ${error.message}`, 'error');
        document.getElementById('resultsContent').innerHTML =
            `<p style="color:#c0392b;"><strong>Analysis failed:</strong> ${error.message}</p>
             <p style="font-size:13px;color:#666;">Make sure the FastAPI server is running at <code>${FASTAPI_BASE_URL}</code>.</p>`;
    }
}

function renderVisionResults(data) {
    // Expected API response shape: { results: [ { condition: str, score: float }, … ] }
    // or a flat object with condition keys — handle both gracefully.
    let html = `<h3>MedSigLIP Zero-Shot Results</h3>`;

    let results = [];
    if (Array.isArray(data.results)) {
        results = data.results;
  
    } else if (data.results && typeof data.results === 'object') {

        // convert { Pneumonia: 0.82, Normal: 0.12, … } → array
        results = Object.entries(data.results).map(([condition, score]) => ({ condition, score }));
    } else if (typeof data === 'object') {
        console.log(data);
        // fallback: treat top-level keys as condition → score
        results = Object.entries(data.all_scores)
            .filter(([k]) => k !== 'message')
            .map(([condition, score]) => ({ condition, score }));
    }

    if (results.length === 0) {
        html += `<pre style="font-size:13px;">${JSON.stringify(data, null, 2)}</pre>`;
    } else {
        // Sort descending by score
        results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        const topCondition = results[0];

        html += `<p style="margin-bottom:12px;">
                    <strong>Top Match:</strong>
                    <span style="color:#27ae60;font-size:16px;"> ${topCondition.condition}</span>
                    (${(topCondition.score * 1).toFixed(1)}% confidence)
                 </p>
                 <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Condition</th>
                            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Score</th>
                            <th style="padding:8px;border:1px solid #ddd;">Confidence Bar</th>
                        </tr>
                    </thead>
                    <tbody>`;

        results.forEach(r => {
            const pct = ((r.score ?? 0) * 1).toFixed(1);
            const barColor = r === topCondition ? '#27ae60' : '#667eea';
            html += `<tr>
                        <td style="padding:8px;border:1px solid #ddd;">${r.condition}</td>
                        <td style="padding:8px;border:1px solid #ddd;text-align:right;">${pct}%</td>
                        <td style="padding:8px;border:1px solid #ddd;">
                            <div style="background:#eee;border-radius:4px;height:12px;width:100%;">
                                <div style="background:${barColor};width:${pct}%;height:12px;border-radius:4px;"></div>
                            </div>
                        </td>
                     </tr>`;
        });

        html += `   </tbody></table>`;
    }

    html += `<p style="margin-top:16px;color:#667eea;"><strong>✓ Image: ${uploadedImage.name}</strong></p>`;
    document.getElementById('resultsContent').innerHTML = html;
}

// ─── Therapeutic Analysis ─────────────────────────────────────────────────────
// Analyze Therapeutic Data
async function analyzeTherapeuticData() {
    const dropdown = document.getElementById('taskDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const drugSmiles = document.getElementById('drugSmilesInput').value.trim();
    const additionalQuestion = document.getElementById('additionalQuestionInput').value.trim();

    if (!selectedOption.value) {
        alert('Please select a prediction task first!');
        return;
    }
    if (!drugSmiles) {
        alert('Please enter a Drug SMILES string!');
        return;
    }

    const taskId = parseInt(selectedOption.value);
    const task = availableTasks.find(t => t.id === taskId);
    if (!task || !task.prompt_template) {
        alert('Selected task has no prompt template configured.');
        return;
    }

    // UI feedback
    document.getElementById('therapeuticResultsContent').textContent = 'Running TxGemma analysis…';
    document.getElementById('therapeuticResultsContent').style.color = '#667eea';
    setApiStatus('txApiStatus', 'Connecting to FastAPI server…', 'info');

    const payload = {
        task_name: task.task_name,
        drug_smiles: drugSmiles,
        prompt_template: task.prompt_template,
        additional_question: additionalQuestion ? [additionalQuestion] : []
    };

    try {
        const response = await fetch(`${FASTAPI_BASE_URL}/analyze/therapeutics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setApiStatus('txApiStatus', '✅ Analysis complete', 'success');

        const resultText = data.results ?? data.response ?? data.output ?? JSON.stringify(data.analysis_results, null, 2);
        document.getElementById('therapeuticResultsContent').textContent = resultText;
        document.getElementById('therapeuticResultsContent').style.color = '#333';

        // Log to history table
        logTherapeuticResult(task, drugSmiles, 'completed');

    } catch (error) {
        setApiStatus('txApiStatus', `❌ Error: ${error.message}`, 'error');
        document.getElementById('therapeuticResultsContent').textContent =
            `Analysis failed: ${error.message}\n\nMake sure the FastAPI server is running at ${FASTAPI_BASE_URL}.`;
        document.getElementById('therapeuticResultsContent').style.color = '#c0392b';

        logTherapeuticResult(task, drugSmiles, 'failed');
    }
}

function logTherapeuticResult(task, smiles, status) {
    const entry = {
        id: Date.now(),
        taskId: task.id,
        title: task.name,
        description: smiles.length > 40 ? smiles.substring(0, 40) + '…' : smiles,
        category: task.category,
        status: status,
        createdAt: new Date().toLocaleString()
    };
    tasks.push(entry);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTasksList();
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
/**
 * Show a status message in one of the API status boxes.
 * @param {string} elementId
 * @param {string} message
 * @param {'info'|'success'|'error'} type
 */
function setApiStatus(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const colors = {
        info:    { bg: '#e8f4fd', border: '#2196F3', text: '#1565C0' },
        success: { bg: '#e8f5e9', border: '#4CAF50', text: '#2E7D32' },
        error:   { bg: '#fdecea', border: '#f44336', text: '#b71c1c' }
    };
    const c = colors[type] || colors.info;
    el.style.cssText = `display:block;background:${c.bg};border:1px solid ${c.border};color:${c.text};padding:8px 12px;border-radius:4px;font-size:13px;`;
    el.textContent = message;
}


    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }


// ─── Analysis History Table ───────────────────────────────────────────────────
// Task Management Functions
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Update Tasks List Display
function updateTasksList() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;

    if (tasks.length === 0) {
        tasksList.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999; border: 1px solid #ddd;">No analyses run yet. Select a task and run TxGemma analysis to get started!</td></tr>';
        return;
    }

    const statusColor = { completed: '#4CAF50', failed: '#f44336', pending: '#ff9800' };

    let html = '';
    tasks.forEach(task => {
        const color = statusColor[task.status] || '#ff9800';
        const statusBadge = `<span style="background-color:${color};color:white;padding:4px 10px;border-radius:3px;font-size:12px;">${task.status}</span>`;
        const categoryBadge = `<span style="background-color:#2196F3;color:white;padding:3px 8px;border-radius:3px;font-size:12px;">${task.category || 'General'}</span>`;

        html += `
            <tr>
                <td style="padding:10px;border:1px solid #ddd;font-weight:bold;">${task.title}</td>
                <td style="padding:10px;border:1px solid #ddd;font-family:monospace;font-size:12px;">${task.description || '–'}</td>
                <td style="padding:10px;border:1px solid #ddd;text-align:center;">${categoryBadge}</td>
                <td style="padding:10px;border:1px solid #ddd;text-align:center;">${statusBadge}</td>
                <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                    <button onclick="deleteTask(${task.id})" style="padding:5px 10px;background-color:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Delete</button>
                </td>
            </tr>
        `;
    });

    tasksList.innerHTML = html;
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTasksList();
    }
}

// ─── Task Dropdown ────────────────────────────────────────────────────────────
// Load Available Tasks from Task.json
let availableTasks = [];

function loadAvailableTasks() {
    fetch('Task.json')
        .then(response => response.json())
        .then(data => {
            availableTasks = data.tasks;
            populateTaskDropdown();
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            const dd = document.getElementById('taskDropdown');
            if (dd) dd.innerHTML = '<option value="">Error loading tasks</option>';
        });
}

// Populate Task Dropdown
function populateTaskDropdown() {
    const dropdown = document.getElementById('taskDropdown');
    if (!dropdown) return;
    let html = '<option value="">-- Select a task --</option>';
    availableTasks.forEach(task => {
        html += `<option value="${task.id}">${task.name} (${task.category})</option>`;
    });
    dropdown.innerHTML = html;
}

// Called when the user picks a task — updates the description and prompt preview
function onTaskSelected() {
    const dropdown = document.getElementById('taskDropdown');
    const taskId = parseInt(dropdown.value);
    const task = availableTasks.find(t => t.id === taskId);

    const descBox    = document.getElementById('taskDescriptionBox');
    const previewBox = document.getElementById('promptTemplatePreview');

    if (!task) {
        if (descBox)    descBox.textContent   = '';
        if (previewBox) previewBox.textContent = 'Select a task to see its prompt template.';
        return;
    }

    if (descBox)    descBox.textContent   = task.description || '';
    if (previewBox) previewBox.textContent = task.prompt_template || '(No template defined for this task)';
}

// ─── Analysis History Table ───────────────────────────────────────────────────
