export default function DebugEnv() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Debug</h1>
      <pre>
        NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
      </pre>
    </div>
  );
}
