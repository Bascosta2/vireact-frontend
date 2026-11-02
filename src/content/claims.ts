/**
 * Marketing numbers and claims shown on public pages. Components render these
 * values from here; do not hard-code a claim in a component.
 *
 * Nothing in this file is verified. Each entry carries a `// VERIFY` note with
 * where it renders and what the audit found (docs/audit/SITE_WALKTHROUGH.md,
 * "Claims inventory"). Change a value here only after the owner confirms it.
 *
 * History: until Funnel V2 Phase 2 the hook count was hard-coded as "119" in
 * the nav, /viral-hooks and its thank-you page. The KB copy of the hooks PDF
 * holds about 91 hooks across 11 categories (docs/audit/KNOWLEDGE_BASE_AUDIT.md).
 */
export const claims = {
  // VERIFY: hook count. Audit counted ~91 hooks in the KB copy of the PDF. Renders in the header nav,
  // /viral-hooks (headline, "What's inside" card, preview alt) and /viral-hooks/thank-you.
  // Replace with GET /api/v1/library/stats once the library ships (build plan §5.4).
  hookCount: '90+',

  // VERIFY: hero badge (components/UI/animated-hero.tsx). No ranking source found.
  heroBadge: '#1 CREATOR TRUSTED SHORT FORM CONTENT TOOL',

  // VERIFY: star rating and review count. No review source found. Renders in animated-hero.tsx,
  // ViralHooks/components/SocialProofRow.tsx and ViralHooks/ThankYou.tsx.
  rating: '4.6/5',
  reviewCount: '1000+',

  // VERIFY: creator count (Home/HeroAvatarStack, ViralHooks/ThankYou.tsx). Hover animation counts
  // from creatorCount up to creatorCountHoverMax. Audit: 192 users in the production database.
  creatorCount: 1000,
  creatorCountHoverMax: 1247,

  // VERIFY: login/signup side panel (components/SocialProof/index.tsx). Contradicts creatorCount (1,000+ vs 10K+).
  authBadge: '#1 AI short form content tool',
  authHeadline: 'Trusted by 10K+ creators and businesses worldwide',

  // ── Landing V3 (founder-led page) ──
  // VERIFY: founder identity. Used on the new home hero and FounderCredibility section.
  founderName: '',
  // VERIFY: number of accounts the founder has grown. Used in hero subline and proof blocks.
  founderAccountCount: null as number | null,
  // VERIFY: total followers and views across founder-run or advised accounts. Strings so formatting is explicit.
  founderTotalFollowers: '',
  founderTotalViews: '',
  // VERIFY: per-account stats. Each entry renders only when all fields are set.
  founderAccounts: [] as Array<{
    platform: 'tiktok' | 'instagram' | 'youtube';
    handle: string;
    followers: string;
    pfpSlot: 'account-1-pfp' | 'account-2-pfp' | 'account-3-pfp' | 'account-4-pfp';
    url: string;
  }>,
  // VERIFY: headline result counter in the ResultsBand ("X views analysed/generated").
  headlineViews: { value: '', label: '', verified: false as boolean },
  // VERIFY: views behind the hook & story library (from the hooks PDF or later library stats).
  libraryViews: '',
  // VERIFY: total creators helped. The number renders only when verified is true.
  creatorCountSummary: { value: '', verified: false as boolean },
  // VERIFY: rating + review count for the "Used by X creators" row. Hidden when verified is false.
  ratingSummary: { value: '', count: '', verified: false as boolean },
  // VERIFY: before/after views for a representative video. Hidden when verified is false.
  beforeAfter: {
    before: { views: '' },
    after: { views: '' },
    verified: false as boolean,
  },
  // VERIFY: before/after follower growth for the step 01 slider on Landing V3. One entry per creator;
  // needs brand assets growth-N-before.webp and growth-N-after.webp (profile screenshots). Each slide
  // stays hidden in production until verified is true and both images exist.
  growthComparisons: [
    { slot: 1, name: '', beforeFollowers: '', afterFollowers: '', verified: false as boolean },
    { slot: 2, name: '', beforeFollowers: '', afterFollowers: '', verified: false as boolean },
    { slot: 3, name: '', beforeFollowers: '', afterFollowers: '', verified: false as boolean },
  ] as Array<{ slot: 1 | 2 | 3; name: string; beforeFollowers: string; afterFollowers: string; verified: boolean }>,  // VERIFY: value anchors for free items, e.g. "$99 value — FREE". Hidden unless verified is true.
  valueAnchors: {
    quiz: { amount: '', verified: false as boolean },
    rewriter: { amount: '', verified: false as boolean },
    library: { amount: '', verified: false as boolean },
    analysis: { amount: '', verified: false as boolean },
  },
  // VERIFY: optional launch offer deadline. When null, no urgency UI is shown.
  launchOfferEndsAt: null as string | null,

  // VERIFY: size of the prediction benchmark set. CardViralityPrediction.tsx said "15M+",
  // ViralityRangeWidget.tsx said "15.2M"; both now render this value.
  similarVideosCount: '15M+',

  // VERIFY: /viral-hooks headline and "What's inside" copy. No source for the view total.
  viralHooksViews: '200M+',
  // VERIFY: storytelling structure step count (ViralHooks/components/InsideCards.tsx); confirm against the PDF.
  storytellingSteps: '6-step',
  // VERIFY: PDF delivery time (ViralHooks/index.tsx). Delivery is a Mailchimp automation that is not in code.
  pdfDeliveryTime: '10 seconds',
  // VERIFY: /viral-hooks badge. Audit flags "NO SIGN-UP" as misleading because the page requires an email.
  viralHooksBadge: 'FREE PDF — NO SIGN-UP, NO PAYWALL',

  // VERIFY: free offer (ViralHooks/ThankYou.tsx). Must switch to trial copy when
  // NEW_USER_ACCESS_MODEL=card_trial (build plan §8.1).
  freeOffer: 'Two free uploads, no credit card.',

  // VERIFY: user results quoted in Home/WhyChooseUsSection/why-choose-us-items.ts. No source found.
  userResults: {
    subGrowth: '2k to 15k subs in 30 days',
    trendVideo: '1.2M views in 4 days',
    postTimingEngagement: '2x engagement',
    captionRetention: '40% more retention',
  },

  // VERIFY: feature-page stat blocks (pages/PreLogin/Features/*/*-stats.ts). Unsourced percentages and multipliers.
  featureStats: {
    viralPredictor: ['75%', '2X', '1MIN', '99%'],
    hookAnalyzer: ['95%', '4X', '80%', '90%'],
    captionClarity: ['80%', '2.5X', '70%', '92%'],
    audioInsight: ['90%', '3X', '85%', '95%'],
    advancedAnalytics: ['88%', '2.8X', '75%', '93%'],
    pacingAndRhythm: ['85%', '3X', '90%', '88%'],
  },

  // VERIFY: illustrative widget output on Home (Home/DifferentiationSection/*). Audit flags the virality
  // widget as self-contradictory: 110K sits outside the "Expected 75–95K" tile and the scenario
  // probabilities sum to 139%.
  demoWidgets: {
    virality: {
      low: '45K',
      expected: '110K',
      high: '180K',
      summary: '89% Confidence · 15.2M similar videos · Top 12% in niche',
      scenarios: [
        { label: 'Conservative', range: '45–65K', prob: '15%' },
        { label: 'Expected', range: '75–95K', prob: '89%' },
        { label: 'Optimistic', range: '150–180K', prob: '35%' },
      ],
    },
    actionableFixes: [
      '✂  Cut your intro from 4s → 1.5s for +31% retention',
      '🎵  Background music too loud at 0:07 — lower by 40%',
      '📌  Add caption at 0:03 — viewers drop off without text',
    ],
    contentDna: [
      'Fast cuts (0.8–1.2s) work 3.2x better for you',
      'You excel at 2.8s cut frequency',
      'Your audience responds best to <1s opening shots',
    ],
  },
} as const;

/**
 * Image-bound claims that stay next to their images. Each needs the owner to confirm the numbers
 * and the right to show the person's likeness or the brand's logo (docs/audit/OPEN_QUESTIONS.md).
 */
export const claimsKeptInPlace = [
  // VERIFY: creator avatars and follower counts.
  'components/FeaturesPage/CreatorsAndBusinesses/ProfileCard/profile-data.ts',
  'components/SocialProof/index.tsx (creator list)',
  // VERIFY: brand and company logos implying use or endorsement.
  'components/FeaturesPage/CreatorsAndBusinesses/logo-data.ts',
  'components/SocialProof/index.tsx (company logos)',
  // VERIFY: testimonial channels and subscriber counts.
  'components/Home/WinsSection/wins-data.ts',
  // VERIFY: creator thumbnails (MrBeast, IShowSpeed, Hormozi, Rogan, Goggins...).
  'assets/thumbnails/*',
  // VERIFY: view counts in image alts (component not rendered on Home).
  'components/AnalyticsScreenshots/wins-items.ts',
] as const;
