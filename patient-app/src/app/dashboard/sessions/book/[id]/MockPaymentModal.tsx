"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, X, CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderData {
  orderId: string;
  amount: number;         // in paise
  currency: string;
  key: string;
  therapistName: string;
  therapistId: string;
  scheduledAt: string;
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
  const formattedDate = new Date(orderData.scheduledAt).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kolkata"
  });
  const formattedTime = new Date(orderData.scheduledAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const handlePay = async () => {
    setStep("processing");
    setErrorMsg(null);

    try {
      const mockPaymentId = `MOCK_PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const mockSignature = `MOCK_SIG_${Date.now()}`;

      const result = await api.payments.verify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        therapistId: orderData.therapistId,
        scheduledAt: orderData.scheduledAt,
        notes: orderData.notes,
        mode: orderData.mode,
      });

      setStep("success");
      // Redirect to intake form first, then to session after intake is complete
      const sessionId = result?.id || result?.appointmentId;
      router.push(sessionId ? `/dashboard/intake?session=${sessionId}` : "/dashboard/intake");
    } catch (err: any) {
      setErrorMsg(err.message || "Payment verification failed");
      setStep("error");
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        className="relative w-full max-w-md my-auto animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Payment"
      >
        {/* ── Card shell ──────────────────────────────────────────── */}
        <Card className="overflow-hidden p-0 gap-0 border border-white/10 bg-[#0f0f1a] shadow-2xl ring-0">

          {/* Header bar */}
          <div className="bg-[#1a1a2e] px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-white text-sm font-bold tracking-tight">Secure Checkout</p>
                <p className="text-white/40 text-base">The Blissful Station</p>
              </div>
            </div>
            {step === "form" && (
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/60 hover:text-white p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Body */}
          <div className="bg-[#0f0f1a] px-4 py-6 sm:px-6 sm:py-8">

            {/* ── Success State ────────────────────────────── */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading text-white font-medium">Payment Successful!</h2>
                  <p className="text-white/50 text-sm mt-2">One last step — please fill out your intake form.</p>
                </div>
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Redirecting to intake form…
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
                <Button
                  onClick={() => setStep("form")}
                  className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* ── Payment Form ─────────────────────────────── */}
            {step === "form" && (
              <div className="space-y-6">
                {/* Dev Mode Banner */}
                {orderData.isMock && (
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-amber-400 text-base font-bold uppercase tracking-widest">Dev Mode — Mock Payment</p>
                      <p className="text-amber-400/60 text-base mt-0.5">No real charge. Pre-filled test card below.</p>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <p className="text-white/40 text-base font-bold uppercase tracking-widest">Order Summary</p>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white text-sm font-medium">{orderData.therapistName}</p>
                      <p className="text-white/40 text-base">{formattedDate} • {formattedTime} IST</p>
                      {orderData.mode && (
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                          orderData.mode === 'IN_CLINIC' ? 'text-primary' : 'text-primary'
                        }`}>
                          {orderData.mode === 'IN_CLINIC' ? '🏥 In-Clinic Visit' : '🖥️ Online Consultation'}
                        </p>
                      )}
                    </div>
                    <p className="text-white text-lg sm:text-xl font-heading font-medium flex-shrink-0">₹{amountInRupees}</p>
                  </div>
                  {orderData.mode === 'IN_CLINIC' && orderData.clinicAddress && (
                    <p className="text-white/30 text-base pt-2 border-t border-white/5 leading-relaxed">
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
                      <Input
                        type="text"
                        value={cardNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="0000 0000 0000 0000"
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Name on Card</label>
                    <Input
                      type="text"
                      value={cardName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Full Name"
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Expiry</label>
                      <Input
                        type="text"
                        value={expiry}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiry(e.target.value)}
                        maxLength={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs font-bold uppercase tracking-widest">CVV</label>
                      <Input
                        type="text"
                        value={cvv}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCvv(e.target.value)}
                        maxLength={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-primary/50 transition-colors placeholder-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  id="mock-payment-pay-btn"
                  onClick={handlePay}
                  className="w-full py-3.5 sm:py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 h-auto"
                >
                  <Lock className="w-4 h-4" />
                  Pay ₹{amountInRupees}
                </Button>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-2 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1 text-white/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="hidden sm:block w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1 text-white/30">
                    <Lock className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                  {orderData.isMock && (
                    <>
                      <div className="hidden sm:block w-px h-3 bg-white/10" />
                      <span className="text-amber-500/50 font-bold uppercase tracking-widest">Mock</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
