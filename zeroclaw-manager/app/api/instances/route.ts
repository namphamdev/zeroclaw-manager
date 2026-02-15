import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Instance from '@/models/Instance';
import Provider from '@/models/Provider';
import path from 'path';
import fs from 'fs';
import { processManager } from '@/lib/processManager';

export async function GET() {
  await dbConnect();
  try {
    const instances = await Instance.find({});
    // Enrich with running status from processManager
    const enrichedInstances = instances.map(inst => ({
      ...inst.toObject(),
      isRunning: processManager.isRunning(inst._id.toString())
    }));
    return NextResponse.json({ success: true, data: enrichedInstances });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    // Create base data directory
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create instance record (initially without path)
    const instance = new Instance({
      name: body.name,
      workspacePath: '',
      status: 'stopped'
    });

    // Set workspace path based on ID
    const workspacePath = path.join(dataDir, instance._id.toString());
    instance.workspacePath = workspacePath;

    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    // Generate config.toml content
    let configContent = '';

    // Handle Provider selection
    if (body.providerId) {
      const provider = await Provider.findById(body.providerId);
      if (provider) {
        // Use custom provider format: "custom:https://..."
        configContent += `default_provider = "custom:${provider.baseUrl}"\n`;
        if (provider.apiKey) {
           configContent += `api_key = "${provider.apiKey}"\n`;
        }
      } else {
        // Fallback or error if provider not found
        configContent += `default_provider = "openrouter"\n`;
      }
    } else {
       // Default generic config
       configContent += `default_provider = "openrouter"\n`;
    }

    // Basic workspace config
    configContent += `
[workspace]
# root is implicitly set by ZEROCLAW_WORKSPACE env var
`;

    // Write config.toml
    fs.writeFileSync(path.join(workspacePath, 'config.toml'), configContent);

    await instance.save();

    return NextResponse.json({ success: true, data: instance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
