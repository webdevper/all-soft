import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'documents.json');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file with unique name
    const uniqueName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueName);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Create document record
    const document = {
      id: Date.now().toString(),
      name: file.name,
      path: `/uploads/${uniqueName}`,
      type: file.type,
      size: file.size,
      major_head: formData.get('major_head'),
      minor_head: formData.get('minor_head'),
      document_date: formData.get('document_date'),
      document_remarks: formData.get('document_remarks'),
      tags: formData.getAll('tags[]'),
      uploaded_at: new Date().toISOString()
    };

    // Save to database
    let documents = [];
    if (fs.existsSync(dbPath)) {
      documents = JSON.parse(fs.readFileSync(dbPath));
    }
    documents.push(document);
    fs.writeFileSync(dbPath, JSON.stringify(documents, null, 2));

    return NextResponse.json({ 
      success: true, 
      document 
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}