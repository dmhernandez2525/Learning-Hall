# Learning Hall - Documentation Index

**Version:** 3.0.0
**Last Updated:** January 2026
**Architecture:** Payload CMS v3 + Next.js 14

---

## Quick Links

| Document | Description |
|----------|-------------|
| [README](../README.md) | Project overview and setup |
| [Architecture](./ARCHITECTURE.md) | System design and patterns |
| [Roadmap](./ROADMAP.md) | Feature phases and timeline |
| [Coding Standards](./CODING_STANDARDS.md) | Code style guidelines |
| [Vision](./VISION.md) | Product vision and goals |
| [Work Status](../roadmap/WORK_STATUS.md) | Current development status |

---

## Software Design Documents

### Phase 1: Foundation

| SDD | Feature | Priority |
|-----|---------|----------|
| [F1.1.1](./sdd/phase-1/F1.1.1-payload-cms-setup.md) | Payload CMS + Next.js Setup | P0 |
| [F1.1.2](./sdd/phase-1/F1.1.2-postgresql-rls.md) | PostgreSQL + RLS | P0 |
| [F1.1.3](./sdd/phase-1/F1.1.3-nextauth-authentication.md) | NextAuth Authentication | P0 |
| [F1.2.1](./sdd/phase-1/F1.2.1-course-crud.md) | Course Collection & CRUD | P0 |
| [F1.2.2](./sdd/phase-1/F1.2.2-module-lesson-hierarchy.md) | Module/Lesson Hierarchy | P0 |
| [F1.2.3](./sdd/phase-1/F1.2.3-course-builder-ui.md) | Course Builder UI | P0 |
| [F1.3.1](./sdd/phase-1/F1.3.1-byos-storage-abstraction.md) | BYOS Storage Abstraction | P0 |
| [F1.4.1](./sdd/phase-1/F1.4.1-video-upload.md) | Video Upload | P0 |
| [F1.4.3](./sdd/phase-1/F1.4.3-video-player.md) | Video Player | P0 |
| [F1.5.1](./sdd/phase-1/F1.5.1-stripe-checkout.md) | Stripe Checkout | P0 |
| [F1.6.1](./sdd/phase-1/F1.6.1-docker-deployment.md) | Docker + Render Deployment | P0 |

### Phase Overviews

| Phase | Description | Status |
|-------|-------------|--------|
| [Phase 1](./sdd/phase-1/PHASE_1_OVERVIEW.md) | Foundation | In Progress |
| [Phase 2](./sdd/phase-2/PHASE_2_OVERVIEW.md) | Core Features | Planned |
| [Phase 3](./sdd/phase-3/PHASE_3_OVERVIEW.md) | Scale & Polish | Planned |
| [Phase 4](./sdd/phase-4/PHASE_4_OVERVIEW.md) | Differentiation | Planned |

---

## Architecture Diagrams

| Diagram | Description |
|---------|-------------|
| [System Architecture](./diagrams/system-architecture.md) | High-level system overview |
| [Database ERD](./diagrams/database-erd.md) | Entity relationship diagram |
| [API Map](./diagrams/api-map.md) | API endpoint documentation |
| [User Flows](./diagrams/user-flows.md) | User journey diagrams |

---

## Checklists

| Checklist | Description |
|-----------|-------------|
| [Pre-Commit](./checklists/PRE_COMMIT_CHECKLIST.md) | Before committing code |
| [Pre-MR](./checklists/PRE_MR_CHECKLIST.md) | Before creating merge request |
| [Code Review](./checklists/CODE_REVIEW_CHECKLIST.md) | Code review checklist |

---

## Project Overview

Learning Hall is a **self-hostable, white-label course creation platform** with Bring Your Own Storage (BYOS) capability. It enables creators to build and sell courses while maintaining full control over their content and data.

### Key Differentiators

1. **BYOS (Bring Your Own Storage)** - Connect AWS S3, Cloudflare R2, GCS
2. **True White-Label** - No platform branding
3. **Self-Hostable** - Run on your own infrastructure
4. **Zero Transaction Fees** - Keep 100% of revenue
5. **Open Source** - MIT license

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14+ |
| CMS | Payload CMS | 3.0 |
| Database | PostgreSQL | 16 |
| Language | TypeScript | 5.x |
| UI Framework | React | 18+ |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | Latest |
| Auth | NextAuth.js | 5.0 |
| Payments | Stripe | Latest |
| Testing | Vitest + Playwright | Latest |

### Target Users

- **Solo Educators** - Content creators wanting full control
- **Developers** - Add courses to portfolio
- **Small Businesses** - Internal training or customer education
- **Privacy-Conscious Creators** - Data ownership and compliance

---

## Development Workflow

### Feature Implementation

1. Check `roadmap/WORK_STATUS.md` for next feature
2. Read the feature's SDD in `docs/sdd/phase-{N}/`
3. Create feature branch: `feat/F{X}.{Y}.{Z}-{short-name}`
4. Implement with tests (80%+ coverage)
5. Run quality checks: `npm run lint && npm run type-check && npm test`
6. Create PR with proper description
7. Address code review feedback
8. Update work status after merge

### Branch Naming

```
feat/F1.1.1-payload-setup        # New feature
fix/F1.1.1-auth-redirect         # Bug fix
docs/update-architecture         # Documentation
chore/upgrade-dependencies       # Maintenance
```

---

## External Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Compiled Research](../../_@agent-prompts/learning-hall/research/sessions/COMPILED_RESEARCH.md)

---

## Author

Daniel Hernandez (Solo project)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Complete | Fully implemented and tested |
| 🚧 In Progress | Currently being worked on |
| 📋 Planned | Scheduled for implementation |
| ⏸️ Blocked | Waiting on dependency |

---

**Document Version:** 3.0.0
**Last Updated:** January 2026
