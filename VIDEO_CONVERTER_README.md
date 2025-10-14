# Video Converter Backend

This is a simple Flask backend for video conversion and MP3 audio extraction using FFmpeg.

## Features

- Convert videos between different formats (MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V, 3GP, OGV)
- Extract audio from videos to MP3 format
- Quality control and compression options
- File size comparison
- Progress tracking

## Prerequisites

1. **Python 3.7+**
2. **FFmpeg** - Must be installed and available in PATH
   - Download from: https://ffmpeg.org/download.html
   - Or install via package manager:
     - Windows: `choco install ffmpeg`
     - macOS: `brew install ffmpeg`
     - Ubuntu: `sudo apt install ffmpeg`

## Installation

1. Install Python dependencies:
   ```bash
   pip install -r video-converter-requirements.txt
   ```

2. Make sure FFmpeg is installed and in your PATH

## Usage

### Start the Backend

**Windows:**
```bash
start-video-converter.bat
```

**Linux/Mac:**
```bash
python video-converter-backend.py
```

The backend will start on `http://localhost:5000`

### API Endpoints

- `POST /convert-video` - Convert video or extract audio
- `GET /download_converted/<filename>` - Download converted file
- `GET /health` - Health check

### Example Usage

```javascript
const formData = new FormData();
formData.append('file', videoFile);
formData.append('outputFormat', 'mp3'); // or 'mp4', 'avi', etc.
formData.append('quality', '80');
formData.append('compression', 'medium');

fetch('http://localhost:5000/convert-video', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.status === 'success') {
    // Download the converted file
    window.open(`http://localhost:5000/download_converted/${data.converted_filename}`);
  }
});
```

## Supported Formats

### Input Formats
- MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V, 3GP, OGV

### Output Formats
- **Video**: MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V, 3GP, OGV
- **Audio**: MP3 (extracted from any video format)

## Configuration

- **Quality**: 1-100 (higher = better quality, larger file)
- **Compression**: low, medium, high (affects encoding speed vs file size)
- **Max file size**: 500MB (configurable in frontend)

## Troubleshooting

1. **FFmpeg not found**: Make sure FFmpeg is installed and in your PATH
2. **Conversion fails**: Check the console output for FFmpeg error messages
3. **File too large**: Reduce quality or compression settings
4. **Unsupported format**: Check if the input format is supported

## Notes

- Converted files are stored in the `converted_videos/` folder
- Input files are automatically cleaned up after conversion
- The backend runs on port 5000 by default
- CORS is enabled for frontend integration
