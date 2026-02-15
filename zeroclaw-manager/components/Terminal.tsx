'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

export default function Terminal({ instanceId }: { instanceId: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [input, setInput] = useState('');

  // Poll logs
  const { data: logs } = useSWR(`/api/instances/${instanceId}/logs`, fetcher, {
    refreshInterval: 1000
  });

  // Keep track of printed logs to avoid duplication (simple approach)
  const lastLogIndex = useRef(0);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
      rows: 20,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('Connecting to instance logs...');

    xtermRef.current = term;

    return () => {
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (xtermRef.current && logs) {
      if (logs.length < lastLogIndex.current) {
        // Logs reset?
        lastLogIndex.current = 0;
        xtermRef.current.clear();
      }

      const newLogs = logs.slice(lastLogIndex.current);
      if (newLogs.length > 0) {
        newLogs.forEach((log: string) => {
           // Handle newlines properly for xterm if needed, though child process usually sends \n
           // Xterm expects \r\n for line break
           const formatted = log.replace(/\n/g, '\r\n');
           xtermRef.current?.write(formatted);
        });
        lastLogIndex.current = logs.length;
      }
    }
  }, [logs]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    try {
      await axios.post(`/api/instances/${instanceId}/command`, { command: input });
      setInput('');
    } catch (error) {
      console.error('Failed to send command', error);
      xtermRef.current?.writeln(`\r\nError sending command: ${error}\r\n`);
    }
  };

  return (
    <div className="bg-black p-4 rounded-lg shadow-lg">
      <div ref={terminalRef} className="mb-4 overflow-hidden rounded" />
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-gray-800 text-white border border-gray-700 rounded p-2 font-mono"
          placeholder="Enter command..."
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
