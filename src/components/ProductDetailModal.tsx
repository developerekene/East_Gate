import React, { useState } from 'react';
import { Product, ProductVariation, BuyerTier } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice, getTierPricingForQuantity } from '../utils/currency';
import { ProductEditModal } from './ProductEditModal';
import {
  X,
  Edit3,
  CreditCard,
  History,
  Package,
  Layers,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Star,
  ThumbsUp,
  MessageSquare,
  LifeBuoy,
  CheckCircle2,
  HelpCircle,
  Crown,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const {
    buyerTier,
    currency,
    orders,
    reviews,
    addReview,
    voteReviewHelpful,
    productQuestions,
    askQuestion,
    answerQuestion,
    setIsCreateDisputeOpen,
    setPrefilledDisputeOrder,
    initiatePaystackCheckout,
    addBatchToCart,
    isSuperAdminUser,
    user,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'qa' | 'history'>('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionAuthor, setNewQuestionAuthor] = useState(user?.displayName || 'Valued Buyer');
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const currentQuestions = productQuestions.filter((q) => q.productId === product.id);

  const handleAskQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    askQuestion(product.id, newQuestionText, newQuestionAuthor);
    setNewQuestionText('');
  };

  const handleAnswerSubmit = (qId: string) => {
    const ans = replyText[qId];
    if (!ans || !ans.trim()) return;
    answerQuestion(qId, ans);
    setReplyText((prev) => ({ ...prev, [qId]: '' }));
  };

  // Review Form & Filter State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAuthorName, setNewAuthorName] = useState(user?.displayName || 'Direct Buyer');
  const [newAuthorEmail, setNewAuthorEmail] = useState(user?.email || 'buyer@example.com');
  const [reviewBuyerTier, setReviewBuyerTier] = useState<BuyerTier>(buyerTier);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'retail' | 'wholesale'>('all');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Variant Quantity State
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    product.variations.forEach((v, idx) => {
      initial[v.id] = idx === 0 ? (buyerTier === 'wholesale' ? product.wholesaleMinQuantity : 1) : 0;
    });
    return initial;
  });

  const totalBatchUnits = Object.values(variantQuantities).reduce((sum, q) => sum + (q || 0), 0);

  const tierPricing = getTierPricingForQuantity(
    product,
    totalBatchUnits > 0 ? totalBatchUnits : 1,
    buyerTier
  );

  const batchSubtotal = product.variations.reduce((sum, v) => {
    const q = variantQuantities[v.id] || 0;
    if (q <= 0) return sum;
    const variantDelta = buyerTier === 'wholesale' ? v.priceDeltaWholesale : v.priceDeltaRetail;
    const itemPrice = tierPricing.unitPrice + variantDelta;
    return sum + itemPrice * q;
  }, 0);

  const shipping = buyerTier === 'wholesale' ? 0 : 2500;
  const totalAmount = batchSubtotal + shipping;

  const handleQuantityChange = (variantId: string, delta: number) => {
    setVariantQuantities((prev) => {
      const current = prev[variantId] || 0;
      const targetVariant = product.variations.find((v) => v.id === variantId);
      const maxStock = targetVariant?.stock ?? 99;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [variantId]: next };
    });
  };

  const handleSetDirectQuantity = (variantId: string, val: string) => {
    const parsed = parseInt(val, 10);
    const targetVariant = product.variations.find((v) => v.id === variantId);
    const maxStock = targetVariant?.stock ?? 99;
    const next = isNaN(parsed) ? 0 : Math.max(0, Math.min(maxStock, parsed));
    setVariantQuantities((prev) => ({ ...prev, [variantId]: next }));
  };

  const handleAddBatchToCart = () => {
    const items = product.variations
      .map((v) => ({ variant: v, quantity: variantQuantities[v.id] || 0 }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) return;
    addBatchToCart(product, items);
  };

  const handleInstantCheckout = () => {
    const items = product.variations
      .map((v) => ({ variant: v, quantity: variantQuantities[v.id] || 0 }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) return;

    const primaryItem = items[0];
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);

    initiatePaystackCheckout({
      product,
      variant: primaryItem.variant,
      quantity: totalQty,
      buyerTier,
      unitPrice: tierPricing.unitPrice,
      shipping,
      subtotal: batchSubtotal,
      totalAmount,
    });
  };

  const productOrders = orders.filter((o) => o.productId === product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const filteredProductReviews = productReviews.filter((r) => {
    if (reviewFilter === 'retail') return r.buyerTier === 'retail';
    if (reviewFilter === 'wholesale') return r.buyerTier === 'wholesale';
    return true;
  });

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const matching = productReviews.filter((r) => Math.round(r.rating) === stars).length;
    return {
      stars,
      count: matching,
      percentage: productReviews.length > 0 ? Math.round((matching / productReviews.length) * 100) : 0,
    };
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) return;

    addReview({
      productId: product.id,
      authorName: newAuthorName.trim() || 'Valued Buyer',
      authorEmail: newAuthorEmail.trim() || 'buyer@example.com',
      buyerTier: reviewBuyerTier,
      rating: newRating,
      title: newTitle.trim(),
      comment: newComment.trim(),
      verifiedPurchase: true,
    });

    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setNewTitle('');
      setNewComment('');
    }, 1200);
  };

  const handleTriggerDisputeForProduct = () => {
    const relatedOrder = productOrders[0];
    if (relatedOrder) {
      setPrefilledDisputeOrder(relatedOrder);
    }
    setIsCreateDisputeOpen(true);
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-150">
        <div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0B2545] bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
          >
            <span>← Back to Catalog</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl w-full border border-blue-100 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50 via-blue-50/40 to-blue-50 text-slate-900">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-800">
                <span className="font-bold text-blue-950">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500">{product.category}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950">
                {product.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Specs button visible ONLY to Super Admin */}
              {isSuperAdminUser && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Super Admin: Edit Specs and Stock"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Subheader Navigation */}
          <div className="px-6 border-b border-blue-100 bg-white flex items-center gap-6 text-xs font-medium shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-blue-800 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-4 h-4 text-blue-800" />
              <span>Product Details & Order</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-blue-800 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-800" />
              <span>Reviews & Feedback ({productReviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`py-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'qa'
                  ? 'border-blue-800 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-blue-800" />
              <span>Customer Q&A ({currentQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-blue-800 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4 text-blue-800" />
              <span>Order Ledger ({productOrders.length})</span>
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto p-6 space-y-6">
            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Visual Media & Specifications */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="aspect-4/3 w-full bg-blue-950/5 rounded-3xl overflow-hidden border border-blue-100 relative group">
                    {!imageFailed && product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        onError={() => setImageFailed(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-300">
                        <Package className="w-16 h-16 stroke-1" />
                      </div>
                    )}
                  </div>

                  {/* Choice & Buyer Protection Guarantee */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                      <Sparkles className="w-4 h-4 text-blue-800" />
                      <span>Choice Direct Sole Seller Guarantee</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 font-mono">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-800" />
                        <span>Choice Fast Shipping (3-Day)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% Direct Buyer Guarantee</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-800" />
                        <span>Free Delivery on ₦10,000+</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Secure Checkout</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Narrative */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-mono">
                      About this Product
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {product.fullDetails}
                    </p>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-mono">
                      Specifications
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {product.specifications.map((spec, i) => (
                        <div
                          key={i}
                          className="flex justify-between py-1.5 border-b border-blue-100 text-slate-700"
                        >
                          <span className="text-slate-500">{spec.label}</span>
                          <span className="font-semibold text-blue-950 text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Volume Pricing & Multi-Variant Ordering */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Volume Tier Ladder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-blue-950 font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                        <span>Volume Pricing Tiers</span>
                      </label>
                      <span className="text-xs font-mono text-blue-800 font-bold">
                        {totalBatchUnits} units selected
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {product.volumeTiers.map((tier, idx) => {
                        const isCurrentActive =
                          totalBatchUnits >= tier.minQty &&
                          (!tier.maxQty || totalBatchUnits <= tier.maxQty);

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border transition-all text-center ${
                              isCurrentActive
                                ? 'bg-gradient-to-b from-blue-50 to-blue-50/80 border-blue-800 shadow-sm ring-1 ring-blue-800'
                                : 'bg-slate-50 border-slate-200/80 opacity-80'
                            }`}
                          >
                            <div className="text-[11px] font-mono text-slate-500">
                              {tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : '+'} pcs
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-blue-950 mt-0.5">
                              {formatPrice(tier.priceNGN, currency)}
                            </div>
                            <div className="text-[10px] font-mono font-semibold mt-0.5">
                              {tier.discountPercent > 0 ? (
                                <span className="text-blue-800 font-bold">-{tier.discountPercent}% OFF</span>
                              ) : (
                                <span className="text-slate-400">Retail Base</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {tierPricing.nextTier && (
                      <div className="text-[11px] text-blue-950 bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-2 flex items-center justify-between">
                        <span>
                          Add <strong>{tierPricing.nextTier.requiredQty} more units</strong> to unlock next tier!
                        </span>
                        <span className="font-mono font-bold text-blue-800">
                          Save extra {tierPricing.nextTier.extraDiscount}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Multi-Variant Order Selection */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-800" />
                        <span>Select Quantities by Variation</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Configure quantities for multiple variants together
                      </span>
                    </div>

                    <div className="border border-blue-100 rounded-2xl overflow-hidden bg-white shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-blue-50/80 border-b border-blue-100 text-blue-950 font-mono text-[11px]">
                              <th className="py-2.5 px-3 font-bold">Variation</th>
                              <th className="py-2.5 px-2 font-bold">SKU</th>
                              <th className="py-2.5 px-2 font-bold text-center">In Stock</th>
                              <th className="py-2.5 px-2 font-bold text-center">Unit Price</th>
                              <th className="py-2.5 px-3 font-bold text-right">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-100/60">
                            {product.variations.map((v) => {
                              const qty = variantQuantities[v.id] || 0;
                              const variantDelta =
                                buyerTier === 'wholesale' ? v.priceDeltaWholesale : v.priceDeltaRetail;
                              const effectivePrice = tierPricing.unitPrice + variantDelta;
                              const isLow = v.stock <= v.lowStockThreshold;

                              return (
                                <tr
                                  key={v.id}
                                  className={`hover:bg-blue-50/30 transition-colors ${
                                    qty > 0 ? 'bg-blue-50/40' : ''
                                  }`}
                                >
                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold text-slate-900">{v.name}</div>
                                    <div className="text-[10px] text-slate-500">
                                      {Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' · ')}
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">
                                    {v.sku}
                                  </td>

                                  <td className="py-2.5 px-2 text-center font-mono">
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        v.stock === 0
                                          ? 'text-blue-800'
                                          : isLow
                                          ? 'text-amber-600'
                                          : 'text-slate-700'
                                      }`}
                                    >
                                      {v.stock}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-950">
                                    {formatPrice(effectivePrice, currency)}
                                  </td>

                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleQuantityChange(v.id, -1)}
                                        disabled={qty <= 0}
                                        className="w-7 h-7 rounded-lg border border-blue-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 disabled:opacity-40 cursor-pointer"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <input
                                        type="text"
                                        value={qty}
                                        onChange={(e) => handleSetDirectQuantity(v.id, e.target.value)}
                                        className="w-12 h-7 text-center font-mono font-bold text-slate-900 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-800 text-xs"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleQuantityChange(v.id, 1)}
                                        disabled={qty >= v.stock}
                                        className="w-7 h-7 rounded-lg border border-blue-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 disabled:opacity-40 cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Checkout Actions */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 via-blue-50/50 to-blue-50 border border-blue-100 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Total Units:</span>
                      <span className="font-mono font-bold text-blue-950">
                        {totalBatchUnits} Units ({tierPricing.activeTier.label})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Volume Savings:</span>
                      <span className="font-mono font-bold text-blue-800">
                        {tierPricing.discountPercent}% Discount
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-blue-200/80 pt-2">
                      <span className="font-bold text-slate-900">Total Payable:</span>
                      <span className="text-xl font-extrabold font-mono text-blue-800 tabular-nums">
                        {formatPrice(totalAmount, currency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddBatchToCart}
                        disabled={totalBatchUnits <= 0}
                        className="py-3 px-4 bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-800" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleInstantCheckout}
                        disabled={totalBatchUnits <= 0}
                        className="py-3 px-4 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Instant Checkout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'reviews' ? (
              /* Reviews Section */
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border border-blue-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                  <div className="flex items-center gap-5 text-center md:text-left">
                    <div className="space-y-1">
                      <div className="text-4xl font-extrabold font-mono text-blue-950 tracking-tight">
                        {product.rating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {productReviews.length} verified review{productReviews.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col gap-1 w-48 text-[11px] font-mono text-slate-500">
                      {ratingCounts.map((rc) => (
                        <div key={rc.stars} className="flex items-center gap-2">
                          <span className="w-5 text-right">{rc.stars}★</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-800 to-blue-900 rounded-full transition-all"
                              style={{ width: `${rc.percentage}%` }}
                            />
                          </div>
                          <span className="w-6 text-slate-400">{rc.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-blue-100 fill-blue-100" />
                      <span>{showReviewForm ? 'Hide Form' : 'Write a Review'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTriggerDisputeForProduct}
                      className="w-full sm:w-auto px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LifeBuoy className="w-3.5 h-3.5 text-blue-800" />
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="p-5 bg-white border border-blue-200 rounded-2xl shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-mono">
                        Customer Review & Verified Feedback
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Direct Sole Seller Feedback
                      </span>
                    </div>

                    {reviewSubmitted ? (
                      <div className="py-6 text-center text-emerald-800 flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        <p className="text-xs font-bold">Thank you for your valuable review!</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                              Overall Rating
                            </label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewRating(star)}
                                  className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= newRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="ml-2 text-xs font-mono font-bold text-slate-700">
                                {newRating} of 5 Stars
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                              Purchasing Tier
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setReviewBuyerTier('retail')}
                                className={`px-3 py-1.5 text-xs rounded-xl font-semibold border ${
                                  reviewBuyerTier === 'retail'
                                    ? 'bg-blue-800 text-white border-blue-800'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                Retail Buyer
                              </button>
                              <button
                                type="button"
                                onClick={() => setReviewBuyerTier('wholesale')}
                                className={`px-3 py-1.5 text-xs rounded-xl font-semibold border ${
                                  reviewBuyerTier === 'wholesale'
                                    ? 'bg-blue-800 text-white border-blue-800'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                Wholesale Partner
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Your Name / Company
                            </label>
                            <input
                              type="text"
                              value={newAuthorName}
                              onChange={(e) => setNewAuthorName(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-800"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Contact Email
                            </label>
                            <input
                              type="email"
                              value={newAuthorEmail}
                              onChange={(e) => setNewAuthorEmail(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-800"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Review Title / Headline
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g. Crisp audio performance, watch battery lasts all week"
                            className="w-full px-3 py-2 text-xs border border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-800"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Detailed Feedback
                          </label>
                          <textarea
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-800 resize-none leading-relaxed"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-blue-100">
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-bold text-xs rounded-xl shadow-xs"
                          >
                            Publish Verified Review
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {filteredProductReviews.length > 0 ? (
                    filteredProductReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-white border border-blue-100 rounded-2xl shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-xs text-slate-900">{rev.title}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              {rev.buyerTier === 'wholesale' ? 'Verified Wholesale Partner' : 'Verified Retail Purchase'}
                            </span>
                            <span className="text-slate-400">{rev.createdAt}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                        <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-medium text-slate-700">{rev.authorName}</span>
                          <button
                            type="button"
                            onClick={() => voteReviewHelpful(rev.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-blue-50 text-slate-500"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-blue-800" />
                            <span>Helpful ({rev.helpfulCount})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-blue-950">
                        No reviews yet for this product
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Purchasers can share real feedback here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'qa' ? (
              /* Customer Q&A Section */
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border border-blue-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-mono">
                      Customer Q&A (Direct Sole Seller Support)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Have questions regarding battery life, earbud charging, or wholesale delivery? Ask directly.
                    </p>
                  </div>
                </div>

                {/* Ask Form */}
                <form
                  onSubmit={handleAskQuestionSubmit}
                  className="p-4 bg-white border border-blue-200 rounded-2xl space-y-3 shadow-xs"
                >
                  <div className="text-xs font-bold text-blue-950 font-mono">
                    Ask a Question About This Hardware
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newQuestionAuthor}
                      onChange={(e) => setNewQuestionAuthor(e.target.value)}
                      placeholder="Your Name / Company"
                      className="px-3 py-2 text-xs border border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-800"
                      required
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="e.g. Can earbuds pair independently to a phone without the smartwatch being on?"
                    className="w-full px-3 py-2 text-xs border border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-800 resize-none"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Submit Question
                    </button>
                  </div>
                </form>

                {/* Q&A List */}
                <div className="space-y-3">
                  {currentQuestions.length > 0 ? (
                    currentQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 bg-white border border-blue-100 rounded-2xl shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-blue-950">Q: {q.question}</span>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Asked by {q.authorName} on {q.createdAt}
                            </div>
                          </div>
                        </div>

                        {q.answer ? (
                          <div className="mt-2 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1">
                            <div className="text-[11px] font-bold text-blue-950 font-mono flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                              <span>Sole Seller Official Response:</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{q.answer}</p>
                          </div>
                        ) : isSuperAdminUser ? (
                          <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                            <div className="text-[11px] font-bold text-amber-900 font-mono flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-amber-600" />
                              <span>Super Admin Reply Affordance</span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={replyText[q.id] || ''}
                                onChange={(e) =>
                                  setReplyText({ ...replyText, [q.id]: e.target.value })
                                }
                                placeholder="Type answer as super admin..."
                                className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleAnswerSubmit(q.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-800 to-blue-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                              >
                                Publish Answer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-mono">
                            Awaiting response from sole seller...
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-blue-50/40 border border-blue-100 rounded-2xl space-y-1">
                      <p className="text-xs font-bold text-blue-950">No questions asked yet</p>
                      <p className="text-[11px] text-slate-500">
                        Ask any technical or compatibility question directly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Order History Audit Log */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-mono">
                    Order Ledger
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {productOrders.length} confirmed orders
                  </span>
                </div>

                {productOrders.length > 0 ? (
                  <div className="border border-blue-100 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-blue-50/80 border-b border-blue-100 text-blue-950 font-mono text-[11px]">
                            <th className="py-2.5 px-4 font-bold">Reference</th>
                            <th className="py-2.5 px-4 font-bold">Customer</th>
                            <th className="py-2.5 px-4 font-bold">Variation</th>
                            <th className="py-2.5 px-4 font-bold text-center">Quantity</th>
                            <th className="py-2.5 px-4 font-bold text-right">Total Paid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100/60">
                          {productOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-blue-50/30">
                              <td className="py-2.5 px-4 font-mono font-bold text-blue-950">
                                {ord.reference}
                              </td>
                              <td className="py-2.5 px-4 text-slate-700">
                                <div className="font-medium">{ord.customerName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{ord.customerEmail}</div>
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">{ord.variantName}</td>
                              <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                                {ord.quantity} pcs
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-800">
                                {formatPrice(ord.totalAmount, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-blue-50/40 border border-blue-100 rounded-2xl">
                    <p className="text-xs font-bold text-blue-950">No recorded orders yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Real orders placed for this item will appear in this ledger.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Super Admin Edit Modal */}
      {isEditModalOpen && (
        <ProductEditModal
          product={product}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};
