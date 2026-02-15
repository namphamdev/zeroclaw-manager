import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';

export async function GET() {
  await dbConnect();
  try {
    const providers = await Provider.find({});
    return NextResponse.json({ success: true, data: providers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const provider = await Provider.create(body);
    return NextResponse.json({ success: true, data: provider }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
