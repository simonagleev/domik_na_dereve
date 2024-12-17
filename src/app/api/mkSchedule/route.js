export async function GET(req) {
  try {
    const data = {haha: 'hehehe 21'}
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
