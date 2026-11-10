# Handoff Report — Challenger 2: Adversarial Verifier (Participant Selection & Form Flow)

**Verdict**: **APPROVE**  
**Role**: Empirical Challenger (critic, specialist)  
**Target Components**:
- `src/features/calendar/components/SmartParticipantPicker.tsx`
- `src/features/calendar/components/CreatePersonalMeetingModal.tsx`
- Design Tokens & Anti-AI UI: `src/features/calendar/components/smartPickers.css`
- Empirical Test Suite: `src/features/calendar/adversarialParticipantForm.test.tsx`

---

## 1. Observation

### 1.1 Source Code Inspection
- **Duplicate Prevention in Quick Groups** (`SmartParticipantPicker.tsx:177-184`):
  ```ts
  const handleAddGroup = (members: string[]) => {
    if (disabled) return;
    const cleanMembers = members.map((m) => m.replace(/\(.*?\)/g, '').trim());
    const merged = Array.from(new Set([...value, ...cleanMembers]));
    const nextValues = effectiveMax ? merged.slice(0, effectiveMax) : merged;
    const nextItems = masterDirectory.filter((m) => nextValues.some((v) => isNameMatch(v, m.name)));
    onChange?.(nextValues, nextItems);
  };
  ```
  `cleanMembers` actively strips parenthesized role annotations such as `(Admin)` from fixture data (e.g. `'Phạm Đức Long (Admin)'` -> `'Phạm Đức Long'`). `new Set([...value, ...cleanMembers])` guarantees mathematical set uniqueness, preventing duplicates when clicking the same group repeatedly or selecting overlapping groups (e.g. Ban Biên tập and Ban Thư ký both sharing Trần Thu Hà and Lê Thanh Vân).
- **Frequent Collaborator 1-Click Chips** (`SmartParticipantPicker.tsx:253-292`):
  Top newsroom collaborators (`Trần Thu Hà`, `Lê Thanh Vân`, `Nguyễn Hoài Nam`, `Đỗ Quang Huy`, `Nguyễn Tấn Đạt`) are surfaced as 1-click pill chips. Clicking toggles selection state via `handleTogglePerson` without duplicating, displaying initials avatar tone and `CheckOutlined` when selected.
- **Vietnamese Diacritics & Pen Names Search** (`SmartParticipantPicker.tsx:187-207`):
  ```ts
  const s = searchText.trim().toLowerCase();
  ...
  return (
    item.name.toLowerCase().includes(s) ||
    (item.penName && item.penName.toLowerCase().includes(s)) ||
    item.department.toLowerCase().includes(s) ||
    (item.position && item.position.toLowerCase().includes(s)) ||
    (item.email && item.email.toLowerCase().includes(s))
  );
  ```
  Enables case-insensitive searching across Vietnamese full name, pen name (`penName`, e.g. "Minh Anh", "Thu Hà", "Quang Huy", "Hoài Nam"), department, role position, and email address.
- **Department Filtering** (`SmartParticipantPicker.tsx:56-74, 187-207`):
  Supports 9 department tabs (`all`, `bbt`, `noidung`, `thoisu`, `theky`, `vanphong`, `congnghe`, `chuyende`, `hanhchinh`). Each tab filters the list to its exact department subset.
- **Modal Payloads for TASK, MEETING, EVENT** (`CreatePersonalMeetingModal.tsx:402-588`):
  - **TASK**: Submitting via "Triển khai" creates `ticketType: 'TASK'`, `type: 'task'`, `workflowType: 'DISPATCH'`, `approvalStatus: 'IN_PROGRESS'`, `location: 'Phiếu công việc'`, with clean `participants` array and synced `startAt`/`deadline`. Submitting via "Đề xuất" opens approver picker sub-modal, setting `workflowType: 'PROPOSAL'` and `approvalStatus: 'PENDING'`.
  - **MEETING**: Submitting via "Tạo lịch họp" validates `content`, `startAt`, and `participants` (min 1 required), producing `ticketType: 'MEETING'`, `type: 'meeting'`, `approvalStatus: 'SCHEDULED'`, `location` appropriately derived from offline/online/hybrid mode, and clean participants list.
  - **EVENT**: Submitting via "Triển khai" when participants are initially empty safely opens a participant picker sub-modal, confirms selection, and proceeds through the confirmation modal to persist `ticketType: 'EVENT'`, `type: 'event'`, `location: 'Sự kiện cơ quan'`.
- **Anti-AI UI Compliance** (`smartPickers.css:1-485`):
  - Zero occurrences of decorative `border-left: 3px/4px solid ...` across contact list rows and collaborator chips.
  - Zero nested box-in-box card frames; flat contact list using 1px micro-divider (`border-bottom: 1px solid #f1f5f9`).
  - Restrained brand color `#D92D20` used only for active/focus states.

### 1.2 Tool Execution Results
1. **Adversarial Empirical Test Suite Execution**:
   - Command: `npx vitest run src/features/calendar/adversarialParticipantForm.test.tsx`
   - Result: **16 passed / 16 tests** (21.10s)
2. **Standard Calendar SmartPickers Suite Execution**:
   - Command: `npx vitest run src/features/calendar/smartPickers.test.tsx`
   - Result: **11 passed / 11 tests** (550ms)
3. **Total Calendar Pickers Tests**: **27 passed / 27 tests**
4. **TypeScript Typecheck**:
   - Command: `npm run typecheck` (`tsc --noEmit`)
   - Result: **0 errors** (Exit code 0)
5. **Production Build**:
   - Command: `npm run build` (`tsc && vite build`)
   - Result: **Built in 11.18s** (Exit code 0)

---

## 2. Logic Chain

1. **Step 1 (Quick Groups Deduplication)**: Observation 1.1 shows that `handleAddGroup` strips parenthesized suffixes with `replace(/\(.*?\)/g, '')` and constructs `Array.from(new Set([...value, ...cleanMembers]))`. Observation 1.2 test suite empirically proves that adding Ban Biên tập multiple times or adding Ban Biên tập followed by Ban Thư ký yields unique elements (`expect(afterTkts.length).toBe(new Set(afterTkts).size)`). Thus, quick groups addition is resilient against duplicates.
2. **Step 2 (Frequent Collaborators)**: Observation 1.1 shows chip click handler dispatches through `handleTogglePerson`. Observation 1.2 confirms clicking a chip toggles presence in `value`, renders initials avatar, and does not duplicate existing tags.
3. **Step 3 (Vietnamese Search & Diacritics)**: Observation 1.1 reveals multi-field filter checking `name`, `penName`, `department`, `position`, `email`. Observation 1.2 verifies case-insensitivity (`nguyễn minh anh`), diacritics (`Nguyễn Hoài Nam`), pen name (`Quang Huy` matching `Đỗ Quang Huy`), and email. Fallback "Không tìm thấy nhân sự phù hợp" renders when unmatched.
4. **Step 4 (Department Scoping)**: Observation 1.1 tab definitions map to exact agency departments. Observation 1.2 verifies each tab (`congnghe`, `thoisu`, `chuyende`, `all`) restricts the flat list exclusively to matching members.
5. **Step 5 (Form Submission Payloads)**: Observation 1.1 payload builder in `handleExecuteFinalSubmit` handles `TASK`, `MEETING`, and `EVENT` with correct workflow types (`DISPATCH` vs `PROPOSAL`), status (`IN_PROGRESS`, `PENDING`, `SCHEDULED`), locations, clean participant arrays, and ISO dates. Observation 1.2 verifies all 4 form flows end-to-end via mocked API calls.
6. **Step 6 (Design System & Anti-AI UI Standards)**: Observation 1.1 stylesheet analysis and Observation 1.2 DOM computed style tests confirm complete absence of decorative `border-left` and no box-in-box nesting.

---

## 3. Caveats

- **Scope boundaries**: Mobile view under 768px was not tested as it is explicitly out of scope per contract Điều 9 & Điều 36.
- **Pre-existing test failures**: Pre-existing test failures in other unrelated modules (e.g. `evaluations`, `personnel-profile`, `dashboard`) were observed during the full repo Vitest run, but all Calendar modules (`calendar-week.test.tsx`, `calendar-notifications.test.tsx`, `calendar-sidebar-access.test.tsx`, `smartPickers.test.tsx`, and `adversarialParticipantForm.test.tsx`) pass 100%.
- No other caveats.

---

## 4. Conclusion

`SmartParticipantPicker` and `CreatePersonalMeetingModal` demonstrate robust architecture, typesafety, clean data normalization, duplicate protection, and strict adherence to the Anti-AI UI standard.

**Verdict**: **APPROVE**

---

## 5. Verification Method

To independently verify all findings:

```bash
# 1. Run the empirical adversarial verification test suite (16 tests)
npx vitest run src/features/calendar/adversarialParticipantForm.test.tsx

# 2. Run the unit & integration test suite for calendar smart pickers (11 tests)
npx vitest run src/features/calendar/smartPickers.test.tsx

# 3. Run calendar week flow tests (12 tests)
npx vitest run src/features/calendar/calendar-week.test.tsx

# 4. Verify TypeScript compilation
npm run typecheck

# 5. Verify production build
npm run build
```
