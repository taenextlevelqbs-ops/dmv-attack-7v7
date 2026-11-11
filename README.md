# DMV Attack — Athlete & Team Operations Platform

A web platform for the DMV Attack youth and high-school 7v7 football organization.

**Live site:** https://www.dmvattack.com/

## Product overview
The application supports a public-facing organization website alongside operational workflows for tryout registration, athlete and family information, team selection, and payments. It is designed to reduce manual administration for coaches and organizers.

## Engineering highlights
- Next.js web application with responsive interfaces.
- Tryout registration and administrative check-in workflows.
- Athlete profiles, family relationships, roster and acceptance workflows.
- Stripe-based payment experiences and reconciliation-oriented operational tooling.
- Role-based administrator and coach workflows, with attention to database authorization and production controls.

## What this demonstrates
Full-stack product development, workflow design, payment integration, and translating the needs of a real sports organization into an operational application.

## Local development
See `package.json` for supported scripts. Typically:

```bash
npm ci
npm run dev
```

Provider integrations require separately configured environment variables. Do not commit credentials, athlete records, or other personal information.

> **Privacy:** This repository is source code, not a place to store real athlete, family, or payment data. Do not use production customer data in demos or tests.

## Portfolio
Built and maintained as part of a broader collection of business, sports, and infrastructure projects. See the [engineering portfolio](https://github.com/taenextlevelqbs-ops/crestlane-digital/blob/main/docs/engineering-portfolio.md).
