import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Instance from '@/models/Instance';
import { processManager } from '@/lib/processManager';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();
    const action = body.action; // 'start' or 'stop'

    const instance = await Instance.findById(id);
    if (!instance) {
      return NextResponse.json({ success: false, error: 'Instance not found' }, { status: 404 });
    }

    if (action === 'start') {
      if (processManager.isRunning(id)) {
        return NextResponse.json({ success: false, error: 'Instance is already running' });
      }
      // Start the process
      processManager.start(id, instance.workspacePath);

      instance.status = 'running';
      await instance.save();

      return NextResponse.json({ success: true, message: 'Instance started' });
    } else if (action === 'stop') {
      if (!processManager.isRunning(id)) {
        return NextResponse.json({ success: false, error: 'Instance is not running' });
      }
      processManager.stop(id);

      instance.status = 'stopped';
      await instance.save();

      return NextResponse.json({ success: true, message: 'Instance stopped' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
