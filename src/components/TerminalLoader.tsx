import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, CheckCircle2, Loader2, ShieldCheck, Cpu, Database, Wifi, Activity, History, TrendingUp, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

const BOOT_LOGS = [
  { text: "Aviator Predictor v4.0.227 — Initializing...", delay: 500 },
  { text: "Loading AI prediction model...", delay: 800 },
  { text: "  model: aviator-coeff-transformer-v4", delay: 200 },
  { text: "  weights: 0ACD1E24CE81AF01024DB62548AE048E", delay: 200 },
  { text: "  parameters: 239,000,000", delay: 200 },
  { text: "  status: loaded [OK]", delay: 400, type: 'success' },
  { text: "Initializing coefficient analysis engine...", delay: 600 },
  { text: "  /v4/predict/coefficients", delay: 100 },
  { text: "  /v4/predict/crash-point", delay: 100 },
  { text: "  /v4/predict/multiplier-range", delay: 100 },
  { text: "  /v4/predict/round-history", delay: 100 },
  { text: "  /v4/stream/realtime-odds", delay: 100 },
  { text: "  endpoints: 5/5 active [OK]", delay: 400, type: 'success' },
  { text: "Connecting to 1win game server...", delay: 700 },
  { text: "  websocket: wss://api.1win.com/aviator/stream", delay: 200 },
  { text: "  latency: 30ms", delay: 200 },
  { text: "  connection: established [OK]", delay: 400, type: 'success' },
  { text: "Fetching round data from 1win...", delay: 600 },
  { text: "  last_100_rounds: avg multiplier x2.81", delay: 200 },
  { text: "  max_multiplier: x91.02", delay: 200 },
  { text: "  crash_under_2x: 49%", delay: 200 },
  { text: "  data_sync: complete [OK]", delay: 400, type: 'success' },
  { text: "Calibrating prediction accuracy...", delay: 600 },
  { text: "  round_sample: 26,851 rounds analyzed", delay: 200 },
  { text: "  avg_accuracy: 95.07%", delay: 200 },
  { text: "  confidence_threshold: 0.92", delay: 200 },
  { text: "  calibration: complete [OK]", delay: 400, type: 'success' },
  { text: "Training neural network on live data...", delay: 800 },
  { text: "  epoch 1/4: loss=0.4169 acc=0.8853", delay: 300 },
  { text: "  epoch 2/4: loss=0.1931 acc=0.9292", delay: 300 },
  { text: "  epoch 3/4: loss=0.1356 acc=0.9503", delay: 300 },
  { text: "  epoch 4/4: loss=0.624 acc=0.9681", delay: 300 },
  { text: "  training: converged [OK]", delay: 400, type: 'success' },
  { text: "Generating prediction keys...", delay: 500 },
  { text: "  pk_main: 0E93D3735B2124683A9113BCE2385E4E", delay: 200 },
  { text: "  encryption: AES-256-GCM", delay: 200 },
  { text: "  keys: generated [OK]", delay: 400, type: 'success' },
  { text: "Building APK package...", delay: 600 },
  { text: "  compileSdkVersion: 34 (Android 14)", delay: 100 },
  { text: "  minSdkVersion: 24 (Android 7.0)", delay: 100 },
  { text: "  gradle: 8.2.1 / AGP 8.1.4", delay: 100 },
  { text: "  bundle_id: com.aviator.predictor.Kr5w3G", delay: 100 },
  { text: "  apk_signed: v2 + v3 signature scheme", delay: 100 },
  { text: "  output: aviator-predictor-Kr5w3G.apk (24.5 MB)", delay: 400, type: 'success' },
  { text: "System Ready. Launching Dashboard...", delay: 1000 },
];

export default function TerminalLoader({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<typeof BOOT_LOGS>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentLogIndex = 0;
    const timeouts: NodeJS.Timeout[] = [];

    const addLog = () => {
      if (currentLogIndex < BOOT_LOGS.length) {
        const nextLog = BOOT_LOGS[currentLogIndex];
        if (nextLog) {
          setLogs(prev => [...prev, nextLog]);
          const timeout = setTimeout(addLog, nextLog.delay || 500);
          timeouts.push(timeout);
        }
        currentLogIndex++;
      } else {
        const timeout = setTimeout(onComplete, 1000);
        timeouts.push(timeout);
      }
    };

    addLog();
    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono p-6 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 border-b border-green-900 pb-2">
        <Terminal size={18} />
        <span className="text-xs uppercase tracking-widest opacity-70">Predictor Local Shell - srv-826f18</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-sm scrollbar-hide">
        {logs.map((log, i) => (
          log && (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-2",
                log.type === 'success' ? "text-cyan-400" : "text-green-500"
              )}
            >
              <span className="opacity-30 select-none">[{i.toString().padStart(2, '0')}]</span>
              <span>{log.text}</span>
              {log.type === 'success' && <CheckCircle2 size={14} className="mt-1 shrink-0" />}
            </motion.div>
          )
        ))}
        <div className="flex items-center gap-2">
          <span className="opacity-30 select-none">[{logs.length.toString().padStart(2, '0')}]</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-green-900 flex justify-between items-center text-[10px] opacity-50 uppercase tracking-tighter">
        <span>IP: 154.227.128.17</span>
        <span>Account: atusasirameddy46@gmail.com</span>
        <span>Build: v4.0.227</span>
      </div>
    </div>
  );
}
