# Task Assignment: Worker M2 - Modal Integration & Data Wiring

## Identity
- Role: Frontend Worker (Modal Integration & Data Wiring)
- Working directory: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m2
- Parent: teamwork_orchestrator (d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\orchestrator)

## Mandatory Input Files (MUST READ FIRST)
- ORIGINAL_REQUEST.md: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT.md: `d:\tuoitreproject\ERP-WEB-v2\PROJECT.md`
- Worker M1 Report: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m1\handoff.md`
- Explorer 1 Report: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_1\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Anti-AI UI Rules (CRITICAL - ZERO TOLERANCE)
- Strictly NO `border-left` decoration anywhere (no `border-left: 3px solid ...`). Use 6px circular dot, subtle badges, or full 1px perimeter borders.
- NO nested `box-in-box` card frames. Prefer flat rows with `1px solid #f1f5f9` dividers and whitespace.
- Brand Red `#D92D20` must only be used with restraint for primary action buttons or active selection indicators. Never use red as a large background fill.

## Implementation Tasks (Milestone 2)
1. **`src/features/calendar/CalendarWeekPage.tsx`**:
   - Forward `allEvents` as `existingEvents={allEvents}` into `<CreatePersonalMeetingModal ... />` at line ~1173.

2. **`src/features/calendar/components/CreatePersonalMeetingModal.tsx`**:
   - Accept `existingEvents?: CalendarEvent[]` in `CreatePersonalMeetingModalProps`.
   - In form render for `TASK` ("Phiếu công việc" / Booking ticket):
     - Replace the old DatePicker in Form.Item `name="time"` with `<SmartTimePicker ticketType="TASK" existingEvents={existingEvents} ... />`.
     - Replace `<Select options={SUGGESTED_MEMBERS}>` in Form.Item `name="participants"` with `<SmartParticipantPicker ticketType="TASK" role="executors" placeholder="Chọn thành phần thực hiện công việc..." ... />`.
   - In form render for `MEETING` ("Lịch họp"):
     - Replace the old DatePicker in Form.Item `name="startAt"` with `<SmartTimePicker ticketType="MEETING" existingEvents={existingEvents} ... />`.
     - Replace `<Select options={SUGGESTED_MEMBERS}>` in Form.Item `name="participants"` with `<SmartParticipantPicker ticketType="MEETING" role="participants" placeholder="Chọn nhân sự tham dự cuộc họp..." ... />`.
   - In form render for `EVENT` ("Sự kiện"):
     - Replace time and participant inputs similarly.
   - Upgrade sub-modals (`showParticipantModal`, `showApproverModal`) with `<SmartParticipantPicker>` where appropriate.
   - Maintain form field names (`time`, `startAt`, `participants`) and ensure full backward compatibility with `form.getFieldsValue()` and submit handlers.

3. **`src/features/calendar/components/CreateEditorialMeetingModal.tsx`**:
   - Upgrade `scheduledAt` picker in Form.Item `name="scheduledAt"` to use `<SmartTimePicker mode="single" ... />`.
   - Upgrade individual participant selector to `<SmartParticipantPicker role="participants" ... />`.

4. **Verification**:
   - Run `npm run typecheck`
   - Run `npm run lint`
   - Run `npx vitest run src/features/calendar/` (ensure both `smartPickers.test.tsx` and `calendar-week.test.tsx` pass 100%)
   - Run `npm run build`
   - Document all changes and test outputs in `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m2\handoff.md`.


## 2026-11-04T17:50:26Z
You are Worker M2: Frontend Worker.
Your working directory is: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m2
Read d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m2\DISPATCH.md and d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\ORIGINAL_REQUEST.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 2 per DISPATCH.md:
1. `src/features/calendar/CalendarWeekPage.tsx`: forward `existingEvents={allEvents}`
2. `src/features/calendar/components/CreatePersonalMeetingModal.tsx`: integrate SmartTimePicker and SmartParticipantPicker across TASK, MEETING, and EVENT form flows.
3. `src/features/calendar/components/CreateEditorialMeetingModal.tsx`: integrate SmartTimePicker and SmartParticipantPicker.

Strict Anti-AI Rules: NO `border-left` decoration under any circumstance; NO box-in-box nested frames; restrained Brand Red #D92D20.
Run `npm run typecheck`, `npm run lint`, `npx vitest run src/features/calendar/`, and `npm run build` to verify your changes.
Write your complete handoff report to d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\worker_m2\handoff.md and report back via send_message. Keep progress.md updated.
