// Curated wallet docs (ClickUp, in-repo design docs). Edit by hand.
import type { CodeRepo, ReferenceGroup } from '../types'

export const WALLET_TXN_FLOW_DRAWIO_URL =
  'https://app.diagrams.net/#G1OEb5ruNnPjdOcjFWK1O49cXGagXSC1Fk'

export const REFERENCE_GROUPS: ReferenceGroup[] = [
  {
    name: 'Start here',
    docs: [
      {
        title: 'Wallet & Transaction System – Executive Summary',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-449456'
      },
      {
        title: 'Blade KT',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-449436'
      },
      {
        title: 'Billing KT',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-449796'
      },
      {
        title: 'Wallet Related Resources',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-373076'
      },
      {
        title: 'Wallet Master SOP',
        where: 'ClickUp · Support SOPs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-139056/87cpx-826256'
      },
      {
        title: 'Wallets & Transactions (QA)',
        where: 'ClickUp · QA Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-192416/87cpx-292316'
      }
    ]
  },
  {
    name: 'Recharge & payments',
    docs: [
      {
        title: 'Auto-Recharge System',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-579236'
      },
      {
        title: 'Wallet Recharge Failure Handling',
        where: 'ClickUp · Testing Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-706876/87cpx-701696'
      },
      {
        title: 'Wallet recharge reconciliation',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-327636'
      },
      {
        title: 'Wallet Reconciliation Reporting via Stripe',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-394516'
      },
      {
        title: 'Resolve Stripe-Wallet Recharge Discrepancies',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-413976/87cpx-481336'
      },
      {
        title: 'ACH Payments for Agency Wallet Recharges',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-413976/87cpx-479616'
      },
      {
        title: 'Wallet Recharge via Reselling (Dev testing)',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-460776'
      },
      {
        title: 'Requirements from Reselling Team for wallet recharge product',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-443256'
      },
      {
        title: 'POC Automated Recharge as Stripe Product with Taxes',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-442336'
      }
    ]
  },
  {
    name: 'Charges, usage & balance',
    docs: [
      {
        title: 'Processing rebilling messages from Pub/Sub and wallet debit',
        where: 'ClickUp · Revex SaaS',
        url: 'https://app.clickup.com/8631005/docs/87cpx-1180/87cpx-424'
      },
      {
        title: 'Usage Limit Feature – Access Control & Wallet Flow',
        where: 'ClickUp · Blade Tech Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-381156/87cpx-605136'
      },
      {
        title: 'HasFunds API Test Case',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-281956'
      },
      {
        title: 'Product Billing Prerequisites',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-511736'
      },
      {
        title: 'Minimize Negative Wallet Balance Risk',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-413976/87cpx-480176'
      },
      {
        title: 'Negative Wallet Balance Alert & Mitigation',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-413976/87cpx-481176'
      },
      {
        title: 'Wallet Usage Notification V2',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-449856'
      },
      {
        title: 'Wallet Transaction Anomaly Detection & Notification',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-271536/87cpx-477976'
      },
      {
        title: 'Stamp Implementation Expert id on wallet charges',
        where: 'ClickUp · Blade Platform',
        url: 'https://app.clickup.com/8631005/docs/87cpx-814856/87cpx-802076'
      }
    ]
  },
  {
    name: 'Refunds, subscriptions & cleanup',
    docs: [
      {
        title: 'Automated Wallet Refunds from Support Portal',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-385616'
      },
      {
        title: 'Automated Wallet Refunds (Flow 2)',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-401276'
      },
      {
        title: 'Wallet Subscription',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-448236'
      },
      {
        title: 'Wallet Cleanup',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-358696'
      },
      {
        title: 'Wallet Cleanup for Positive and Negative Balances',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-271536/87cpx-372576'
      },
      {
        title: 'Reconcile Opening and Closing Wallet Balance',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-271536/87cpx-372636'
      }
    ]
  },
  {
    name: 'Tax, invoices & receipts',
    docs: [
      {
        title: 'Collect Taxes on Agency Wallet Usage',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-413976/87cpx-481316'
      },
      {
        title: 'Global Tax Compliance [Architecture Overview]',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-521036'
      },
      {
        title: 'Enhanced Tax Computation with Retry',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-396016'
      },
      {
        title: 'Historical Wallet Usage Receipts/Invoices',
        where: 'ClickUp · Blade Platform',
        url: 'https://app.clickup.com/8631005/docs/87cpx-475836/87cpx-525056'
      },
      {
        title: 'Revex – Invoice generation',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-282816'
      }
    ]
  },
  {
    name: 'Data, ledger & analytics',
    docs: [
      {
        title: 'Ledger · TigerBeetle · CDC alerts',
        where: 'ClickUp · Blade PRDs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-857816/87cpx-831256'
      },
      {
        title: 'MongoDB StreamChange Watcher Workers',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-213016'
      },
      {
        title: 'Deduplicate company_wallet_transactions MV',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-373176'
      },
      {
        title: 'SaaS (Wallet) – Product Data Onboarding',
        where: 'ClickUp · Data Engineering',
        url: 'https://app.clickup.com/8631005/docs/87cpx-180416/87cpx-374856'
      },
      {
        title: 'Monthly Wallet Audit Data ETL',
        where: 'ClickUp · RevOps BI',
        url: 'https://app.clickup.com/8631005/docs/87cpx-511236/87cpx-618656'
      },
      {
        title: 'Wallet Audit Data Process',
        where: 'ClickUp · RevOps BI',
        url: 'https://app.clickup.com/8631005/docs/87cpx-520156/87cpx-567136'
      },
      {
        title: 'fact_wallet_transaction_consumer_audit',
        where: 'ClickUp · A.RO Data',
        url: 'https://app.clickup.com/8631005/docs/87cpx-722336/87cpx-713116'
      },
      {
        title: 'customer_wallet_balance_activity (Tableau)',
        where: 'ClickUp · A.RO Data',
        url: 'https://app.clickup.com/8631005/docs/87cpx-722336/87cpx-736136'
      },
      {
        title: 'January 2026 Monthly Wallet Audit Data Issue',
        where: 'ClickUp · RevOps KB',
        url: 'https://app.clickup.com/8631005/docs/87cpx-615856/87cpx-623456'
      }
    ]
  },
  {
    name: 'UI & APIs',
    docs: [
      {
        title: 'Wallet UI Revamp — Company & Location Wallet',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-733676'
      },
      {
        title: 'Wallet UI Revamp – API doc v2',
        where: 'ClickUp',
        url: 'https://app.clickup.com/8631005/docs/87cpx-720016/87cpx-709476'
      },
      {
        title: 'API List',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-420936'
      },
      {
        title: 'Transaction Summary',
        where: 'ClickUp · Dev Docs',
        url: 'https://app.clickup.com/8631005/docs/87cpx-124667/87cpx-188727'
      }
    ]
  },
  {
    name: 'In-repo design docs',
    docs: [
      {
        title: 'Flow Tracker – Wallet Flow Inventory',
        where: 'ghl-revex-backend · .aw_docs',
        url: 'https://github.com/GoHighLevel/ghl-revex-backend/tree/master/.aw_docs/features/flow-tracker'
      },
      {
        title: 'Wallet observability dashboard',
        where: 'ghl-revex-backend · .aw_docs',
        url: 'https://github.com/GoHighLevel/ghl-revex-backend/tree/master/.aw_docs/features/wallet-observability-dashboard'
      },
      {
        title: 'Stripe ↔ wallet reconciliation',
        where: 'ghl-revex-backend · .aw_docs',
        url: 'https://github.com/GoHighLevel/ghl-revex-backend/tree/master/.aw_docs/features/stripe-wallet-reconciliation'
      },
      {
        title: 'Dev ledger (TigerBeetle)',
        where: 'ghl-revex-backend · .aw_docs',
        url: 'https://github.com/GoHighLevel/ghl-revex-backend/tree/master/.aw_docs/features/dev-ledger'
      }
    ]
  }
]

export const CODE_REPOS: CodeRepo[] = [
  {
    name: 'ghl-revex-backend',
    url: 'https://github.com/GoHighLevel/ghl-revex-backend',
    stack: 'NestJS monorepo · TypeScript',
    role: 'Primary home of the wallet. Billing API, Blade platform (wallets, recharge, settlement, tax), gatekeeper, subscriptions, Stripe webhooks and the TigerBeetle ledger.',
    parts: [
      {
        path: 'apps/billing',
        note: 'Bill / charge API, has-funds, rebilling & BaaS config workers'
      },
      {
        path: 'apps/blade-platform',
        note: 'Company & location wallets, recharge, settlement, tax, alerts, cleanup, export'
      },
      {
        path: 'apps/revex-wallet-gatekeeper',
        note: 'Usage reservation & bill-retry for metered products'
      },
      {
        path: 'apps/wallet-subscriptions',
        note: 'Recurring wallet subscriptions (renewal, cancel, refund)'
      },
      {
        path: 'apps/stripe-consumer',
        note: 'Stripe webhook ingress → Pub/Sub'
      },
      {
        path: 'apps/ledger',
        note: 'Double-entry ledger postings into TigerBeetle'
      },
      {
        path: 'apps/reselling',
        note: 'Reselling invoice rail into wallet recharge'
      }
    ]
  },
  {
    name: 'saas-service',
    url: 'https://github.com/GoHighLevel/saas-service',
    stack: 'Express · TypeScript',
    role: 'Legacy wallet surface: location wallets, wallet server, recharge worker, ACH settlement and SaaS billing workers.',
    parts: [
      {
        path: 'src/wallet_server.ts',
        note: 'Wallet HTTP server entry'
      },
      {
        path: 'src/recharge_worker.ts',
        note: 'Legacy recharge worker'
      },
      {
        path: 'src/saas_billing_server.ts',
        note: 'SaaS billing server'
      },
      {
        path: 'src/saas_billing_worker.ts',
        note: 'SaaS billing worker'
      },
      {
        path: 'src/saas_billing_charge_worker.ts',
        note: 'SaaS billing charge worker'
      },
      {
        path: 'src/watcher',
        note: 'Mongo change-stream watchers'
      }
    ]
  },
  {
    name: 'ghl-revex-frontend',
    url: 'https://github.com/GoHighLevel/ghl-revex-frontend',
    stack: 'Vue 3 · Rsbuild',
    role: 'Wallet UI for agency and sub-account (Add funds, transactions, auto-recharge settings).',
    parts: [
      {
        path: 'apps/wallet-kit',
        note: 'Wallet micro-frontend'
      }
    ]
  },
  {
    name: 'ghl-liquibase',
    url: 'https://github.com/GoHighLevel/ghl-liquibase',
    stack: 'ClickHouse DDL',
    role: 'ClickHouse tables and materialized views for wallet analytics and ledger.',
    parts: []
  },
  {
    name: 'platform-backend',
    url: 'https://github.com/GoHighLevel/platform-backend',
    stack: 'Kubernetes configs',
    role: 'Production CronJobs that drive settlement, sweeps, recon and other scheduled wallet work.',
    parts: [
      {
        path: 'crons/deployments/production',
        note: 'k8s CronJob YAMLs'
      }
    ]
  },
  {
    name: 'highlevel-employee-portal',
    url: 'https://github.com/GoHighLevel/highlevel-employee-portal',
    stack: 'Support portal',
    role: 'Support tools: wallet refunds, adjustments and the flow-tracker view.',
    parts: []
  },
  {
    name: 'platform-core',
    url: 'https://github.com/GoHighLevel/platform-core',
    stack: 'Shared npm packages · TypeScript',
    role: 'Home of @platform-core/wallet-sdk, the typed client services use to call revex-wallet-gatekeeper.',
    parts: [
      {
        path: 'wallet-sdk',
        note: 'WalletClient, WalletModule (NestJS), error codes, /sdk-config polling'
      }
    ]
  }
]
