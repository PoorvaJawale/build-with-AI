import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function DataSourceNode({ data }) {
  const { sourceText = '' } = data || {};
  return (
    <div style={{ padding: '10px', borderRadius: '8px', background: '#fff', border: '2px solid #8b5cf6', minWidth: '200px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '6px' }}>DATA SOURCE</div>
      <textarea
        rows="4"
        placeholder="Paste text to inject into the flow"
        style={{ width: '100%', fontSize: '11px', padding: '4px' }}
        value={sourceText}
        onChange={(e) => data.onSourceChange && data.onSourceChange(e.target.value)}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}