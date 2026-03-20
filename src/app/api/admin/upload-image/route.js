import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

function getExtension(file) {
  const nameExt = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (nameExt) return nameExt;
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/svg+xml') return 'svg';
  return 'bin';
}

function checkAdmin(request) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token || !JWT_SECRET) return false;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') || 'common').trim().toLowerCase();

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Разрешены только JPG/PNG/WEBP/SVG' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Максимальный размер файла 5MB' }, { status: 400 });
  }

  const ext = getExtension(file);
  const safeFolder = folder.replace(/[^a-z0-9_-]/g, '');
  const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
  const relativeDir = path.posix.join('uploads', 'events', safeFolder || 'common');
  const relativePath = path.posix.join(relativeDir, fileName);

  const absoluteDir = path.join(process.cwd(), 'public', 'uploads', 'events', safeFolder || 'common');
  const absolutePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(bytes));

  return NextResponse.json({
    ok: true,
    imagePath: `/${relativePath}`,
  });
}
