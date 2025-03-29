import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/documents.json');

export async function POST(request) {
  try {
    const searchParams = await request.json();
    
    // Load documents
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json([]);
    }
    
    const documents = JSON.parse(fs.readFileSync(dbPath));
    
    // Filter documents based on search parameters
    const results = documents.filter(doc => {
      if (searchParams.major_head && doc.major_head !== searchParams.major_head) return false;
      if (searchParams.minor_head && doc.minor_head !== searchParams.minor_head) return false;
      if (searchParams.search_term && 
          !doc.name.toLowerCase().includes(searchParams.search_term.toLowerCase()) &&
          !doc.document_remarks?.toLowerCase().includes(searchParams.search_term.toLowerCase())) {
        return false;
      }
      if (searchParams.tags && searchParams.tags.length > 0) {
        const hasMatchingTag = searchParams.tags.some(tag => 
          doc.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      return true;
    });
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}