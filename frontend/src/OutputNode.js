import { Handle, Position } from '@xyflow/react';

export default function OutputNode({ data }) {
  return (
    <div style={{ padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '2px solid #64748b', minWidth: '150px' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>FINAL RESULT</div>
      <div style={{ fontSize: '12px', marginTop: '5px', whiteSpace: 'pre-wrap' }}>
        {data.label || "Waiting for run..."}
      </div>
    </div>
  );
}