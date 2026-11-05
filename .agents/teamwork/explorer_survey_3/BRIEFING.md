# BRIEFING — 2026-11-04T17:25:50Z

## Mission
Investigate data schemas, mock APIs, fixtures, departments/staff models, and conflict detection logic for Calendar time picker and participant selector components.

## 🔒 My Identity
- Archetype: explorer
- Roles: Data Schema & Conflict Logic Explorer
- Working directory: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_3
- Original parent: 52b87d1d-b6e7-44e8-bb56-9f35bb2fa1e6
- Milestone: Survey & Architectural Design

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Adhere strictly to AGENTS.md and Tuoi Tre Design System (no border-left, anti-AI UI, etc.)
- Only write within d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_3

## Current Parent
- Conversation ID: 52b87d1d-b6e7-44e8-bb56-9f35bb2fa1e6
- Updated: 2026-11-04T17:25:50Z

## Investigation State
- **Explored paths**:
  - `src/types/domain.ts`
  - `src/types/calendar.ts`
  - `src/types/personnel.ts`
  - `src/types/extended.ts`
  - `src/mocks/fixtures.ts`
  - `src/mocks/calendarNotificationFixtures.ts`
  - `src/mocks/personnelFixtures.ts`
  - `src/mocks/workTicketFixtures.ts`
  - `src/services/api.ts`
  - `src/services/mockApi.ts`
  - `src/features/calendar/CalendarWeekPage.tsx`
  - `src/features/calendar/mockCalendarData.ts`
  - `src/features/calendar/calendarWeekUtils.ts`
  - `src/features/calendar/components/CreatePersonalMeetingModal.tsx`
  - `src/features/calendar/components/CreateEditorialMeetingModal.tsx`
  - `src/features/calendar/components/CalendarEventDetailModal.tsx`
  - `src/features/calendar/components/ParticipantList.tsx`
- **Key findings**:
  - All mock data for users, directory contacts (18 contacts across 14 departments), recipient groups (5 groups), personnel list, calendar events (editorial and personal), and work tickets identified.
  - In `CreatePersonalMeetingModal.tsx`, time selection is currently a plain AntD `DatePicker` with no presets, no duration picker, and no conflict detection; participant selection is a basic AntD `Select` using hardcoded `SUGGESTED_MEMBERS`.
  - In `CreateEditorialMeetingModal.tsx`, time is an optional scheduledAt DatePicker; recipient is radio for group/individual/all.
  - Formulated a multi-dimensional conflict detection algorithm covering: self conflict, attendee conflict, room conflict, and editorial clash.
  - Formulated comprehensive TypeScript interfaces for `SmartTimePicker` and `ParticipantSelector`.
- **Unexplored areas**: None for data schema and conflict logic.

## Key Decisions Made
- Conflict detection should operate on ISO 8601 interval intersection ($S_{new} < E_e \land S_e < E_{new}$) with strict bounds to allow consecutive non-overlapping events.
- Participant directory should be built by unifying `directoryContacts`, `initialRecipientGroups`, and `SUGGESTED_MEMBERS`, with quick filters by department and quick selection of frequent collaborators.
- Interfaces structured to support both standalone form controls and seamless integration into AntD `Form.Item`.

## Artifact Index
- DISPATCH.md — Task assignment
- BRIEFING.md — Persistent working memory
- progress.md — Liveness & progress tracking
- handoff.md — Complete investigation report
