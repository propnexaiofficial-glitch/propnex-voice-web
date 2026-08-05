import { Link } from '@/features/landing/lib/router'
import { plans, planThemes } from '../../data/pricingPlans'
import { CheckIcon, PlanIcon } from './PlanIcons'

export default function PricingPlansGrid({
  interactive = false,
  selectedPlan,
  onSelectPlan,
  linkCtaToSignUp = false,
  cardClassName = '',
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-4">
      {plans.map((plan) => {
        const theme = planThemes[plan.accent]
        const selected = interactive && selectedPlan === plan.id
        const cardState = selected || (!interactive && plan.popular)
          ? theme.selected
          : theme.card

        const inner = (
          <>
            {plan.popular && (
              <span
                className={`absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${theme.badge}`}
              >
                Most Popular
              </span>
            )}

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition duration-300 ${theme.iconWrap}`}
            >
              <PlanIcon type={plan.icon} className={`h-4 w-4 ${theme.icon}`} />
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-white md:text-lg">
              {plan.name}
            </h2>
            <p className="mt-0.5 text-xs text-white/45">{plan.subtitle}</p>

            {plan.context && (
              <p className="mt-4 text-xs text-white/55">{plan.context}</p>
            )}

            <ul
              className={`space-y-2 ${plan.context ? 'mt-2' : 'mt-4'} flex-1`}
            >
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[12px] leading-snug text-white/75 md:text-[13px]"
                >
                  <CheckIcon
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.check}`}
                  />
                  {f}
                </li>
              ))}
            </ul>

            {plan.ctaHref ? (
              <a
                href={plan.ctaHref}
                className={`mt-5 block w-full rounded-full py-2.5 text-center text-[13px] font-semibold transition active:scale-[0.98] ${
                  plan.popular ? theme.btn : theme.btnIdle
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {plan.cta}
              </a>
            ) : linkCtaToSignUp ? (
              <Link
                to="/auth/sign-up"
                className={`mt-5 block w-full rounded-full py-2.5 text-center text-[13px] font-semibold transition active:scale-[0.98] ${
                  plan.popular ? theme.btn : theme.btnIdle
                }`}
              >
                {plan.cta}
              </Link>
            ) : (
              <button
                type="button"
                className={`mt-5 w-full rounded-full py-2.5 text-[13px] font-semibold transition active:scale-[0.98] ${
                  selected || plan.popular ? theme.btn : theme.btnIdle
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPlan?.(plan.id)
                }}
              >
                {plan.cta}
              </button>
            )}
          </>
        )

        if (interactive) {
          return (
            <article
              key={plan.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPlan?.(plan.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectPlan?.(plan.id)
                }
              }}
              className={`group relative flex cursor-pointer flex-col rounded-xl border p-4 transition duration-300 md:p-5 ${cardState} ${cardClassName}`}
            >
              {inner}
            </article>
          )
        }

        return (
          <article
            key={plan.id}
            className={`group relative flex flex-col rounded-xl border p-4 transition duration-300 md:p-5 ${cardState} ${cardClassName}`}
          >
            {inner}
          </article>
        )
      })}
    </div>
  )
}
