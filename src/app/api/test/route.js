export async function GET(req) {
  console.log('GET test')
  try {
    // Возвращаем успешный ответ с данными
    return new Response(JSON.stringify({test: 'test test 123'}), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
