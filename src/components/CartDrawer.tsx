import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  ShieldCheck,
  Package,
  Gift,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    currency,
    buyerTier,
    vouchers,
    initiatePaystackCheckout,
  } = useStore();

  const [appliedCouponCode, setAppliedCouponCode] = React.useState<string>('');

  if (!isCartOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = buyerTier === 'wholesale' || cart.length === 0 ? 0 : 2500;

  const appliedVoucher = vouchers.find((v) => v.code === appliedCouponCode && v.claimed);
  const discountAmount =
    appliedVoucher && subtotal >= appliedVoucher.minSpendNGN ? appliedVoucher.discountNGN : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shipping);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const firstItem = cart[0];
    initiatePaystackCheckout({
      product: firstItem.product,
      variant: firstItem.variant,
      quantity: firstItem.quantity,
      buyerTier: firstItem.buyerTier,
      unitPrice: firstItem.unitPrice,
      shipping,
      subtotal: Math.max(0, subtotal - discountAmount),
      totalAmount,
    });
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-blue-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-blue-100 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Shopping & Wholesale Cart</h2>
              <div className="text-[11px] text-blue-100 font-mono">
                {totalItemsCount} unit{totalItemsCount !== 1 ? 's' : ''} across {cart.length} item{cart.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length > 0 ? (
            cart.map((item) => {
              const itemTotal = item.unitPrice * item.quantity;
              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-blue-200">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600">
                          <Package className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5 truncate">
                        {item.variant.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white text-slate-700 rounded border border-blue-200">
                          {item.variant.sku}
                        </span>
                        <span className="text-[10px] font-mono text-blue-800 font-bold uppercase">
                          {item.buyerTier} Tier
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-slate-400 hover:text-blue-800 rounded transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                    {/* Stepper */}
                    <div className="flex items-center border border-blue-200 rounded-lg bg-white p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                        className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-blue-950 tabular-nums">
                        {formatPrice(itemTotal, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatPrice(item.unitPrice, currency)} / unit
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border border-blue-200">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-950">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Browse the new smartwatch, audio, and hardware catalog to add items and unlock volume discounts.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Totals & Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-blue-100 bg-blue-50/50 space-y-3.5">
            {/* Store Voucher / Coupon Selector */}
            <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-blue-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-950 font-mono">
                <Gift className="w-3.5 h-3.5 text-blue-800" />
                <span>Store Voucher / Coupon</span>
              </div>
              <select
                value={appliedCouponCode}
                onChange={(e) => setAppliedCouponCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-blue-50/40 border border-blue-200 rounded-xl text-slate-800 font-mono focus:outline-none cursor-pointer"
              >
                <option value="">-- Select Claimed Voucher --</option>
                {vouchers
                  .filter((v) => v.claimed)
                  .map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.title} (-{v.discountNGN.toLocaleString()} NGN)
                    </option>
                  ))}
              </select>
              {appliedVoucher && (
                <div className="text-[10px] text-emerald-700 font-mono font-bold">
                  ✓ Voucher {appliedVoucher.code} applied (-{appliedVoucher.discountNGN.toLocaleString()} NGN)
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItemsCount} units)</span>
                <span className="font-mono tabular-nums text-slate-900 font-semibold">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Voucher</span>
                  <span className="font-mono tabular-nums">
                    -{formatPrice(discountAmount, currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono tabular-nums text-slate-800">
                  {shipping === 0 ? 'Free Shipping' : formatPrice(shipping, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-blue-950 pt-2 border-t border-blue-200">
                <span>Total Payable</span>
                <span className="font-mono tabular-nums text-blue-800">
                  {formatPrice(totalAmount, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
            >
              <CreditCard className="w-4 h-4" />
              <span>Checkout ({formatPrice(totalAmount, currency)})</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-blue-950/70 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
              <span>Secure Checkout · Protected</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
