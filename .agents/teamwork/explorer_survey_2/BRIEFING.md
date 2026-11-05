# BRIEFING — 2026-11-04T17:26:00Z

## Mission
Design System, Anti-AI UI Rules & UX Specification Investigation for "Thời gian" and "Chọn thành phần" pickers in calendar/booking modals.

## 🔒 My Identity
- Archetype: explorer
- Roles: Design System & UX Spec Explorer
- Working directory: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_2
- Original parent: 52b87d1d-b6e7-44e8-bb56-9f35bb2fa1e6
- Milestone: M1_EXPLORATION

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strict Anti-AI UI rules: NO border-left decorations, NO nested box-in-box, use flat lists, whitespace, subtle 6px dots, micro-dividers
- Controlled Brand Red (#D92D20) usage
- Comply with AGENTS.md, 02_KIEN_TRUC_VA_DESIGN_SYSTEM.md, Tailwind & Ant Design theme conventions

## Current Parent
- Conversation ID: 52b87d1d-b6e7-44e8-bb56-9f35bb2fa1e6
- Updated: 2026-11-04T17:21:00Z

## Investigation State
- **Explored paths**:
  - `AGENTS.md` (Anti-AI rules Điều 30, Điều 47; technology stack Điều 7)
  - `docs/02_KIEN_TRUC_VA_DESIGN_SYSTEM.md` (Design tokens, typography, radius, semantic colors)
  - `tailwind.config.js`, `src/config/theme.ts`, `src/styles/index.css`
  - `src/features/calendar/components/CreatePersonalMeetingModal.tsx` (Current SmartTimePicker and participant Select)
  - `src/features/calendar/components/CreateEditorialMeetingModal.tsx`
  - `src/features/work-tickets/components/WorkTicketFormModal.tsx`
  - `src/features/calendar/CalendarWeekPage.tsx`
  - `src/features/calendar/components/DayScheduleDrawer.tsx` & `.css` (Reference for Anti-AI flat card implementation)
  - `src/mocks/fixtures.ts` (18 `directoryContacts`, departments, `SUGGESTED_MEMBERS`)
- **Key findings**:
  - Current `SmartTimePicker` in `CreatePersonalMeetingModal.tsx:131-150` is a minimal 1-line wrapper around Antd `DatePicker` without presets, duration chips, or conflict alerts.
  - Current participant selector in `CreatePersonalMeetingModal.tsx:903` is a simple `Select mode="multiple"` without department filtering, avatar chips, or frequent collaborator suggestions.
  - Conflict detection does not exist in any modal; needs a clean algorithmic and visual design.
  - Strict Anti-AI UI rules prohibit `border-left` decoration and nested `box-in-box` frames, mandating flat lists, subtle 6px dots, and 1px micro-dividers (`#f1f5f9`).
- **Unexplored areas**: none (all investigation targets completed).

## Key Decisions Made
- Formulate 2 complete, drop-in replacement UX/UI specifications: `SmartTimePicker` and `SmartParticipantPicker`.
- Define complete Anti-AI UI design guidelines, design tokens, component anatomy, interaction states, and verification criteria.

## Artifact Index
- DISPATCH.md — incoming task dispatch
- progress.md — liveness heartbeat and investigation progress
- handoff.md — final comprehensive handoff report
