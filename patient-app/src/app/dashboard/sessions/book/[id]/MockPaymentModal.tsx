"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, X, CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface OrderData {
  orderId: string;
  amount: number;         // in paise
  currency: string;
  key: string;
  therapistName: string;
  slotId: string;
  date: string;
  notes?: string;
  isMock: boolean;
  mode?: string;         // 'ONLINE' | 'IN_CLINIC'
  clinicAddress?: string;
}

interface Props {
  orderData: OrderData;
  onClose: () => void;
}

type ModalStep = "form" | "processing" | "success" | "error";

const MOCK_CARD = "4111 1111 1111 1111";
const MOCK_EXPIRY = "12/28";
const MOCK_CVV = "123";
const MOCK_NAME = "Test Patient";

export default function MockPaymentModal({ orderData, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState(MOCK_CARD);
  const [expiry, setExpiry] = useState(MOCK_EXPIRY);
  const [cvv, setCvv] = useState(MOCK_CVV);
  const [cardName, setCardName] = useState(MOCK_NAME);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && step === "form") onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && step === "form") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, onClose]);

  const amountInRupees = (orderData.amount / 100).toLocaleString("en-IN");
  const formattedDate = new Date(orderData.date).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });
  const formattedTime = new Date(orderData.date).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  });

  const handlePay = async () => {
    setStep("processing");
    setErrorMsg(null);

    // Simulate brief processing delay for realism
    await new Promise((r) => setTimeout(r, 1800));

    try {
      const mockPaymentId = `MOCK_PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const mockSignature = `MOCK_SIG_${Date.now()}`;

      await api.payments.verify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        slotId: orderData.slotId,
        date: orderData.date,
        notes: orderData.notes,
        mode: orderData.mode,
      });

      setStep("success");
      // Redirect after showing success for a moment
      setTimeout(() => router.push("/dashboard/sessions?success=true"), 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Payment verification failed");
      setStep("error");
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Payment"
      >
        {/* ── Card shell ──────────────────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">

          {/* Header bar */}
          <div className="bg-[#1a1a2e] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-white text-sm font-bold tracking-tight">Secure Checkout</p>
                <p className="text-white/40 text-xs">The Blissful Station</p>
              </div>
            </div>
            {step === "form" && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="bg-[#0f0f1a] px-6 py-8">

            {/* ── Success State ────────────────────────────── */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading text-white font-medium">Payment Successful!</h2>
                  <p className="text-white/50 text-sm mt-2">Redirecting to your sessions…</p>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Please wait
                </div>
              </div>
            )}

            {/* ── Processing State ─────────────────────────── */}
            {step === "processing" && (
              <div className="flex flex-col items-center gap-5 py-12 text-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-heading text-white">Processing Payment…</h2>
                  <p className="text-white/40 text-sm mt-1">Please do not close this window</p>
                </div>
              </div>
            )}

            {/* ── Error State ──────────────────────────────── */}
            {step === "error" && (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-heading text-white">Payment Failed</h2>
                  <p className="text-red-400/80 text-sm mt-2">{errorMsg}</p>
                </div>
                <button
                  onClick={() => setStep("form")}
                  className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ── Payment Form ─────────────────────────────── */}
            {step === "form" && (
              <div className="space-y-6">
                {/* Dev Mode Banner */}
                {orderData.isMock && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Dev Mode — Mock Payment</p>
                      <p className="text-amber-400/60 text-xs mt-0.5">No real charge. Pre-filled test card below.</p>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Order Summary</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{orderData.therapistName}</p>
                      <p className="text-white/40 text-xs">{formattedDate} • {formattedTime} IST</p>
                      {orderData.mode && (
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                          orderData.mode === 'IN_CLINIC' ? 'text-emerald-400' : 'text-primary'
                        }`}>
                          {orderData.mode === 'IN_CLINIC' ? '🏥 In-Clinic Visit' : '🖥️ Online Consultation'}
                        </p>
                      )}
                    </div>
                    <p className="text-white text-xl font-heading font-medium">₹{amountInRupees}</p>
                  </div>
                  {orderData.mode === 'IN_CLINIC' && orderData.clinicAddress && (
                    <p className="text-white/30 text-xs pt-2 border-t border-white/5">
                      📍 {orderData.clinicAddress}
                    </p>
                  )}
                </div>

                {/* Card form */}
                <div className="space-y-4">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20"
                        placeholder="0000 0000 0000 0000"
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20"
                      placeholder="Full Name"
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Expiry</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        maxLength={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs font-bold uppercase tracking-widest">CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  id="mock-payment-pay-btn"
                  onClick={handlePay}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Pay ₹{amountInRupees}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <ShieldCheck className="w-3 h-3" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <Lock className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                  {orderData.isMock && (
                    <>
                      <div className="w-px h-3 bg-white/10" />
                      <span className="text-amber-500/50 text-xs font-bold uppercase tracking-widest">Mock</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
