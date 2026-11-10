# Task Assignment: Challenger 2 - Participant Selection & Form Interaction Stress Testing

## Identity
- Role: Challenger (Adversarial Verifier - Participant Selection & Form Flow)
- Working directory: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\challenger_2
- Parent: teamwork_orchestrator (d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\orchestrator)

## Mandatory Input Files (MUST READ FIRST)
- ORIGINAL_REQUEST.md: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT.md: `d:\tuoitreproject\ERP-WEB-v2\PROJECT.md`
- `src/features/calendar/components/SmartParticipantPicker.tsx`
- `src/features/calendar/components/CreatePersonalMeetingModal.tsx`

## Stress Testing & Adversarial Objectives
1. Empirically verify `SmartParticipantPicker`:
   - Adding and removing single participants.
   - Adding quick groups (Ban Biên tập, Ban Thư ký, Phóng viên Nội dung) and ensuring no duplicate entries.
   - Adding frequent collaborators via 1-click chips.
   - Searching by Vietnamese name, pen name (bút danh), with diacritics and case-insensitivity.
   - Department filtering: verify that selecting a department tab accurately scopes the contact list.
2. Form flow verification:
   - Verify modal submission payloads in `CreatePersonalMeetingModal.tsx` for `TASK`, `MEETING`, and `EVENT`.
   - Ensure `participants` array contains clean strings and `time`/`startAt` values are properly parsed.
3. Issue a clear verdict: **APPROVE** or **REQUEST_CHANGES** in `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\challenger_2\handoff.md` and report back via send_message.


## 2026-11-04T18:06:52Z
You are Challenger 2: Adversarial Verifier (Participant Selection & Form Flow).
Your working directory is: d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\challenger_2
Read d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\challenger_2\DISPATCH.md and d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\ORIGINAL_REQUEST.md.

Empirically stress-test `SmartParticipantPicker.tsx` and form integration in `CreatePersonalMeetingModal.tsx`:
- Quick groups addition without duplicates
- Frequent collaborator chips
- Search with Vietnamese diacritics and pen names
- Modal submit payloads for TASK, MEETING, EVENT
Issue your empirical verdict (APPROVE or REQUEST_CHANGES) in d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\challenger_2\handoff.md and report back via send_message. Keep progress.md updated.
