// Gradebook Prototype - JavaScript Core Functions
// API Configuration
const GEMINI_API_KEY = 'AIzaSyBIbJ3GZqfZdVlzDgIezdgwrKp51s62jv0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const SYLLABUS_API_URL = 'https://studentaiadmin.vercel.app/api/public-syllabus';

// Global Variables
let studentData = null;
let charts = {};
let subjectResourcesCache = {}; // Cache for subject resources
let syllabusData = null; // Store fetched syllabus data

// Subject configurations for different classes (fallback when API data is not available)
const subjectConfigs = {
    '1': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '2': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '3': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '4': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '5': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '6': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
    '7': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
    '8': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
    '9': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
    '10': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
    '11': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
    '12': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupFileUpload();
    setupClassSelection();
    
    // Initialize upload area as disabled
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.classList.add('disabled');
    }
    
    // Pre-load sample subjects in manual entry section for instant access
    preloadSampleSubjects();
    
}

// Load Demo Data
function loadDemoData() {
    const demoData = {
        class: '10',
        board: 'cbse',
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
}

// Event Listeners Setup
function setupEventListeners() {
    // Form submission
    const manualForm = document.getElementById('manual-form');
    if (manualForm) {
        manualForm.addEventListener('submit', handleManualEntry);
    }

    // Shared class and board selection
    const classSelect = document.getElementById('class-select');
    const boardSelect = document.getElementById('board-select');
    if (classSelect) {
        classSelect.addEventListener('change', handleSharedSelection);
    }
    if (boardSelect) {
        boardSelect.addEventListener('change', handleSharedSelection);
    }

    // File input change
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

// Pre-load Sample Subjects on Page Load
function preloadSampleSubjects() {
    // Only preload if manual entry section is not visible
    const manualEntrySection = document.getElementById('manual-entry-section');
    if (manualEntrySection && manualEntrySection.style.display !== 'none') {
        console.log('Manual entry section is visible, skipping preload');
        return;
    }
    
    // Load common subjects that work for most classes
    const commonSubjects = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'];
    
    console.log('Preloading sample subjects:', commonSubjects);
    
    // Generate subject inputs immediately in the hidden manual entry section
    generateSubjectInputs(commonSubjects);
}

// Load Subjects Immediately (No API Wait)
function loadSubjectsImmediately(classValue) {
    // Get subjects from predefined configs immediately
    const subjects = subjectConfigs[classValue] || ['Mathematics', 'Science', 'English', 'Social Science'];
    
    console.log('Loading subjects for class:', classValue, 'Subjects:', subjects);
    
    // Generate subject inputs immediately
    generateSubjectInputs(subjects);
}

// Clear Dashboard and Reset State Function
function clearDashboardAndResetState() {
    // Clear global student data
    studentData = null;
    
    // Hide dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
    }
    
    // Clear dashboard content
    clearDashboardContent();
    
    // Clear any existing charts
    if (charts.performance) {
        charts.performance.destroy();
        charts.performance = null;
    }
    if (charts.subject) {
        charts.subject.destroy();
        charts.subject = null;
    }
    
    // Clear file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Reset upload progress
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    if (uploadProgress) {
        uploadProgress.style.display = 'none';
    }
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Show upload area
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
}

// Navigation Functions
function showManualEntry() {
    // Check if class and board are selected first
    const classValue = document.getElementById('class-select').value;
    const boardValue = document.getElementById('board-select').value;
    
    if (!classValue || !boardValue) {
        // Show validation errors
        validateClassAndBoard();
        
        // Show user-friendly message
        showMessage('Please select both class and board before entering grades manually.', 'error');
        
        // Scroll to the selection form to make it visible
        setTimeout(() => {
            document.querySelector('.shared-selection-form').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
        
        return;
    }
    
    // Clear dashboard and reset state
    clearDashboardAndResetState();
    
    // Hide upload section
    document.querySelector('.upload-section').style.display = 'none';
    
    // Update subjects to match selected class BEFORE showing the section
    loadSubjectsImmediately(classValue);
    
    // Show manual entry section after subjects are loaded
    document.getElementById('manual-entry-section').style.display = 'block';
    
    
    // Scroll to manual entry section
    setTimeout(() => {
        document.getElementById('manual-entry-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

function showUploadSection() {
    // Clear dashboard and reset state
    clearDashboardAndResetState();
    
    // Hide manual entry section
    document.getElementById('manual-entry-section').style.display = 'none';
    
    // Show upload section
    document.querySelector('.upload-section').style.display = 'block';
    
    // Scroll to upload section
    setTimeout(() => {
        document.querySelector('.upload-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

// File Upload Setup
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadLink = document.querySelector('.upload-link');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        // Check if upload area is disabled
        if (uploadArea.classList.contains('disabled')) {
            // Show validation errors
            validateClassAndBoard();
            
            // Show user-friendly message
            showMessage('Please select both class and board before uploading your marksheet.', 'error');
            
            // Scroll to the selection form to make it visible
            setTimeout(() => {
                document.querySelector('.shared-selection-form').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
            
            return;
        }
        fileInput.click();
    });
    uploadLink.addEventListener('click', (e) => {
        e.stopPropagation();
        // Check if upload area is disabled
        if (uploadArea.classList.contains('disabled')) {
            // Show validation errors
            validateClassAndBoard();
            
            // Show user-friendly message
            showMessage('Please select both class and board before uploading your marksheet.', 'error');
            
            // Scroll to the selection form to make it visible
            setTimeout(() => {
                document.querySelector('.shared-selection-form').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
            
            return;
        }
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

// Fetch Syllabus Data from API
async function fetchSyllabusData(board, grade) {
    try {
        console.log(`Fetching syllabus data for board: ${board}, grade: ${grade}`);
       
        
        const response = await fetch(`${SYLLABUS_API_URL}?board=${board}&grade=${grade}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Syllabus data fetched successfully:', data);
        
        // Log detailed subject information
        if (data.board && data.board.subjects) {
            console.log('Subjects found in syllabus:');
            data.board.subjects.forEach((subject, index) => {
                console.log(`${index + 1}. ${subject.name} - ${subject.chapters?.length || 0} chapters`);
                if (subject.chapters) {
                    subject.chapters.forEach((chapter, chIndex) => {
                        console.log(`   ${chIndex + 1}. ${chapter.name} (${chapter.marks || 'no marks'})`);
                    });
                }
            });
        }
        
        // Store the fetched data globally
        syllabusData = data;
        
        
        return data;
    } catch (error) {
        console.error('Error fetching syllabus data:', error);
        return null;
    }
}

// Show Error Message
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    console.log('showFieldError called:', { fieldId, message });
    console.log('Field found:', !!field, 'Error element found:', !!errorElement);
    
    if (field && errorElement) {
        // Add error class to field
        field.classList.add('error');
        
        // Show error message
        errorElement.style.display = 'flex';
        const spanElement = errorElement.querySelector('span');
        if (spanElement) {
            spanElement.textContent = message;
        }
        
        console.log('Error message should be visible now');
    } else {
        console.error('Could not find field or error element:', { fieldId, field: !!field, errorElement: !!errorElement });
    }
}

// Hide Error Message
function hideFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field && errorElement) {
        // Remove error class from field
        field.classList.remove('error');
        
        // Hide error message
        errorElement.style.display = 'none';
    }
}

// Test function to manually show errors (for debugging)
function testErrorMessages() {
    console.log('Testing error messages...');
    showFieldError('class-select', 'Test class error message');
    showFieldError('board-select', 'Test board error message');
}

// Validate Class and Board Selection
function validateClassAndBoard() {
    const classValue = document.getElementById('class-select').value;
    const boardValue = document.getElementById('board-select').value;
    let isValid = true;
    
    console.log('validateClassAndBoard called with:', { classValue, boardValue });
    
    // Clear previous errors
    hideFieldError('class-select');
    hideFieldError('board-select');
    
    // Validate class
    if (!classValue) {
        console.log('Showing class error');
        showFieldError('class-select', 'Please select a class from the list.');
        isValid = false;
    }
    
    // Validate board
    if (!boardValue) {
        console.log('Showing board error');
        showFieldError('board-select', 'Please select a board from the list.');
        isValid = false;
    }
    
    console.log('Validation complete, isValid:', isValid);
    return isValid;
}

// Handle Shared Selection
async function handleSharedSelection() {
    const classValue = document.getElementById('class-select').value;
    const boardValue = document.getElementById('board-select').value;
    const uploadArea = document.getElementById('upload-area');
    
    // Clear any existing errors when user makes a selection
    if (classValue) {
        hideFieldError('class-select');
    }
    if (boardValue) {
        hideFieldError('board-select');
    }
    
    if (classValue && boardValue) {
        // Both class and board are selected, enable upload area
        uploadArea.classList.remove('disabled');
        
        // Fetch syllabus data from API
        await fetchSyllabusData(boardValue, classValue);
                
        // Update manual entry subjects if manual entry is visible (immediate, no API wait)
        if (document.getElementById('manual-entry-section').style.display !== 'none') {
            console.log('Updating subjects in manual entry section for class:', classValue);
            loadSubjectsImmediately(classValue);
        }
    } else {
        // Disable upload area if either is not selected
        uploadArea.classList.add('disabled');
    }
}

// File Upload Handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate class and board selection first
    if (!validateClassAndBoard()) {
        return;
    }

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
                    
                    
                    processStudentData(extractedData);
                } catch (error) {
                    console.error('Error processing image:', error);
                    
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
        
        // Process the extracted data - use selected class and board if available
        const selectedClass = document.getElementById('class-select').value;
        const selectedBoard = document.getElementById('board-select').value;
        
        return {
            class: selectedClass || extractedData.class,
            board: selectedBoard || extractedData.board,
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
    // Get selected class and board from shared form
    const selectedClass = document.getElementById('class-select').value;
    const selectedBoard = document.getElementById('board-select').value;
    
    // Use selected values or fallback to defaults
    const classValue = selectedClass || '10';
    const boardValue = selectedBoard || 'cbse';
    
    // Get subjects for the selected class
    const subjects = subjectConfigs[classValue] || ['Mathematics', 'Science', 'English'];
    
    // Generate mock marks for each subject
    const subjectsWithMarks = subjects.map(subject => {
        const marks = Math.floor(Math.random() * 30) + 60; // 60-90 range
        return {
            name: subject,
            marks: marks,
            total: 100,
            percentage: marks,
            grade: calculateGrade(marks)
        };
    });
    
    return {
        class: classValue,
        board: boardValue,
        testType: 'Mid-term',
        date: new Date().toISOString().split('T')[0],
        subjects: subjectsWithMarks
    };
}

// Generate Mock Grades (kept for demo button)
function generateMockGrades() {
    const classes = ['9', '10', '11', '12'];
    const boards = ['cbse', 'ap', 'telangana'];
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
    const selectedBoard = document.getElementById('board-select').value;
    
    if (selectedClass && selectedBoard) {
        // Use syllabus data from API if available, otherwise fallback to subjectConfigs
        let subjects = [];
        
        if (syllabusData && syllabusData.board && syllabusData.board.subjects) {
            // Extract subject names from API data
            subjects = syllabusData.board.subjects.map(subject => subject.name);
        } else if (subjectConfigs[selectedClass]) {
            // Fallback to predefined subjects
            subjects = subjectConfigs[selectedClass];
        }
        
        if (subjects.length > 0) {
            generateSubjectInputs(subjects);
        }
    }
}

// Generate Subject Input Fields
function generateSubjectInputs(subjects) {
    const container = document.getElementById('subjects-container');
    
    // Clear container completely to prevent duplicates
    container.innerHTML = '';
    
    // Validate subjects array
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        console.warn('No subjects provided to generateSubjectInputs');
        return;
    }
    
    console.log('Generating subject inputs for:', subjects);
    
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
                   placeholder="Your Marks" min="0" max="100" step="0.1" required>
        </div>
        <div class="form-group">
            <input type="number" name="subject_total_${index || Date.now()}" 
                   placeholder="Total Marks" min="1" value="100" required>
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
    
    // Validate class and board selection first
    if (!validateClassAndBoard()) {
        return;
    }
    
    // Get class and board from shared dropdowns
    const classValue = document.getElementById('class-select').value;
    const boardValue = document.getElementById('board-select').value;
    
    const studentData = {
        class: classValue,
        board: boardValue,
        testType: 'Manual Entry',
        date: new Date().toISOString().split('T')[0],
        subjects: []
    };
    
    // Extract subject data from dynamic form
    const subjectItems = document.querySelectorAll('.subject-item');
    let hasValidData = false;
    
    subjectItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const marksInput = item.querySelector('input[placeholder="Your Marks"]');
        const totalInput = item.querySelector('input[placeholder="Total Marks"]');
        
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
    
    // Process the data the same way as uploaded images
    processStudentData(studentData);
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
    
    // Auto-scroll to results section instead of input section
    setTimeout(() => {
        document.getElementById('dashboard').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 300);
    
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
        
        ${studentData.subjects.map(subject => {
            const marks = subject.percentage;
            const isWeak = marks < 70;
            const attentionText = isWeak ? 'Needs Attention' : 'Excellence Suggestions';
            const iconClass = isWeak ? 'fas fa-exclamation-triangle' : 'fas fa-star';
            const accordionId = `accordion-${subject.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            
            return `
            <div class="recommendation-accordion">
                <div class="accordion-header" onclick="toggleAccordion('${accordionId}')">
                    <h4><i class="${iconClass}"></i> ${subject.name} - ${attentionText}</h4>
                    <div class="accordion-toggle">
                        <i class="fas fa-chevron-down accordion-icon" id="icon-${accordionId}"></i>
                    </div>
                </div>
                <div class="accordion-content" id="${accordionId}" style="display: none;">
                    <div class="subject-details">
                        <p><strong>Current Score:</strong> ${subject.percentage.toFixed(1)}%</p>
                        <p><strong>Grade:</strong> ${subject.grade}</p>
                    </div>
                    <div class="subject-resources-loading" data-subject="${subject.name}">
                        <i class="fas fa-spinner fa-spin"></i> Loading study resources...
                    </div>
                </div>
            </div>
        `;
        }).join('')}
    `;
    
    // Add study calendar section
    addStudyCalendarSection();
    
    // Debug subject matching
    debugSubjectMatching();
    
    // Load subject resources asynchronously for all subjects
    studentData.subjects.forEach(async (subject) => {
        await loadRecommendationSubjectResources(subject.name);
    });
}



// Toggle Accordion Function
function toggleAccordion(accordionId) {
    const content = document.getElementById(accordionId);
    const icon = document.getElementById(`icon-${accordionId}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
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
        
        ${data.subjects.map(subject => {
            const marks = subject.percentage;
            const isWeak = marks < 70;
            const attentionText = isWeak ? 'Needs Attention' : 'Excellence Suggestions';
            const iconClass = isWeak ? 'fas fa-exclamation-triangle' : 'fas fa-star';
            const accordionId = `accordion-${subject.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            
            return `
            <div class="recommendation-accordion">
                <div class="accordion-header" onclick="toggleAccordion('${accordionId}')">
                    <h4><i class="${iconClass}"></i> ${subject.name} - ${attentionText}</h4>
                    <div class="accordion-toggle">
                        <i class="fas fa-chevron-down accordion-icon" id="icon-${accordionId}"></i>
                    </div>
                </div>
                <div class="accordion-content" id="${accordionId}" style="display: none;">
                    <div class="subject-details">
                        <p><strong>Current Score:</strong> ${subject.percentage.toFixed(1)}%</p>
                        <p><strong>Grade:</strong> ${subject.grade}</p>
                    </div>
                    <div class="fallback-recommendation">
                        <p><strong>${subject.name}</strong> (${subject.percentage.toFixed(1)}%): Focus on understanding fundamental concepts, practice regularly, and seek additional help if needed.</p>
                    </div>
                </div>
            </div>
        `;
        }).join('')}
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
            
            // Note: Resources will be loaded asynchronously in display functions
            dayPlan.subjects.push({
                name: subject.name,
                currentScore: subject.percentage,
                targetScore: Math.min(85, subject.percentage + 15),
                duration: '2 hours',
                priority: 'high',
                weightage: getTopicWeightage(subject.name)
            });
        }
        
        // Sunday is for rest/revision - no additional subjects needed
        
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
        
        // Assign subjects to this week (ensure all weeks get at least one subject)
        if (weakSubjects.length <= 4) {
            // If 4 or fewer subjects, assign one subject per week
            if (week <= weakSubjects.length) {
                weekPlan.focusSubjects = [weakSubjects[week - 1]];
            } else {
                // For weeks beyond available subjects, cycle through subjects
                const subjectIndex = (week - 1) % weakSubjects.length;
                weekPlan.focusSubjects = [weakSubjects[subjectIndex]];
            }
        } else {
            // If more than 4 subjects, distribute evenly
            const subjectsPerWeek = Math.ceil(weakSubjects.length / 4);
            const startIndex = (week - 1) * subjectsPerWeek;
            const endIndex = Math.min(startIndex + subjectsPerWeek, weakSubjects.length);
            weekPlan.focusSubjects = weakSubjects.slice(startIndex, endIndex);
        }
        
        console.log(`Week ${week}:`, {
            totalSubjects: weakSubjects.length,
            focusSubjects: weekPlan.focusSubjects.map(s => s.name)
        });
        
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
                
                // Note: Resources will be loaded asynchronously in display functions
                dayPlan.subjects.push({
                    name: subject.name,
                    currentScore: subject.percentage,
                    targetScore: Math.min(85, subject.percentage + 15),
                    duration: '1.5 hours',
                    priority: 'high',
                    weightage: getTopicWeightage(subject.name)
                });
            }
            
            // Sunday is for rest/revision - no additional subjects needed
            
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
                                <div class="subject-schedule" data-subject="${subject.name}">
                                    <div class="subject-info">
                                        <h6>${subject.name}</h6>
                                        ${subject.currentScore ? `
                                            <div class="score-progress">
                                                <span>Current: ${subject.currentScore.toFixed(1)}%</span>
                                                <span>Target: ${subject.targetScore}%</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="loading-content">
                                        <!-- Content will be loaded from cache -->
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
    
    // Load resources for each subject (using cached data - no API calls)
    for (const day of studyCalendar.days) {
        for (const subject of day.subjects) {
            if (subject.name !== 'Weekly Revision') {
                loadSubjectResources(subject.name);
            }
        }
    }
}

// Filter out non-academic chapters
function filterAcademicChapters(chapters) {
    const nonAcademicKeywords = [
        'internal assessment', 'practical work', 'practical', 'project work', 'project mark',
        'project', 'assessment', 'internal', 'practical exam', 'viva', 'oral', 'lab work',
        'laboratory work', 'field work', 'assignment', 'homework', 'class work',
        'continuous assessment', 'formative assessment', 'summative assessment',
        'term work', 'record work', 'journal', 'notebook', 'portfolio'
    ];
    
    return chapters.filter(chapter => {
        const chapterName = chapter.name.toLowerCase();
        return !nonAcademicKeywords.some(keyword => chapterName.includes(keyword));
    });
}

// Determine chapter importance from syllabus data
function getChapterImportance(subjectName) {
    console.log('Getting chapters for subject:', subjectName);
    console.log('Syllabus data available:', !!syllabusData);
    console.log('Syllabus subjects:', syllabusData?.board?.subjects?.map(s => s.name));
    
    if (!syllabusData || !syllabusData.board || !syllabusData.board.subjects) {
        console.log('No syllabus data available, using fallback chapters');
        return getFallbackChapters(subjectName);
    }
    
    // Clean subject name for better matching
    const cleanSubjectName = subjectName.toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    console.log('Cleaned subject name:', cleanSubjectName);
    
    // Try multiple matching strategies
    let subject = null;
    
    // 1. Exact match
    subject = syllabusData.board.subjects.find(s => 
        s.name.toLowerCase() === subjectName.toLowerCase()
    );
    console.log('Exact match result:', subject?.name);
    
    // 2. Clean exact match
    if (!subject) {
        subject = syllabusData.board.subjects.find(s => {
            const cleanSyllabusName = s.name.toLowerCase()
                .replace(/[&]/g, 'and')
                .replace(/[()]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            return cleanSyllabusName === cleanSubjectName;
        });
        console.log('Clean exact match result:', subject?.name);
    }
    
    // 3. Contains match (either direction)
    if (!subject) {
        subject = syllabusData.board.subjects.find(s => {
            const cleanSyllabusName = s.name.toLowerCase()
                .replace(/[&]/g, 'and')
                .replace(/[()]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            return cleanSyllabusName.includes(cleanSubjectName) || 
                   cleanSubjectName.includes(cleanSyllabusName);
        });
        console.log('Contains match result:', subject?.name);
    }
    
    // 4. Word-based matching (for cases like "Science & Technology" vs "Science")
    if (!subject) {
        const subjectWords = cleanSubjectName.split(' ').filter(word => word.length > 2);
        subject = syllabusData.board.subjects.find(s => {
            const cleanSyllabusName = s.name.toLowerCase()
                .replace(/[&]/g, 'and')
                .replace(/[()]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            const syllabusWords = cleanSyllabusName.split(' ').filter(word => word.length > 2);
            
            // Check if any significant words match
            return subjectWords.some(word => syllabusWords.includes(word)) ||
                   syllabusWords.some(word => subjectWords.includes(word));
        });
        console.log('Word-based match result:', subject?.name);
    }
    
    // 5. Composite subject matching (for cases like "SOCIAL SCIENCES" = "History and Political science" + "Geography")
    if (!subject) {
        const compositeSubjects = {
            'social sciences': ['history', 'political', 'geography', 'civics', 'economics'],
            'social science': ['history', 'political', 'geography', 'civics', 'economics'],
            'science': ['physics', 'chemistry', 'biology', 'environmental'],
            'languages': ['hindi', 'marathi', 'english', 'sanskrit']
        };
        
        const compositeKey = Object.keys(compositeSubjects).find(key => 
            cleanSubjectName.includes(key)
        );
        
        if (compositeKey) {
            const keywords = compositeSubjects[compositeKey];
            const matchingSubjects = syllabusData.board.subjects.filter(s => {
                const cleanSyllabusName = s.name.toLowerCase()
                    .replace(/[&]/g, 'and')
                    .replace(/[()]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                // Check if syllabus subject contains any of the keywords
                return keywords.some(keyword => cleanSyllabusName.includes(keyword));
            });
            
            if (matchingSubjects.length > 0) {
                // For composite subjects, combine chapters from all matching subjects
                console.log('Composite subject match found:', matchingSubjects.map(s => s.name));
                return getCompositeChapters(matchingSubjects, subjectName);
            }
        }
    }
    
    console.log('Final matched subject:', subject);
    
    if (!subject || !subject.chapters) {
        console.log('No chapters found for subject, using fallback');
        console.log('Available subjects in syllabus:', syllabusData.board.subjects.map(s => s.name));
        return getFallbackChapters(subjectName);
    }
    
    console.log('Found chapters:', subject.chapters.length);
    
    // Process chapters and assign importance
    const allChapters = subject.chapters.map((chapter, index) => {
        let importance = 0;
        
        if (chapter.marks) {
            // Use actual marks if available
            importance = parseInt(chapter.marks) || 0;
        } else {
            // Assign importance based on position (first chapters are usually more important)
            importance = Math.max(1, subject.chapters.length - index);
        }
        
        return {
            name: chapter.name,
            marks: chapter.marks || null,
            importance: importance
        };
    });
    
    // Filter out non-academic chapters
    const academicChapters = filterAcademicChapters(allChapters);
    
    console.log('Original chapters:', allChapters.length, 'Filtered chapters:', academicChapters.length);
    
    // Sort by importance (higher importance first)
    return academicChapters.sort((a, b) => b.importance - a.importance);
}

// Get composite chapters from multiple subjects
function getCompositeChapters(matchingSubjects, subjectName) {
    console.log('Getting composite chapters for:', subjectName);
    console.log('Matching subjects:', matchingSubjects.map(s => s.name));
    
    let allChapters = [];
    
    matchingSubjects.forEach((subject, subjectIndex) => {
        if (subject.chapters) {
            subject.chapters.forEach((chapter, chapterIndex) => {
                let importance = 0;
                
                if (chapter.marks) {
                    importance = parseInt(chapter.marks) || 0;
                } else {
                    // Assign importance based on subject priority and chapter position
                    // First subject gets higher priority
                    importance = (matchingSubjects.length - subjectIndex) * 100 + (subject.chapters.length - chapterIndex);
                }
                
                allChapters.push({
                    name: chapter.name,
                    marks: chapter.marks || null,
                    importance: importance,
                    sourceSubject: subject.name
                });
            });
        }
    });
    
    // Filter out non-academic chapters
    const academicChapters = filterAcademicChapters(allChapters);
    
    // Sort by importance (higher importance first)
    academicChapters.sort((a, b) => b.importance - a.importance);
    
    console.log('Composite chapters found:', allChapters.length, 'Filtered chapters:', academicChapters.length);
    return academicChapters;
}

// Fallback chapters when syllabus data is not available
function getFallbackChapters(subjectName) {
    console.log('Using fallback chapters for:', subjectName);
    
    const fallbackChapters = {
        'marathi': ['व्याकरण', 'साहित्य', 'लेखन कौशल', 'बोध', 'कविता', 'निबंध'],
        'hindi': ['व्याकरण', 'साहित्य', 'लेखन कौशल', 'बोध', 'कविता', 'निबंध'],
        'english': ['Grammar', 'Literature', 'Writing Skills', 'Comprehension', 'Poetry', 'Essay'],
        'mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus', 'Arithmetic'],
        'science': ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
        'social science': ['History', 'Geography', 'Civics', 'Economics', 'Political Science'],
        'social sciences': ['History', 'Geography', 'Civics', 'Economics', 'Political Science']
    };
    
    const subjectKey = subjectName.toLowerCase();
    const chapters = fallbackChapters[subjectKey] || fallbackChapters[subjectKey.replace(/\s+/g, '')] || ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'];
    
    console.log('Fallback chapters selected:', chapters);
    
    // Convert to chapter objects and filter
    const chapterObjects = chapters.map((chapter, index) => ({
        name: chapter,
        marks: null,
        importance: chapters.length - index
    }));
    
    // Apply the same filter to fallback chapters
    const filteredChapters = filterAcademicChapters(chapterObjects);
    
    console.log('Fallback chapters filtered:', filteredChapters.length);
    return filteredChapters;
}

// Debug function to test subject matching
function debugSubjectMatching() {
    if (!syllabusData || !syllabusData.board || !syllabusData.board.subjects) {
        console.log('No syllabus data available for debugging');
        return;
    }
    
    console.log('=== SUBJECT MATCHING DEBUG ===');
    console.log('Available subjects in syllabus:');
    syllabusData.board.subjects.forEach((subject, index) => {
        console.log(`${index + 1}. "${subject.name}" (${subject.chapters?.length || 0} chapters)`);
    });
    
    console.log('\nStudent subjects:');
    if (studentData && studentData.subjects) {
        studentData.subjects.forEach((subject, index) => {
            console.log(`${index + 1}. "${subject.name}"`);
        });
    }
    
    console.log('\n=== MATCHING TEST ===');
    if (studentData && studentData.subjects) {
        studentData.subjects.forEach(studentSubject => {
            const chapters = getChapterImportance(studentSubject.name);
            console.log(`"${studentSubject.name}" -> ${chapters.length} chapters found`);
        });
    }
}

// Get improvement strategy based on student marks
function getImprovementStrategy(studentMarks) {
    if (studentMarks < 30) {
        return {
            chapterPercentage: 90,
            pyqCount: 6,
            strategy: 'Comprehensive coverage needed'
        };
    } else if (studentMarks < 45) {
        return {
            chapterPercentage: 50,
            pyqCount: 3,
            strategy: 'Moderate focus required'
        };
    } else if (studentMarks < 70) {
        return {
            chapterPercentage: 20,
            pyqCount: 2,
            strategy: 'Targeted improvement'
        };
    } else {
        return {
            chapterPercentage: 10,
            pyqCount: 1,
            strategy: 'Some suggestions for excellence'
        };
    }
}

// Generate PYQs using Gemini
async function generatePYQs(subjectName, chapterNames, count) {
    try {
        const prompt = `
        Generate ${count} important Previous Year Questions (PYQs) for the subject "${subjectName}" focusing on these chapters: ${chapterNames.join(', ')}.
        
        IMPORTANT: 
        - Generate questions in the same language as the subject name
        - If subject is in English, generate in English
        - If subject is in Hindi/other language, generate in that language
        - Do not mix languages in the same question
        
        Return a JSON array with this format:
        [
            {
                "question": "Question text here in subject language only",
                "chapter": "Chapter name"
            }
        ]
        
        Make sure questions are relevant to the specified chapters and in the correct language.
        `;
        
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
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        
        // Clean and parse JSON
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        cleanText = cleanText.replace(/^\s*/, '').replace(/\s*$/, '');
        
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error generating PYQs:', error);
        // Fallback PYQs
        return chapterNames.slice(0, count).map((chapter, index) => ({
            question: `Important question from ${chapter} chapter`,
            chapter: chapter
        }));
    }
}

// Load subject resources for recommendations
async function loadRecommendationSubjectResources(subjectName) {
    console.log('Loading resources for subject:', subjectName);
    const loadingElement = document.querySelector(`[data-subject="${subjectName}"]`);
    
    if (!loadingElement) {
        console.log('No loading element found for subject:', subjectName);
        return;
    }
    
    // Find the student's marks for this subject
    const studentSubject = studentData.subjects.find(s => 
        s.name.toLowerCase() === subjectName.toLowerCase()
    );
    
    if (!studentSubject) {
        console.log('No student subject found for:', subjectName);
        return;
    }
    
    console.log('Student subject found:', studentSubject);
    
    const studentMarks = studentSubject.percentage;
    const strategy = getImprovementStrategy(studentMarks);
    const chapters = getChapterImportance(subjectName);
    
    console.log('Strategy:', strategy);
    console.log('Chapters found:', chapters);
    
    // Calculate number of chapters to show
    const chapterCount = Math.max(1, Math.ceil((chapters.length * strategy.chapterPercentage) / 100));
    const importantChapters = chapters.slice(0, chapterCount);
    
    console.log('Important chapters to show:', importantChapters);
    
    // Generate PYQs
    const pyqs = await generatePYQs(subjectName, importantChapters.map(c => c.name), strategy.pyqCount);
    console.log('Generated PYQs:', pyqs);
    
    // Create improvement strategies HTML
    const improvementStrategiesHTML = `
        <div class="improvement-strategies">
            <h5><i class="fas fa-target"></i> Improvement Strategies</h5>
            <div class="strategy-info">
                <span class="strategy-badge">${strategy.strategy}</span>
            </div>
            
            <div class="chapters-section">
                <div class="chapters-list">
                    ${importantChapters.map((chapter, index) => `
                        <div class="chapter-item">
                            <span class="chapter-number">${index + 1}</span>
                            <span class="chapter-name">${chapter.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="pyqs-section">
                <div class="pyqs-list">
                    ${pyqs.map((pyq, index) => `
                        <div class="pyq-item">
                            <div class="pyq-question">${pyq.question}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Create Student AI help HTML (moved to second position)
    const studentAIHelpHTML = `
        <div class="student-ai-help">
            <h5><i class="fas fa-robot"></i> How Student AI will help you to improve ${subjectName}</h5>
            <div class="single-feature-line">
                <i class="fas fa-check-circle"></i>
                <span>Use Student AI's Practice Tests, Flashcards, Topic Explanations & Worksheets</span>
            </div>
        </div>
    `;
    
    // Combine both sections
    loadingElement.innerHTML = `
        <div class="subject-resources">
            ${improvementStrategiesHTML}
            ${studentAIHelpHTML}
        </div>
    `;
    
    console.log('Content loaded for subject:', subjectName);
}

// Load subject resources and update the display (for calendar - uses cached data)
function loadSubjectResources(subjectName) {
    const subjectElements = document.querySelectorAll(`[data-subject="${subjectName}"]`);
    
    subjectElements.forEach(element => {
        const loadingElement = element.querySelector('.loading-content');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="study-content">
                    <div class="single-feature-line">
                        <i class="fas fa-check-circle"></i>
                        <span>Use Student AI's Practice Tests, Flashcards, Topic Explanations & Worksheets</span>
                    </div>
                </div>
            `;
        }
    });
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
                                            <div class="subject-schedule" data-subject="${subject.name}">
                                                <div class="subject-info">
                                                    <h6>${subject.name}</h6>
                                                    ${subject.currentScore ? `
                                                        <div class="score-progress">
                                                            <span>Current: ${subject.currentScore.toFixed(1)}%</span>
                                                            <span>Target: ${subject.targetScore}%</span>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                <div class="loading-content">
                                                    <!-- Content will be loaded from cache -->
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
    
    // Load resources for each subject (using cached data - no API calls)
    for (const week of studyCalendar.weeks) {
        for (const day of week.days) {
            for (const subject of day.subjects) {
                if (subject.name !== 'Weekly Revision') {
                    loadSubjectResources(subject.name);
                }
            }
        }
    }
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



// Add Study Planner Section
function addStudyCalendarSection() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && !document.getElementById('study-planner-section')) {
        const plannerSection = document.createElement('div');
        plannerSection.id = 'study-planner-section';
        plannerSection.className = 'study-planner-section';
        plannerSection.innerHTML = `
            <div class="container">
                <h2 class="section-title">
                    <i class="fas fa-calendar-alt"></i>
                    Study Planner
                </h2>
                <div class="study-planner-content">
                    <div class="planner-question">
                        <h3>Do you want to generate a personalized study planner?</h3>
                        <p>Create a customized study schedule for your weak subjects with 1-week or 1-month plans.</p>
                    </div>
                    <div class="planner-options">
                        <a href="https://trial.thestudentai.in/" target="_blank" class="planner-option planner-button">
                            <div class="option-icon">
                                <i class="fas fa-calendar-week"></i>
                            </div>
                            <h4>1 Week Plan</h4>
                            <p>Quick 7-day study schedule</p>
                        </a>
                        <a href="https://trial.thestudentai.in/" target="_blank" class="planner-option planner-button">
                            <div class="option-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h4>1 Month Plan</h4>
                            <p>Comprehensive 30-day study plan</p>
                        </a>
                    </div>
                    
                </div>
            </div>
        `;
        dashboard.appendChild(plannerSection);
    }
}

// Toggle calendar view function (wrapper for generateStudyCalendar)
function toggleCalendarView(viewType) {
    generateStudyCalendar(viewType);
}

// Export functions for global access
window.showManualEntry = showManualEntry;
window.showUploadSection = showUploadSection;
window.scrollToInput = scrollToInput;
window.toggleCalendarView = toggleCalendarView;
window.toggleAccordion = toggleAccordion;

window.generateStudyCalendar = generateStudyCalendar;
window.loadDemoData = loadDemoData;
window.addNewSubject = addNewSubject;
window.removeSubject = removeSubject;
window.updateSubjectCount = updateSubjectCount;

// Debug functions
window.testErrorMessages = testErrorMessages;
window.validateClassAndBoard = validateClassAndBoard;