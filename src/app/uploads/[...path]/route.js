import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';

export const runtime = 'nodejs';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

function resolveSafeUploadPath(segments) {
  if (!segments?.length) return null;
  const decoded = segments.map((s) => decodeURIComponent(String(s)));
  const joined = path.join(UPLOADS_ROOT, ...decoded);
  const normalized = path.normalize(joined);
  if (!normalized.startsWith(UPLOADS_ROOT)) return null;
  return normalized;
}

export async function GET(_request, { params }) {
  const raw = params?.path;
  const segments = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  const filePath = resolveSafeUploadPath(segments);

  if (!filePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    const body = await fs.readFile(filePath);

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
