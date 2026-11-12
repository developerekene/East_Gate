import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  setUser as setReduxUser,
  setProducts as setReduxProducts,
  setCart as setReduxCart,
  setOrders as setReduxOrders,
  setLoading,
  addToast,
} from '../store/appSlice';
import {
  Product,
  ProductVariation,
  Order,
  StockAlert,
  BuyerTier,
  Currency,
  CartItem,
  ProductReview,
  DisputeTicket,
  DisputeStatus,
  ProductQuestion,
  StoreVoucher,
} from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { generatePaystackReference, getTierPricingForQuantity } from '../utils/currency';
import {
  auth,
  isSuperAdmin,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  FirebaseUser,
} from '../utils/firebase';

export interface CheckoutPayload {
  product: Product;
  variant: ProductVariation;
  quantity: number;
  buyerTier: BuyerTier;
  unitPrice: number; // in NGN
  shipping: number; // in NGN
  subtotal: number; // in NGN
  totalAmount: number; // in NGN
}

export interface PaymentSubmission {
  customerEmail: string;
  customerName: string;
  paymentMethod: 'card' | 'bank_transfer' | 'ussd';
  paystackChannel: string;
}

interface StoreContextType {
  // Firebase Auth State
  user: FirebaseUser | null;
  authLoading: boolean;
  isSuperAdminUser: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'signin' | 'signup') => void;

  // Catalog & Commerce
  products: Product[];
  orders: Order[];
  reviews: ProductReview[];
  disputes: DisputeTicket[];
  buyerTier: BuyerTier;
  currency: Currency;
  stockAlerts: StockAlert[];
  isStockAlertOpen: boolean;
  selectedProduct: Product | null;
  checkoutPayload: CheckoutPayload | null;
  isPaystackOpen: boolean;
  activeTab: 'catalog' | 'inventory' | 'orders' | 'disputes';
  cart: CartItem[];
  isCartOpen: boolean;
  isProfileOpen: boolean;
  isCreateDisputeOpen: boolean;
  prefilledDisputeOrder: Order | null;
  setIsCartOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  setIsCreateDisputeOpen: (open: boolean) => void;
  setPrefilledDisputeOrder: (order: Order | null) => void;
  openDisputeForOrder: (order: Order) => void;
  addToCart: (product: Product, variant: ProductVariation, quantity: number) => void;
  addBatchToCart: (product: Product, batch: { variant: ProductVariation; quantity: number }[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setBuyerTier: (tier: BuyerTier) => void;
  setCurrency: (curr: Currency) => void;
  setActiveTab: (tab: 'catalog' | 'inventory' | 'orders' | 'disputes') => void;
  setIsStockAlertOpen: (open: boolean) => void;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  initiatePaystackCheckout: (payload: CheckoutPayload) => void;
  closePaystackCheckout: () => void;
  completePaystackPayment: (details: PaymentSubmission) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateProduct: (updated: Product) => void;
  addProduct: (product: Product) => void;
  restockVariant: (productId: string, variantId: string, unitsToAdd: number) => void;
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount' | 'votedHelpful'>) => void;
  voteReviewHelpful: (reviewId: string) => void;
  fileDispute: (data: Omit<DisputeTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages' | 'status'> & { initialMessage?: string }) => DisputeTicket;
  resolveDispute: (ticketId: string, status: DisputeStatus, resolutionNote: string) => void;
  sendDisputeMessage: (ticketId: string, sender: 'buyer' | 'seller', senderName: string, message: string) => void;
  vouchers: StoreVoucher[];
  claimVoucher: (code: string) => void;
  productQuestions: ProductQuestion[];
  askQuestion: (productId: string, question: string, authorName: string) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  resetCatalog: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'nmili_products_pink_v4',
  ORDERS: 'nmili_orders_pink_v4',
  BUYER_TIER: 'nmili_buyer_tier_pink_v4',
  CURRENCY: 'nmili_currency_pink_v4',
  CART: 'nmili_cart_pink_v4',
  REVIEWS: 'nmili_reviews_pink_v4',
  DISPUTES: 'nmili_disputes_pink_v4',
  VOUCHERS: 'nmili_vouchers_pink_v4',
  QUESTIONS: 'nmili_questions_pink_v4',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(setReduxUser({ uid: user.uid, email: user.email, displayName: user.displayName }));
    } else {
      dispatch(setReduxUser(null));
    }
  }, [user, dispatch]);

  const isSuperAdminUser = useMemo(() => {
    return isSuperAdmin(user?.email);
  }, [user]);

  const signIn = async (email: string, pass: string) => {
    dispatch(setLoading({ isLoading: true, message: 'Signing in...' }));
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      dispatch(addToast({ message: 'Signed in successfully!', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Sign in failed. Please check your credentials.', type: 'error' }));
      throw err;
    } finally {
      dispatch(setLoading({ isLoading: false }));
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    dispatch(setLoading({ isLoading: true, message: 'Creating your account...' }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        setUser({ ...userCredential.user, displayName: name });
      }
      dispatch(addToast({ message: 'Account created successfully!', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Could not create account.', type: 'error' }));
      throw err;
    } finally {
      dispatch(setLoading({ isLoading: false }));
    }
  };

  const signOutUser = async () => {
    dispatch(setLoading({ isLoading: true, message: 'Signing out...' }));
    try {
      await signOut(auth);
      dispatch(addToast({ message: 'Signed out successfully.', type: 'info' }));
    } finally {
      dispatch(setLoading({ isLoading: false }));
    }
  };

  // Products State - Initialized from fresh user images catalog
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Orders State - Clean empty array (no fake dummy orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Reviews State - Clean empty array (no fake dummy reviews)
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Disputes State - Clean empty array (no fake dummy disputes)
  const [disputes, setDisputes] = useState<DisputeTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISPUTES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Store Vouchers
  const [vouchers, setVouchers] = useState<StoreVoucher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { code: 'PINK5K', title: '₦5,000 Off Wholesale Order', discountNGN: 5000, minSpendNGN: 40000, claimed: false },
      { code: 'PINK2K', title: '₦2,000 Off Retail Order', discountNGN: 2000, minSpendNGN: 15000, claimed: false },
      { code: 'PINKFREE', title: 'Free Express Pink Delivery', discountNGN: 2500, minSpendNGN: 10000, claimed: true },
    ];
  });

  // Product Questions - Clean empty array
  const [productQuestions, setProductQuestions] = useState<ProductQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [buyerTier, setBuyerTierState] = useState<BuyerTier>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUYER_TIER);
      if (saved === 'wholesale' || saved === 'retail') return saved;
    } catch {
      // ignore
    }
    return 'wholesale';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved === 'USD' || saved === 'NGN') return saved;
    } catch {
      // ignore
    }
    return 'NGN';
  });

  const [activeTab, setActiveTab] = useState<'catalog' | 'inventory' | 'orders' | 'disputes'>('catalog');
  const [isStockAlertOpen, setIsStockAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<CheckoutPayload | null>(null);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateDisputeOpen, setIsCreateDisputeOpen] = useState(false);
  const [prefilledDisputeOrder, setPrefilledDisputeOrder] = useState<Order | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
    } catch {}
  }, [disputes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(vouchers));
    } catch {}
  }, [vouchers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(productQuestions));
    } catch {}
  }, [productQuestions]);

  const setBuyerTier = (tier: BuyerTier) => {
    setBuyerTierState(tier);
    try {
      localStorage.setItem(STORAGE_KEYS.BUYER_TIER, tier);
    } catch {}
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    } catch {}
  };

  // Derive stock alerts dynamically
  const stockAlerts = useMemo<StockAlert[]>(() => {
    const alerts: StockAlert[] = [];
    products.forEach((prod) => {
      prod.variations.forEach((v) => {
        if (v.stock <= v.lowStockThreshold) {
          alerts.push({
            id: `alert-${prod.id}-${v.id}`,
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            variantName: v.name,
            sku: v.sku,
            currentStock: v.stock,
            threshold: v.lowStockThreshold,
            severity: v.stock === 0 ? 'critical' : 'warning',
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
    return alerts;
  }, [products]);

  const openProductDetail = (product: Product) => {
    const current = products.find((p) => p.id === product.id) || product;
    setSelectedProduct(current);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const addToCart = (product: Product, variant: ProductVariation, quantity: number) => {
    const tierPricing = getTierPricingForQuantity(product, quantity, buyerTier);
    const variantDelta = buyerTier === 'wholesale' ? variant.priceDeltaWholesale : variant.priceDeltaRetail;
    const unitPrice = tierPricing.unitPrice + variantDelta;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id && item.buyerTier === buyerTier
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        const newPricing = getTierPricingForQuantity(product, newQty, buyerTier);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, variant.stock > 0 ? variant.stock : 99),
          unitPrice: newPricing.unitPrice + variantDelta,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product,
          variant,
          quantity,
          buyerTier,
          unitPrice,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const addBatchToCart = (product: Product, batch: { variant: ProductVariation; quantity: number }[]) => {
    const validItems = batch.filter((item) => item.quantity > 0);
    if (validItems.length === 0) return;

    const totalBatchUnits = validItems.reduce((sum, item) => sum + item.quantity, 0);
    const tierPricing = getTierPricingForQuantity(product, totalBatchUnits, buyerTier);

    setCart((prev) => {
      let currentCart = [...prev];
      for (const item of validItems) {
        const variantDelta = buyerTier === 'wholesale' ? item.variant.priceDeltaWholesale : item.variant.priceDeltaRetail;
        const unitPrice = tierPricing.unitPrice + variantDelta;

        const existingIndex = currentCart.findIndex(
          (c) => c.product.id === product.id && c.variant.id === item.variant.id && c.buyerTier === buyerTier
        );

        if (existingIndex > -1) {
          const newQty = currentCart[existingIndex].quantity + item.quantity;
          currentCart[existingIndex] = {
            ...currentCart[existingIndex],
            quantity: Math.min(newQty, item.variant.stock > 0 ? item.variant.stock : 99),
            unitPrice,
          };
        } else {
          currentCart.push({
            id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            product,
            variant: item.variant,
            quantity: item.quantity,
            buyerTier,
            unitPrice,
          });
        }
      }
      return currentCart;
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;
        const maxStock = item.variant.stock;
        const newQty = maxStock > 0 ? Math.min(quantity, maxStock) : quantity;
        const tierPricing = getTierPricingForQuantity(item.product, newQty, item.buyerTier);
        const variantDelta = item.buyerTier === 'wholesale' ? item.variant.priceDeltaWholesale : item.variant.priceDeltaRetail;
        return {
          ...item,
          quantity: newQty,
          unitPrice: tierPricing.unitPrice + variantDelta,
        };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const initiatePaystackCheckout = (payload: CheckoutPayload) => {
    setCheckoutPayload(payload);
    setIsPaystackOpen(true);
  };

  const closePaystackCheckout = () => {
    setIsPaystackOpen(false);
    setCheckoutPayload(null);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const restockVariant = (productId: string, variantId: string, unitsToAdd: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variations: p.variations.map((v) => {
            if (v.id !== variantId) return v;
            return {
              ...v,
              stock: Math.max(0, v.stock + unitsToAdd),
            };
          }),
        };
      })
    );

    setSelectedProduct((prev) => {
      if (!prev || prev.id !== productId) return prev;
      return {
        ...prev,
        variations: prev.variations.map((v) => {
          if (v.id !== variantId) return v;
          return {
            ...v,
            stock: Math.max(0, v.stock + unitsToAdd),
          };
        }),
      };
    });
  };

  const completePaystackPayment = async (
    details: PaymentSubmission
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (!checkoutPayload) {
      return { success: false, error: 'No active checkout found.' };
    }

    const { product, variant, quantity, buyerTier: tier, unitPrice, shipping, subtotal, totalAmount } =
      checkoutPayload;

    const currentProduct = products.find((p) => p.id === product.id);
    const currentVariant = currentProduct?.variations.find((v) => v.id === variant.id);

    if (!currentVariant || currentVariant.stock < quantity) {
      return {
        success: false,
        error: `Insufficient inventory: Only ${currentVariant ? currentVariant.stock : 0} units left for this variation.`,
      };
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== product.id) return p;
        return {
          ...p,
          variations: p.variations.map((v) => {
            if (v.id !== variant.id) return v;
            return {
              ...v,
              stock: Math.max(0, v.stock - quantity),
            };
          }),
        };
      })
    );

    const reference = generatePaystackReference();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      reference,
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      sku: variant.sku,
      quantity,
      buyerTier: tier,
      unitPrice,
      subtotal,
      tax: 0,
      shipping,
      totalAmount,
      currency,
      customerEmail: details.customerEmail || user?.email || 'customer@gmail.com',
      customerName: details.customerName || user?.displayName || 'Valued Buyer',
      paymentMethod: details.paymentMethod,
      paystackChannel: details.paystackChannel,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          variations: prev.variations.map((v) => (v.id === variant.id ? { ...v, stock: v.stock - quantity } : v)),
        };
      });
    }

    return { success: true, order: newOrder };
  };

  const openDisputeForOrder = (order: Order) => {
    setPrefilledDisputeOrder(order);
    setIsCreateDisputeOpen(true);
  };

  const addReview = (
    reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount' | 'votedHelpful'>
  ) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      votedHelpful: false,
    };

    setReviews((prev) => [newReview, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === reviewData.productId) {
          const productReviews = reviews.filter((r) => r.productId === p.id);
          const allRatings = [...productReviews.map((r) => r.rating), reviewData.rating];
          const newAvg = Number(
            (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(2)
          );
          return {
            ...p,
            rating: newAvg,
            reviewsCount: allRatings.length,
          };
        }
        return p;
      })
    );
  };

  const voteReviewHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const alreadyVoted = r.votedHelpful ?? false;
          return {
            ...r,
            helpfulCount: alreadyVoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
            votedHelpful: !alreadyVoted,
          };
        }
        return r;
      })
    );
  };

  const fileDispute = (
    data: Omit<
      DisputeTicket,
      'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages' | 'status'
    > & { initialMessage?: string }
  ): DisputeTicket => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTicket: DisputeTicket = {
      id: `disp-${Date.now()}`,
      ticketNumber: `DSP-2026-${randomSuffix}`,
      orderReference: data.orderReference,
      productId: data.productId,
      productName: data.productName,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      category: data.category,
      subject: data.subject,
      description: data.description,
      preferredResolution: data.preferredResolution,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'buyer',
          senderName: data.customerName,
          message: data.initialMessage || data.description,
          timestamp: now,
        },
      ],
    };

    setDisputes((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const resolveDispute = (
    ticketId: string,
    status: DisputeStatus,
    resolutionNote: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setDisputes((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const resolutionMessage = {
            id: `msg-${Date.now()}`,
            sender: 'seller' as const,
            senderName: 'Direct Sole Seller Support',
            message: `[Direct Sole Seller Resolution - ${status.toUpperCase()}]: ${resolutionNote}`,
            timestamp: now,
          };

          return {
            ...t,
            status,
            resolutionNote,
            resolvedAt: now,
            updatedAt: now,
            messages: [...t.messages, resolutionMessage],
          };
        }
        return t;
      })
    );
  };

  const sendDisputeMessage = (
    ticketId: string,
    sender: 'buyer' | 'seller',
    senderName: string,
    message: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: now,
    };

    setDisputes((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            updatedAt: now,
            status: sender === 'seller' && t.status === 'open' ? 'under_review' : t.status,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );
  };

  const claimVoucher = (code: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.code === code ? { ...v, claimed: true } : v))
    );
  };

  const askQuestion = (productId: string, question: string, authorName: string) => {
    const newQ: ProductQuestion = {
      id: `q-${Date.now()}`,
      productId,
      authorName: authorName.trim() || user?.displayName || 'Valued Buyer',
      question: question.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProductQuestions((prev) => [newQ, ...prev]);
  };

  const answerQuestion = (questionId: string, answer: string) => {
    setProductQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answer: answer.trim() } : q))
    );
  };

  const resetCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders([]);
    setReviews([]);
    setDisputes([]);
    setProductQuestions([]);
    setBuyerTierState('wholesale');
    setCurrencyState('NGN');
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.BUYER_TIER);
    localStorage.removeItem(STORAGE_KEYS.CURRENCY);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.DISPUTES);
    localStorage.removeItem(STORAGE_KEYS.VOUCHERS);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        authLoading,
        isSuperAdminUser,
        signIn,
        signUp,
        signOutUser,
        isAuthModalOpen,
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        products,
        orders,
        reviews,
        disputes,
        buyerTier,
        currency,
        stockAlerts,
        isStockAlertOpen,
        selectedProduct,
        checkoutPayload,
        isPaystackOpen,
        activeTab,
        cart,
        isCartOpen,
        isProfileOpen,
        isCreateDisputeOpen,
        prefilledDisputeOrder,
        setIsCartOpen,
        setIsProfileOpen,
        setIsCreateDisputeOpen,
        setPrefilledDisputeOrder,
        openDisputeForOrder,
        addToCart,
        addBatchToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setBuyerTier,
        setCurrency,
        setActiveTab,
        setIsStockAlertOpen,
        openProductDetail,
        closeProductDetail,
        initiatePaystackCheckout,
        closePaystackCheckout,
        completePaystackPayment,
        updateProduct,
        addProduct,
        restockVariant,
        addReview,
        voteReviewHelpful,
        fileDispute,
        resolveDispute,
        sendDisputeMessage,
        vouchers,
        claimVoucher,
        productQuestions,
        askQuestion,
        answerQuestion,
        resetCatalog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
