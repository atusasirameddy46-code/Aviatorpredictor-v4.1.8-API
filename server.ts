import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Game State
  let currentMultiplier = 1.0;
  let isFlying = false;
  let nextCrashPoint = 2.5;
  let nextPrediction = 2.45;
  let roundHistory: { id: number; multiplier: number; time: string }[] = [
    { id: 1, multiplier: 2.81, time: '14:22' },
    { id: 2, multiplier: 1.45, time: '14:21' },
    { id: 3, multiplier: 12.4, time: '14:20' },
  ];

  function broadcast(data: any) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Game Loop Simulation
  async function runGameLoop() {
    while (true) {
      // 1. Waiting for next round
      isFlying = false;
      currentMultiplier = 1.0;
      // Generate next crash point and prediction
      nextCrashPoint = parseFloat((Math.random() * 5 + 1.1).toFixed(2));
      nextPrediction = parseFloat((nextCrashPoint * (0.95 + Math.random() * 0.04)).toFixed(2));
      
      for (let i = 5; i > 0; i--) {
        broadcast({ 
          type: 'WAITING', 
          nextIn: i,
          prediction: nextPrediction,
          history: roundHistory.slice(0, 10)
        });
        await new Promise(r => setTimeout(r, 1000));
      }

      // 2. Flying
      isFlying = true;
      broadcast({ type: 'START' });

      const startTime = Date.now();
      while (isFlying) {
        const elapsed = (Date.now() - startTime) / 1000;
        // Exponential growth simulation: multiplier = e^(0.1 * t)
        currentMultiplier = Math.exp(0.15 * elapsed);
        
        if (currentMultiplier >= nextCrashPoint) {
          isFlying = false;
          currentMultiplier = nextCrashPoint;
        } else {
          broadcast({ type: 'TICK', multiplier: currentMultiplier });
          await new Promise(r => setTimeout(r, 100));
        }
      }

      // 3. Crashed
      const newRound = {
        id: Date.now(),
        multiplier: currentMultiplier,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      roundHistory = [newRound, ...roundHistory].slice(0, 50);
      
      broadcast({ 
        type: 'CRASHED', 
        multiplier: currentMultiplier,
        round: newRound
      });
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  runGameLoop();

  wss.on('connection', (ws) => {
    console.log('Client connected to Aviator Stream');
    ws.send(JSON.stringify({ 
      type: 'INIT', 
      history: roundHistory.slice(0, 10),
      isFlying,
      currentMultiplier,
      nextPrediction: isFlying ? null : nextPrediction
    }));
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
