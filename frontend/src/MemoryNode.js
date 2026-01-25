import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function MemoryNode({ data }) {
  const { note = '' } = data || {};
  return (
    <div style={{ padding: '10px', borderRadius: '8px', background: '#fff', border: '2px solid #22c55e', minWidth: '180px' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e', marginBottom: '6px' }}>MEMORY BLOCK</div>
      <textarea
        rows="3"
        placeholder="Optional note or tag for memory"
        style={{ width: '100%', fontSize: '11px', padding: '4px' }}
        value={note}
        onChange={(e) => data.onNoteChange && data.onNoteChange(e.target.value)}
      />
      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>Stores current text for later nodes.</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}