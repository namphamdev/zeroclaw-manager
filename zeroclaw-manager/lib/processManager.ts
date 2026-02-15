import { spawn, ChildProcess } from 'child_process';

// Global map to store active processes
// Key: instanceId, Value: ChildProcess
// We attach it to globalThis to survive hot reloads in dev (partially)
const globalForProcesses = global as unknown as {
  activeProcesses: Map<string, ChildProcess>;
  processLogs: Map<string, string[]>;
};

if (!globalForProcesses.activeProcesses) {
  globalForProcesses.activeProcesses = new Map();
}
if (!globalForProcesses.processLogs) {
  globalForProcesses.processLogs = new Map();
}

const activeProcesses = globalForProcesses.activeProcesses;
const processLogs = globalForProcesses.processLogs;

export const processManager = {
  start: (instanceId: string, workspacePath: string, args: string[] = []) => {
    if (activeProcesses.has(instanceId)) {
      // Check if process is actually running
      const proc = activeProcesses.get(instanceId);
      if (proc && proc.exitCode === null) {
          throw new Error('Instance is already running');
      }
      activeProcesses.delete(instanceId);
    }

    // Determine zeroclaw binary path.
    const zeroclawPath = process.env.ZEROCLAW_PATH || 'zeroclaw';

    const env = { ...process.env, ZEROCLAW_WORKSPACE: workspacePath };

    console.log(`Starting instance ${instanceId} with workspace ${workspacePath}`);
    // Use 'agent' command for interactive mode by default if no args provided, or just pass args
    // The default command to interact is `zeroclaw agent`
    // If we want daemon, we run `zeroclaw daemon`
    // But daemon is not interactive via stdin in the same way.
    // The requirement is "Allow interactive with zeroclaw command via UI".
    // "agent" mode is interactive.
    const commandArgs = args.length > 0 ? args : ['agent'];

    const child = spawn(zeroclawPath, commandArgs, { env });

    activeProcesses.set(instanceId, child);
    processLogs.set(instanceId, []);

    child.stdout.on('data', (data) => {
      const log = data.toString();
      const logs = processLogs.get(instanceId) || [];
      logs.push(log);
      // Keep last 1000 lines
      if (logs.length > 1000) logs.shift();
      processLogs.set(instanceId, logs);
    });

    child.stderr.on('data', (data) => {
       const log = data.toString();
      const logs = processLogs.get(instanceId) || [];
      logs.push(log);
      if (logs.length > 1000) logs.shift();
      processLogs.set(instanceId, logs);
    });

    child.on('close', (code) => {
      console.log(`Instance ${instanceId} exited with code ${code}`);
      activeProcesses.delete(instanceId);
    });

    child.on('error', (err) => {
        console.error(`Instance ${instanceId} error:`, err);
        const logs = processLogs.get(instanceId) || [];
        logs.push(`Error: ${err.message}\n`);
        processLogs.set(instanceId, logs);
        activeProcesses.delete(instanceId);
    })

    return child.pid;
  },

  stop: (instanceId: string) => {
    const child = activeProcesses.get(instanceId);
    if (child) {
      child.kill();
      activeProcesses.delete(instanceId);
      return true;
    }
    return false;
  },

  sendCommand: (instanceId: string, command: string) => {
    const child = activeProcesses.get(instanceId);
    if (child && child.stdin) {
      child.stdin.write(command + '\n');
      return true;
    }
    return false;
  },

  getLogs: (instanceId: string) => {
    return processLogs.get(instanceId) || [];
  },

  isRunning: (instanceId: string) => {
    const child = activeProcesses.get(instanceId);
    return child !== undefined && child.exitCode === null;
  }
};
