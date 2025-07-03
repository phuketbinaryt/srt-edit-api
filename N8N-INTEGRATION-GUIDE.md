# n8n Integration Guide for Subtitle Shift API

This guide shows how to call the Subtitle Shift API from n8n workflows using the HTTP Request node.

## Prerequisites

1. **Deploy the API** to a public URL (e.g., Render.com, Heroku, Railway)
2. **Get the API URL** (e.g., `https://your-app.onrender.com`)

## n8n Workflow Setup

### Method 1: Using HTTP Request Node (Recommended)

#### Step 1: Add HTTP Request Node
1. In your n8n workflow, add an **HTTP Request** node
2. Configure the following settings:

#### Step 2: Basic Configuration
```
Method: POST
URL: https://your-api-url.onrender.com/shift-subtitles
```

#### Step 3: Parameters (Optional)
Add query parameters if needed:
```
Parameter Name: shift
Parameter Value: 9
```
*Or use an expression like `{{ $json.shiftSeconds }}` to get from previous node*

#### Step 4: Body Configuration
- **Body Content Type**: `Multipart-Form Data`
- **Parameters**:
  - **Name**: `file`
  - **Value**: Use file data from previous node or upload directly
  - **Parameter Type**: `File`

#### Step 5: Headers (Optional but Recommended)
```
Accept: application/x-subrip
```

### Method 2: Complete n8n Node Configuration

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://your-api-url.onrender.com/shift-subtitles",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {
          "name": "shift",
          "value": "={{ $json.shiftSeconds }}"
        }
      ]
    },
    "sendBody": true,
    "contentType": "multipart-form-data",
    "bodyParameters": {
      "parameters": [
        {
          "name": "file",
          "value": "={{ $binary.data }}",
          "parameterType": "formBinaryData"
        }
      ]
    },
    "options": {
      "response": {
        "response": {
          "responseFormat": "file"
        }
      }
    }
  }
}
```

## Example Workflows

### Workflow 1: Simple File Processing
```
1. [Manual Trigger] 
   ↓
2. [HTTP Request - Subtitle Shift API]
   ↓
3. [Save to File/Send Email/etc.]
```

### Workflow 2: Automated Processing
```
1. [Webhook/File Trigger]
   ↓
2. [Set Node] - Define shift amount
   ↓
3. [HTTP Request - Subtitle Shift API]
   ↓
4. [Response Processing]
```

### Workflow 3: Batch Processing
```
1. [Schedule Trigger]
   ↓
2. [Read Files from Folder]
   ↓
3. [Split in Batches]
   ↓
4. [HTTP Request - Subtitle Shift API]
   ↓
5. [Save Processed Files]
```

## Input Data Examples

### From Previous Node (File Upload)
```javascript
// If previous node provides file data
{
  "file": "{{ $binary.data }}",
  "shift": "{{ $json.timeShift }}"
}
```

### Static Configuration
```javascript
{
  "shift": 9,  // Shift forward 9 seconds
  // File will be from binary data
}
```

### Dynamic Shift Calculation
```javascript
{
  "shift": "={{ $json.startTime - $json.actualStart }}",
  // Calculate shift based on timing difference
}
```

## Response Handling

The API returns the modified .srt file as binary data. Configure the HTTP Request node to handle file responses:

### Response Configuration
- **Response Format**: `File`
- **Binary Property**: `data`

### Processing the Response
```javascript
// The response will be in $binary.data
// You can save it, send it via email, or process further
{
  "filename": "shifted_subtitles.srt",
  "data": "{{ $binary.data }}"
}
```

## Error Handling

Add error handling to your workflow:

### Common Errors
- **400**: Invalid file format or missing file
- **500**: Server error during processing

### Error Handling Node
```javascript
// Check if request was successful
if ($json.statusCode !== 200) {
  throw new Error(`API Error: ${$json.statusMessage}`);
}
```

## Complete Example Workflow

```json
{
  "nodes": [
    {
      "parameters": {},
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "parameters": {
        "values": {
          "number": [
            {
              "name": "shiftSeconds",
              "value": 9
            }
          ]
        }
      },
      "name": "Set Shift Amount",
      "type": "n8n-nodes-base.set"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://your-api.onrender.com/shift-subtitles",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "shift",
              "value": "={{ $json.shiftSeconds }}"
            }
          ]
        },
        "sendBody": true,
        "contentType": "multipart-form-data",
        "bodyParameters": {
          "parameters": [
            {
              "name": "file",
              "value": "={{ $binary.data }}",
              "parameterType": "formBinaryData"
            }
          ]
        },
        "options": {
          "response": {
            "response": {
              "responseFormat": "file"
            }
          }
        }
      },
      "name": "Shift Subtitles",
      "type": "n8n-nodes-base.httpRequest"
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Set Shift Amount",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Shift Amount": {
      "main": [
        [
          {
            "node": "Shift Subtitles",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Testing

1. **Deploy your API** to a public URL
2. **Import the workflow** into n8n
3. **Update the API URL** in the HTTP Request node
4. **Test with a sample .srt file**

## Tips

- **File Size**: API supports up to 10MB files
- **Encoding**: API handles UTF-8 and Windows-1252 automatically
- **Shift Values**: Can be positive (forward) or negative (backward)
- **Decimal Values**: Supports decimal seconds (e.g., 2.5)
- **Error Logs**: Check API logs for debugging

## API Endpoints Summary

- **POST** `/shift-subtitles` - Main endpoint for shifting subtitles
- **GET** `/` - HTML test interface (for manual testing)

The API is now ready for integration into your n8n workflows!