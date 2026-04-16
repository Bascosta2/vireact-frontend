import { useEffect, useState, useCallback, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Video, Activity } from 'lucide-react';
import { useUser } from '@/redux/hooks/use-user';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos } from '@/api/video';
import { ANALYSIS_STATUS } from '@/constants';
import { cn } from '@/lib/utils';

const STEP_DELAY_MS = 150;
const GLOW_INTERVAL_MS = 2200;

const steps = [
  {
    step: 1,
    title: 'Upload Your Video',
    description: 'Drop a file or paste a TikTok, Reel, or Shorts link',
    benefit: 'Supports MP4, MOV, AVI, MKV • URLs from TikTok, Reels & Shorts',
    href: '/upload',
    navigable: true,
  },
  {
    step: 2,
    title: 'Select Features',
    description: 'Choose which aspects you want analyzed — hook, pacing, audio, and more',
    benefit: 'Hook • Pacing • Audio • Caption • Views • Advanced Analytics',
    href: '/features',
    navigable: true,
  },
  {
    step: 3,
    title: 'AI Analyzes',
    description: 'Our AI breaks down every frame. Takes 2–5 minutes.',
    benefit: 'Scene-by-scene breakdown with timestamp-level feedback',
    href: null,
    navigable: false,
  },
  {
    step: 4,
    title: 'Chat & Get Feedback',
    description: 'Open the chat on any completed video and ask anything',
    benefit: 'Ask anything • Get fixes • Compare platforms',
    href: '/videos',
    navigable: true,
  },
] as const;

function UploadWorkflowIcon() {
  return (
    <div className="relative h-[120px] w-[120px]" aria-hidden>
      <style>
        {`
          @keyframes upload-dash-march {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -44; }
          }
          @keyframes upload-file-drop {
            0% { transform: translate(56px, -16px) scale(0.96); opacity: 0; }
            10% { opacity: 1; }
            55% { transform: translate(56px, 50px) scale(1); opacity: 1; }
            65% { transform: translate(56px, 58px) scale(1.07); opacity: 1; }
            75% { transform: translate(56px, 54px) scale(0.98); opacity: 1; }
            85% { transform: translate(56px, 56px) scale(1); opacity: 1; }
            100% { transform: translate(56px, 56px) scale(1); opacity: 0; }
          }
          @keyframes upload-zone-glow {
            0%, 38%, 100% { opacity: 0; }
            48%, 76% { opacity: 1; }
          }
          @keyframes upload-check-in {
            0%, 70% { opacity: 0; transform: scale(0.72); }
            80%, 95% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1); }
          }
          .upload-zone-dash {
            animation: upload-dash-march 650ms linear infinite;
          }
          .upload-file {
            transform-box: fill-box;
            transform-origin: center;
            animation: upload-file-drop 3s cubic-bezier(0.22, 0.72, 0.2, 1) infinite;
          }
          .upload-zone-accent {
            animation: upload-zone-glow 3s ease-in-out infinite;
          }
          .upload-check {
            transform-box: fill-box;
            transform-origin: center;
            animation: upload-check-in 3s ease-in-out infinite;
          }
        `}
      </style>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <rect x="20" y="28" width="80" height="64" rx="13" fill="rgba(255,255,255,0.03)" />
        <rect
          x="20"
          y="28"
          width="80"
          height="64"
          rx="13"
          fill="none"
          stroke="#d4d4d8"
          strokeOpacity="0.75"
          strokeWidth="1.6"
          strokeDasharray="6 5"
          className="upload-zone-dash"
        />
        <rect
          x="20"
          y="28"
          width="80"
          height="64"
          rx="13"
          fill="none"
          stroke="#FF5500"
          strokeWidth="2"
          strokeOpacity="0.85"
          className="upload-zone-accent"
          filter="url(#upload-glow)"
        />
        <g className="upload-file">
          <path d="M-13 0h20l8 8v26a3 3 0 0 1-3 3h-25a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z" fill="#f8fafc" />
          <path d="M7 0v8h8" fill="none" stroke="#FF5500" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-8 14h15M-8 20h12M-8 26h10" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" />
          <g className="upload-check">
            <circle cx="11.5" cy="32" r="5.8" fill="#FF5500" />
            <path d="M8.6 32.1l1.8 1.8 3.2-3.2" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        <defs>
          <filter id="upload-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function FeaturesWorkflowIcon() {
  return (
    <div className="relative h-[120px] w-[120px]" aria-hidden>
      <style>
        {`
          @keyframes features-cursor-path {
            0% { transform: translate(88px, 100px) rotate(-12deg); opacity: 0; }
            8% { opacity: 1; }
            14% { transform: translate(30px, 30px) rotate(-6deg); }
            28% { transform: translate(64px, 30px) rotate(-5deg); }
            42% { transform: translate(30px, 51px) rotate(-3deg); }
            56% { transform: translate(64px, 51px) rotate(-4deg); }
            70% { transform: translate(30px, 72px) rotate(-2deg); }
            84% { transform: translate(64px, 72px) rotate(-2deg); opacity: 1; }
            100% { transform: translate(88px, 100px) rotate(-12deg); opacity: 0; }
          }
          @keyframes features-pill-select {
            0%, 10.99% { fill: rgba(255,255,255,0.04); stroke: rgba(212,212,216,0.65); filter: none; }
            11%, 100% { fill: rgba(255,85,0,0.85); stroke: rgba(255,85,0,1); filter: drop-shadow(0 0 6px rgba(255,85,0,0.45)); }
          }
          @keyframes features-ripple {
            0%, 10% { opacity: 0; transform: scale(0.2); }
            11% { opacity: 0.7; transform: scale(0.3); }
            20% { opacity: 0; transform: scale(1.5); }
            100% { opacity: 0; transform: scale(1.5); }
          }
          .features-cursor {
            transform-box: fill-box;
            transform-origin: center;
            animation: features-cursor-path 4s cubic-bezier(0.22, 0.72, 0.2, 1) infinite;
          }
          .features-pill-1 { animation: features-pill-select 4s linear infinite; animation-delay: 0.12s; }
          .features-pill-2 { animation: features-pill-select 4s linear infinite; animation-delay: 0.68s; }
          .features-pill-3 { animation: features-pill-select 4s linear infinite; animation-delay: 1.24s; }
          .features-pill-4 { animation: features-pill-select 4s linear infinite; animation-delay: 1.8s; }
          .features-pill-5 { animation: features-pill-select 4s linear infinite; animation-delay: 2.36s; }
          .features-pill-6 { animation: features-pill-select 4s linear infinite; animation-delay: 2.92s; }
          .features-ripple-1, .features-ripple-2, .features-ripple-3, .features-ripple-4, .features-ripple-5, .features-ripple-6 {
            transform-box: fill-box;
            transform-origin: center;
            animation: features-ripple 4s linear infinite;
          }
          .features-ripple-1 { animation-delay: 0s; }
          .features-ripple-2 { animation-delay: 0.4s; }
          .features-ripple-3 { animation-delay: 0.8s; }
          .features-ripple-4 { animation-delay: 1.2s; }
          .features-ripple-5 { animation-delay: 1.6s; }
          .features-ripple-6 { animation-delay: 2s; }
        `}
      </style>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g fill="none" stroke="rgba(255,255,255,0.08)">
          <rect x="22" y="22" width="76" height="76" rx="12" />
        </g>

        {[
          { x: 27, y: 28, label: 'Hook', pill: 'features-pill-1', ripple: 'features-ripple-1', cx: 45, cy: 35 },
          { x: 61, y: 28, label: 'Pacing', pill: 'features-pill-2', ripple: 'features-ripple-2', cx: 79, cy: 35 },
          { x: 27, y: 49, label: 'Audio', pill: 'features-pill-3', ripple: 'features-ripple-3', cx: 45, cy: 56 },
          { x: 61, y: 49, label: 'Caption', pill: 'features-pill-4', ripple: 'features-ripple-4', cx: 79, cy: 56 },
          { x: 27, y: 70, label: 'Views', pill: 'features-pill-5', ripple: 'features-ripple-5', cx: 45, cy: 77 },
          { x: 61, y: 70, label: 'Advanced', pill: 'features-pill-6', ripple: 'features-ripple-6', cx: 79, cy: 77 },
        ].map((p) => (
          <g key={p.label}>
            <rect x={p.x} y={p.y} width="34" height="14" rx="7" className={p.pill} strokeWidth="1.1" />
            <text x={p.x + 17} y={p.y + 9.4} textAnchor="middle" fontSize="4.2" fill="#f8fafc" fontWeight="600">
              {p.label}
            </text>
            <circle cx={p.cx} cy={p.cy} r="8" fill="none" stroke="#FF5500" strokeWidth="1.2" className={p.ripple} />
          </g>
        ))}

        <g className="features-cursor">
          <path d="M0 0l10 24 5-8 7 6 3-3-7-6 8-3z" fill="#f8fafc" stroke="#111827" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

function AiWorkflowIcon() {
  return (
    <div className="relative h-[120px] w-[120px]" aria-hidden>
      <style>
        {`
          @keyframes ai-chip-pulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px rgba(255,85,0,0.3)); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(255,85,0,0.75)); }
          }
          @keyframes ai-line-idle {
            0%, 100% { opacity: 0.38; }
            50% { opacity: 0.65; }
          }
          @keyframes ai-pulse-h {
            from { offset-distance: 0%; opacity: 0; }
            8%, 90% { opacity: 1; }
            to { offset-distance: 100%; opacity: 0; }
          }
          @keyframes ai-pulse-v {
            from { offset-distance: 0%; opacity: 0; }
            10%, 92% { opacity: 1; }
            to { offset-distance: 100%; opacity: 0; }
          }
          .ai-grid-line {
            animation: ai-line-idle 2.5s ease-in-out infinite;
          }
          .ai-chip {
            transform-box: fill-box;
            transform-origin: center;
            animation: ai-chip-pulse 2.5s ease-in-out infinite;
          }
          .ai-pulse-1, .ai-pulse-2, .ai-pulse-3, .ai-pulse-4, .ai-pulse-5, .ai-pulse-6 {
            offset-rotate: 0deg;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            filter: drop-shadow(0 0 3px rgba(255,85,0,0.85));
          }
          .ai-pulse-1 { offset-path: path('M10 60 L48 60'); animation: ai-pulse-h 2.5s infinite; animation-delay: 0s; }
          .ai-pulse-2 { offset-path: path('M110 60 L72 60'); animation: ai-pulse-h 2.5s infinite; animation-delay: 0.35s; }
          .ai-pulse-3 { offset-path: path('M60 10 L60 48'); animation: ai-pulse-v 2.5s infinite; animation-delay: 0.15s; }
          .ai-pulse-4 { offset-path: path('M60 110 L60 72'); animation: ai-pulse-v 2.5s infinite; animation-delay: 0.55s; }
          .ai-pulse-5 { offset-path: path('M20 30 L48 48'); animation: ai-pulse-h 2.5s infinite; animation-delay: 0.2s; }
          .ai-pulse-6 { offset-path: path('M100 90 L72 72'); animation: ai-pulse-h 2.5s infinite; animation-delay: 0.65s; }
        `}
      </style>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <rect x="14" y="14" width="92" height="92" rx="10" fill="rgba(255,255,255,0.02)" />
        <g stroke="#d4d4d8" strokeOpacity="0.32" strokeWidth="1">
          <path className="ai-grid-line" d="M24 24H96M24 42H96M24 60H96M24 78H96M24 96H96" />
          <path className="ai-grid-line" d="M24 24V96M42 24V96M60 24V96M78 24V96M96 24V96" />
        </g>
        <rect className="ai-chip" x="48" y="48" width="24" height="24" rx="4" fill="rgba(255,85,0,0.2)" stroke="#FF5500" strokeWidth="1.6" />
        <rect x="53" y="53" width="14" height="14" rx="2.5" fill="rgba(255,85,0,0.5)" stroke="#ffd7c2" strokeOpacity="0.9" strokeWidth="1" />
        <circle className="ai-pulse-1" r="2.4" fill="#FF5500" />
        <circle className="ai-pulse-2" r="2.2" fill="#FF5500" />
        <circle className="ai-pulse-3" r="2.2" fill="#FF5500" />
        <circle className="ai-pulse-4" r="2.3" fill="#FF5500" />
        <circle className="ai-pulse-5" r="1.9" fill="#FF5500" />
        <circle className="ai-pulse-6" r="1.9" fill="#FF5500" />
      </svg>
    </div>
  );
}

function ChatWorkflowIcon() {
  return (
    <div className="relative mx-auto h-[120px] w-[270px] max-w-full overflow-hidden" aria-hidden>
      <style>
        {`
          @keyframes chat4-dot-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2.5px); }
          }
          @keyframes chat4-b1-dots-vis {
            0%, 15.98% { opacity: 1; }
            16%, 100% { opacity: 0; }
          }
          @keyframes chat4-b1-body {
            0%, 16% { opacity: 0; transform: translateY(4px); }
            22%, 95.98% { opacity: 1; transform: translateY(0); }
            96%, 100% { opacity: 0; transform: translateY(0); }
          }
          @keyframes chat4-b2-dots-vis {
            0%, 31.98% { opacity: 0; }
            32%, 47.98% { opacity: 1; }
            48%, 100% { opacity: 0; }
          }
          @keyframes chat4-b2-body {
            0%, 48% { opacity: 0; transform: translateY(4px); }
            54%, 95.98% { opacity: 1; transform: translateY(0); }
            96%, 100% { opacity: 0; transform: translateY(0); }
          }
          @keyframes chat4-b3-dots-vis {
            0%, 63.98% { opacity: 0; }
            64%, 79.98% { opacity: 1; }
            80%, 100% { opacity: 0; }
          }
          @keyframes chat4-b3-body {
            0%, 80% { opacity: 0; transform: translateY(4px); }
            86%, 95.98% { opacity: 1; transform: translateY(0); }
            96%, 100% { opacity: 0; transform: translateY(0); }
          }
          @keyframes bar4-hook-w {
            0%, 16% { width: 0; }
            24%, 95.98% { width: 42px; }
            96%, 100% { width: 0; }
          }
          @keyframes bar4-pacing-w {
            0%, 48% { width: 0; }
            56%, 95.98% { width: 46px; }
            96%, 100% { width: 0; }
          }
          @keyframes bar4-audio-w {
            0%, 80% { width: 0; fill: #FF5500; }
            88%, 95.98% { width: 30px; fill: #FFA500; }
            96%, 100% { width: 0; fill: #FF5500; }
          }
          @keyframes bar4-hook-score {
            0%, 23.98% { transform: translateX(0); opacity: 0; }
            24%, 95.98% { transform: translateX(42px); opacity: 1; }
            96%, 100% { transform: translateX(0); opacity: 0; }
          }
          @keyframes bar4-pacing-score {
            0%, 55.98% { transform: translateX(0); opacity: 0; }
            56%, 95.98% { transform: translateX(46px); opacity: 1; }
            96%, 100% { transform: translateX(0); opacity: 0; }
          }
          @keyframes bar4-audio-score {
            0%, 87.98% { transform: translateX(0); opacity: 0; }
            88%, 95.98% { transform: translateX(30px); opacity: 1; }
            96%, 100% { transform: translateX(0); opacity: 0; }
          }
          .chat4-type-dot {
            transform-box: fill-box;
            transform-origin: center bottom;
            animation: chat4-dot-bounce 0.45s ease-in-out infinite;
          }
          .chat4-type-dot-1 { animation-delay: 0s; }
          .chat4-type-dot-2 { animation-delay: 0.15s; }
          .chat4-type-dot-3 { animation-delay: 0.3s; }
          .chat4-b1-dots-wrap {
            animation: chat4-b1-dots-vis 5s linear infinite;
          }
          .chat4-b1-body-wrap {
            transform-box: fill-box;
            transform-origin: center top;
            animation: chat4-b1-body 5s ease-out infinite;
          }
          .chat4-b2-dots-wrap {
            animation: chat4-b2-dots-vis 5s linear infinite;
          }
          .chat4-b2-body-wrap {
            transform-box: fill-box;
            transform-origin: center top;
            animation: chat4-b2-body 5s ease-out infinite;
          }
          .chat4-b3-dots-wrap {
            animation: chat4-b3-dots-vis 5s linear infinite;
          }
          .chat4-b3-body-wrap {
            transform-box: fill-box;
            transform-origin: center top;
            animation: chat4-b3-body 5s ease-out infinite;
          }
          .bar4-hook-fill {
            animation: bar4-hook-w 5s ease-out infinite;
          }
          .bar4-pacing-fill {
            animation: bar4-pacing-w 5s ease-out infinite;
          }
          .bar4-audio-fill {
            animation: bar4-audio-w 5s ease-out infinite;
          }
          .bar4-hook-score {
            transform-box: fill-box;
            transform-origin: left center;
            animation: bar4-hook-score 5s ease-out infinite;
          }
          .bar4-pacing-score {
            transform-box: fill-box;
            transform-origin: left center;
            animation: bar4-pacing-score 5s ease-out infinite;
          }
          .bar4-audio-score {
            transform-box: fill-box;
            transform-origin: left center;
            animation: bar4-audio-score 5s ease-out infinite;
          }
        `}
      </style>
      <svg width="270" height="120" viewBox="0 0 200 120" className="block h-full w-full max-w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="chat4-left-clip">
            <rect x="0" y="0" width="93" height="120" />
          </clipPath>
          <clipPath id="chat4-right-clip">
            <rect x="107" y="0" width="93" height="120" />
          </clipPath>
          <filter id="chat4-bar-glow" x="-35%" y="-80%" width="170%" height="220%">
            <feGaussianBlur stdDeviation="1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g clipPath="url(#chat4-left-clip)">
          <rect
            x="4"
            y="4"
            width="88"
            height="112"
            rx="6"
            fill="#1a1a2e"
            stroke="rgba(212,212,216,0.3)"
            strokeWidth="1"
          />
          <circle cx="16" cy="18" r="7" fill="#FF5500" />
          <text x="16" y="18" textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="700" fill="#ffffff">
            AI
          </text>

          <g className="chat4-b1-dots-wrap">
            <circle className="chat4-type-dot chat4-type-dot-1" cx="36" cy="37" r="1.8" fill="#d4d4d8" />
            <circle className="chat4-type-dot chat4-type-dot-2" cx="44" cy="37" r="1.8" fill="#d4d4d8" />
            <circle className="chat4-type-dot chat4-type-dot-3" cx="52" cy="37" r="1.8" fill="#d4d4d8" />
          </g>
          <g className="chat4-b1-body-wrap">
            <rect x="26" y="30" width="58" height="14" rx="3" fill="#252540" />
            <text
              x="28"
              y="37"
              dominantBaseline="middle"
              fontSize="5.5"
              fill="#ffffff"
              fontWeight="600"
              textLength="54"
              lengthAdjust="spacingAndGlyphs"
            >
              Hook too slow — cut 1.2s ✂
            </text>
          </g>

          <g className="chat4-b2-dots-wrap">
            <circle className="chat4-type-dot chat4-type-dot-1" cx="36" cy="65" r="1.8" fill="#d4d4d8" />
            <circle className="chat4-type-dot chat4-type-dot-2" cx="44" cy="65" r="1.8" fill="#d4d4d8" />
            <circle className="chat4-type-dot chat4-type-dot-3" cx="52" cy="65" r="1.8" fill="#d4d4d8" />
          </g>
          <g className="chat4-b2-body-wrap">
            <rect x="26" y="58" width="58" height="14" rx="3" fill="#252540" />
            <text
              x="28"
              y="65"
              dominantBaseline="middle"
              fontSize="5.5"
              fill="#ffffff"
              fontWeight="600"
              textLength="54"
              lengthAdjust="spacingAndGlyphs"
            >
              Pacing strong after 0:04 🔥
            </text>
          </g>

          <g className="chat4-b3-dots-wrap">
            <circle className="chat4-type-dot chat4-type-dot-1" cx="36" cy="91" r="1.8" fill="#d4d4d8" />
            <circle className="chat4-type-dot chat4-type-dot-2" cx="44" cy="91" r="1.8" fill="#d4d4d8" />
            <circle className="chat4-type-dot chat4-type-dot-3" cx="52" cy="91" r="1.8" fill="#d4d4d8" />
          </g>
          <g className="chat4-b3-body-wrap">
            <rect x="26" y="84" width="58" height="14" rx="3" fill="#252540" />
            <text
              x="28"
              y="91"
              dominantBaseline="middle"
              fontSize="5.5"
              fill="#ffffff"
              fontWeight="600"
              textLength="54"
              lengthAdjust="spacingAndGlyphs"
            >
              Audio inconsistent ⚠
            </text>
          </g>
        </g>

        <g clipPath="url(#chat4-right-clip)">
          <text x="109" y="18" dy="4" dominantBaseline="middle" fontSize="6.5" fill="#ffffff" fontWeight="600">
            Hook
          </text>
          <rect x="135" y="18" width="52" height="8" rx="4" fill="#2a2a3a" />
          <rect
            className="bar4-hook-fill"
            x="135"
            y="18"
            width="0"
            height="8"
            rx="4"
            fill="#FF5500"
            filter="url(#chat4-bar-glow)"
          />
          <text className="bar4-hook-score" x="138" y="22" dominantBaseline="middle" fontSize="6" fill="#ffffff" fontWeight="700">
            88
          </text>

          <text x="109" y="42" dy="4" dominantBaseline="middle" fontSize="6.5" fill="#ffffff" fontWeight="600">
            Pacing
          </text>
          <rect x="135" y="42" width="52" height="8" rx="4" fill="#2a2a3a" />
          <rect
            className="bar4-pacing-fill"
            x="135"
            y="42"
            width="0"
            height="8"
            rx="4"
            fill="#FF5500"
            filter="url(#chat4-bar-glow)"
          />
          <text className="bar4-pacing-score" x="138" y="46" dominantBaseline="middle" fontSize="6" fill="#ffffff" fontWeight="700">
            94
          </text>

          <text x="109" y="66" dy="4" dominantBaseline="middle" fontSize="6.5" fill="#ffffff" fontWeight="600">
            Audio
          </text>
          <rect x="135" y="66" width="52" height="8" rx="4" fill="#2a2a3a" />
          <rect
            className="bar4-audio-fill"
            x="135"
            y="66"
            width="0"
            height="8"
            rx="4"
            fill="#FF5500"
            filter="url(#chat4-bar-glow)"
          />
          <text className="bar4-audio-score" x="138" y="70" dominantBaseline="middle" fontSize="6" fill="#ffffff" fontWeight="700">
            61
          </text>

          <text x="109" y="90" dy="4" dominantBaseline="middle" fontSize="6.5" fill="#ffffff" fontWeight="600" opacity="0.35">
            Caption
          </text>
          <rect x="135" y="90" width="52" height="8" rx="4" fill="#2a2a3a" />
        </g>

        <line
          x1="101"
          y1="5"
          x2="101"
          y2="115"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    </div>
  );
}

function WorkflowIcon({ step }: { step: number }) {
  if (step === 1) return <UploadWorkflowIcon />;
  if (step === 2) return <FeaturesWorkflowIcon />;
  if (step === 3) return <AiWorkflowIcon />;
  return <ChatWorkflowIcon />;
}

function connectorOpacity(fromStepIndex: number, activeStep: number): number {
  if (activeStep === fromStepIndex) return 1;
  if (activeStep === fromStepIndex + 1) return 0.55;
  return 0.35;
}

function MarchingDashHorizontal({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn('h-0.5 rounded-full dashboard-dash-march-h', className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, #f97316 0px, #f97316 6px, transparent 6px, transparent 12px)',
        backgroundSize: '24px 2px',
        ...style,
      }}
    />
  );
}

function Dashboard() {
  const { name } = useUser();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [feedbackReadyCount, setFeedbackReadyCount] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [workflowUnderline, setWorkflowUnderline] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const list = await getUserVideos();
      setVideoCount(list.length);
      setFeedbackReadyCount(
        list.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED).length
      );
    } catch {
      setVideoCount(0);
      setFeedbackReadyCount(0);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (visibleCount >= steps.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), visibleCount * STEP_DELAY_MS);
    return () => clearTimeout(t);
  }, [visibleCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, GLOW_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWorkflowUnderline(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const displayName = (name || 'USER').toUpperCase();

  const opA = connectorOpacity(0, activeStep);
  const opC = connectorOpacity(2, activeStep);

  return (
    <>
      <style>
        {`
          @keyframes dashboard-dash-march-h {
            from { background-position: 0 0; }
            to { background-position: 24px 0; }
          }
          .dashboard-dash-march-h {
            animation: dashboard-dash-march-h 600ms linear infinite;
          }
        `}
      </style>
      <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
        <div className="relative max-w-6xl mx-auto pb-24 sm:pb-10">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[min(60vh,480px)] w-full max-w-2xl -translate-x-1/2 rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, rgba(255, 80, 120, 0.45) 0%, transparent 65%)',
            }}
          />

          <section className="relative text-center mb-12">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-white mb-3"
              style={{ fontFamily: 'Impact, Anton, "Arial Black", sans-serif' }}
            >
              Hello {displayName}
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-6">
              Here&apos;s how to get started with Vireact
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400/90">
              <span
                className="relative flex h-2.5 w-2.5"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              AI Engine Ready
            </div>
          </section>

          <div className="relative mb-10 mt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1">
              Your workflow
            </p>
            <div
              className="mx-auto h-0.5 max-w-md rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-pink-500 transition-[width] duration-[600ms] ease-out"
              style={{ width: workflowUnderline ? '100%' : '0%' }}
            />
          </div>

          <div className="relative mb-12">
            <div className="relative grid grid-cols-1 md:grid-cols-2 md:items-stretch gap-5 md:gap-6 md:min-h-0">
              {/* Connector A: card 0 → card 1 */}
              <div
                className="hidden md:flex absolute left-1/2 top-[calc(25%-0.625rem)] z-10 -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 pointer-events-none transition-opacity duration-400 ease-in-out"
                style={{ opacity: opA }}
                aria-hidden
              >
                <MarchingDashHorizontal className="w-5" />
                <span className="text-[#f97316] text-[10px] leading-none select-none" aria-hidden>
                  ▶
                </span>
              </div>

              {/* Connector C: bottom row card 3 → card 4 */}
              <div
                className="hidden md:flex absolute left-1/2 top-[calc(75%-0.625rem)] z-10 -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 pointer-events-none transition-opacity duration-400 ease-in-out"
                style={{ opacity: opC }}
                aria-hidden
              >
                <MarchingDashHorizontal className="w-5" />
                <span className="text-[#f97316] text-[10px] leading-none select-none" aria-hidden>
                  ▶
                </span>
              </div>

              {steps.map((s, index) => {
                const isVisible = index < visibleCount;
                const isActive = activeStep === index;

                const CardInner = (
                  <div
                    className={cn(
                      'relative h-full min-h-full rounded-2xl border backdrop-blur-sm p-6 md:p-7 pb-6 md:pb-8 transition-all duration-400 ease-in-out',
                      isActive
                        ? 'border-orange-500 bg-white/[0.04] shadow-[0_0_20px_rgba(249,115,22,0.35),0_0_40px_rgba(249,115,22,0.15)]'
                        : 'border-white/5 bg-gray-900/70 shadow-none',
                      'hover:border-pink-500/20 hover:shadow-[0_0_0_1px_rgba(236,72,153,0.12)]',
                      s.navigable && 'cursor-pointer',
                      !s.navigable && 'cursor-default'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition-transform duration-400 ease-in-out',
                        isActive && 'scale-110'
                      )}
                      style={{
                        background: 'linear-gradient(135deg, #FF1B6B 0%, #FF6B35 100%)',
                        boxShadow: isActive
                          ? '0 0 16px rgba(255, 107, 53, 0.55)'
                          : '0 0 12px rgba(255, 27, 107, 0.25)',
                      }}
                    >
                      {s.step}
                    </div>
                    <div className="flex h-full min-h-0 flex-col items-center text-center pt-9">
                      <div
                        className={cn(
                          'mb-4 transition-all duration-400 ease-in-out',
                          isActive
                            ? 'opacity-100 drop-shadow-[0_0_10px_rgba(249,115,22,0.45)]'
                            : 'opacity-70'
                        )}
                      >
                        <WorkflowIcon step={s.step} />
                      </div>
                      <h2
                        className={cn(
                          'mb-2 text-lg font-bold transition-colors duration-400 ease-in-out md:text-xl',
                          isActive ? 'text-white' : 'text-gray-300'
                        )}
                      >
                        {s.title}
                      </h2>
                      <p className="max-w-xs text-sm leading-relaxed text-gray-400">{s.description}</p>
                      <div className="mt-2 w-full max-w-xs border-t border-white/5 pt-2">
                        <p className="text-xs tracking-wide text-gray-500">{s.benefit}</p>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div
                    key={s.step}
                    className={cn(
                      'flex min-h-0 transition-all duration-500 ease-out md:h-full',
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    )}
                  >
                    {s.navigable && s.href ? (
                      <button
                        type="button"
                        onClick={() => navigate(s.href!)}
                        className="h-full w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
                      >
                        {CardInner}
                      </button>
                    ) : (
                      <div className="h-full w-full">{CardInner}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900/60 px-4 py-2 text-xs font-medium text-gray-300">
              <Video className="h-4 w-4 text-orange-400" strokeWidth={1.5} />
              {videoCount} Video{videoCount === 1 ? '' : 's'} Analyzed
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900/60 px-4 py-2 text-xs font-medium text-gray-300">
              <Activity className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
              AI Engine: Online
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900/60 px-4 py-2 text-xs font-medium text-gray-300">
              <MessageSquare className="h-4 w-4 text-pink-400" strokeWidth={1.5} />
              Feedback Ready ({feedbackReadyCount})
            </div>
          </div>
        </div>
      </UserPage>
    </>
  );
}

export default Dashboard;
