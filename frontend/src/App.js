import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ReactFlow, addEdge, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AiNode from './AiNode';
import InputNode from './InputNode';
import OutputNode from './OutputNode';
import ToolNode from './ToolNode';
import MemoryNode from './MemoryNode';
import DataSourceNode from './DataSourceNode';



const nodeTypes = {
  inputNode: InputNode,
  aiNode: AiNode,
  toolNode: ToolNode,
  memoryNode: MemoryNode,
  dataSourceNode: DataSourceNode,
  outputNode: OutputNode
};

const initialNodes = [
  { id: '1', type: 'inputNode', data: { label: '' }, position: { x: 250, y: 0 } },
  { id: '2', type: 'aiNode', position: { x: 250, y: 150 }, data: { prompt: '' } },
  { id: '3', type: 'outputNode', data: { label: 'Output will appear here' }, position: { x: 250, y: 350 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [output, setOutput] = useState("");

  // FIX 1: Define these functions BEFORE useMemo
  const handlePromptChange = useCallback((id, newPrompt) => {
    setNodes((nds) => nds.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, prompt: newPrompt } } : node
    ));
  }, [setNodes]);

  const handleLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) => nds.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
    ));
  }, [setNodes]);

  const handleOperationChange = useCallback((id, newOp) => {
    setNodes((nds) => nds.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, operation: newOp } } : node
    ));
  }, [setNodes]);

  const handleNoteChange = useCallback((id, newNote) => {
    setNodes((nds) => nds.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, note: newNote } } : node
    ));
  }, [setNodes]);

  const handleSourceChange = useCallback((id, newSource) => {
    setNodes((nds) => nds.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, sourceText: newSource } } : node
    ));
  }, [setNodes]);

  // FIX 2: useMemo now has access to the functions above
  const nodesWithHandlers = useMemo(() =>
    nodes.map((node) => {
      let updatedNode = { ...node };
      if (node.type === 'inputNode') {
        updatedNode.data = {
          ...node.data,
          onLabelChange: (val) => handleLabelChange(node.id, val)
        };
      } else if (node.type === 'aiNode') {
        updatedNode.data = {
          ...node.data,
          onPromptChange: (val) => handlePromptChange(node.id, val)
        };
      } else if (node.type === 'toolNode') {
        updatedNode.data = {
          ...node.data,
          onOperationChange: (val) => handleOperationChange(node.id, val)
        };
      } else if (node.type === 'memoryNode') {
        updatedNode.data = {
          ...node.data,
          onNoteChange: (val) => handleNoteChange(node.id, val)
        };
      } else if (node.type === 'dataSourceNode') {
        updatedNode.data = {
          ...node.data,
          onSourceChange: (val) => handleSourceChange(node.id, val)
        };
      }
      return updatedNode;
    }), [nodes, handleLabelChange, handlePromptChange, handleOperationChange, handleNoteChange, handleSourceChange]
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const runWorkflow = async () => {
    if (edges.length === 0) {
      setOutput("Error: No connections! Please connect your blocks by dragging from one block's handle to another.");
      return;
    }

    setOutput("Processing...");
    console.log('Sending to backend:', { nodes, edges });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://ai-backend-poorva.onrender.com';
      console.log('Backend URL:', backendUrl);

      const response = await fetch(backendUrl + '/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      const resultText = data.result || data.output;

      if (!resultText) {
        setOutput("Warning: Backend returned empty result. Check console for details.");
        return;
      }

      setOutput(resultText);

      setNodes((nds) => nds.map((node) =>
        node.type === 'outputNode' ? { ...node, data: { ...node.data, label: resultText } } : node
      ));

    } catch (err) {
      console.error('Workflow error:', err);
      setOutput(`Error: ${err.message}\n\nTip: Make sure your blocks are connected and you've filled in the required fields.`);
    }
  };

  const downloadFlow = () => {
    const flowData = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([flowData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-ai-app.json';
    link.click();
  };

  const uploadRef = useRef(null);
  const importFlow = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      setOutput('Flow imported');
    } catch (e) {
      setOutput('Import failed: ' + e.message);
    }
  };

  const addAIBlock = () => {
    const id = `ai-${Date.now()}`;
    const newNode = {
      id,
      type: 'aiNode',
      position: { x: Math.random() * 400, y: 200 },
      data: { prompt: '' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addToolBlock = () => {
    const id = `tool-${Date.now()}`;
    const newNode = {
      id,
      type: 'toolNode',
      position: { x: Math.random() * 400 + 200, y: 220 },
      data: { operation: 'uppercase' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addMemoryBlock = () => {
    const id = `mem-${Date.now()}`;
    const newNode = {
      id,
      type: 'memoryNode',
      position: { x: Math.random() * 400 + 100, y: 260 },
      data: { note: '' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addDataSourceBlock = () => {
    const id = `ds-${Date.now()}`;
    const newNode = {
      id,
      type: 'dataSourceNode',
      position: { x: Math.random() * 400, y: 80 },
      data: { sourceText: '' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const resetFlow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setOutput("");
  };

  const loadExample = () => {
    const exampleNodes = [
      { id: '1', type: 'inputNode', data: { label: 'Hello World' }, position: { x: 250, y: 0 } },
      { id: '2', type: 'aiNode', position: { x: 250, y: 150 }, data: { prompt: 'Translate this to Spanish' } },
      { id: '3', type: 'outputNode', data: { label: 'Output will appear here' }, position: { x: 250, y: 350 } },
    ];
    const exampleEdges = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ];
    setNodes(exampleNodes);
    setEdges(exampleEdges);
    setOutput("Example loaded! Click 'Run Flow' to see it work.");
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>LegoAI Studio</strong>

        {/* New Toolbar Group */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={addAIBlock} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            + Add AI Block
          </button>

          <button onClick={addToolBlock} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            + Add Tool
          </button>

          <button onClick={addMemoryBlock} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            + Add Memory
          </button>

          <button onClick={addDataSourceBlock} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            + Data Source
          </button>

          <button onClick={downloadFlow} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            💾 Download
          </button>

          <input
            type="file"
            ref={uploadRef}
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => importFlow(e.target.files?.[0])}
          />
          <button onClick={() => uploadRef.current && uploadRef.current.click()} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            ⬆️ Upload
          </button>

          <button onClick={loadExample} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            Load Example
          </button>

          <button onClick={resetFlow} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            Reset
          </button>

          <button onClick={runWorkflow} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer' }}>
            Run Flow
          </button>
        </div>
      </header>

      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      <div style={{ height: '120px', background: '#f8fafc', padding: '15px', borderTop: '2px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Console Output:</strong>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Blocks: {nodes.length} | Connections: {edges.length}
            {edges.length === 0 && <span style={{ color: '#ef4444', fontWeight: 'bold' }}> - No connections!</span>}
          </span>
        </div>
        <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{output || "Ready to run. Type in the User Input box, add a prompt to the AI block, then click Run Flow."}</p>
      </div>
    </div>
  );
}