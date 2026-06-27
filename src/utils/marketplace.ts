export function getMarketplaceLabel(url: string): string {
  if (url.includes('shopee')) return 'Ver na Shopee'
  if (url.includes('mercadolivre') || url.includes('mercadolibre')) return 'Ver no M. Livre'
  if (url.includes('amazon')) return 'Ver na Amazon'
  if (url.includes('americanas')) return 'Ver nas Americanas'
  if (url.includes('magalu') || url.includes('magazineluiza')) return 'Ver no Magalu'
  if (url.includes('casasbahia')) return 'Ver nas C. Bahia'
  if (url.includes('aliexpress')) return 'Ver no AliExpress'
  return 'Ver oferta'
}

export function parsePriceVal(price: string | null | undefined): number {
  if (!price) return 0
  return parseFloat(price.replace(/[R$\s.]/g, '').replace(',', '.')) || 0
}

export function parseSalesVal(sales: string | null | undefined): number {
  if (!sales) return 0
  const m = sales.match(/([\d.,]+)\s*([kKmM]?)/)
  if (!m) return 0
  let n = parseFloat(m[1].replace(',', '.'))
  const suf = m[2].toLowerCase()
  if (suf === 'k') n *= 1000
  if (suf === 'm') n *= 1000000
  return Math.round(n)
}

export function parseDiscountVal(discount: string | null | undefined): number {
  if (!discount) return 0
  return parseFloat(discount.replace(/[^0-9.]/g, '')) || 0
}
