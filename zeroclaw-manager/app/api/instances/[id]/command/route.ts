import { NextResponse } from 'next/server';
import { processManager } from '@/lib/processManager';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const command = body.command;

    if (!processManager.isRunning(id)) {
      return NextResponse.json({ success: false, error: 'Instance is not running' }, { status: 400 });
    }

    processManager.sendCommand(id, command);
    return NextResponse.json({ success: true, message: 'Command sent' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
