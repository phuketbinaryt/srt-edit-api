# Subtitle Shift API

A simple Node.js API built with Express that allows users to upload .srt subtitle files and shift their timestamps by a specified number of seconds.

## Features

- Upload .srt subtitle files via multipart/form-data
- Shift all subtitle timestamps by positive or negative seconds
- Automatic encoding detection (UTF-8 with fallback to Windows-1252)
- Download modified subtitle files
- Basic CORS support
- Simple HTML form for manual testing
- Error handling and validation
- Ready for deployment on Render.com

## API Endpoints

### POST /shift-subtitles

Shifts subtitle timestamps in an uploaded .srt file.

**Parameters:**
- `file` (required): .srt subtitle file (multipart/form-data)
- `shift` (optional): Time shift in seconds (query parameter or form field)
  - Positive values shift timestamps forward
  - Negative values shift timestamps backward
  - Default: 0 seconds

**Example requests:**

```bash
# Shift subtitles forward by 9 seconds
curl -X POST \
  -F "file=@subtitles.srt" \
  "http://localhost:3000/shift-subtitles?shift=9" \
  --output shifted_subtitles.srt

# Shift subtitles backward by 5.5 seconds
curl -X POST \
  -F "file=@subtitles.srt" \
  -F "shift=-5.5" \
  "http://localhost:3000/shift-subtitles" \
  --output shifted_subtitles.srt
```

### GET /

Returns a simple HTML form for manual testing of the API.

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## Deployment

### Render.com

This API is ready for deployment on Render.com as a web service:

1. Connect your repository to Render
2. Create a new Web Service
3. Use the following settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

## Technical Details

- **File Size Limit:** 10MB
- **Supported Formats:** .srt files only
- **Encoding:** UTF-8 (with automatic fallback to Windows-1252)
- **Error Handling:** Comprehensive error responses for invalid files, encoding issues, and server errors

## Dependencies

- `express`: Web framework
- `multer`: File upload handling
- `iconv-lite`: Character encoding conversion

## License

MIT