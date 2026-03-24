import React, { useState } from 'react';
import TerminalLoader from './components/TerminalLoader';
import PredictorDashboard from './components/PredictorDashboard';

export default function App() {
  const [status, setStatus] = useState<'BOOTING' | 'READY'>('BOOTING');

  return (
    <div className="min-h-screen bg-black">
      {status === 'BOOTING' ? (
        <TerminalLoader onComplete={() => setStatus('READY')} />
      ) : (
        <PredictorDashboard />
      )}
    </div>
  );
}
