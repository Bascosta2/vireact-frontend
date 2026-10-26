import { useState } from 'react';
import { track } from '@/lib/analytics';

const isTrialBillingEnabled = (): boolean =>
  String(import.meta.env.VITE_TRIAL_BILLING ?? '').toLowerCase() === 'true';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  showWhenTrialOn?: boolean;
}

const buildFaqItems = (): FaqItem[] => {
  const trialOn = isTrialBillingEnabled();
  const items: FaqItem[] = [
    {
      id: 'followers',
      question: 'Do I need followers to start?',
      answer:
        "No. Vireact works even if you’re starting from zero. The quiz and hook analysis are based on your niche and content, not just your current follower count.",
    },
    {
      id: 'free',
      question: 'Is it really free?',
      answer: trialOn
        ? 'Yes. The quiz, personalized hook plan, and first AI hook rewrite are free. When trial billing is on, deeper frame-by-frame analysis and predictions unlock with a 7-day trial — you can see what you get before you decide to start it.'
        : 'Yes. The quiz, personalized hook plan, first AI hook rewrite, and initial video analyses are available on the free tier. Higher limits and team features live on paid plans, but you can see real results before upgrading.',
    },
    {
      id: 'platforms',
      question: 'Which platforms does it work for?',
      answer: 'Vireact is built for short-form TikTok, Instagram Reels, and YouTube Shorts (and Facebook Reels by extension).',
    },
    {
      id: 'uploads',
      question: 'What videos can I upload?',
      answer:
        'Short-form clips between roughly 5–60 seconds, up to 200MB per file. Supported formats: MP4, MOV, WEBM, AVI, and MKV.',
    },
    {
      id: 'privacy',
      question: 'Is my video private?',
      answer:
        'Yes. Your videos are processed to generate analysis and hook suggestions, but they are not made public or shared with other creators. They are used only to improve your own recommendations.',
    },
    {
      id: 'difference',
      question: 'How is this different from generic AI tools?',
      answer:
        'Generic chatbots guess based on prompts. Vireact runs frame-level analysis, tracks exactly where viewers drop, and hands you timestamped fixes and replacement lines grounded in a library of proven hooks.',
    },
    {
      id: 'cancel',
      question: 'Can I cancel?',
      showWhenTrialOn: true,
      answer:
        'Yes. When trials and plans are enabled you will be able to cancel anytime from your account settings. Access continues until the trial or billing period ends.',
    },
    {
      id: 'after-click',
      question: 'What happens after I click the button?',
      answer:
        'You’ll answer six quick questions, get your personalized hook plan and free rewrite, then create an account to unlock deeper analysis and predictions. No surprises and no hidden extra steps.',
    },
  ];

  return items.filter((item) => !item.showWhenTrialOn || trialOn);
};

export function FaqV3() {
  const items = buildFaqItems();
  const [openId, setOpenId] = useState<string | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const handleToggle = (item: FaqItem) => {
    const nextOpen = openId === item.id ? null : item.id;
    setOpenId(nextOpen);
    if (nextOpen && !trackedIds.has(item.id)) {
      track('faq_opened', { question: item.id });
      setTrackedIds(new Set(trackedIds).add(item.id));
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 md:py-20">
      <header className="mb-6 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">FAQ</p>
        <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          Answers before you upload a single video.
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          If something here isn’t clear, you’ll be able to get in touch from inside the app.
        </p>
      </header>
      <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-zinc-950/70">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-6 md:py-5"
                onClick={() => handleToggle(item)}
                aria-expanded={open}
              >
                <span className="text-sm font-medium text-white">{item.question}</span>
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-zinc-200"
                  aria-hidden="true"
                >
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-zinc-300 md:px-6">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

