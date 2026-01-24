import { Handle, Position } from '@xyflow/react';

export default function InputNode({ data }) {
  return (
    <div style={{ padding: '10px', borderRadius: '8px', background: '#fff', border: '2px solid #10b981', minWidth: '150px' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#10b981' }}>USER INPUT</div>
      <input 
        type="text" 
        placeholder="Type something..."
        style={{ width: '100%', border: 'none', borderBottom: '1px solid #ccc', marginTop: '5px' }}
        onChange={(evt) => data.onLabelChange(evt.target.value)}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}