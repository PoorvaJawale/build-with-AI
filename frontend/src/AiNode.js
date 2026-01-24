import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function AiNode({ data }) {
  return (
    <div style={{ padding: '10px', borderRadius: '8px', background: '#fff', border: '2px solid #3b82f6', minWidth: '150px' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>AI Model Block</div>
      <textarea 
        rows="3"
        placeholder="Instructions (e.g. Translate to Hindi)"
        style={{ width: '100%', fontSize: '10px', padding: '4px' }}
        onChange={(evt) => data.onPromptChange(evt.target.value)}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}