export type BuyerTier = 'retail' | 'wholesale';
export type Currency = 'NGN' | 'USD';

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  priceDeltaRetail: number; // added to base price
  priceDeltaWholesale: number;
  attributes: Record<string, string>; // e.g. { Color: 'Walnut', Finish: 'Matte' }
}

export interface VolumePriceTier {
  minQty: number;
  maxQty?: number; // e.g. 1-4, 5-24, 25+
  priceNGN: number;
  label: string; // e.g. "Retail / Sample", "Wholesale Tier 1", "Bulk Wholesale Tier"
  discountPercent: number; // e.g. 0, 15, 30
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  fullDetails: string;
  specifications: { label: string; value: string }[];
  image: string;
  basePriceRetail: number; // in NGN
  basePriceWholesale: number; // in NGN
  wholesaleMinQuantity: number; // MOQ for wholesale tier
  variations: ProductVariation[];
  rating: number;
  reviewsCount: number;
  createdAt: string;
  volumeTiers: VolumePriceTier[];
  estimatedResalePriceNGN: number; // For wholesale margin calculation
}

export interface Order {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  buyerTier: BuyerTier;
  unitPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  currency: Currency;
  customerEmail: string;
  customerName: string;
  paymentMethod: 'card' | 'bank_transfer' | 'ussd';
  paystackChannel: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  severity: 'critical' | 'warning';
  timestamp: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariation;
  quantity: number;
  buyerTier: BuyerTier;
  unitPrice: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  authorEmail: string;
  buyerTier: BuyerTier; // 'retail' | 'wholesale'
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
  votedHelpful?: boolean;
}

export type DisputeCategory =
  | 'quality_defect'
  | 'delayed_delivery'
  | 'wrong_item'
  | 'billing_payment'
  | 'damaged_packaging'
  | 'general_complaint';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_refund'
  | 'resolved_replacement'
  | 'closed';

export type PreferredResolution =
  | 'refund'
  | 'replacement'
  | 'store_credit'
  | 'explanation';

export interface DisputeMessage {
  id: string;
  sender: 'buyer' | 'seller';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface DisputeTicket {
  id: string;
  ticketNumber: string; // e.g. "DSP-8401"
  orderReference?: string;
  productId?: string;
  productName?: string;
  customerName: string;
  customerEmail: string;
  category: DisputeCategory;
  subject: string;
  description: string;
  preferredResolution: PreferredResolution;
  status: DisputeStatus;
  messages: DisputeMessage[];
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  authorName: string;
  question: string;
  answer?: string;
  createdAt: string;
}

export interface StoreVoucher {
  code: string;
  title: string;
  discountNGN: number;
  minSpendNGN: number;
  claimed: boolean;
}
