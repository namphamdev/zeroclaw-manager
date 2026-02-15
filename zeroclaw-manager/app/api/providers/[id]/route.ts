import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const deletedProvider = await Provider.deleteOne({ _id: id });
    if (!deletedProvider) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: deletedProvider });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
