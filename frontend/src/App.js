import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, addEdge, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AiNode from './AiNode';
import InputNode from './InputNode';
import OutputNode from './OutputNode';



const nodeTypes = {
  inputNode: InputNode,
  aiNode: AiNode,
  outputNode: OutputNode
};

const initialNodes = [
  { id: '1', type: 'inputNode', data: { label: '' }, position: { x: 250, y: 0 } },
  { id: '2', type: 'aiNode', position: { x: 250, y: 150 }, data: { prompt: '' } },
  { id: '3', type: 'outputNode', data: { label: 'Output will appear here' }, position: { x: 250, y: 350 } },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
      }
      return updatedNode;
    }), [nodes, handleLabelChange, handlePromptChange]
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const runWorkflow = async () => {
    setOutput("Processing...");
    try {
      const response = await fetch('https://ai-backend-poorva.onrender.com/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const resultText = data.result || data.output;

      setOutput(resultText);

      // This MAGIC line puts the result inside the Output Node block!
      setNodes((nds) => nds.map((node) =>
        node.type === 'outputNode' ? { ...node, data: { ...node.data, label: resultText } } : node
      ));

    } catch (err) {
      setOutput("Error: " + err.message);
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

  const resetFlow = () => {
    setNodes(initialNodes);
    setEdges([]);
    setOutput("");
  };

  // Add the button to your <header>
  <button onClick={resetFlow} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Reset</button>

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>AI Lego Studio</strong>

        {/* New Toolbar Group */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={addAIBlock} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            + Add AI Block
          </button>

          <button onClick={downloadFlow} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            💾 Download
          </button>

          <button onClick={resetFlow} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            Reset
          </button>

          <button onClick={runWorkflow} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer' }}>
            ▶ Run Flow
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
        <strong>Console Output:</strong>
        <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{output}</p>
      </div>
    </div>
  );
}