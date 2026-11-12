import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';
import { Order } from '../types';
import {
  X,
  CreditCard,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Download,
  AlertCircle,
} from 'lucide-react';

export const PaystackModal: React.FC = () => {
  const {
    isPaystackOpen,
    closePaystackCheckout,
    checkoutPayload,
    currency,
    completePaystackPayment,
  } = useStore();

  // Checkout form state
  const [channel, setChannel] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
  const [customerEmail, setCustomerEmail] = useState('seniordevekene@gmail.com');
  const [customerName, setCustomerName] = useState('Senior Developer');

  // Card details
  const [cardNumber, setCardNumber] = useState('4084 0840 0840 0840');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('840');

  // Transfer details
  const [transferTimer, setTransferTimer] = useState(1799); // 30 mins
  const [copiedAccount, setCopiedAccount] = useState(false);

  // USSD details
  const [ussdBank, setUssdBank] = useState('gtb');

  // Processing flow states
  const [paymentState, setPaymentState] = useState<
    'idle' | 'processing' | 'otp_required' | 'success' | 'failed'
  >('idle');
  const [otpCode, setOtpCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer for simulated bank transfer
  useEffect(() => {
    if (!isPaystackOpen || channel !== 'bank_transfer') return;
    const interval = setInterval(() => {
      setTransferTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [channel, isPaystackOpen]);

  // Reset modal state when closed or opened
  useEffect(() => {
    if (isPaystackOpen) {
      setPaymentState('idle');
      setOtpCode('');
      setErrorMessage('');
      setStatusMessage('');
      setCompletedOrder(null);
      setTransferTimer(1799);
    }
  }, [isPaystackOpen]);

  if (!isPaystackOpen || !checkoutPayload) return null;

  const { product, variant, quantity, buyerTier, unitPrice, shipping, subtotal, totalAmount } =
    checkoutPayload;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText('0124893012');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const fillTestCard = (type: 'success' | 'insufficient') => {
    if (type === 'success') {
      setCardNumber('4084 0840 0840 0840');
      setCardExpiry('12/28');
      setCardCvv('408');
    } else {
      setCardNumber('5123 4567 8901 0000');
      setCardExpiry('06/27');
      setCardCvv('999');
    }
  };

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Initiate simulation
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) {
      setErrorMessage('Please provide a valid customer email.');
      return;
    }

    setErrorMessage('');
    setPaymentState('processing');
    setStatusMessage('Initiating secure encrypted checkout...');

    setTimeout(() => {
      if (channel === 'card') {
        if (cardNumber.endsWith('0000')) {
          setPaymentState('failed');
          setErrorMessage('Transaction declined: Insufficient funds in bank account.');
          return;
        }
        // Proceed to OTP 3D secure challenge
        setPaymentState('otp_required');
      } else if (channel === 'bank_transfer') {
        setStatusMessage('Listening for bank payment confirmation...');
        setTimeout(async () => {
          finalizeSuccessfulPayment('Direct Bank Transfer (Virtual Account)');
        }, 1500);
      } else {
        setStatusMessage('Connecting with mobile carrier network...');
        setTimeout(async () => {
          finalizeSuccessfulPayment(`Instant USSD (${ussdBank.toUpperCase()})`);
        }, 1500);
      }
    }, 1200);
  };

  // Submit OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState('processing');
    setStatusMessage('Authenticating secure bank token...');

    setTimeout(async () => {
      finalizeSuccessfulPayment(`Debit/Credit Card ending in ${cardNumber.slice(-4) || '4084'}`);
    }, 1400);
  };

  const finalizeSuccessfulPayment = async (channelDescription: string) => {
    setStatusMessage('Allocating inventory and generating order receipt...');
    const result = await completePaystackPayment({
      customerEmail,
      customerName: customerName || 'Valued Buyer',
      paymentMethod: channel,
      paystackChannel: channelDescription,
    });

    if (result.success && result.order) {
      setCompletedOrder(result.order);
      setPaymentState('success');
    } else {
      setPaymentState('failed');
      setErrorMessage(result.error || 'Failed to complete transaction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-blue-100 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Oceanic Water Header */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#014F86] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center font-bold text-cyan-200 text-sm shadow-xs">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  East Gate Checkout
                </span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>
              <div className="text-sm font-semibold text-white">Payment Portal</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-blue-300 font-mono">Total Payable</div>
            <div className="text-lg font-bold font-mono text-white tabular-nums">
              {formatPrice(totalAmount, currency)}
            </div>
          </div>
        </div>

        {/* Order Preview Bar */}
        <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-2.5 flex items-center justify-between text-xs text-slate-700">
          <div className="truncate max-w-[280px]">
            <span className="font-semibold text-[#0B1E36]">{product.name}</span>
            <span className="text-slate-500 font-mono text-[11px]"> ({variant.name})</span>
          </div>
          <span className="font-mono text-slate-600 tabular-nums shrink-0">
            Qty: {quantity} unit{quantity > 1 ? 's' : ''}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {paymentState === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-900 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-[#0B1E36]">Securing Your Transaction</p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{statusMessage}</p>
              </div>
            </div>
          )}

          {paymentState === 'otp_required' && (
            <form onSubmit={handleVerifyOtp} className="py-4 space-y-5">
              <div className="text-center space-y-1">
                <div className="w-11 h-11 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1E36]">Card Security Authentication</h3>
                <p className="text-xs text-slate-500">
                  A verification one-time passcode has been simulated for your mobile device.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
                <span className="text-[11px] text-blue-900/80 block">Test Passcode Hint:</span>
                <span className="text-sm font-mono font-bold text-blue-950 tracking-widest">
                  123456
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full max-w-[200px] mx-auto block px-4 py-2 text-center text-lg font-mono font-bold tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentState('idle')}
                  className="w-1/2 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-semibold bg-[#0B1E36] hover:bg-blue-950 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Verify & Complete
                </button>
              </div>
            </form>
          )}

          {paymentState === 'success' && completedOrder && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0B1E36]">Payment Approved</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your order is confirmed and inventory has been reserved.
                </p>
              </div>

              {/* Receipt card */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-mono">Reference</span>
                  <span className="font-mono font-bold text-[#0B1E36]">
                    {completedOrder.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-mono font-bold text-[#0B1E36]">
                    {formatPrice(completedOrder.totalAmount, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="text-slate-800">{completedOrder.paystackChannel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="text-slate-800">{completedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SKU</span>
                  <span className="font-mono text-slate-800">{completedOrder.sku}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={closePaystackCheckout}
                  className="w-full py-3 text-xs font-semibold bg-[#0B1E36] hover:bg-blue-950 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Done & View Order Ledger
                </button>
              </div>
            </div>
          )}

          {paymentState === 'failed' && (
            <div className="py-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mx-auto border border-blue-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Transaction Not Completed</h3>
                <p className="text-xs text-blue-800 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setPaymentState('idle')}
                className="px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {paymentState === 'idle' && (
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-900"
                    required
                  />
                </div>
              </div>

              {/* Payment Channel Selector (Tabs) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('card')}
                    className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      channel === 'card'
                        ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('bank_transfer')}
                    className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      channel === 'bank_transfer'
                        ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('ussd')}
                    className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      channel === 'ussd'
                        ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>USSD</span>
                  </button>
                </div>
              </div>

              {/* Channel View: Card */}
              {channel === 'card' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Test Simulator Cards:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fillTestCard('success')}
                        className="text-blue-900 font-semibold hover:underline cursor-pointer"
                      >
                        Auto-Fill Test Card
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => fillTestCard('insufficient')}
                        className="text-blue-800 font-medium hover:underline cursor-pointer"
                      >
                        Fail Test Card
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4084 0840 0840 0840"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-blue-900 tracking-wider"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">CVV Security Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Channel View: Bank Transfer */}
              {channel === 'bank_transfer' && (
                <div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-2xl space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0B1E36]">
                      Direct Transfer Virtual Account
                    </span>
                    <span className="font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-300">
                      Valid for {formatTimer(transferTimer)}
                    </span>
                  </div>

                  <div className="space-y-1.5 py-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name</span>
                      <span className="font-semibold text-slate-900">Wema Bank</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0B1E36] text-sm">
                          0124893012
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="p-1 text-slate-500 hover:text-slate-900"
                          title="Copy account number"
                        >
                          {copiedAccount ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary</span>
                      <span className="font-semibold text-[#0B1E36]">
                        NMILI COMMERCE
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    Transfer exactly <strong>{formatPrice(totalAmount, currency)}</strong> to the account above. Confirmation is verified automatically.
                  </p>
                </div>
              )}

              {/* Channel View: USSD */}
              {channel === 'ussd' && (
                <div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-2xl space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Choose Your Bank
                    </label>
                    <select
                      value={ussdBank}
                      onChange={(e) => setUssdBank(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="gtb">GTBank (*737#)</option>
                      <option value="zenith">Zenith Bank (*966#)</option>
                      <option value="access">Access Bank (*901#)</option>
                      <option value="uba">UBA (*919#)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-white border border-blue-200 rounded-xl text-center space-y-1">
                    <span className="text-[11px] text-slate-500 block">Dial USSD string:</span>
                    <span className="text-base font-mono font-bold text-[#0B1E36] tracking-wider">
                      {ussdBank === 'gtb'
                        ? '*737*50*4928#'
                        : ussdBank === 'zenith'
                        ? '*966*00*4928#'
                        : '*901*00*4928#'}
                    </span>
                  </div>
                </div>
              )}

              {/* Pay Action CTA in Oceanic Blue */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#0B2545] to-[#0284C7] hover:from-[#134074] hover:to-[#0369A1] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider font-mono shadow-md hover:shadow-lg"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    Pay {formatPrice(totalAmount, currency)} Securely
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={closePaystackCheckout}
                  className="hover:text-slate-700 underline cursor-pointer"
                >
                  Cancel transaction
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
