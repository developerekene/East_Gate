import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';
import { Package, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { currency, openProductDetail } = useStore();
  const [imageFailed, setImageFailed] = useState(false);

  const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0);
  const displayPrice = product.volumeTiers?.[0]?.priceNGN || product.basePriceRetail;

  return (
    <div
      onClick={() => openProductDetail(product)}
      className="group relative bg-white border border-blue-100/90 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col h-full bg-gradient-to-b from-white via-white to-blue-50/30"
    >
      {/* Picture */}
      <div className="relative aspect-4/3 w-full bg-blue-950/5 overflow-hidden">
        {!imageFailed && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-blue-300 bg-blue-50/50">
            <Package className="w-12 h-12 stroke-1 mb-2 text-blue-300" />
            <span className="text-xs font-medium text-blue-900">{product.name}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#0B2545] transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating, Amount, Stock Available */}
        <div className="pt-3 border-t border-blue-100/80 space-y-2">
          <div className="flex items-center justify-between">
            {/* Amount */}
            <span className="text-base font-extrabold text-[#0B2545]">
              {formatPrice(displayPrice, currency)}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Stock Available */}
          <div className="text-xs font-medium text-blue-900/75">
            {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
          </div>
        </div>
      </div>
    </div>
  );
};
