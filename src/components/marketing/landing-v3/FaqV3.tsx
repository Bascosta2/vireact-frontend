import { useId, useState } from 'react';
import { claims } from '@/content/claims';
import { track } from '@/lib/analytics';
import { PrimaryCta } from './PrimaryCta';

const isTrialBillingEnabled = (): boolean =>
  String(import.meta.env.VITE_TRIAL_BILLING ?? '').toLowerCase() === 'true';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Answers follow the current access model: with trial billing off the free tier is `claims.freeOffer`. */
export const buildFaqItems = (trialOn: boolean = isTrialBillingEnabled()): FaqItem[] => {
  const items: FaqItem[] = [
    {
      id: 'followers',
      question: 'Do I need followers to start?',
      answer:
        'No. The quiz and the hook analysis work from your niche, platform and the video itself, not your follower count.',
    },
    {
      id: 'free',
      question: 'Is it really free?',
      answer: trialOn
        ? 'The quiz, your personalized hook plan and one AI hook rewrite are free. Frame-by-frame analysis of your own videos comes with the 7-day free trial, so you see the results before you decide to keep a plan.'
        : `The quiz, your personalized hook plan and one AI hook rewrite are free. ${claims.freeOffer} Higher limits and advanced analysis are on paid plans.`,
    },
    {
      id: 'platforms',
      question: 'Which platforms does it work for?',
      answer: 'TikTok, Instagram Reels and YouTube Shorts.',
    },
    {
      id: 'uploads',
      question: 'What videos can I upload?',
      answer: 'MP4, MOV, WEBM, AVI or MKV files up to 200MB, roughly 5 to 60 seconds long.',
    },
    {
      id: 'privacy',
      question: 'Is my video private?',
      answer:
        'Your videos and reports are only visible inside your account; Vireact does not publish them or show them to other users. The Privacy Policy explains how data is processed.',
    },
    {
      id: 'difference',
      question: 'How is this different from generic AI tools?',
      answer:
        'Vireact works frame by frame. Every fix is tied to a timestamp and gives you the actual line to use, based on a library of hooks that have worked. It also predicts a view range before you post. No general advice like “make the hook stronger.”',
    },
    {
      id: 'after-click',
      question: 'What happens after I click?',
      answer:
        'You answer six quick questions, see your results and a free hook rewrite, then create an account to analyze your own video.',
    },
  ];

  if (trialOn) {
    items.splice(6, 0, {
      id: 'cancel',
      question: 'Can I cancel?',
      answer:
        'Yes, anytime from your account settings. Access continues until the end of your trial or billing period.',
    });
  }
  return items;
};

export function FaqV3() {
  const items = buildFaqItems();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (item: FaqItem) => {
    const opening = openId !== item.id;
    setOpenId(opening ? item.id : null);
    if (opening) track('faq_opened', { question: item.question });
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-24" aria-labelledby={`${baseId}-title`}>
      <h2 id={`${baseId}-title`} className="mb-6 text-center !text-4xl md:text-left">
        Questions before you start
      </h2>
      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04]">
        {items.map((item) => {
          const open = openId === item.id;
          const panelId = `${baseId}-${item.id}`;
          return (
            <div key={item.id}>
              <h3 className="m-0">
                <button
                  type="button"
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-4 text-left text-base font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-400 md:px-6"
                  onClick={() => toggle(item)}
                  aria-expanded={open}
                  aria-controls={panelId}
                >
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="text-xl text-zinc-300">
                    {open ? '−' : '+'}
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" hidden={!open} className="px-4 pb-4 text-zinc-300 md:px-6">
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="faq" />
      </div>
    </section>
  );
}
