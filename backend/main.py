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
    print(f"Workflow data: {workflow}")

    nodes = workflow.get("nodes", [])
    edges = workflow.get("edges", [])

    print(f"Number of nodes: {len(nodes)}, Number of edges: {len(edges)}")

    if not nodes:
        return {"result": "Error: No nodes provided"}

    if not edges:
        return {"result": "Error: No connections between blocks. Please connect your blocks."}

    node_map = {n.get('id'): n for n in nodes}
    connections = {e.get('source'): e.get('target') for e in edges}

    # Determine start: prefer inputNode, else dataSourceNode
    start_node = next((n for n in nodes if n.get('type') == 'inputNode'), None)
    if not start_node:
        start_node = next((n for n in nodes if n.get('type') == 'dataSourceNode'), None)

    if not start_node:
        return {"result": "Error: No input or data source node found. Please add an Input or Data Source block."}

    current_text = ''
    if start_node:
        if start_node.get('type') == 'inputNode':
            current_text = start_node.get('data', {}).get('label', '')
            print(f"Starting with input: '{current_text}'")
        elif start_node.get('type') == 'dataSourceNode':
            current_text = start_node.get('data', {}).get('sourceText', '')
            print(f"Starting with data source: '{current_text}'")

    if not current_text:
        print("Warning: Starting with empty text")

    memory_value = ''
    current_id = start_node.get('id') if start_node else None

    # Traverse linear connections
    steps_executed = []
    while current_id and current_id in connections:
        target_id = connections[current_id]
        target_node = node_map.get(target_id)
        if not target_node:
            break

        ntype = target_node.get('type')
        data = target_node.get('data', {})
        print(f"Processing node: {ntype} (id: {target_id})")

        if ntype == 'aiNode':
            prompt = data.get('prompt', '')
            if not prompt:
                current_text = "[Error: AI block has no prompt/instructions]"
                steps_executed.append(f"AI Block: No prompt provided")
            else:
                query = f"{prompt}\n\nInput: {current_text}"
                try:
                    print(f"Calling AI with query: {query[:100]}...")
                    response = model.generate_content(query)
                    current_text = response.text
                    steps_executed.append(f"AI Block: Processed with prompt '{prompt[:30]}...'")
                    print(f"AI response: {current_text[:100]}...")
                except Exception as e:
                    current_text = f"[AI error] {e}"
                    steps_executed.append(f"AI Block: Error - {e}")
                    print(f"AI error: {e}")

        elif ntype == 'toolNode':
            op = data.get('operation', 'uppercase')
            if op == 'uppercase':
                current_text = (current_text or '').upper()
            elif op == 'lowercase':
                current_text = (current_text or '').lower()
            elif op == 'word_count':
                wc = len((current_text or '').split())
                current_text = f"Word count: {wc}\n\n{current_text}"
            steps_executed.append(f"Tool Block: Applied '{op}'")
            print(f"Applied tool operation: {op}")

        elif ntype == 'memoryNode':
            memory_value = current_text
            note = data.get('note', '')
            current_text = f"{current_text}\n\n[Memory saved]{(': ' + note) if note else ''}"
            steps_executed.append(f"Memory Block: Saved with note '{note}'")
            print(f"Memory saved: {memory_value[:50]}...")

        elif ntype == 'dataSourceNode':
            current_text = data.get('sourceText', '')
            steps_executed.append(f"Data Source: Loaded text")
            print(f"Loaded data source: {current_text[:50]}...")

        elif ntype == 'outputNode':
            steps_executed.append("Output Block: Reached")
            print("Reached output node")
            break

        current_id = target_id

    result = current_text
    if memory_value:
        result = f"{result}\n\n[Memory]: {memory_value}"

    print(f"Final result: {result[:100]}...")
    print(f"Steps executed: {steps_executed}")

    return {"result": result}

# single consolidated route above handles execution