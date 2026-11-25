import { describe, expect, it } from 'vitest'
import { CHARGE_TYPE_VIEWS, codeUrl, countByModel, groupByProduct, modelFromTiming, toView } from '../src/kb/chargeModels'
import { ALL_CHARGE_TYPES } from '../src/kb/data/chargeTypes'

describe('billing models', () => {
  it('maps catalogue bill timing to a model', () => {
    expect(modelFromTiming('before')).toBe('bill_first')
    expect(modelFromTiming('after')).toBe('usage_first')
    expect(modelFromTiming('na')).toBe('platform')
    expect(modelFromTiming('unknown')).toBe('unconfirmed')
    expect(modelFromTiming('mixed')).toBe('unconfirmed')
  })

  it('classifies every charge type exactly once', () => {
    const counts = countByModel(CHARGE_TYPE_VIEWS)
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    expect(total).toBe(CHARGE_TYPE_VIEWS.length)
    expect(new Set(CHARGE_TYPE_VIEWS.map((r) => r.chargeType)).size).toBe(CHARGE_TYPE_VIEWS.length)
  })

  it('puts the known examples on the right side', () => {
    const model = (id: string) => CHARGE_TYPE_VIEWS.find((r) => r.chargeType === id)?.model
    expect(model('domainPurchase')).toBe('bill_first')
    expect(model('workflow_premium_actions')).toBe('bill_first')
    expect(model('outbound_sms')).toBe('usage_first')
    expect(model('contentAI')).toBe('usage_first')
    expect(model('Stripe_Payment')).toBe('platform')
  })

  it('groups charge types under their product', () => {
    const groups = groupByProduct(CHARGE_TYPE_VIEWS.filter((r) => r.family === 'Email'))
    expect(groups.map((g) => g.product)).toContain('LC Email')
    expect(groups.find((g) => g.product === 'LC Email')?.items.length).toBeGreaterThanOrEqual(3)
  })

  it('builds GitHub links with the right repo, branch and line', () => {
    const ai = toView(ALL_CHARGE_TYPES.find((r) => r.chargeType === 'contentAI')!)
    expect(codeUrl(ai, 'apps/ai-wrapper/src/services/billingService.ts:100')).toBe(
      'https://github.com/GoHighLevel/ai-backend/blob/master/apps/ai-wrapper/src/services/billingService.ts#L100'
    )
    const domain = toView(ALL_CHARGE_TYPES.find((r) => r.chargeType === 'domainPurchase')!)
    expect(codeUrl(domain, 'apps/domains/src/x.ts')).toContain('/leadgen-backend/blob/main/')
  })
})
