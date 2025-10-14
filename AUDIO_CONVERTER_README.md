# Audio Converter Backend

This is a comprehensive Flask backend for audio conversion between all major audio formats using FFmpeg with advanced quality control and processing options.

## Features

### 🎵 **Supported Input Formats**
- **MP3** - Most compatible audio format
- **WAV** - Uncompressed audio
- **FLAC** - Lossless compression
- **AAC** - High-quality compression
- **OGG Vorbis** - Open source format
- **M4A** - iTunes audio format
- **WMA** - Windows Media Audio
- **AIFF** - Mac audio format
- **AU** - Sun audio format
- **Opus** - Modern efficient codec

### 🎯 **Supported Output Formats**
- **MP3** - Most compatible, customizable bitrate
- **WAV** - Uncompressed, highest quality
- **FLAC** - Lossless compression
- **AAC** - High-quality compression
- **OGG Vorbis** - Open source, efficient
- **M4A** - iTunes compatible
- **WMA** - Windows Media Audio
- **AIFF** - Mac compatible
- **Opus** - Modern, very efficient

### ⚙️ **Advanced Controls**
- **Bitrate Control** - 64kbps to 320kbps (or variable)
- **Sample Rate** - 22kHz to 192kHz (CD to studio quality)
- **Channel Configuration** - Mono, Stereo, Surround (5.1)
- **Quality Levels** - 50% to 100% quality control
- **Format Optimization** - Automatic codec selection
- **File Size Comparison** - Before/after size analysis

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
   pip install -r audio-converter-requirements.txt
   ```

2. Make sure FFmpeg is installed and in your PATH

## Usage

### Start the Backend

**Windows:**
```bash
start-audio-converter.bat
```

**Linux/Mac:**
```bash
python audio-converter-backend.py
```

The backend will start on `http://localhost:5001`

### API Endpoints

- `POST /convert-audio` - Convert audio between formats
- `GET /download_converted_audio/<filename>` - Download converted file
- `GET /health` - Health check

### Example Usage

```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('outputFormat', 'mp3');
formData.append('bitrate', '192');
formData.append('sampleRate', '44100');
formData.append('channels', 'stereo');
formData.append('quality', '80');

fetch('http://localhost:5001/convert-audio', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.status === 'success') {
    // Download the converted file
    window.open(`http://localhost:5001/download_converted_audio/${data.converted_filename}`);
  }
});
```

## Quality Settings

### Bitrate Options
- **64 kbps** - Low quality, small files
- **128 kbps** - Standard quality (CD-like)
- **192 kbps** - High quality (recommended)
- **256 kbps** - Very high quality
- **320 kbps** - Maximum quality
- **Variable** - Automatic bitrate selection

### Sample Rate Options
- **22050 Hz** - Low quality, small files
- **44100 Hz** - CD quality (standard)
- **48000 Hz** - Professional quality
- **88200 Hz** - High-resolution audio
- **96000 Hz** - Studio quality
- **192000 Hz** - Ultra high-resolution

### Channel Options
- **Mono** - Single channel (50% file size)
- **Stereo** - Two channels (standard)
- **Surround** - 5.1 surround sound
- **Original** - Keep original channel configuration

## Use Cases

### 🎵 **Music Production**
- Convert between studio formats (WAV, FLAC, AIFF)
- High-resolution audio processing
- Professional quality settings

### 📱 **Mobile Optimization**
- Convert to mobile-friendly formats (AAC, M4A)
- Optimize file sizes for streaming
- Battery-efficient compression

### 🎧 **Audio Archiving**
- Lossless conversion (FLAC, WAV)
- Preserve original quality
- Long-term storage optimization

### 🌐 **Web Compatibility**
- Convert to web-friendly formats (MP3, OGG)
- Cross-browser compatibility
- Streaming optimization

### 🎮 **Gaming Audio**
- Game audio optimization
- Real-time processing
- Performance-focused conversion

## Configuration

- **Max file size**: 500MB (configurable in frontend)
- **Port**: 5001 (configurable in backend)
- **CORS**: Enabled for frontend integration
- **Debug logging**: Comprehensive conversion tracking

## Troubleshooting

1. **FFmpeg not found**: Make sure FFmpeg is installed and in your PATH
2. **Conversion fails**: Check the console output for FFmpeg error messages
3. **File too large**: Reduce quality or bitrate settings
4. **Unsupported format**: Check if the input format is supported
5. **Quality issues**: Adjust bitrate, sample rate, or quality settings

## Performance Tips

- **For speed**: Use lower quality settings and smaller bitrates
- **For quality**: Use higher bitrates and sample rates
- **For file size**: Use efficient formats like MP3 or AAC
- **For compatibility**: Use MP3 or WAV formats

## Notes

- Converted files are stored in the `converted_audio/` folder
- Input files are automatically cleaned up after conversion
- The backend runs on port 5001 by default (different from video converter)
- CORS is enabled for frontend integration
- All conversions preserve metadata when possible
