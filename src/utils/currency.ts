import { Currency, Product, BuyerTier, VolumePriceTier } from '../types';

export const NGN_TO_USD_RATE = 1 / 1500; // 1 USD = 1500 NGN

export function formatPrice(amountInNGN: number, currency: Currency): string {
  if (currency === 'USD') {
    const usd = amountInNGN * NGN_TO_USD_RATE;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(usd);
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInNGN).replace('NGN', '₦');
}

export function convertAmount(amountInNGN: number, currency: Currency): number {
  if (currency === 'USD') {
    return Math.round(amountInNGN * NGN_TO_USD_RATE * 100) / 100;
  }
  return Math.round(amountInNGN);
}

export function generatePaystackReference(): string {
  const dateStr = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NML-${dateStr}-${randomStr}`;
}

/**
 * Calculates dynamic tiered wholesale pricing based on multi-tier volume ladders
 */
export function getTierPricingForQuantity(
  product: Product,
  quantity: number,
  buyerTier: BuyerTier
): {
  unitPrice: number;
  activeTier: VolumePriceTier;
  discountPercent: number;
  savingsVsRetail: number;
  nextTier?: { requiredQty: number; nextPrice: number; extraDiscount: number };
} {
  const tiers = product.volumeTiers || [];
  if (tiers.length === 0) {
    const unitPrice = buyerTier === 'wholesale' ? product.basePriceWholesale : product.basePriceRetail;
    return {
      unitPrice,
      activeTier: { minQty: 1, priceNGN: unitPrice, label: 'Standard', discountPercent: 0 },
      discountPercent: 0,
      savingsVsRetail: 0,
    };
  }

  // If user is explicitly in wholesale mode, or ordered >= MOQ, match highest applicable volume tier
  let activeTier = tiers[0];
  let nextTier: { requiredQty: number; nextPrice: number; extraDiscount: number } | undefined = undefined;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (quantity >= tier.minQty) {
      activeTier = tier;
      if (i + 1 < tiers.length) {
        const next = tiers[i + 1];
        nextTier = {
          requiredQty: next.minQty - quantity,
          nextPrice: next.priceNGN,
          extraDiscount: next.discountPercent - activeTier.discountPercent,
        };
      } else {
        nextTier = undefined;
      }
    }
  }

  // If retail buyer has not reached wholesale tier 1, use tier 0 retail price
  let unitPrice = activeTier.priceNGN;
  if (buyerTier === 'retail' && quantity < product.wholesaleMinQuantity) {
    unitPrice = product.basePriceRetail;
  }

  const retailBase = product.basePriceRetail;
  const savingsVsRetail = Math.max(0, retailBase - unitPrice);
  const discountPercent = retailBase > 0 ? Math.round((savingsVsRetail / retailBase) * 100) : 0;

  return {
    unitPrice,
    activeTier,
    discountPercent,
    savingsVsRetail,
    nextTier,
  };
}
