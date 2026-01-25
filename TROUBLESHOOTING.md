# Troubleshooting Guide - LegoAI Studio

## Quick Fixes

### Issue: Output not showing when clicking "Run Flow"

Here are the most common causes and solutions:

#### 1. Blocks Not Connected
**Problem**: The initial blocks are not connected with lines.
**Solution**:
- Drag from the small circle at the bottom of one block to the top circle of the next block
- You should see a line connecting them
- Check the status bar at the bottom - it should show "Connections: 2" or more

#### 2. Empty Input Field
**Problem**: You haven't typed anything in the "User Input" box.
**Solution**:
- Click on the green "USER INPUT" block
- Type some text in the input field
- Example: "Hello World"

#### 3. Empty AI Prompt
**Problem**: The AI Model Block has no instructions.
**Solution**:
- Click on the blue "AI Model Block"
- Type instructions in the textarea
- Example: "Translate to Spanish" or "Summarize this text"

#### 4. Backend Not Running
**Problem**: The backend server is not accessible.
**Solution**:
- Open browser console (F12) and check for errors
- Look for messages like "Failed to fetch" or "Network error"
- If using local backend, make sure it's running on port 8000

#### 5. Missing Google API Key
**Problem**: Backend can't access Google Gemini API.
**Solution**:
- Get a free API key from https://aistudio.google.com/app/apikey
- Add it to `.env` file: `GOOGLE_API_KEY=your-key-here`
- Restart the backend

## Testing Steps

1. **Click "Load Example"** button - This loads a pre-configured flow
2. **Check connections** - Look for lines between blocks
3. **Click "Run Flow"** - Should see output in the console and Output block
4. **Check browser console** - Press F12 to see detailed logs

## What the Console Shows

The console at the bottom shows:
- "Blocks: X | Connections: Y" - Number of blocks and connections
- "Ready to run..." - Initial state
- "Processing..." - When executing
- "Error: No connections!" - If blocks aren't connected
- Result text - When successful

## Quick Test Without Backend

To test the frontend without the backend:
1. Click "Load Example"
2. Check that blocks are connected (you should see lines)
3. Try adding more blocks using the toolbar buttons
4. Test drag-and-drop connections

## Common Error Messages

- **"No connections!"** → Connect your blocks with lines
- **"AI block has no prompt"** → Add instructions to the AI block
- **"Server error: 404"** → Backend URL is wrong or not running
- **"Failed to fetch"** → Network/CORS issue or backend is down

## Debug Mode

Open browser console (F12) to see detailed logs:
- What data is being sent to backend
- Backend responses
- Any errors that occur

## Still Not Working?

1. Refresh the page
2. Click "Reset" to start fresh
3. Try the "Load Example" button
4. Check browser console for error messages
5. Verify backend is accessible at the URL shown in console
