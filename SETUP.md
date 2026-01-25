# LegoAI Studio - Setup Guide

## What I Fixed

Your AI builder wasn't showing output because:

1. **No Initial Connections**: The blocks weren't connected by default, so data couldn't flow through
2. **Missing Error Messages**: No feedback when things went wrong
3. **No Debug Logging**: Hard to see what was happening

## What's New

### Frontend Improvements
- ✅ Blocks now connect automatically on startup
- ✅ Status bar shows number of blocks and connections
- ✅ Better error messages in console
- ✅ Visual warning when no connections exist
- ✅ "Load Example" button for quick testing
- ✅ Console logging for debugging

### Backend Improvements
- ✅ Detailed logging of each step
- ✅ Better error handling
- ✅ Helpful error messages
- ✅ Validation checks for missing data

## Quick Start

### 1. Test the Frontend (No Backend Needed)
```bash
cd frontend
npm start
```

Then:
1. Click **"Load Example"** button
2. You'll see blocks pre-filled with sample data
3. Blocks should already be connected (visible lines)
4. Check the status bar: "Blocks: 3 | Connections: 2"

### 2. Run the Full App (With AI)

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Get a Google Gemini API key:
1. Visit https://aistudio.google.com/app/apikey
2. Create a free API key
3. Add to `.env` file in the root:
   ```
   GOOGLE_API_KEY=your-actual-key-here
   ```

Start backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm start
```

Open http://localhost:3000

### 3. Test the Flow

1. **Load Example**: Click the "Load Example" button (purple)
2. **Verify Connections**: You should see lines connecting the blocks
3. **Run**: Click "Run Flow" (green button)
4. **Check Output**: Look at the console at the bottom and the Output block

## How to Use

### Basic Flow
1. **User Input** → Type text here
2. **AI Model Block** → Add instructions (e.g., "Translate to French")
3. **Output** → See results

### Connect Blocks
- Drag from the circle at the **bottom** of one block
- Drop on the circle at the **top** of another block
- A line appears showing the connection

### Add More Blocks
Use the toolbar buttons:
- **+ Add AI Block**: Another AI processing step
- **+ Add Tool**: Text transformations (uppercase, lowercase, word count)
- **+ Add Memory**: Store text for later use
- **+ Data Source**: Alternative input source

### Save & Load
- **Download**: Save your flow as JSON
- **Upload**: Load a saved flow
- **Reset**: Clear everything and start fresh

## Environment Variables

### `.env` File
```bash
# Required for AI functionality
GOOGLE_API_KEY=your-google-gemini-api-key-here

# Frontend (optional, defaults to Render deployment)
REACT_APP_BACKEND_URL=http://localhost:8000

# Supabase (if using database features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SUPABASE_ANON_KEY=your-anon-key
```

## Debugging Tips

### Check Browser Console
Press **F12** to see:
- What data is sent to backend
- Backend responses
- Any errors

### Check Backend Logs
In the terminal running the backend, you'll see:
- Each node being processed
- Input/output at each step
- Any errors from the AI

### Status Bar
Bottom of the screen shows:
- Number of blocks
- Number of connections
- Warning if no connections

## Deployment Notes

### Backend (Currently on Render)
- URL: https://ai-backend-poorva.onrender.com
- Make sure `GOOGLE_API_KEY` is set in Render environment variables

### Frontend (Vercel/Render)
- Set `REACT_APP_BACKEND_URL` to your deployed backend URL

## Hackathon Checklist

- ✅ Flow builder with drag-and-drop
- ✅ At least 3 composable blocks (Input, AI, Output, Tool, Memory, Data Source)
- ✅ Execution engine that runs blocks in sequence
- ✅ Ability to remix/reuse (Download/Upload JSON)
- ✅ Live output panel showing results
- ✅ Visual connections between blocks
- ✅ Error handling and user feedback
- ✅ Multiple block types for composability

## Example Flows

### Translation Flow
1. User Input: "Hello"
2. AI Block: "Translate to Spanish"
3. Output: "Hola"

### Text Analysis Flow
1. Data Source: "Long article text..."
2. AI Block: "Summarize in 3 bullet points"
3. Tool Block: Word Count
4. Output: Summary + word count

### Multi-Step Processing
1. User Input: "write a poem"
2. AI Block #1: "Write a short poem about coding"
3. Memory: Store original
4. AI Block #2: "Translate this poem to emoji"
5. Output: Emoji version

## Need Help?

See TROUBLESHOOTING.md for common issues and solutions.
