'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Download, Save, Check } from 'lucide-react'

// Données des étapes (7 stages)
const STAGES = [
  {
    key: 'bienvenue',
    title: 'Bienvenue & Confirmation',
    criterias: [
      'Accueil personnalisé',
      'Présentation',
      'Pertinence du produit confirmée',
      'Gestion de l’objection "occupé"',
    ],
  },
  {
    key: 'objections-initiales',
    title: 'Objections Initiales',
    criterias: [
      'Réponse à « je n’ai pas commandé / je regarde seulement »',
      'Explication du processus',
      'Ton amical maintenu',
    ],
  },
  {
    key: 'besoins',
    title: 'Identification des Besoins',
    criterias: [
      'Questions sur la fréquence/type de douleur',
      'Enflure/localisation',
      'Âge',
      'Résumé du problème',
      'Accord du client',
    ],
  },
  {
    key: 'produit',
    title: 'Présentation du Produit',
    criterias: [
      'Explication étape par étape',
      'Ingrédients naturels',
      'Soulagement + bénéfices long terme',
      'Lien avec besoins',
    ],
  },
  {
    key: 'cures',
    title: 'Préparation des Cures',
    criterias: [
      'Importance de la cure complète',
      'Différencier essai / basique / complet',
      'Recommandation adaptée',
      'Présenté comme solution long terme',
    ],
  },
  {
    key: 'prix-objections',
    title: 'Prix & Gestion des Objections',
    criterias: [
      'Réponse à « trop cher »',
      'Réponse à « 1 seul paquet »',
      'Réassurance',
      'Urgence avec promotions',
    ],
  },
  {
    key: 'finalisation',
    title: 'Finalisation de la Vente',
    criterias: [
      'Récapitulatif de commande',
      'Prix total confirmé',
      'Détails de livraison collectés',
      'Méthode de paiement confirmée',
      'Délai communiqué',
      'Satisfaction renforcée',
    ],
  },
]

// Petits composants UI (style shadcn-like) en un seul fichier
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-800 ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
}

function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg sm:text-xl font-semibold ${className}`}>{children}</h3>
}

function CardContent({ children, className = '' }) {
  return <div className={`p-4 sm:p-6 pt-0 ${className}`}>{children}</div>
}

function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center gap-2 justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-black text-white hover:bg-black/90 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-white/90',
    outline: 'border border-gray-300 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800',
    ghost: 'hover:bg-gray-100 dark:hover:bg-neutral-800',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

function Checkbox({ checked, onChange, id }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-3 cursor-pointer select-none">
      <span className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-black border-black dark:bg-white dark:border-white' : 'bg-white border-gray-300 dark:bg-neutral-900 dark:border-neutral-700'}`}>
        {checked && <Check className="h-4 w-4 text-white dark:text-black" />}
      </span>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
    </label>
  )
}

function Select({ value, onChange, options, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-900 dark:border-neutral-700"
    >
      <option value="">— Sélectionner —</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-900 dark:border-neutral-700"
    />
  )
}

function Divider() {
  return <div className="h-px bg-gray-200 dark:bg-neutral-800" />
}

function StageCard({ idx, stage, state, onToggleOpen, onToggleCheck, onScoreChange, onCommentChange }) {
  const totalChecks = stage.criterias.length
  const completedChecks = state.checks.filter(Boolean).length

  return (
    <Card className="mb-4">
      <CardHeader>
        <button
          onClick={onToggleOpen}
          className="w-full flex items-start justify-between gap-4 text-left"
        >
          <div>
            <CardTitle>{idx + 1}. {stage.title}</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Checklist: {completedChecks}/{totalChecks} · Score: {state.score || '—'}/5
            </p>
          </div>
          <div className="shrink-0">
            {state.open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </button>
      </CardHeader>
      <AnimatePresence initial={false}>
        {state.open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium">Liste de vérification</p>
                <ul className="space-y-3">
                  {stage.criterias.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Checkbox
                        id={`${stage.key}-c-${i}`}
                        checked={state.checks[i]}
                        onChange={(val) => onToggleCheck(i, val)}
                      />
                      <label htmlFor={`${stage.key}-c-${i}`} className="text-sm leading-6">
                        {c}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <Divider />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label htmlFor={`${stage.key}-score`} className="text-sm font-medium">Score</label>
                <Select
                  id={`${stage.key}-score`}
                  value={state.score}
                  onChange={(v) => onScoreChange(v)}
                  options={[1,2,3,4,5].map((n) => ({ value: String(n), label: String(n) }))}
                />
                <span className="text-sm text-gray-500">(1 = faible, 5 = excellent)</span>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Commentaires</p>
                <Textarea
                  value={state.comments}
                  onChange={onCommentChange}
                  placeholder="Ajoutez des observations, points forts et axes d’amélioration..."
                />
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default function App() {
  const [stages, setStages] = useState(() => STAGES.map((s, i) => ({
    key: s.key,
    open: i === 0, // première section ouverte
    checks: Array.from({ length: s.criterias.length }, () => false),
    score: '',
    comments: '',
  })))

  // Charger un brouillon sauvegardé
  useEffect(() => {
    const raw = localStorage.getItem('audit-evaluation')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === STAGES.length) {
          setStages(parsed)
        }
      } catch {}
    }
  }, [])

  const totals = useMemo(() => {
    const totalChecks = STAGES.reduce((acc, s) => acc + s.criterias.length, 0)
    const completedChecks = stages.reduce((acc, st, idx) => acc + st.checks.filter(Boolean).length, 0)
    const totalScore = stages.reduce((acc, st) => acc + (Number(st.score) || 0), 0)
    return { totalChecks, completedChecks, remainingChecks: totalChecks - completedChecks, totalScore, maxScore: STAGES.length * 5 }
  }, [stages])

  const updateStage = (idx, updater) => {
    setStages((prev) => prev.map((s, i) => (i === idx ? updater(s) : s)))
  }

  const handleExport = () => {
    const payload = {
      meta: {
        creeLe: new Date().toISOString(),
        application: 'Table d’Évaluation de Script',
      },
      stages: stages.map((st, i) => ({
        etape: i + 1,
        cle: STAGES[i].key,
        titre: STAGES[i].title,
        checklist: STAGES[i].criterias.map((libelle, idx) => ({ libelle, coche: st.checks[idx] })),
        score: Number(st.score) || 0,
        commentaires: st.comments,
      })),
      resume: {
        scoreTotal: totals.totalScore,
        scoreMax: totals.maxScore,
        checklist: { complete: totals.completedChecks, total: totals.totalChecks, restant: totals.remainingChecks },
      },
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-evaluation-${new Date().toISOString().slice(0,19).replaceAll(':','-')}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    localStorage.setItem('audit-evaluation', JSON.stringify(stages))
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* En-tête */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Table d’Évaluation de Script</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
            Audit d’appels commerciaux · Design minimaliste, fluide et responsive.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <Button onClick={handleSave} className="sm:w-auto w-full">
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
          <Button variant="outline" onClick={handleExport} className="sm:w-auto w-full">
            <Download className="h-4 w-4" /> Exporter en JSON
          </Button>
        </div>

        {/* Étapes */}
        <div>
          {STAGES.map((stage, idx) => (
            <StageCard
              key={stage.key}
              idx={idx}
              stage={stage}
              state={stages[idx]}
              onToggleOpen={() => updateStage(idx, (s) => ({ ...s, open: !s.open }))}
              onToggleCheck={(i, val) => updateStage(idx, (s) => {
                const checks = [...s.checks]
                checks[i] = val
                return { ...s, checks }
              })}
              onScoreChange={(v) => updateStage(idx, (s) => ({ ...s, score: v }))}
              onCommentChange={(v) => updateStage(idx, (s) => ({ ...s, comments: v }))}
            />
          ))}
        </div>

        {/* Résumé */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
              Vue d’ensemble des performances de l’appel.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                <p className="text-sm text-gray-500">Score total</p>
                <p className="mt-1 text-2xl font-semibold">{totals.totalScore} / {totals.maxScore}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                <p className="text-sm text-gray-500">Checklist complétée</p>
                <p className="mt-1 text-2xl font-semibold">{totals.completedChecks} / {totals.totalChecks}</p>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white"
                    style={{ width: `${(totals.completedChecks / Math.max(1, totals.totalChecks)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                <p className="text-sm text-gray-500">Items restants</p>
                <p className="mt-1 text-2xl font-semibold">{totals.remainingChecks}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button onClick={handleSave} className="sm:w-auto w-full">
                <Save className="h-4 w-4" /> Enregistrer
              </Button>
              <Button variant="outline" onClick={handleExport} className="sm:w-auto w-full">
                <Download className="h-4 w-4" /> Exporter en JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-neutral-500">
          Texte en français uniquement · Interface inspirée de shadcn/ui · Animations par framer-motion.
        </p>
      </div>
    </div>
  )
}
