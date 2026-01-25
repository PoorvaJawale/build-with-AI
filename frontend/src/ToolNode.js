import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function ToolNode({ data }) {
  const { operation = 'uppercase' } = data || {};
  return (
    <div style={{ padding: '10px', borderRadius: '8px', background: '#fff', border: '2px solid #f59e0b', minWidth: '180px' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '6px' }}>TOOL BLOCK</div>
      <label style={{ display: 'block', fontSize: '11px', color: '#334155' }}>Operation</label>
      <select
        value={operation}
        onChange={(e) => data.onOperationChange && data.onOperationChange(e.target.value)}
        style={{ width: '100%', fontSize: '11px', padding: '4px' }}
      >
        <option value="uppercase">Uppercase</option>
        <option value="lowercase">Lowercase</option>
        <option value="word_count">Word Count</option>
      </select>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}