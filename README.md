# Trevnoctilla - Complete PDF Toolkit

A powerful, all-in-one PDF management platform built with Next.js and Python Flask. Transform, edit, and optimize your PDFs with professional-grade tools in a sleek, modern interface.

## Features

### 🎨 Modern UI/UX

- Dark gradient background with glassmorphism effects
- Purple/pink gradient accents throughout
- Smooth animations with Framer Motion
- Responsive design for all screen sizes

### 📄 PDF Processing

- **PDF to HTML Conversion**: Convert PDFs to HTML while preserving original layout
- **Image Extraction**: Extract and display images from PDFs
- **Click-to-Edit**: Click any text or image to edit directly
- **Real-time Preview**: See changes immediately in the viewer
- **Page Navigation**: Browse through multi-page PDFs
- **Zoom Controls**: Adjust zoom level for better viewing

### 🛠️ Advanced Editor

- **Visual Document Editor**: Canvas-based PDF editing interface
- **Operator Mode**: Advanced editing controls for:
  - Remove Text (with input field)
  - Add Text (with X/Y coordinates)
  - Remove Images (by name)
  - Add Images (file picker)
- **Tool Selection**: Select, Text, Rectangle, Circle, Operator Mode
- **Save System**: Track and save all edits

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Backend**: Flask (Python) with PyMuPDF

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- pip

### Installation

1. **Install Frontend Dependencies**

```bash
npm install
```

2. **Install Backend Dependencies**

```bash
py -m pip install flask PyMuPDF
```

3. **Start the Backend Server**

```bash
py app.py
```

4. **Start the Frontend Development Server**

```bash
npm run dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   ├── layout/
│   │   ├── LayoutClient.tsx # Layout wrapper
│   │   └── UniversalHeader.tsx # Navigation header
│   ├── pages/
│   │   ├── LandingPage.tsx  # Landing page
│   │   ├── PDFTools.tsx     # PDF tools interface
│   │   └── PDFEditor.tsx    # Advanced PDF editor
│   └── ScrollHandler.tsx    # Scroll handling
├── contexts/
│   └── NavigationContext.tsx # Page navigation state
├── public/
│   └── platform-hero-bg.png # Background image
├── templates/               # Flask templates (legacy)
├── app.py                  # Flask backend server
└── package.json
```

## Usage

### PDF to HTML Conversion

1. Upload a PDF file using drag & drop
2. The PDF is automatically converted to HTML
3. Click any text or image to edit
4. Use page navigation and zoom controls
5. Save your edits to download the modified PDF

### Advanced PDF Editing

1. Navigate to PDF Tools
2. Select "Edit PDF" tab
3. Upload your PDF file
4. Click "Open Editor" to access the visual editor
5. Use Operator Mode for advanced editing controls
6. Save your changes

## API Endpoints

- `POST /` - Upload and convert PDF to HTML
- `GET /convert/<filename>` - View converted PDF
- `POST /save_edits/<filename>` - Save PDF edits

## Customization

### Styling

The app uses Tailwind CSS with a custom theme. Key colors:

- Primary: Blue gradient
- Purple: Purple gradient for accents
- Pink: Pink gradient for highlights

### Adding New Tools

1. Add new tab to `PDFTools.tsx`
2. Implement the tool logic
3. Update the backend API if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
