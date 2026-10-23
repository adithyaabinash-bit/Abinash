import React from 'react';
import { X, Check, Zap, Sparkles } from 'lucide-react';
import { UserUsage } from '../../types/writing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage: UserUsage;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, usage }) => {
  if (!isOpen) return null;

  const tiers = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      words: '10,000 words/mo',
      features: [
        'Standard Grammar & Spelling',
        'Basic Readability Statistics',
        '3 AI Detections per day',
        'Up to 5 Saved Documents',
      ],
      current: usage.tier === 'free',
      popular: false,
    },
    {
      name: 'Student Scholar',
      price: '$9',
      period: 'per month',
      words: '60,000 words/mo',
      features: [
        'Advanced Grammar, Style & Clarity',
        'Full Plagiarism Checking (15 papers/mo)',
        'Full AI Content Detector & Heatmaps',
        'All Citation Styles (APA, MLA, Chicago)',
        'Up to 50 Saved Documents',
      ],
      current: usage.tier === 'student',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$19',
      period: 'per month',
      words: '150,000 words/mo',
      features: [
        'Unlimited Real-time Grammar Engine',
        'Unlimited AI Content Probabilistic Scans',
        'Deep Plagiarism Corpus Matching',
        'All 7 Paraphrasing Modes & Tone Tuning',
        'Unlimited Version History Snapshots',
        'Priority Gemini 3.8 Flash Neural Pipeline',
      ],
      current: usage.tier === 'pro',
      popular: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[11px] font-semibold mb-1">
              <Zap className="w-3 h-3 text-amber-600" /> Subscription Plans
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Upgrade Writing Intelligence
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`p-5 rounded-xl border flex flex-col justify-between ${
                t.popular
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.name}
                  </span>
                  {t.popular && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t.price}
                  </span>
                  <span className="text-xs text-slate-400">{t.period}</span>
                </div>

                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                  {t.words}
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {t.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={t.current}
                  onClick={onClose}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                    t.current
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : t.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {t.current ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
