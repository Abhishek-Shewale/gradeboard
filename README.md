# Gradebook Prototype

A modern, AI-powered grade tracking and analysis application designed to help parents monitor their child's academic progress and get personalized study recommendations.

## 🚀 Features

### Core Functionality
- **Manual Grade Entry**: Easy-to-use form for entering student grades
- **Mock OCR Processing**: Simulated marksheet upload with progress tracking
- **Performance Analysis**: Comprehensive grade analysis with visual charts
- **AI-Powered Recommendations**: Personalized study suggestions using Gemini API
- **Study Calendar Generation**: 4-week personalized study plans
- **Responsive Design**: Mobile-first design that works on all devices

### Key Components
- **Dashboard**: Overall performance summary with subject-wise breakdown
- **Charts**: Interactive visualizations using Chart.js
- **Calendar**: Weekly and monthly study plan views
- **Support**: WhatsApp integration for instant help

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **AI Integration**: Google Gemini API for intelligent recommendations
- **Icons**: Font Awesome for UI icons
- **Styling**: Custom CSS with CSS Grid and Flexbox

## 📁 Project Structure

```
gradebook-prototype/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # Core JavaScript functionality
└── README.md           # Project documentation
```

## 🎯 How to Use

### 1. Getting Started
- Open `index.html` in a web browser
- Click "Try Demo" to see the system in action with sample data
- Or manually enter your child's grades

### 2. Manual Entry
1. Select the class (1st to 12th standard)
2. Choose the education board (CBSE, ICSE, etc.)
3. Select test type (Unit Test, Mid-term, Final)
4. Enter marks for each subject
5. Click "Analyze Performance"

### 3. File Upload (Mock)
1. Switch to "Upload Marksheet" tab
2. Drag and drop or click to upload a file
3. Watch the simulated OCR processing
4. View the extracted data

### 4. View Results
- **Performance Summary**: Overall grade and percentage
- **Subject Breakdown**: Individual subject performance with visual indicators
- **Charts**: Bar charts and doughnut charts for data visualization
- **AI Recommendations**: Personalized study advice and improvement strategies

### 5. Generate Study Calendar
- Click "Generate Study Calendar" button
- View 4-week personalized study plan
- Toggle between weekly and monthly views
- See daily schedules with topics and duration

## 🔧 Configuration

### API Key Setup
The application uses Google Gemini API for AI recommendations. The API key is configured in `script.js`:

```javascript
const GEMINI_API_KEY = 'AIzaSyCbNoabsBsUBCMBzCRtI25DmPiKzhGLwAY';
```

### Subject Configuration
Subjects are configured based on class levels in the `subjectConfigs` object:

```javascript
const subjectConfigs = {
    '1st': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
    '10th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
    // ... more configurations
};
```

## 🎨 Design Features

### Color Scheme
- **Primary**: #4A90E2 (Professional Blue)
- **Success**: #7ED321 (Good Performance)
- **Warning**: #F5A623 (Needs Attention)
- **Danger**: #D0021B (Weak Performance)

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Flexible grid layouts
- Touch-friendly interface

## 📊 Data Structure

### Student Data Format
```javascript
const studentData = {
    class: "10th",
    board: "CBSE",
    testType: "Mid-term",
    date: "2024-03-15",
    subjects: [
        {
            name: "Mathematics",
            marks: 65,
            total: 100,
            percentage: 65,
            grade: "B"
        }
        // ... more subjects
    ]
};
```

## 🚀 Deployment

### Local Development
1. Clone or download the project files
2. Open `index.html` in a web browser
3. No build process required - pure frontend application

### Web Hosting
- Upload all files to any web hosting service
- Works with GitHub Pages, Netlify, Vercel, etc.
- No server-side requirements

## 🔮 Future Enhancements

### Planned Features
- **Real OCR Integration**: Connect with actual OCR services
- **Progress Tracking**: Historical performance tracking
- **Parent Dashboard**: Multiple children management
- **Teacher Integration**: Teacher feedback and comments
- **Export Features**: PDF reports and grade sheets
- **Offline Support**: PWA capabilities

### Technical Improvements
- **Data Persistence**: Local storage or database integration
- **Authentication**: User accounts and data security
- **Advanced Analytics**: Trend analysis and predictions
- **Mobile App**: Native mobile application

## 🤝 Contributing

This is a prototype project demonstrating AI-powered educational insights. Feel free to:
- Report bugs or issues
- Suggest new features
- Improve the UI/UX
- Add new subject configurations
- Enhance the AI prompts

## 📞 Support

- **WhatsApp**: Contact via the support section in the app
- **Demo Mode**: Use the "Try Demo" button to explore features
- **Help**: FAQ section (coming soon)

## 📄 License

This project is a prototype for educational purposes. Feel free to use and modify as needed.

---

**Built with ❤️ for parents who want to help their children excel academically.**
