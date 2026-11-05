# Task Assignment: Worker M1 - Smart Components & Conflict Detection Engine

## Identity
- Role: Frontend Worker (Implementation & Unit Testing)
- Working directory: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m1
- Parent: teamwork_orchestrator (d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\orchestrator)

## Mandatory Input Files (MUST READ FIRST)
- ORIGINAL_REQUEST.md: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT.md: `d:\tuoitreproject\ERP-WEB-v2\PROJECT.md`
- Explorer 1 Report: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_1\handoff.md`
- Explorer 2 Report: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_2\handoff.md`
- Explorer 3 Report: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_3\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Anti-AI UI Rules (CRITICAL - ZERO TOLERANCE)
- Strictly NO `border-left` decoration anywhere (no `border-left: 3px solid ...`). Use 6px circular dot, subtle badges, or full 1px perimeter borders.
- NO nested `box-in-box` card frames. Prefer flat rows with `1px solid #f1f5f9` dividers and whitespace.
- Brand Red `#D92D20` must only be used with restraint for primary action buttons or active selection indicators. Never use red as a large background fill.

## Implementation Tasks (Milestone 1)
1. **Types (`src/features/calendar/types/timeConflict.ts`)**:
   Implement all interfaces from Explorer 3 handoff §4.1 & §4.2:
   - `TimeSlotValue`, `ConflictItem`, `SuggestedSlot`, `ConflictCheckResult`, `SmartTimePickerProps`
   - `ParticipantItem`, `SmartParticipantPickerProps`, `DepartmentGroup`

2. **Conflict Logic Engine (`src/features/calendar/conflictUtils.ts`)**:
   Implement pure conflict detection function `detectEventConflicts` per Explorer 3 handoff §6:
   - Interval overlap checking: `proposedStart < evEnd && evStart < proposedEnd`
   - Classify into: `self_busy`, `attendee_busy`, `room_occupied`, `editorial_clash`
   - Return detailed conflict summary and suggested alternative slots.

3. **Smart Time Picker Component (`src/features/calendar/components/SmartTimePicker.tsx`)**:
   - Presets bar: "Hôm nay", "Ngày mai", "Thứ Hai tuần tới", and custom toggle.
   - Time inputs: Start time + End time.
   - Duration chips: `30 phút`, `45 phút`, `60 phút`, `90 phút`, `120 phút`, `Cả ngày`.
   - Single-point mode support for `TASK` (deadline presets: "Cuối giờ sáng", "Đầu giờ chiều", "Cuối giờ chiều", "Hết ngày").
   - Real-time Visual Conflict Warning Banner (Anti-AI: amber `#fffbeb` background, 1px `#fed7aa` perimeter border, 6px amber dot, NO border-left, actionable time shift chip).

4. **Smart Participant Selector Component (`src/features/calendar/components/SmartParticipantPicker.tsx`)**:
   - Unified directory from `directoryContacts` in `src/mocks/fixtures.ts` and groups from `src/mocks/calendarNotificationFixtures.ts`.
   - Department filter tabs: "Tất cả", "Ban Biên tập", "Ban Nội dung", "Ban Thời sự", "Ban Thư ký", "Phòng Công nghệ", "Văn phòng", etc.
   - Frequent collaborator suggestion chips (1-click add): Trần Thu Hà, Lê Thanh Vân, Nguyễn Hoài Nam, Đỗ Quang Huy, etc.
   - Quick group addition: Ban Biên tập, Ban Thư ký tòa soạn, Phóng viên Nội dung.
   - Selected tags with circular avatar + initials (`avatarTone` from `@/utils/avatar`), full name, and 1-click remove (`✕`).
   - Flat contact list with avatars, roles, department badges (NO box-in-box).

5. **Verification**:
   Run `npm run typecheck` and verify no TypeScript errors.
   Write detailed implementation and verification report to `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m1\handoff.md`.


## 2026-11-04T17:31:25Z
You are Worker M1: Frontend Worker.
Your working directory is: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m1
Read d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m1\DISPATCH.md and d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\ORIGINAL_REQUEST.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 1 per DISPATCH.md:
1. `src/features/calendar/types/timeConflict.ts`
2. `src/features/calendar/conflictUtils.ts`
3. `src/features/calendar/components/SmartTimePicker.tsx`
4. `src/features/calendar/components/SmartParticipantPicker.tsx`

Strict Anti-AI Rules: NO `border-left` decoration under any circumstance; NO box-in-box nested frames; restrained Brand Red #D92D20.
Run `npm run typecheck` to verify your code.
Write your complete handoff report to d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m1\handoff.md and report back via send_message. Keep progress.md updated.
