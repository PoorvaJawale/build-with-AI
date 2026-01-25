import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from fastapi import FastAPI, Body, Request
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Warning: GOOGLE_API_KEY not found in environment!")
else:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://build-with-ai.vercel.app", # Example Vercel URL
    "https://ai-frontend-poorva.onrender.com" # Example Render URL
]

# IMPORTANT: Update with your Vercel URL during the hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, # This MUST be False if origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Using GOOGLE_API_KEY from environment only; no hardcoded key

@app.get("/")
def home():
    return {"status": "AI Builder Backend is Live"}

@app.post("/api/execute")
@app.post("/api/execute/")
async def execute_workflow(request: Request, workflow: dict = Body(...)):
    print(f"Received request at: {request.url}")

    nodes = workflow.get("nodes", [])
    edges = workflow.get("edges", [])

    node_map = {n.get('id'): n for n in nodes}
    connections = {e.get('source'): e.get('target') for e in edges}

    # Determine start: prefer inputNode, else dataSourceNode
    start_node = next((n for n in nodes if n.get('type') == 'inputNode'), None)
    if not start_node:
        start_node = next((n for n in nodes if n.get('type') == 'dataSourceNode'), None)

    current_text = ''
    if start_node:
        if start_node.get('type') == 'inputNode':
            current_text = start_node.get('data', {}).get('label', '')
        elif start_node.get('type') == 'dataSourceNode':
            current_text = start_node.get('data', {}).get('sourceText', '')

    memory_value = ''
    current_id = start_node.get('id') if start_node else None

    # Traverse linear connections
    while current_id and current_id in connections:
        target_id = connections[current_id]
        target_node = node_map.get(target_id)
        if not target_node:
            break

        ntype = target_node.get('type')
        data = target_node.get('data', {})

        if ntype == 'aiNode':
            prompt = data.get('prompt', '')
            query = f"{prompt}\n\nInput: {current_text}"
            try:
                response = model.generate_content(query)
                current_text = response.text
            except Exception as e:
                current_text = f"[AI error] {e}"

        elif ntype == 'toolNode':
            op = data.get('operation', 'uppercase')
            if op == 'uppercase':
                current_text = (current_text or '').upper()
            elif op == 'lowercase':
                current_text = (current_text or '').lower()
            elif op == 'word_count':
                wc = len((current_text or '').split())
                current_text = f"Word count: {wc}\n\n{current_text}"

        elif ntype == 'memoryNode':
            memory_value = current_text
            note = data.get('note', '')
            current_text = f"{current_text}\n\n[Memory saved]{(': ' + note) if note else ''}"

        elif ntype == 'dataSourceNode':
            current_text = data.get('sourceText', '')

        elif ntype == 'outputNode':
            break

        current_id = target_id

    result = current_text
    if memory_value:
        result = f"{result}\n\n[Memory]: {memory_value}"
    return {"result": result}

# single consolidated route above handles execution