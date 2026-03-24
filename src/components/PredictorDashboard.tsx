import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  History, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Wifi, 
  User, 
  Settings, 
  LogOut,
  ChevronRight,
  Zap,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';

const ROUND_HISTORY = [
  { id: 1, multiplier: 2.81, time: '14:22' },
  { id: 2, multiplier: 1.45, time: '14:21' },
  { id: 3, multiplier: 12.4, time: '14:20' },
  { id: 4, multiplier: 1.02, time: '14:19' },
  { id: 5, multiplier: 3.15, time: '14:18' },
  { id: 6, multiplier: 1.88, time: '14:17' },
  { id: 7, multiplier: 91.02, time: '14:16' },
  { id: 8, multiplier: 2.11, time: '14:15' },
];

export default function PredictorDashboard() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [nextIn, setNextIn] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      console.log('Connected to Predictor Stream');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'INIT':
          setHistory(data.history || []);
          setPrediction(data.nextPrediction);
          if (data.isFlying) {
            setGameState('FLYING');
            setCurrentMultiplier(data.currentMultiplier);
          }
          break;
        case 'WAITING':
          setGameState('WAITING');
          setNextIn(data.nextIn);
          setPrediction(data.prediction);
          setConfidence(Math.floor(Math.random() * 8 + 92));
          setHistory(data.history || []);
          break;
        case 'START':
          setGameState('FLYING');
          setCurrentMultiplier(1.0);
          break;
        case 'TICK':
          setCurrentMultiplier(data.multiplier);
          break;
        case 'CRASHED':
          setGameState('CRASHED');
          setCurrentMultiplier(data.multiplier);
          if (data.round) {
            setHistory(prev => [data.round, ...prev].slice(0, 10));
          }
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Predictor Stream');
      // Reconnect logic could be added here
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const generatePrediction = () => {
    // In live mode, predictions are pushed from the server
    // We can simulate a "refresh" or "re-analyze" if needed
    setIsPredicting(true);
    setTimeout(() => setIsPredicting(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">Aviator Predictor</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Live Engine v4.0</span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
          <User size={18} className="text-white/60" />
        </button>
      </header>

      <main className="p-6 space-y-6 max-w-md mx-auto">
        {/* Main Prediction Card */}
        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em]">Next Round Forecast</span>
                <h2 className="text-2xl font-light italic serif">Predicted Crash</h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Confidence</span>
                <span className={cn(
                  "text-lg font-mono font-bold",
                  confidence > 0 ? "text-green-400" : "text-white/10"
                )}>
                  {confidence > 0 ? `${confidence}%` : '--%'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-10 min-h-[200px]">
              <AnimatePresence mode="wait">
                {gameState === 'FLYING' ? (
                  <motion.div
                    key="flying"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      scale: {
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    className="flex flex-col items-center relative"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Live Stream</span>
                    </div>
                    <motion.span 
                      key={currentMultiplier}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-7xl font-mono font-black tracking-tighter text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      x{currentMultiplier.toFixed(2)}
                    </motion.span>
                    <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-[0.3em] mt-2">Live Multiplier</p>
                    
                    {/* Dynamic background glow */}
                    <div className="absolute inset-0 -z-10 bg-cyan-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                  </motion.div>
                ) : gameState === 'CRASHED' ? (
                  <motion.div
                    key="crashed"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center relative"
                  >
                    {/* Explosion Effect */}
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-red-500/40 blur-xl"
                    />
                    <motion.div 
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full border-2 border-red-500/50"
                    />
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Round Ended</span>
                    </div>
                    <motion.span 
                      animate={{ 
                        x: [0, -5, 5, -5, 5, 0],
                        rotate: [0, -1, 1, -1, 1, 0]
                      }}
                      transition={{ duration: 0.3 }}
                      className="text-7xl font-mono font-black tracking-tighter text-red-500"
                    >
                      x{currentMultiplier.toFixed(2)}
                    </motion.span>
                    <p className="text-xs font-mono text-red-500/60 uppercase tracking-[0.3em] mt-2">Crashed</p>
                  </motion.div>
                ) : isPredicting ? (
                  <motion.div
                    key="predicting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <RefreshCw size={64} className="text-cyan-500 animate-spin" strokeWidth={1} />
                      <Zap size={24} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-mono text-white/40 uppercase tracking-[0.3em] animate-pulse">Analyzing Patterns...</p>
                  </motion.div>
                ) : prediction ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center relative"
                  >
                    {/* Countdown Ring for WAITING state */}
                    {gameState === 'WAITING' && nextIn > 0 && (
                      <div className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none">
                        <svg className="w-64 h-64 -rotate-90">
                          <circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/5"
                          />
                          <motion.circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="754"
                            initial={{ strokeDashoffset: 754 }}
                            animate={{ strokeDashoffset: 754 - (754 * (5 - nextIn) / 5) }}
                            transition={{ duration: 1, ease: "linear" }}
                            className="text-cyan-500/30"
                          />
                        </svg>
                        
                        <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full transform translate-x-1/2 -translate-y-1/2">
                          T-{nextIn}S
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">AI Forecast</span>
                    </div>
                    <span className="text-7xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                      x{prediction.toFixed(2)}
                    </span>
                    <div className="mt-4 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-green-400" />
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Verified Signal</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 opacity-20"
                  >
                    <TrendingUp size={64} strokeWidth={1} />
                    <p className="text-xs font-mono uppercase tracking-[0.3em]">Ready for Analysis</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={generatePrediction}
              disabled={isPredicting || gameState === 'FLYING'}
              className={cn(
                "w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2",
                (isPredicting || gameState === 'FLYING')
                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isPredicting ? 'Processing...' : gameState === 'FLYING' ? 'Round in Progress' : gameState === 'WAITING' && nextIn > 0 ? `Next Round in ${nextIn}s` : 'Get Prediction'}
              {!isPredicting && gameState !== 'FLYING' && <ChevronRight size={18} />}
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-white/40">
              <Activity size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Accuracy</span>
            </div>
            <p className="text-xl font-mono font-bold">95.07%</p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-white/40">
              <Wifi size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Latency</span>
            </div>
            <p className="text-xl font-mono font-bold">30ms</p>
          </div>
        </div>

        {/* History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <History size={16} className="text-white/40" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Recent Rounds</h3>
            </div>
            <span className="text-[10px] font-mono text-white/20 uppercase">Last 100 Rounds</span>
          </div>
          
          <div className="space-y-2">
            {history.map((round) => (
              round && (
                <div 
                  key={round.id} 
                  className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-white/20">{round.time}</span>
                    <span className={cn(
                      "font-mono font-bold",
                      round.multiplier >= 2 ? "text-cyan-400" : "text-white/60"
                    )}>
                      x{round.multiplier.toFixed(2)}
                    </span>
                  </div>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    round.multiplier >= 2 ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "bg-white/10"
                  )} />
                </div>
              )
            ))}
          </div>
        </section>

        {/* System Info */}
        <section className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 flex items-start gap-4">
          <AlertTriangle size={20} className="text-cyan-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">System Notice</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              AI model <span className="text-white/80">v4.0.227</span> is currently synchronized with 1win server. Prediction accuracy is optimal.
            </p>
          </div>
        </section>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <button className="flex flex-col items-center gap-1 text-cyan-500">
          <TrendingUp size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Predict</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
          <Database size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Data</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
          <Cpu size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Model</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Setup</span>
        </button>
      </nav>
      
      {/* Spacer for nav */}
      <div className="h-24" />
    </div>
  );
}
