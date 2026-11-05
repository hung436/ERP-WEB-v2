# Project: Smart Calendar Pickers & Modal UI/UX Prototype (ERP Báo Tuổi Trẻ)

## Architecture
- **Target Route**: `/calendar/week` (Lịch làm việc tuần)
- **Module Boundary**: `src/features/calendar/`
- **Data Flow**:
  - `CalendarWeekPage.tsx` supplies active week events (`allEvents`) to modal dialogs.
  - `SmartTimePicker.tsx` takes date/time inputs, calculates flexible durations (30m, 45m, 60m, 90m, 120m), offers date presets ("Hôm nay", "Ngày mai", ngày trong tuần tới), and evaluates conflict state via `detectEventConflicts()` in `conflictUtils.ts`.
  - `SmartParticipantPicker.tsx` loads newsroom directory contacts and recipient groups, filters by editorial units (Ban Biên tập, Ban Nội dung, Văn phòng, v.v.), highlights frequent collaborators with 1-click addition chips, renders selected members with avatar tones, and provides search across full name/pen name.
  - `CreatePersonalMeetingModal.tsx` integrates both components for `TASK` (Phiếu công việc / Booking), `MEETING` (Lịch họp), and `EVENT` (Sự kiện).
  - `CreateEditorialMeetingModal.tsx` integrates both components for Ban Biên tập meetings & broadcasts.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| F1 | Quick Date Presets | Buttons for "Hôm nay", "Ngày mai", "Thứ Hai tuần tới", and custom date picker toggle | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F2 | Flexible Duration Chips | Duration selector with 30m, 45m, 60m, 90m, 120m, All Day; auto-calculates endAt | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F3 | Multi-tier Conflict Detection | Checks interval overlap with existing events for current user, room, attendees, and editorial all-hands | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F4 | Anti-AI Conflict Warning Banner | Full-perimeter bordered warning with 6px status dot; strictly ZERO `border-left` decoration; 1-click time shift chips | M1 | ORIGINAL_REQUEST §R1, R3 | DONE |
| F5 | Department & Editorial Unit Filter | Tabs/pills to filter staff by newsroom departments (Ban Biên tập, Ban Nội dung, Văn phòng, Công nghệ, v.v.) | M1 | ORIGINAL_REQUEST §R2 | DONE |
| F6 | Avatar & Identity Tags | Rich selected tags displaying circular avatar with initials, `avatarTone` color, full name, and 1-click removal | M1 | ORIGINAL_REQUEST §R2 | DONE |
| F7 | Frequent Collaborators Shortcuts | Top-bar chips for 4-6 most frequent colleagues (Trần Thu Hà, Lê Thanh Vân, Nguyễn Hoài Nam, Đỗ Quang Huy) for 1-click addition | M1 | ORIGINAL_REQUEST §R2 | DONE |
| F8 | Quick Group Selection | Shortcuts to add entire newsroom groups (Ban Biên tập, Ban Thư ký, Phóng viên Nội dung) | M1 | ORIGINAL_REQUEST §R2 | DONE |
| F9 | Integration into `CreatePersonalMeetingModal` | Upgrade DatePicker and Select in `CreatePersonalMeetingModal` for `TASK`, `MEETING`, and `EVENT` | M2 | ORIGINAL_REQUEST §R1, R2 | DONE |
| F10 | Integration into `CreateEditorialMeetingModal` | Upgrade scheduledAt and individual participant selector in `CreateEditorialMeetingModal` | M2 | ORIGINAL_REQUEST §R1, R2 | DONE |
| F11 | Integration into `CalendarWeekPage` | Forward `allEvents` into `CreatePersonalMeetingModal` for real-time conflict checking | M2 | ORIGINAL_REQUEST §R1 | DONE |
| F12 | Anti-AI UI Compliance Verification | Strict verification that no `border-left` decoration exists, no box-in-box nesting, and Brand Red `#D92D20` is controlled | M3 | ORIGINAL_REQUEST §R3 | DONE |
| F13 | Technical Verification & Build Validation | Verification that `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test` pass cleanly | M3 | ORIGINAL_REQUEST §AC | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Smart Calendar Components & Conflict Logic | Create `timeConflict.ts`, `conflictUtils.ts`, `SmartTimePicker.tsx`, `SmartParticipantPicker.tsx` | None | DONE |
| M2 | Modal Integration & Data Wiring | Integrate new pickers into `CreatePersonalMeetingModal.tsx`, `CreateEditorialMeetingModal.tsx`, and `CalendarWeekPage.tsx` | M1 | DONE |
| M3 | End-to-End Validation, Anti-AI Audit & Quality Gate | Rigorous review, empirical challenge, forensic integrity audit, typecheck, lint, and build verification | M2 | DONE |

## Interface Contracts

### M1 ↔ M2: `SmartTimePicker` Contract
```typescript
export interface TimeSlotValue {
  date: Dayjs;
  startAt: Dayjs;
  endAt: Dayjs;
  durationMinutes: number;
  isAllDay?: boolean;
}

export interface SmartTimePickerProps {
  value?: TimeSlotValue | Dayjs;
  onChange?: (val: TimeSlotValue | Dayjs) => void;
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  existingEvents?: CalendarEvent[];
  currentUserName?: string;
  selectedParticipants?: string[];
  selectedLocation?: string;
  excludeEventId?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

### M1 ↔ M2: `SmartParticipantPicker` Contract
```typescript
export interface ParticipantItem {
  id: string;
  name: string;
  penName?: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  isFrequent?: boolean;
}

export interface SmartParticipantPickerProps {
  value?: string[]; // array of selected member names
  onChange?: (selected: string[], items?: ParticipantItem[]) => void;
  placeholder?: string;
  role?: 'participants' | 'executors' | 'approvers' | 'watchers';
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  maxSelected?: number;
  disabled?: boolean;
  className?: string;
}
```

### M1: Conflict Detection Contract (`conflictUtils.ts`)
```typescript
export function detectEventConflicts(params: {
  proposedStart: Dayjs;
  proposedEnd: Dayjs;
  currentUserName?: string;
  selectedParticipants?: string[];
  selectedLocation?: string;
  existingEvents: CalendarEvent[];
  excludeEventId?: string;
}): ConflictCheckResult;
```

## Code Layout & File Ownership
- **Milestone 1 Exclusively Owns**:
  - `src/features/calendar/types/timeConflict.ts`
  - `src/features/calendar/conflictUtils.ts`
  - `src/features/calendar/components/SmartTimePicker.tsx`
  - `src/features/calendar/components/SmartParticipantPicker.tsx`
  - `src/features/calendar/components/smartPickers.css`
  - `src/features/calendar/smartPickers.test.tsx`
- **Milestone 2 Exclusively Owns**:
  - `src/features/calendar/CalendarWeekPage.tsx`
  - `src/features/calendar/components/CreatePersonalMeetingModal.tsx`
  - `src/features/calendar/components/CreateEditorialMeetingModal.tsx`
- **Milestone 3 (Verification & Testing)**:
  - `src/features/calendar/__tests__/conflictUtils.stress.test.ts`
  - `src/features/calendar/__tests__/smartTimePicker.stress.test.tsx`
  - `src/features/calendar/adversarialParticipantForm.test.tsx`
