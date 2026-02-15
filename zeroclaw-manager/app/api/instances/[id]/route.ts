import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Instance from '@/models/Instance';
import path from 'path';
import fs from 'fs';
import { processManager } from '@/lib/processManager';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const instance = await Instance.findById(id);
    if (!instance) {
      return NextResponse.json({ success: false, error: 'Instance not found' }, { status: 404 });
    }

    // Enrich with runtime status
    const isRunning = processManager.isRunning(id);
    const enrichedInstance = {
      ...instance.toObject(),
      status: isRunning ? 'running' : 'stopped',
    };

    return NextResponse.json({ success: true, data: enrichedInstance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const instance = await Instance.findById(id);
    if (!instance) {
      return NextResponse.json({ success: false, error: 'Instance not found' }, { status: 404 });
    }

    // Stop process if running
    if (processManager.isRunning(id)) {
      processManager.stop(id);
    }

    // Delete workspace directory
    if (instance.workspacePath && fs.existsSync(instance.workspacePath)) {
      fs.rmSync(instance.workspacePath, { recursive: true, force: true });
    }

    await Instance.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: 'Instance deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
