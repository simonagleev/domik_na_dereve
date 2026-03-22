import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminPayload } from '@/lib/adminAuth';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { techName, id } = params;
  if (techName !== 'shows') {
    return NextResponse.json({ error: 'Пока только shows' }, { status: 400 });
  }

  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  const { data, error } = await supabase.from('shows').select('*').eq('ID', numericId).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { techName, id } = params;
  if (techName !== 'shows') {
    return NextResponse.json({ error: 'Пока только shows' }, { status: 400 });
  }

  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  const body = await request.json();

  const updates = {};
  const allowed = ['Name', 'Price', 'MaxTikets', 'Description', 'Comments', 'ImageName', 'ImagePath', 'Age', 'Duration'];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates[key] = body[key];
    }
  }

  const { data, error } = await supabase.from('shows').update(updates).eq('ID', numericId).select().single();

  if (error) {
    console.error('PATCH shows', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
