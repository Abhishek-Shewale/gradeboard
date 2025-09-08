// Gradebook Prototype - JavaScript Core Functions
// API Configuration
const GEMINI_API_KEY = 'AIzaSyCbNoabsBsUBCMBzCRtI25DmPiKzhGLwAY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Global Variables
let studentData = null;
let currentTab = 'upload';
let charts = {};

// Subject configurations for different classes
const subjectConfigs = {
    '1st': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '2nd': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '3rd': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '4th': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '5th': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '6th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
    '7th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
    '8th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
    '9th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
    '10th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
    '11th': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
    '12th': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupFileUpload();
    setupClassSelection();
    
 
    
    showMessage('Welcome to Gradebook! Enter your child\'s grades to get AI-powered insights.', 'success');
}

// Load Demo Data
function loadDemoData() {
    const demoData = {
        class: '10th',
        board: 'CBSE',
        testType: 'Mid-term',
        date: new Date().toISOString().split('T')[0],
        subjects: [
            { name: 'Mathematics', marks: 65, total: 100, percentage: 65, grade: 'B' },
            { name: 'Science', marks: 78, total: 100, percentage: 78, grade: 'A' },
            { name: 'English', marks: 82, total: 100, percentage: 82, grade: 'A' },
            { name: 'Social Science', marks: 58, total: 100, percentage: 58, grade: 'C+' },
            { name: 'Hindi', marks: 72, total: 100, percentage: 72, grade: 'B+' },
            { name: 'Computer Science', marks: 85, total: 100, percentage: 85, grade: 'A' }
        ]
    };
    
    processStudentData(demoData);
    showMessage('Demo data loaded! This shows how the system works with sample grades.', 'success');
}

// Event Listeners Setup
function setupEventListeners() {
    // Form submission
    const manualForm = document.getElementById('manual-form');
    if (manualForm) {
        manualForm.addEventListener('submit', handleManualEntry);
    }

    // Class selection change
    const classSelect = document.getElementById('class-select');
    if (classSelect) {
        classSelect.addEventListener('change', handleClassChange);
    }

    // File input change
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

// Tab Switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    currentTab = tabName;
}

// File Upload Setup
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadLink = document.querySelector('.upload-link');

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadLink.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload({ target: { files: files } });
        }
    });
}

// File Upload Handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showMessage('Please upload a PDF, JPG, or PNG file.', 'error');
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showMessage('File size must be less than 10MB.', 'error');
        return;
    }

    // Simulate OCR processing
    simulateOCR(file);
}

// Mock OCR Implementation
function simulateOCR(file) {
    showLoadingOverlay('Processing your marksheet...');
    
    // Hide upload area and show progress
    document.getElementById('upload-area').style.display = 'none';
    document.getElementById('upload-progress').style.display = 'block';
    
    // Simulate progress with different stages
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        document.getElementById('progress-fill').style.width = progress + '%';
        
        // Update progress text based on stage
        const progressText = document.querySelector('.progress-text');
        if (progress < 30) {
            progressText.textContent = 'Reading image...';
        } else if (progress < 60) {
            progressText.textContent = 'Extracting text...';
        } else if (progress < 90) {
            progressText.textContent = 'Analyzing subjects and grades...';
        } else {
            progressText.textContent = 'Finalizing results...';
        }
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(async () => {
                hideLoadingOverlay();
                
                try {
                    const extractedData = await extractDataFromImage(file);
                    
                    // Show extracted information
                    const subjectCount = extractedData.subjects.length;
                    const extractedSubjects = extractedData.subjects.map(s => s.name).join(', ');
                    
                    showMessage(`Successfully extracted ${subjectCount} subjects: ${extractedSubjects}`, 'success');
                    
                    processStudentData(extractedData);
                } catch (error) {
                    console.error('Error processing image:', error);
                    showMessage('Error processing image. Using sample data instead.', 'warning');
                    
                    // Use fallback data
                    const fallbackData = getMockMarksheetData();
                    processStudentData(fallbackData);
                }
                
                // Reset upload area
                setTimeout(() => {
                    document.getElementById('upload-area').style.display = 'block';
                    document.getElementById('upload-progress').style.display = 'none';
                    document.getElementById('progress-fill').style.width = '0%';
                    document.getElementById('file-input').value = '';
                }, 2000);
            }, 1000);
        }
    }, 200);
}

// Extract Data from Uploaded Image using Gemini API
async function extractDataFromImage(file) {
    try {
        // Convert file to base64 for API
        const base64 = await fileToBase64(file);
        
        // Create prompt for Gemini to analyze the marksheet
        const analysisPrompt = `
        Analyze this marksheet image and extract the following information in JSON format:
        
        1. Class (e.g., "10th", "12th", etc.)
        2. Board (e.g., "CBSE", "ICSE", "State Board", etc.)
        3. Test Type (e.g., "Mid-term", "Final", "Unit Test", etc.)
        4. List of subjects with their marks and total marks
        
        Return ONLY a valid JSON object with this structure:
        {
            "class": "10th",
            "board": "CBSE", 
            "testType": "Mid-term",
            "subjects": [
                {"name": "Mathematics", "marks": 78, "total": 100},
                {"name": "Science", "marks": 85, "total": 100}
            ]
        }
        
        If you cannot clearly read the image, return a JSON with sample data for a 10th standard CBSE marksheet.
        `;
        
        // Call Gemini API with image
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: analysisPrompt },
                        {
                            inline_data: {
                                mime_type: file.type,
                                data: base64
                            }
                        }
                    ]
                }]
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        const extractedText = result.candidates[0].content.parts[0].text;
        
        // Clean the response text (remove markdown code blocks)
        let cleanText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Handle edge cases - sometimes the response might have extra whitespace or newlines
        cleanText = cleanText.replace(/^\s*/, '').replace(/\s*$/, '');
        
        console.log('Cleaned text:', cleanText); // Debug log
        
        // Parse the JSON response
        let extractedData;
        try {
            extractedData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Text that failed to parse:', cleanText);
            throw new Error('Failed to parse JSON response from API');
        }
        
        // Process the extracted data
        return {
            class: extractedData.class,
            board: extractedData.board,
            testType: extractedData.testType,
            date: new Date().toISOString().split('T')[0],
            subjects: extractedData.subjects.map(subject => ({
                name: subject.name,
                marks: subject.marks,
                total: subject.total,
                percentage: (subject.marks / subject.total) * 100,
                grade: calculateGrade((subject.marks / subject.total) * 100)
            }))
        };
        
    } catch (error) {
        console.error('Error extracting data from image:', error);
        // Fallback to mock data if API fails
        return getMockMarksheetData();
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Fallback mock data function
function getMockMarksheetData() {
    const marksheetTypes = [
        {
            class: '10th',
            board: 'CBSE',
            testType: 'Mid-term',
            subjects: [
                { name: 'Mathematics', marks: 78, total: 100 },
                { name: 'Science', marks: 85, total: 100 },
                { name: 'English', marks: 72, total: 100 },
                { name: 'Social Science', marks: 68, total: 100 },
                { name: 'Hindi', marks: 80, total: 100 },
                { name: 'Computer Science', marks: 90, total: 100 }
            ]
        },
        {
            class: '12th',
            board: 'CBSE',
            testType: 'Final',
            subjects: [
                { name: 'Mathematics', marks: 65, total: 100 },
                { name: 'Physics', marks: 72, total: 100 },
                { name: 'Chemistry', marks: 78, total: 100 },
                { name: 'Biology', marks: 82, total: 100 },
                { name: 'English', marks: 75, total: 100 },
                { name: 'Computer Science', marks: 88, total: 100 }
            ]
        },
        {
            class: '9th',
            board: 'ICSE',
            testType: 'Unit Test',
            subjects: [
                { name: 'Mathematics', marks: 70, total: 100 },
                { name: 'Science', marks: 76, total: 100 },
                { name: 'English', marks: 84, total: 100 },
                { name: 'Social Studies', marks: 69, total: 100 },
                { name: 'Hindi', marks: 77, total: 100 },
                { name: 'Computer Applications', marks: 91, total: 100 }
            ]
        }
    ];
    
    const selectedMarksheet = marksheetTypes[Math.floor(Math.random() * marksheetTypes.length)];
    
    return {
        class: selectedMarksheet.class,
        board: selectedMarksheet.board,
        testType: selectedMarksheet.testType,
        date: new Date().toISOString().split('T')[0],
        subjects: selectedMarksheet.subjects.map(subject => ({
            name: subject.name,
            marks: subject.marks,
            total: subject.total,
            percentage: (subject.marks / subject.total) * 100,
            grade: calculateGrade((subject.marks / subject.total) * 100)
        }))
    };
}

// Generate Mock Grades (kept for demo button)
function generateMockGrades() {
    const classes = ['9th', '10th', '11th', '12th'];
    const boards = ['CBSE', 'ICSE', 'State Board'];
    const testTypes = ['Unit Test', 'Mid-term', 'Final'];
    
    const selectedClass = classes[Math.floor(Math.random() * classes.length)];
    const subjects = subjectConfigs[selectedClass];
    
    const mockData = {
        class: selectedClass,
        board: boards[Math.floor(Math.random() * boards.length)],
        testType: testTypes[Math.floor(Math.random() * testTypes.length)],
        date: new Date().toISOString().split('T')[0],
        subjects: subjects.map(subject => {
            const marks = Math.floor(Math.random() * 40) + 60; // 60-100 range
            return {
                name: subject,
                marks: marks,
                total: 100,
                percentage: marks,
                grade: calculateGrade(marks)
            };
        })
    };
    
    return mockData;
}

// Class Selection Handler
function setupClassSelection() {
    const classSelect = document.getElementById('class-select');
    if (classSelect) {
        classSelect.addEventListener('change', handleClassChange);
    }
}

function handleClassChange() {
    const selectedClass = document.getElementById('class-select').value;
    if (selectedClass && subjectConfigs[selectedClass]) {
        generateSubjectInputs(subjectConfigs[selectedClass]);
    }
}

// Generate Subject Input Fields
function generateSubjectInputs(subjects) {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';
    
    // Add header with add subject button
    const headerDiv = document.createElement('div');
    headerDiv.className = 'subjects-header';
    headerDiv.innerHTML = `
        <h4>Subjects <span class="subject-count" id="subject-count">(${subjects.length})</span></h4>
        <button type="button" class="btn btn-outline btn-small" onclick="addNewSubject()">
            <i class="fas fa-plus"></i> Add Subject
        </button>
    `;
    container.appendChild(headerDiv);
    
    // Add subjects
    subjects.forEach((subject, index) => {
        addSubjectInput(subject, index);
    });
    
    // Update count after all subjects are added
    updateSubjectCount();
}

// Update subject count display
function updateSubjectCount() {
    const subjectCountElement = document.getElementById('subject-count');
    if (subjectCountElement) {
        const subjectItems = document.querySelectorAll('.subject-item');
        const count = subjectItems.length;
        subjectCountElement.textContent = `(${count})`;
    }
}

// Add individual subject input
function addSubjectInput(subjectName = '', index = null) {
    const container = document.getElementById('subjects-container');
    const subjectDiv = document.createElement('div');
    subjectDiv.className = 'subject-item';
    subjectDiv.setAttribute('data-index', index || Date.now());
    
    const safeName = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    subjectDiv.innerHTML = `
        <div class="form-group subject-name-group">
            <input type="text" name="subject_name_${index || Date.now()}" 
                   placeholder="Subject Name" value="${subjectName}" required>
        </div>
        <div class="form-group">
            <input type="number" name="subject_marks_${index || Date.now()}" 
                   placeholder="Marks" min="0" max="1000" required>
        </div>
        <div class="form-group">
            <input type="number" name="subject_total_${index || Date.now()}" 
                   placeholder="Total" min="1" value="100" required>
        </div>
        <div class="form-group">
            <button type="button" class="btn btn-danger btn-small" onclick="removeSubject(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(subjectDiv);
    updateSubjectCount();
}

// Add new subject
function addNewSubject() {
    addSubjectInput();
}

// Remove subject
function removeSubject(button) {
    const subjectItem = button.closest('.subject-item');
    subjectItem.remove();
    updateSubjectCount();
}

// Manual Entry Handler
function handleManualEntry(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const classValue = formData.get('class');
    const boardValue = formData.get('board');
    const testTypeValue = formData.get('testType');
    
    if (!classValue || !boardValue || !testTypeValue) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    const studentData = {
        class: classValue,
        board: boardValue,
        testType: testTypeValue,
        date: new Date().toISOString().split('T')[0],
        subjects: []
    };
    
    // Extract subject data from dynamic form
    const subjectItems = document.querySelectorAll('.subject-item');
    let hasValidData = false;
    
    subjectItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const marksInput = item.querySelector('input[placeholder="Marks"]');
        const totalInput = item.querySelector('input[placeholder="Total"]');
        
        if (nameInput && marksInput && totalInput) {
            const subjectName = nameInput.value.trim();
            const marks = parseFloat(marksInput.value);
            const total = parseFloat(totalInput.value);
            
            if (subjectName && !isNaN(marks) && !isNaN(total) && marks >= 0 && total > 0) {
                const percentage = (marks / total) * 100;
                studentData.subjects.push({
                    name: subjectName,
                    marks: marks,
                    total: total,
                    percentage: percentage,
                    grade: calculateGrade(percentage)
                });
                hasValidData = true;
            }
        }
    });
    
    if (!hasValidData) {
        showMessage('Please enter at least one subject with valid marks.', 'error');
        return;
    }
    
    // Show extracted data summary (same as uploaded images)
    showExtractedDataSummary(studentData);
    
    // Process the data the same way as uploaded images
    processStudentData(studentData);
    showMessage('Grades entered successfully!', 'success');
}

// Process Student Data
function processStudentData(data) {
    studentData = data;
    
    // Clear any existing dashboard content to prevent duplicates
    clearDashboardContent();
    
    // Calculate overall performance
    const overallPerformance = calculateOverallPerformance(data);
    
    // Update dashboard
    updateDashboard(overallPerformance);
    
    // Show extracted data summary
    showExtractedDataSummary(data);
    
    // Show dashboard
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
    
    // Generate charts
    generateCharts();
    
    // Get AI recommendations
    getGeminiRecommendations(data);
    
    // Study calendar will be added automatically in recommendations
}

// Clear Dashboard Content
function clearDashboardContent() {
    // Remove existing extracted data summary
    const existingSummary = document.querySelector('.extracted-data-summary');
    if (existingSummary) {
        existingSummary.remove();
    }
    
    // Remove existing study calendar section
    const existingCalendarSection = document.getElementById('study-calendar-section');
    if (existingCalendarSection) {
        existingCalendarSection.remove();
    }
    
    // Clear recommendations container
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (recommendationsContainer) {
        recommendationsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Generating personalized recommendations...</p></div>';
    }
    
    // Clear subjects grid
    const subjectsGrid = document.getElementById('subjects-grid');
    if (subjectsGrid) {
        subjectsGrid.innerHTML = '';
    }
}

// Show Extracted Data Summary
function showExtractedDataSummary(data) {
    const summaryHtml = `
        <div class="extracted-data-summary">
            <h4><i class="fas fa-file-alt"></i> Extracted Data Summary</h4>
            <div class="summary-details">
                <div class="detail-item">
                    <span class="label">Class:</span>
                    <span class="value">${data.class}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Board:</span>
                    <span class="value">${data.board}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Test Type:</span>
                    <span class="value">${data.testType}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Subjects Found:</span>
                    <span class="value">${data.subjects.length}</span>
                </div>
            </div>
            <div class="subjects-list">
                <strong>Subjects:</strong>
                <div class="subject-tags">
                    ${data.subjects.map(subject => `
                        <span class="subject-tag">${subject.name}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Insert summary before the performance summary
    const performanceSummary = document.querySelector('.performance-summary');
    if (performanceSummary) {
        performanceSummary.insertAdjacentHTML('beforebegin', summaryHtml);
    }
}

// Calculate Overall Performance
function calculateOverallPerformance(data) {
    const subjects = data.subjects;
    const totalMarks = subjects.reduce((sum, subject) => sum + subject.marks, 0);
    const totalPossible = subjects.reduce((sum, subject) => sum + subject.total, 0);
    const overallPercentage = (totalMarks / totalPossible) * 100;
    
    const weakSubjects = subjects.filter(subject => subject.percentage < 70);
    
    return {
        overallPercentage: Math.round(overallPercentage),
        overallGrade: calculateGrade(overallPercentage),
        weakSubjectsCount: weakSubjects.length,
        weakSubjects: weakSubjects,
        totalSubjects: subjects.length,
        subjects: subjects
    };
}

// Calculate Grade
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
}

// Update Dashboard
function updateDashboard(performance) {
    // Update summary cards
    document.getElementById('overall-grade').textContent = performance.overallGrade;
    document.getElementById('overall-percentage').textContent = performance.overallPercentage + '%';
    document.getElementById('weak-subjects-count').textContent = performance.weakSubjectsCount;
    
    // Update subjects grid
    const subjectsGrid = document.getElementById('subjects-grid');
    subjectsGrid.innerHTML = '';
    
    performance.subjects.forEach(subject => {
        const subjectCard = createSubjectCard(subject);
        subjectsGrid.appendChild(subjectCard);
    });
}

// Create Subject Card
function createSubjectCard(subject) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    
    const gradeClass = getGradeClass(subject.percentage);
    const progressClass = getProgressClass(subject.percentage);
    
    card.innerHTML = `
        <div class="subject-header">
            <div class="subject-name">${subject.name}</div>
            <div class="subject-grade ${gradeClass}">${subject.grade}</div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill ${progressClass}" style="width: ${subject.percentage}%"></div>
        </div>
        <div class="subject-details">
            <span>${subject.marks}/${subject.total}</span>
            <span>${subject.percentage.toFixed(1)}%</span>
        </div>
    `;
    
    return card;
}

// Get Grade Class
function getGradeClass(percentage) {
    if (percentage >= 80) return 'grade-excellent';
    if (percentage >= 70) return 'grade-good';
    if (percentage >= 60) return 'grade-average';
    return 'grade-poor';
}

// Get Progress Class
function getProgressClass(percentage) {
    if (percentage >= 80) return 'progress-excellent';
    if (percentage >= 70) return 'progress-good';
    if (percentage >= 60) return 'progress-average';
    return 'progress-poor';
}

// Generate Charts
function generateCharts() {
    if (!studentData) return;
    
    // Performance Chart
    generatePerformanceChart();
    
    // Subject Comparison Chart
    generateSubjectChart();
}

// Performance Chart
function generatePerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (charts.performance) {
        charts.performance.destroy();
    }
    
    const subjects = studentData.subjects;
    const labels = subjects.map(s => s.name);
    const data = subjects.map(s => s.percentage);
    const colors = data.map(percentage => {
        if (percentage >= 80) return '#7ED321';
        if (percentage >= 70) return '#4A90E2';
        if (percentage >= 60) return '#F5A623';
        return '#D0021B';
    });
    
    charts.performance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage',
                data: data,
                backgroundColor: colors.map(color => color + '80'), // Add transparency
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                hoverBackgroundColor: colors,
                hoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        color: '#666',
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: '#e9ecef',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        color: '#666',
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            const grade = calculateGrade(value);
                            return `Score: ${value.toFixed(1)}% (${grade})`;
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Subject Comparison Chart
function generateSubjectChart() {
    const ctx = document.getElementById('subject-chart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (charts.subject) {
        charts.subject.destroy();
    }
    
    const subjects = studentData.subjects;
    const labels = subjects.map(s => s.name);
    const data = subjects.map(s => s.percentage);
    
    // Generate colors based on performance
    const colors = data.map(percentage => {
        if (percentage >= 80) return '#7ED321'; // Green for excellent
        if (percentage >= 70) return '#4A90E2'; // Blue for good
        if (percentage >= 60) return '#F5A623'; // Orange for average
        return '#D0021B'; // Red for poor
    });
    
    charts.subject = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 4,
                hoverBorderColor: '#f8f9fa'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#333',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const dataset = data.datasets[0];
                                    const value = dataset.data[i];
                                    const color = dataset.backgroundColor[i];
                                    
                                    return {
                                        text: `${label}: ${value.toFixed(1)}%`,
                                        fillStyle: color,
                                        strokeStyle: color,
                                        lineWidth: 0,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const grade = calculateGrade(value);
                            return `${label}: ${value.toFixed(1)}% (${grade})`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Gemini API Integration
async function getGeminiRecommendations(data) {
    const recommendationsContainer = document.getElementById('recommendations-container');
    
    try {
        const prompt = createRecommendationPrompt(data);
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        const recommendations = parseRecommendations(result);
        displayRecommendations(recommendations);
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        displayFallbackRecommendations(data);
    }
}

// Create Recommendation Prompt
function createRecommendationPrompt(data) {
    const weakSubjects = data.subjects.filter(s => s.percentage < 70);
    const strongSubjects = data.subjects.filter(s => s.percentage >= 80);
    
    return `
Analyze this student's academic performance and provide personalized recommendations:

Student Data:
- Class: ${data.class}
- Board: ${data.board}
- Test Type: ${data.testType}
- Overall Performance: ${calculateOverallPerformance(data).overallPercentage}%

Subject Performance:
${data.subjects.map(s => `- ${s.name}: ${s.percentage.toFixed(1)}% (${s.grade})`).join('\n')}

Weak Subjects (below 70%):
${weakSubjects.map(s => `- ${s.name}: ${s.percentage.toFixed(1)}%`).join('\n')}

Strong Subjects (80%+):
${strongSubjects.map(s => `- ${s.name}: ${s.percentage.toFixed(1)}%`).join('\n')}

Please provide a JSON response with:
1. overallAssessment: Brief assessment of overall performance
2. weakSubjects: Array of subjects needing attention with specific improvement strategies
3. strongSubjects: Subjects to maintain and build upon
4. studyTips: 3-5 general study improvement tips
5. timeline: Suggested 4-week improvement plan
6. motivation: Encouraging message for the student

Format as valid JSON only, no additional text.
`;
}

// Parse Recommendations
function parseRecommendations(apiResponse) {
    try {
        const text = apiResponse.candidates[0].content.parts[0].text;
        // Clean the response text (remove markdown code blocks)
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Handle edge cases - sometimes the response might have extra whitespace or newlines
        cleanText = cleanText.replace(/^\s*/, '').replace(/\s*$/, '');
        
        console.log('Recommendations cleaned text:', cleanText); // Debug log
        
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error parsing recommendations:', error);
        console.error('Text that failed to parse:', cleanText);
        return null;
    }
}

// Display Recommendations
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');
    
    if (!recommendations) {
        displayFallbackRecommendations(studentData);
        return;
    }
    
    container.innerHTML = `
        <div class="recommendation-item">
            <h4><i class="fas fa-chart-line"></i> Overall Assessment</h4>
            <p>${recommendations.overallAssessment || 'Your child shows potential for improvement.'}</p>
        </div>
        
        ${recommendations.weakSubjects ? recommendations.weakSubjects.map(subject => `
            <div class="recommendation-item">
                <h4><i class="fas fa-exclamation-triangle"></i> ${subject.subject || subject.name || 'Subject'} - Needs Attention</h4>
                <div class="subject-details">
                    <p><strong>Current Score:</strong> ${subject.score || subject.percentage || 'N/A'}%</p>
                    <p><strong>Grade:</strong> ${subject.grade || 'N/A'}</p>
                </div>
                ${subject.improvementStrategies ? `
                    <div class="improvement-strategies">
                        <h5>Improvement Strategies:</h5>
                        <ul>
                            ${subject.improvementStrategies.map(strategy => `<li>${strategy}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${generateSubjectResources(subject.subject || subject.name)}
            </div>
        `).join('') : ''}
        
        ${recommendations.studyTips ? `
            <div class="recommendation-item">
                <h4><i class="fas fa-lightbulb"></i> Study Tips</h4>
                <ul>
                    ${recommendations.studyTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${recommendations.motivation ? `
            <div class="recommendation-item">
                <h4><i class="fas fa-heart"></i> Encouragement</h4>
                <p>${recommendations.motivation}</p>
            </div>
        ` : ''}
    `;
    
    // Add study calendar section
    addStudyCalendarSection();
}

// Generate subject-specific resources
function generateSubjectResources(subjectName) {
    if (!subjectName) return '';
    
    const resources = getSubjectResources(subjectName);
    
    return `
        <div class="subject-resources">
            <h5><i class="fas fa-book"></i> How Student AI will help you to improve ${subjectName}</h5>
            <div class="resource-grid">
                <div class="resource-item">
                    <h6><i class="fas fa-list-ol"></i> Important Topics</h6>
                    <ul>
                        ${resources.topics.map(topic => `<li>${topic}</li>`).join('')}
                    </ul>
                </div>
                <div class="resource-item">
                    <h6><i class="fas fa-flash"></i> Flashcards</h6>
                    <ul>
                        ${resources.flashcards.map(card => `<li>${card}</li>`).join('')}
                    </ul>
                </div>
                <div class="resource-item">
                    <h6><i class="fas fa-file-alt"></i> Worksheets</h6>
                    <ul>
                        ${resources.worksheets.map(worksheet => `<li>${worksheet}</li>`).join('')}
                    </ul>
                </div>
                <div class="resource-item">
                    <h6><i class="fas fa-clipboard-check"></i> Mock Practice</h6>
                    <ul>
                        ${resources.mockPractice.map(practice => `<li>${practice}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Get subject-specific resources
function getSubjectResources(subjectName) {
    const resourceMap = {
        'Mathematics': {
            topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'],
            flashcards: ['Formula cards', 'Problem-solving steps', 'Key concepts', 'Common mistakes'],
            worksheets: ['Practice problems', 'Previous year questions', 'Sample papers', 'Revision sheets'],
            mockPractice: ['Mock tests', 'Timed practice', 'Error analysis', 'Performance tracking']
        },
        'Science': {
            topics: ['Physics concepts', 'Chemistry reactions', 'Biology systems', 'Scientific method'],
            flashcards: ['Scientific terms', 'Formulas', 'Processes', 'Definitions'],
            worksheets: ['Lab reports', 'Problem sets', 'Concept maps', 'Review sheets'],
            mockPractice: ['Science quizzes', 'Experiment analysis', 'Concept application', 'Test simulations']
        },
        'English': {
            topics: ['Grammar rules', 'Literature analysis', 'Writing skills', 'Comprehension'],
            flashcards: ['Vocabulary words', 'Grammar rules', 'Literary devices', 'Writing tips'],
            worksheets: ['Grammar exercises', 'Essay prompts', 'Reading comprehension', 'Writing practice'],
            mockPractice: ['Writing tests', 'Reading tests', 'Grammar quizzes', 'Speaking practice']
        },
        'Social Science': {
            topics: ['History events', 'Geography concepts', 'Civics principles', 'Economics basics'],
            flashcards: ['Historical dates', 'Geographic facts', 'Government structure', 'Economic terms'],
            worksheets: ['Map exercises', 'Timeline activities', 'Case studies', 'Analysis sheets'],
            mockPractice: ['History quizzes', 'Geography tests', 'Civics assessments', 'Economics problems']
        },
        'Physics': {
            topics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
            flashcards: ['Physics formulas', 'Laws and principles', 'Units and dimensions', 'Problem-solving steps'],
            worksheets: ['Numerical problems', 'Conceptual questions', 'Lab exercises', 'Derivation practice'],
            mockPractice: ['Physics tests', 'Numerical practice', 'Concept application', 'Problem-solving drills']
        },
        'Chemistry': {
            topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Chemical reactions'],
            flashcards: ['Chemical formulas', 'Reaction mechanisms', 'Periodic table', 'Chemical properties'],
            worksheets: ['Balancing equations', 'Stoichiometry problems', 'Lab procedures', 'Chemical analysis'],
            mockPractice: ['Chemistry tests', 'Reaction practice', 'Problem solving', 'Concept application']
        },
        'Biology': {
            topics: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Biology'],
            flashcards: ['Biological terms', 'Processes and cycles', 'Classification', 'Anatomy diagrams'],
            worksheets: ['Diagram labeling', 'Process explanations', 'Case studies', 'Research analysis'],
            mockPractice: ['Biology tests', 'Diagram practice', 'Concept application', 'Research questions']
        }
    };
    
    return resourceMap[subjectName] || {
        topics: ['Fundamental concepts', 'Key principles', 'Important theories', 'Core applications'],
        flashcards: ['Key terms', 'Important concepts', 'Formulas and rules', 'Problem-solving steps'],
        worksheets: ['Practice exercises', 'Review sheets', 'Sample problems', 'Concept applications'],
        mockPractice: ['Practice tests', 'Mock exams', 'Skill assessments', 'Performance tracking']
    };
}

// Fallback Recommendations
function displayFallbackRecommendations(data) {
    const performance = calculateOverallPerformance(data);
    const container = document.getElementById('recommendations-container');
    
    container.innerHTML = `
        <div class="recommendation-item">
            <h4><i class="fas fa-chart-line"></i> Overall Assessment</h4>
            <p>Your child has achieved ${performance.overallPercentage}% overall performance. ${performance.overallPercentage >= 80 ? 'Excellent work!' : performance.overallPercentage >= 70 ? 'Good performance with room for improvement.' : 'Focus on improvement strategies.'}</p>
        </div>
        
        ${performance.weakSubjects.length > 0 ? `
            <div class="recommendation-item">
                <h4><i class="fas fa-exclamation-triangle"></i> Subjects Needing Attention</h4>
                <ul>
                    ${performance.weakSubjects.map(subject => `
                        <li><strong>${subject.name}</strong> (${subject.percentage.toFixed(1)}%): Focus on understanding fundamental concepts, practice regularly, and seek additional help if needed.</li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="recommendation-item">
            <h4><i class="fas fa-lightbulb"></i> General Study Tips</h4>
            <ul>
                <li>Create a consistent study schedule with dedicated time for each subject</li>
                <li>Practice active learning techniques like summarizing and teaching others</li>
                <li>Take regular breaks during study sessions to maintain focus</li>
                <li>Review and revise previous topics regularly</li>
                <li>Seek help from teachers or tutors for difficult concepts</li>
            </ul>
        </div>
        
        <div class="recommendation-item">
            <h4><i class="fas fa-heart"></i> Encouragement</h4>
            <p>Every student learns at their own pace. With consistent effort and the right strategies, improvement is always possible. Stay positive and keep working towards your goals!</p>
        </div>
    `;
}

// Calendar Functions
let currentCalendarView = 'weekly';
let studyCalendar = null;

function generateStudyCalendar(planType = 'weekly') {
    if (!studentData) return;
    
    currentCalendarView = planType;
    
    // Update button states
    document.querySelectorAll('.calendar-controls .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
    });
    
    // Highlight selected button
    const selectedBtn = document.querySelector(`[onclick="generateStudyCalendar('${planType}')"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('btn-outline');
        selectedBtn.classList.add('btn-primary');
    }
    
    const performance = calculateOverallPerformance(studentData);
    const weakSubjects = performance.weakSubjects;
    
    if (weakSubjects.length === 0) {
        showMessage('Great! No subjects need special attention. Focus on maintaining current performance.', 'success');
        return;
    }
    
    studyCalendar = createStudyPlan(weakSubjects, planType);
    displayCalendar();
    
    // Scroll to calendar section
    const calendarSection = document.getElementById('study-calendar-section');
    if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function createStudyPlan(weakSubjects, planType) {
    if (planType === 'weekly') {
        return createWeeklyPlan(weakSubjects);
    } else {
        return createMonthlyPlan(weakSubjects);
    }
}

function createWeeklyPlan(weakSubjects) {
    const plan = {
        type: 'weekly',
        days: []
    };
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, dayIndex) => {
        const dayPlan = {
            day: day,
            date: getDateForDay(dayIndex),
            subjects: [],
            revision: day === 'Sunday'
        };
        
        // Assign subjects to days (rotate through weak subjects)
        if (weakSubjects.length > 0) {
            const subjectIndex = dayIndex % weakSubjects.length;
            const subject = weakSubjects[subjectIndex];
            
            const resources = getSubjectResources(subject.name);
            
            dayPlan.subjects.push({
                name: subject.name,
                currentScore: subject.percentage,
                targetScore: Math.min(85, subject.percentage + 15),
                topics: resources.topics.slice(0, 3), // Top 3 important topics
                duration: '2 hours',
                priority: 'high',
                weightage: getTopicWeightage(subject.name)
            });
        }
        
        // Add revision day (Sunday)
        if (day === 'Sunday') {
            dayPlan.subjects.push({
                name: 'Weekly Revision',
                topics: ['Review all topics covered this week', 'Practice problems', 'Take mock test'],
                duration: '1.5 hours',
                priority: 'medium'
            });
        }
        
        plan.days.push(dayPlan);
    });
    
    return plan;
}

function createMonthlyPlan(weakSubjects) {
    const plan = {
        type: 'monthly',
        weeks: []
    };
    
    // Create 4-week plan
    for (let week = 1; week <= 4; week++) {
        const weekPlan = {
            weekNumber: week,
            days: [],
            focusSubjects: []
        };
        
        // Assign subjects to this week
        const subjectsPerWeek = Math.ceil(weakSubjects.length / 4);
        const startIndex = (week - 1) * subjectsPerWeek;
        const endIndex = Math.min(startIndex + subjectsPerWeek, weakSubjects.length);
        weekPlan.focusSubjects = weakSubjects.slice(startIndex, endIndex);
        
        // Create daily schedule (Monday to Sunday)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach((day, dayIndex) => {
            const dayPlan = {
                day: day,
                date: getDateForWeekDay(week, dayIndex),
                subjects: [],
                revision: day === 'Sunday'
            };
            
            // Assign subjects to days
            if (weekPlan.focusSubjects.length > 0) {
                const subjectIndex = dayIndex % weekPlan.focusSubjects.length;
                const subject = weekPlan.focusSubjects[subjectIndex];
                
                const resources = getSubjectResources(subject.name);
                
                dayPlan.subjects.push({
                    name: subject.name,
                    currentScore: subject.percentage,
                    targetScore: Math.min(85, subject.percentage + 15),
                    topics: resources.topics.slice(0, 2), // Top 2 important topics per day
                    duration: '1.5 hours',
                    priority: 'high',
                    weightage: getTopicWeightage(subject.name)
                });
            }
            
            // Add revision day (Sunday)
            if (day === 'Sunday') {
                dayPlan.subjects.push({
                    name: 'Weekly Revision',
                    topics: ['Review all topics covered this week', 'Practice problems', 'Take mock test'],
                    duration: '2 hours',
                    priority: 'medium'
                });
            }
            
            weekPlan.days.push(dayPlan);
        });
        
        plan.weeks.push(weekPlan);
    }
    
    return plan;
}

// Get topic weightage for subjects
function getTopicWeightage(subjectName) {
    const weightageMap = {
        'Mathematics': {
            'Algebra': 30,
            'Geometry': 25,
            'Trigonometry': 20,
            'Calculus': 15,
            'Statistics': 10
        },
        'Science': {
            'Physics concepts': 35,
            'Chemistry reactions': 35,
            'Biology systems': 30
        },
        'English': {
            'Grammar rules': 25,
            'Literature analysis': 30,
            'Writing skills': 25,
            'Comprehension': 20
        },
        'Social Science': {
            'History events': 30,
            'Geography concepts': 30,
            'Civics principles': 25,
            'Economics basics': 15
        },
        'Physics': {
            'Mechanics': 40,
            'Thermodynamics': 25,
            'Electromagnetism': 20,
            'Optics': 10,
            'Modern Physics': 5
        },
        'Chemistry': {
            'Organic Chemistry': 40,
            'Inorganic Chemistry': 30,
            'Physical Chemistry': 30
        },
        'Biology': {
            'Cell Biology': 25,
            'Genetics': 25,
            'Ecology': 20,
            'Human Physiology': 20,
            'Plant Biology': 10
        }
    };
    
    return weightageMap[subjectName] || {};
}

function generateTopicsForSubject(subjectName) {
    const topicMap = {
        'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Calculus'],
        'Science': ['Physics', 'Chemistry', 'Biology'],
        'English': ['Grammar', 'Literature', 'Writing Skills', 'Comprehension'],
        'Social Science': ['History', 'Geography', 'Civics', 'Economics'],
        'Hindi': ['व्याकरण', 'साहित्य', 'लेखन कौशल', 'बोध'],
        'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
        'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
        'Biology': ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology'],
        'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Database']
    };
    
    return topicMap[subjectName] || ['Fundamental Concepts', 'Practice Problems', 'Previous Year Questions'];
}

function getDateForDay(dayIndex) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayIndex);
    
    return targetDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
    });
}

function getDateForWeekDay(week, dayIndex) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    // Add weeks and days
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + (week - 1) * 7 + dayIndex);
    
    return targetDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
    });
}

function displayCalendar() {
    const container = document.getElementById('calendar-container');
    
    if (!studyCalendar) return;
    
    if (studyCalendar.type === 'weekly') {
        displayWeeklyView(container);
    } else {
        displayMonthlyView(container);
    }
}

function displayWeeklyView(container) {
    if (!studyCalendar || !studyCalendar.days) return;
    
    container.innerHTML = `
        <div class="weekly-calendar">
            <h3>1-Week Study Plan</h3>
            <div class="days-container">
                ${studyCalendar.days.map(day => `
                    <div class="day-card ${day.revision ? 'revision-day' : ''}">
                        <div class="day-header">
                            <h5>${day.day}</h5>
                            <span class="date">${day.date}</span>
                        </div>
                        <div class="day-content">
                            ${day.subjects.map(subject => `
                                <div class="subject-schedule">
                                    <div class="subject-info">
                                        <h6>${subject.name}</h6>
                                        ${subject.currentScore ? `
                                            <div class="score-progress">
                                                <span>Current: ${subject.currentScore.toFixed(1)}%</span>
                                                <span>Target: ${subject.targetScore}%</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="topics">
                                        ${subject.topics.map(topic => `
                                            <span class="topic-tag">
                                                ${topic}
                                                ${subject.weightage && subject.weightage[topic] ? 
                                                    `<span class="weightage">(${subject.weightage[topic]}%)</span>` : ''}
                                            </span>
                                        `).join('')}
                                    </div>
                                    <div class="duration">
                                        <i class="fas fa-clock"></i> ${subject.duration}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function displayMonthlyView(container) {
    if (!studyCalendar || !studyCalendar.weeks) return;
    
    const currentMonth = new Date().toLocaleDateString('en-IN', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    container.innerHTML = `
        <div class="monthly-calendar">
            <h3>1-Month Study Plan</h3>
            <div class="weeks-container">
                ${studyCalendar.weeks.map(week => `
                    <div class="week-card">
                        <div class="week-header">
                            <h4>Week ${week.weekNumber}</h4>
                            <div class="focus-subjects">
                                ${week.focusSubjects.map(subject => `
                                    <span class="subject-badge">${subject.name}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="days-container">
                            ${week.days.map(day => `
                                <div class="day-card ${day.revision ? 'revision-day' : ''}">
                                    <div class="day-header">
                                        <h5>${day.day}</h5>
                                        <span class="date">${day.date}</span>
                                    </div>
                                    <div class="day-content">
                                        ${day.subjects.map(subject => `
                                            <div class="subject-schedule">
                                                <div class="subject-info">
                                                    <h6>${subject.name}</h6>
                                                    ${subject.currentScore ? `
                                                        <div class="score-progress">
                                                            <span>Current: ${subject.currentScore.toFixed(1)}%</span>
                                                            <span>Target: ${subject.targetScore}%</span>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                <div class="topics">
                                                    ${subject.topics.map(topic => `
                                                        <span class="topic-tag">
                                                            ${topic}
                                                            ${subject.weightage && subject.weightage[topic] ? 
                                                                `<span class="weightage">(${subject.weightage[topic]}%)</span>` : ''}
                                                        </span>
                                                    `).join('')}
                                                </div>
                                                <div class="duration">
                                                    <i class="fas fa-clock"></i> ${subject.duration}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Utility Functions
function scrollToInput() {
    document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
}

function showLoadingOverlay(text = 'Processing...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = text;
    overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${getMessageIcon(type)}"></i>
        <span>${message}</span>
        <button class="message-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(messageDiv);
    
    // Auto remove after 7 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 7000);
}

function getMessageIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}



// Add Study Calendar Section
function addStudyCalendarSection() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && !document.getElementById('study-calendar-section')) {
        const calendarSection = document.createElement('div');
        calendarSection.id = 'study-calendar-section';
        calendarSection.className = 'study-calendar-section';
        calendarSection.innerHTML = `
            <div class="container">
                <h2 class="section-title">Study Calendar</h2>
                <div class="calendar-controls">
                    <button class="btn btn-outline" onclick="generateStudyCalendar('weekly')">
                        <i class="fas fa-calendar-week"></i> 1 Week Plan
                    </button>
                    <button class="btn btn-outline" onclick="generateStudyCalendar('monthly')">
                        <i class="fas fa-calendar-alt"></i> 1 Month Plan
                    </button>
                </div>
                <div class="calendar-container" id="calendar-container">
                    <div class="calendar-placeholder">
                        <i class="fas fa-calendar-alt"></i>
                        <h3>Choose a Study Plan</h3>
                        <p>Select 1 Week or 1 Month plan to generate a personalized study calendar for weak subjects.</p>
                    </div>
                </div>
            </div>
        `;
        dashboard.appendChild(calendarSection);
    }
}

// Export functions for global access
window.switchTab = switchTab;
window.scrollToInput = scrollToInput;
window.toggleCalendarView = toggleCalendarView;
window.showFAQ = showFAQ;
window.generateStudyCalendar = generateStudyCalendar;
window.loadDemoData = loadDemoData;
window.addNewSubject = addNewSubject;
window.removeSubject = removeSubject;
window.updateSubjectCount = updateSubjectCount;
