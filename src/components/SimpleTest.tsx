import React from 'react';

export const SimpleTest = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#111827', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>SHADOW SIGNAL</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>App is working!</p>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          border: '1px solid #374151', 
          borderRadius: '8px',
          backgroundColor: '#1f2937'
        }}>
          <p>If you see this, React is loading correctly.</p>
          <p>Tailwind CSS test: <span className="text-red-500">This should be red if Tailwind works</span></p>
        </div>
      </div>
    </div>
  );
};