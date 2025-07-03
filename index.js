const express = require('express');
const multer = require('multer');
const iconv = require('iconv-lite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.srt') {
      cb(null, true);
    } else {
      cb(new Error('Only .srt files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Function to parse SRT content
function parseSRT(content) {
  const blocks = content.trim().split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return null;
    
    const index = lines[0];
    const timestamp = lines[1];
    const text = lines.slice(2).join('\n');
    
    return { index, timestamp, text };
  }).filter(block => block !== null);
}

// Function to shift timestamp
function shiftTimestamp(timestamp, shiftSeconds) {
  const timeRegex = /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/;
  const match = timestamp.match(timeRegex);
  
  if (!match) return timestamp;
  
  const [, startH, startM, startS, startMs, endH, endM, endS, endMs] = match;
  
  // Convert to milliseconds
  const startTime = parseInt(startH) * 3600000 + parseInt(startM) * 60000 + parseInt(startS) * 1000 + parseInt(startMs);
  const endTime = parseInt(endH) * 3600000 + parseInt(endM) * 60000 + parseInt(endS) * 1000 + parseInt(endMs);
  
  // Apply shift
  const shiftMs = shiftSeconds * 1000;
  const newStartTime = Math.max(0, startTime + shiftMs);
  const newEndTime = Math.max(0, endTime + shiftMs);
  
  // Convert back to timestamp format
  function msToTimestamp(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  }
  
  return `${msToTimestamp(newStartTime)} --> ${msToTimestamp(newEndTime)}`;
}

// Function to detect and decode text encoding
function decodeText(buffer) {
  // Try UTF-8 first
  let decoded = iconv.decode(buffer, 'utf-8');
  
  // Check for replacement characters () which indicate encoding issues
  if (decoded.includes('')) {
    // Fallback to windows-1252
    decoded = iconv.decode(buffer, 'windows-1252');
  }
  
  return decoded;
}

// Function to rebuild SRT content
function rebuildSRT(blocks) {
  return blocks.map(block => {
    return `${block.index}\n${block.timestamp}\n${block.text}`;
  }).join('\n\n') + '\n';
}

// Basic CORS support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple HTML form for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Subtitle Shift API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="file"], input[type="number"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background-color: #0056b3; }
            .info { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <h1>Subtitle Shift API</h1>
        <div class="info">
            <p><strong>API Endpoint:</strong> POST /shift-subtitles</p>
            <p><strong>Parameters:</strong></p>
            <ul>
                <li><code>file</code> - .srt subtitle file (required)</li>
                <li><code>shift</code> - Time shift in seconds (optional, can be negative)</li>
            </ul>
        </div>
        
        <form action="/shift-subtitles" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label for="file">Select .srt file:</label>
                <input type="file" id="file" name="file" accept=".srt" required>
            </div>
            <div class="form-group">
                <label for="shift">Time shift (seconds):</label>
                <input type="number" id="shift" name="shift" step="0.1" placeholder="e.g., 9 or -5.5">
            </div>
            <button type="submit">Shift Subtitles</button>
        </form>
    </body>
    </html>
  `);
});

// Main API endpoint
app.post('/shift-subtitles', upload.single('file'), (req, res) => {
  try {
    // Log request details
    const filename = req.file ? req.file.originalname : 'unknown';
    const shiftSeconds = parseFloat(req.query.shift || req.body.shift || 0);
    
    console.log(`Request: filename="${filename}", shift=${shiftSeconds}s`);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Decode the file content
    const content = decodeText(req.file.buffer);
    
    // Parse SRT content
    const blocks = parseSRT(content);
    
    if (blocks.length === 0) {
      return res.status(400).json({ error: 'Invalid SRT file format' });
    }
    
    // Shift timestamps
    const shiftedBlocks = blocks.map(block => ({
      ...block,
      timestamp: shiftTimestamp(block.timestamp, shiftSeconds)
    }));
    
    // Rebuild SRT content
    const modifiedContent = rebuildSRT(shiftedBlocks);
    
    // Encode back to UTF-8
    const outputBuffer = iconv.encode(modifiedContent, 'utf-8');
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/x-subrip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname}"`);
    res.setHeader('Content-Length', outputBuffer.length);
    
    // Send the modified file
    res.send(outputBuffer);
    
  } catch (error) {
    console.error('Error processing subtitle file:', error);
    res.status(500).json({ error: 'Internal server error while processing file' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
  }
  
  if (error.message === 'Only .srt files are allowed') {
    return res.status(400).json({ error: 'Only .srt files are allowed' });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Subtitle Shift API running on port ${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}`);
});

module.exports = app;