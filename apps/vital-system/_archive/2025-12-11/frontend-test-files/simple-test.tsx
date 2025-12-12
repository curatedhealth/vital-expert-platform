/**
 * Ultra-simple test page - no dependencies
 */
export default function SimpleTestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>SIMPLE TEST PAGE</h1>
      <p>If you see this, the page is loading!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

