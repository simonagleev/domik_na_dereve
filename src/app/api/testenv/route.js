export async function GET() {
    return new Response(
      JSON.stringify({
        shopId: process.env.YOOKASSA_SHOP_ID || "Shop id not found",
        secretKey: process.env.YOOKASSA_SECRET_KEY || "Key not found",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  }


