# Encoding Fix for Special Characters

## Problem Solved

The original API had issues with special characters (accented letters) commonly used in Italian, French, Spanish, and other Latin-based languages. Characters like `è`, `à`, `ù`, `ç`, `ñ` were being corrupted and displayed as gibberish (e.g., `è` became `Ã¨`).

## Root Cause

The issue was caused by:
1. **Incorrect encoding detection** - The API assumed UTF-8 encoding but many subtitle files use ISO-8859-1 (Latin-1) or Windows-1252
2. **Poor fallback logic** - The replacement character detection was flawed
3. **No encoding preservation** - Always converted to UTF-8 regardless of input

## Solution Implemented

### 1. Smart Encoding Detection
The API now uses a scoring system to detect the best encoding:

```javascript
// Tries multiple encodings and scores each one
const encodings = [
  'utf-8',           // Most common modern encoding
  'iso-8859-1',      // Latin-1 (common for Western European languages)
  'windows-1252',    // Windows Latin-1 (superset of ISO-8859-1)
  'iso-8859-15',     // Latin-9 (includes Euro symbol)
  'cp1252',          // Alternative name for Windows-1252
  'ascii'            // Basic ASCII
];
```

### 2. Quality Scoring
Each encoding attempt is scored based on:
- **Replacement characters** (🚫 very bad - 1000 points penalty)
- **Suspicious sequences** like `Ã€`, `â€` (🚫 bad - 100 points penalty)
- **SRT format markers** like timestamps (✅ good - bonus points)

### 3. BOM Detection
Automatically detects UTF-8 Byte Order Mark (BOM) for proper UTF-8 files.

### 4. Charset Headers
Proper Content-Type headers with charset information for better browser compatibility.

## Test Results

### Before Fix (❌ Broken)
```
Ciao! Questo Ã¨ un test con caratteri speciali.
CittÃ , perchÃ©, piÃ¹, cosÃ¬, giÃ , perÃ².
CaffÃ¨, universitÃ , qualitÃ , libertÃ .
```

### After Fix (✅ Working)
```
Ciao! Questo è un test con caratteri speciali.
Città, perché, più, così, già, però.
Caffè, università, qualità, libertà.
```

## Supported Languages

The fix now properly handles special characters for:

- 🇮🇹 **Italian**: è, à, ì, ò, ù, é
- 🇫🇷 **French**: é, è, ê, ë, à, â, ä, ç, î, ï, ô, ö, ù, û, ü, ÿ
- 🇪🇸 **Spanish**: á, é, í, ó, ú, ñ, ü
- 🇩🇪 **German**: ä, ö, ü, ß
- 🇵🇹 **Portuguese**: á, â, ã, à, é, ê, í, ó, ô, õ, ú, ç
- And other Western European languages

## API Usage

No changes required for API usage - the encoding detection is automatic:

```bash
# Same API call as before
curl -X POST \
  -F "file=@italian-subtitles.srt" \
  "https://your-api.onrender.com/shift-subtitles?shift=5" \
  --output shifted-subtitles.srt
```

## Debugging

The API now logs encoding detection information:

```
Encoding utf-8: score=500, sample="1\n00:00:01,000 --> 00:00:03,000\nCiao! Questo Ã¨"
Encoding iso-8859-1: score=0, sample="1\n00:00:01,000 --> 00:00:03,000\nCiao! Questo è"
Best encoding: iso-8859-1 (score: 0)
Input encoding: iso-8859-1, Output encoding: utf-8, Charset: utf-8
```

## Technical Details

### Encoding Priority
1. **UTF-8** - Modern standard, handles all Unicode characters
2. **ISO-8859-1** - Latin-1, common for Western European languages
3. **Windows-1252** - Superset of ISO-8859-1, includes additional characters
4. **ISO-8859-15** - Latin-9, includes Euro symbol
5. **ASCII** - Basic fallback

### Output Format
- Input files are detected automatically
- Output is always UTF-8 for maximum compatibility
- Proper charset headers are included

## Migration

If you're upgrading from the previous version:
- ✅ **No API changes required**
- ✅ **Backward compatible**
- ✅ **Automatic improvement**
- ✅ **Better error handling**

Your existing integrations will automatically benefit from the improved encoding handling.