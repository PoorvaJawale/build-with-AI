import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from fastapi import FastAPI, Body, Request

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Warning: GOOGLE_API_KEY not found in environment!")
else:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

# IMPORTANT: Update with your Vercel URL during the hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set your API Key (Use Environment Variables for safety)
genai.configure(api_key="YOUR_GEMINI_API_KEY")
model = genai.GenerativeModel('gemini-1.5-flash')

@app.get("/")
def home():
    return {"status": "AI Builder Backend is Live"}

@app.post("/api/execute")
@app.post("/api/execute/")
async def execute_workflow(request: Request, workflow: dict = Body(...)):
    print(f"Received request at: {request.url}") # This will show in Render logs
    
    nodes = workflow.get("nodes", [])
    edges = workflow.get("edges", [])
    
    # 1. Map node IDs to their data for easy lookup
    node_map = {n['id']: n for n in nodes}
    
    # 2. Find the starting Input Node
    current_input = ""
    for node in nodes:
        if node['type'] == 'inputNode':
            current_input = node['data'].get('label', '')

    # 3. Follow the connections (Edges)
    # This finds which node the Input Node is connected to
    for edge in edges:
        target_node = node_map.get(edge['target'])
        if target_node and target_node['type'] == 'aiNode':
            system_prompt = target_node['data'].get('prompt', '')
            
            # Combine the instruction with the user input
            full_query = f"{system_prompt}\n\nUser Input: {current_input}"
            
            # Call Gemini
            response = model.generate_content(full_query)
            current_input = response.text

    return {"result": current_input}

@app.post("/api/execute")
async def execute_workflow(workflow: dict = Body(...)):
    nodes = workflow.get("nodes", [])
    edges = workflow.get("edges", [])
    
    # 1. Create a map of connections
    # source_id -> target_id
    connections = {edge['source']: edge['target'] for edge in edges}
    
    # 2. Find the starting node (the one that is an 'input' type)
    current_node = next((n for n in nodes if n['type'] == 'input'), None)
    current_data = current_node['data'].get('label', '') if current_node else ""

    # 3. Follow the path
    while current_node and current_node['id'] in connections:
        target_id = connections[current_node['id']]
        current_node = next((n for n in nodes if n['id'] == target_id), None)
        
        if current_node and current_node['type'] == 'aiNode':
            prompt = current_node['data'].get('prompt', '')
            # Call Gemini with the cumulative data
            response = model.generate_content(f"{prompt}\n\nContext: {current_data}")
            current_data = response.text
            
    return {"result": current_data}