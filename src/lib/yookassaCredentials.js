/**
 * Выбор магазина ЮKassa: тестовый API для разработки, боевой на production.
 *
 * Боевые ключи: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY
 * Тестовые: YOOKASSA_SHOP_ID_TEST, YOOKASSA_SECRET_KEY_TEST
 *
 * На production (NODE_ENV=production) всегда используются только боевые ключи.
 * Вне production тестовый магазин включается, если заданы оба тестовых ключа и:
 *   - запущен next dev (NODE_ENV=development), или
 *   - YOOKASSA_USE_TEST=true (удобно для next start локально)
 */

export function getYooKassaCredentials() {
  const shopIdProd = process.env.YOOKASSA_SHOP_ID;
  const secretKeyProd = process.env.YOOKASSA_SECRET_KEY;

  const shopIdTest = process.env.YOOKASSA_SHOP_ID_TEST;
  const secretKeyTest = process.env.YOOKASSA_SECRET_KEY_TEST;

  if (process.env.NODE_ENV === 'production') {
    return {
      shopId: shopIdProd,
      secretKey: secretKeyProd,
      isTest: false,
    };
  }

  const wantTest =
    process.env.NODE_ENV === 'development' || process.env.YOOKASSA_USE_TEST === 'true';

  if (wantTest && shopIdTest && secretKeyTest) {
    return {
      shopId: shopIdTest,
      secretKey: secretKeyTest,
      isTest: true,
    };
  }

  if (wantTest && (!shopIdTest || !secretKeyTest)) {
    console.warn(
      '[YooKassa] Режим разработки, но YOOKASSA_SHOP_ID_TEST / YOOKASSA_SECRET_KEY_TEST не заданы — используются боевые ключи.'
    );
  }

  return {
    shopId: shopIdProd,
    secretKey: secretKeyProd,
    isTest: false,
  };
}
