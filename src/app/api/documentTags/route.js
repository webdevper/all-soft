import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/documents.json');

export async function GET() {
  try {
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json([]);
    }
    
    const documents = JSON.parse(fs.readFileSync(dbPath));
    
    // Extract all unique tags from documents
    const allTags = documents.flatMap(doc => doc.tags || []);
    const uniqueTags = [...new Set(allTags)];
    
    return NextResponse.json(uniqueTags);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}