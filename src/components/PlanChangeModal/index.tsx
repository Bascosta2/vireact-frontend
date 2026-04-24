import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  previewPlanChange,
  changePlan as changePlanApi,
  type PlanChangePreview,
} from '@/api/subscription';
import { getTier, type CheckoutPlan } from '@/config/tiers';

interface PlanChangeModalProps {
  isOpen: boolean;
  targetPlan: CheckoutPlan;
  onClose: () => void;
  onSuccess: () => void;
}

const formatCents = (cents: number, currency: string = 'usd') => {
  const dollars = Math.abs(cents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(dollars);
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const SUCCESS_DISMISS_MS = 1500;

export default function PlanChangeModal({
  isOpen,
  targetPlan,
  onClose,
  onSuccess,
}: PlanChangeModalProps) {
  const [preview, setPreview] = useState<PlanChangePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const targetTier = getTier(targetPlan);
  const targetName = targetTier?.name ?? targetPlan;

  // Load preview when opened
  useEffect(() => {
    if (!isOpen) return;

    setPreview(null);
    setPreviewLoading(true);
    setPreviewError(null);
    setSwitchError(null);
    setSuccess(false);

    let cancelled = false;
    (async () => {
      try {
        const data = await previewPlanChange(targetPlan);
        if (!cancelled) setPreview(data);
      } catch (err: any) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load plan change preview';
          setPreviewError(msg);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, targetPlan]);

  // Focus management: capture previously focused element on open, restore on close
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      const target = previewError ? closeBtnRef.current : confirmBtnRef.current;
      target?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, previewError]);

  // Escape + Tab focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (switching) return;
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, switching, onClose]);

  const handleConfirm = async () => {
    setSwitchError(null);
    setSwitching(true);
    try {
      await changePlanApi(targetPlan);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, SUCCESS_DISMISS_MS);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change plan. Please try again.';
      setSwitchError(msg);
      setSwitching(false);
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !switching) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const headingId = 'plan-change-modal-heading';
  const isCredit = preview ? preview.immediateCharge < 0 : false;
  const isZero = preview ? preview.immediateCharge === 0 : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="w-full max-w-md rounded-xl p-6 text-white shadow-2xl"
        style={{
          background: 'rgba(17, 17, 17, 0.97)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2
          id={headingId}
          className="text-xl font-bold mb-1 text-pink-500"
        >
          Switch to {targetName}
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Review the proration and confirm your plan change.
        </p>

        {previewLoading && (
          <div className="space-y-4 mb-5" aria-live="polite" aria-busy="true">
            <div
              className="h-24 rounded-lg animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            />
            <div
              className="h-24 rounded-lg animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            />
          </div>
        )}

        {!previewLoading && previewError && (
          <div
            className="rounded-lg p-4 mb-5 text-sm"
            role="alert"
            style={{
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
            }}
          >
            <p className="text-red-400">{previewError}</p>
          </div>
        )}

        {!previewLoading && !previewError && preview && (
          <div className="space-y-4 mb-5">
            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <p className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-1">
                {isCredit ? "Today's credit" : "Today's charge"}
              </p>
              <p className="text-2xl font-bold">
                {formatCents(preview.immediateCharge, preview.currency)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {isZero
                  ? 'No proration needed'
                  : isCredit
                    ? 'Will be applied to your next invoice'
                    : 'Prorated for the rest of your current billing period'}
              </p>
            </div>

            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <p className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-1">
                Then
              </p>
              <p className="text-2xl font-bold">
                {targetTier?.priceDisplay ?? ''}
                <span className="text-base text-gray-400 font-normal">
                  /month
                </span>
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Starting {formatDate(preview.nextBillingDate)}
              </p>
            </div>
          </div>
        )}

        {switchError && (
          <div
            className="rounded-lg p-3 mb-4 text-sm"
            role="alert"
            style={{
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
            }}
          >
            <p className="text-red-400">{switchError}</p>
          </div>
        )}

        {success && (
          <div
            className="rounded-lg p-3 mb-4 text-sm"
            role="status"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
            }}
          >
            <p className="text-green-400">
              Switched to {targetName}! New limits apply now.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {previewError ? (
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="px-5 py-2 text-white rounded-lg font-semibold text-sm transition-colors hover:bg-white/5"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={switching || success}
                className="px-5 py-2 text-white rounded-lg font-semibold text-sm transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                onClick={handleConfirm}
                disabled={previewLoading || switching || success || !preview}
                className="px-5 py-2 text-white rounded-lg font-semibold text-sm transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #FF3CAC, #FF8C00)',
                  border: 'none',
                }}
              >
                {success
                  ? 'Switched!'
                  : switching
                    ? 'Switching...'
                    : 'Confirm switch'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
