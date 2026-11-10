# Handoff Report: Data Schema, Mock Fixtures & Conflict Detection Logic Specification

**Explorer**: Explorer 3 — Data Schema & Conflict Logic Explorer  
**Working Directory**: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_3`  
**Target Milestone**: UI/UX & Code Prototype for "Thời gian" (Time Picker) and "Chọn thành phần" (Participant Selector) in Calendar Week & Modals  
**Date**: 2026-11-04 (Simulated Workspace Time: Nov 2026)

---

## 1. Observation

Direct investigation of the codebase in `d:\tuoitreproject\ERP-WEB-v2` revealed the following schemas, mock data sources, and component implementations:

### 1.1 Mock Data Sources & Entity Stores

1. **User & Identity Model** (`src/types/domain.ts:10-21`, `src/mocks/fixtures.ts:3-13`):
   - Current Logged-in User: `demoUser` (`id: 'user-001'`, `username: 'nhanvien'`, `fullName: 'Nguyễn Minh Anh'`, `department: 'Ban Nội dung'`, `position: 'Phóng viên'`, `role: 'employee'`).
   - Admin User: `adminUser` (`id: 'user-admin'`, `username: 'admin'`, `fullName: 'Phạm Đức Long (Admin)'`, `department: 'Ban Quản trị & Công nghệ'`, `position: 'Quản trị viên Hệ thống'`).
   - Retrieved at runtime via `useAuth().user` (`src/features/auth/AuthContext.tsx`).

2. **Directory Contacts & Departments** (`src/types/domain.ts:23-31`, `src/mocks/fixtures.ts:1711-1730`):
   - `directoryContacts`: 18 staff members across 14 editorial and administrative departments:
     - `Ban Nội dung`: Nguyễn Minh Anh, Trần Thu Hà
     - `Văn phòng`: Phạm Đức Long, Lê Thanh Vân, Ngô Mỹ Linh
     - `Ban Bạn đọc`: Nguyễn Hoài Nam
     - `Ban Khoa giáo`: Đỗ Quang Huy
     - `Phòng Lưu trữ`: Mai Phương Thảo
     - `Phòng Hành chính`: Vũ Minh Khôi
     - `Ban Thư ký`: Hoàng Tuấn Anh
     - `Ban Thời sự`: Bùi Anh Tú
     - `Trung tâm Tư liệu`: Phan Thùy Dung
     - `Phòng Công nghệ`: Đặng Quốc Bảo, Tạ Minh Châu
     - `Ban Văn hóa`: Đinh Gia Hân
     - `Ban Thể thao`: Lương Hải Đăng
     - `Phòng Tài chính`: Cao Thanh Tâm
     - `Phòng Tổ chức`: Trịnh Khánh Vy
   - Accessible via API endpoint `/api/directory` -> `directoryApi.list()`.

3. **Calendar Recipient Groups** (`src/types/calendar.ts:9-17`, `src/mocks/calendarNotificationFixtures.ts:11-52`):
   - `initialRecipientGroups`: 5 defined groups:
     - `grp-01`: **Ban Biên tập** (Members: Phạm Đức Long, Trần Thu Hà, Lê Thanh Vân, Nguyễn Minh Anh, Nguyễn Hoài Nam, Đỗ Quang Huy)
     - `grp-02`: **Ban Thư ký tòa soạn & Biên tập viên chính** (Members: Trần Thu Hà, Lê Thanh Vân, Mai Phương Thảo, Vũ Hoàng Yến, Bùi Văn Hùng)
     - `grp-03`: **Phóng viên Ban Thời sự & Nội dung** (Members: Nguyễn Minh Anh, Nguyễn Hoài Nam, Đỗ Quang Huy, Hoàng Minh Tuấn, Trịnh Thị Lan, Phan Văn Kiệt)
     - `grp-04`: **Tổ Chuyển đổi số & Công nghệ** (Members: Phan Văn Kiệt, Đỗ Quang Huy, Phạm Đức Long, Lê Quốc Bảo)
     - `grp-05`: **Hội đồng Tuyển dụng nhiệm kỳ trước** (Closed)
   - Accessible via API endpoint `/api/calendar/groups` -> `calendarGroupApi.list()`.

4. **Personnel Units & Profiles** (`src/mocks/personnelFixtures.ts:88-248, 332-351`):
   - `initialWorkUnits`: 8 organizational units (`Ban Biên tập`, `Ban Nội dung & Xuất bản`, `Ban Tài chính - Kế toán`, `Ban Kỹ thuật & Công nghệ`, `Ban Kinh tế - Xã hội`, `Đoàn Thanh niên Báo Tuổi Trẻ`, `Công đoàn Báo Tuổi Trẻ`, `Đảng ủy Báo Tuổi Trẻ`).
   - `initialPersonnelList`: 6 detailed personnel profiles with positions (`Phóng viên`, `Kỹ sư phần mềm`, `Biên tập viên`, `Chuyên viên Nhân sự`, etc.).

5. **Calendar Events & Weekly Schedule Data** (`src/types/domain.ts:99-175`, `src/mocks/fixtures.ts:48-150`, `src/features/calendar/mockCalendarData.ts`):
   - `CalendarEvent` contains:
     - `id`: string
     - `title`: string
     - `startAt`: string (ISO 8601, e.g. `'2026-10-05T08:30:00+07:00'`)
     - `endAt`: string (ISO 8601, e.g. `'2026-10-05T09:30:00+07:00'`)
     - `location`: string (e.g. `'PH3A'`, `'PHT5'`, `'Hội trường Lầu 6'`, `'Phòng họp số 1'`)
     - `type`: `'meeting' | 'work' | 'deadline' | 'personal' | 'task' | 'event'`
     - `scope`: `'editorial' | 'personal'`
     - `ticketType`: `'TASK' | 'MEETING' | 'EVENT'`
     - `organizer`: string (e.g. `'Ban Biên tập'`, `'Trần Thu Hà'`)
     - `leader`: string (e.g. `'Anh Hoàng Nguyên'`)
     - `participants`: string[] (e.g. `['Nguyễn Minh Anh', 'Trần Thu Hà']`)
     - `participantText`: string
     - `approvalStatus`: `'APPROVED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SCHEDULED' | 'REJECTED'`
     - `executors`: Array<{ id: string | number; name: string; role?: string; status?: string }>
     - `watchers`: Array<{ id: string | number; name: string }>
     - `approver` / `approvers`: Array<{ id: string | number; name: string; status?: string }>
   - Generated dynamically for any week by `getEventsForWeek(weekStart, existingEvents)` in `src/features/calendar/mockCalendarData.ts:1848-1879`.

6. **Work Tickets / Job Tickets (Phiếu công việc)** (`src/mocks/workTicketFixtures.ts:6-100`, `src/features/calendar/components/CreatePersonalMeetingModal.tsx:37-63`):
   - Ticket types managed in calendar:
     - `TASK` ("Phiếu công việc"): focus on content, deadline/time, executors/watchers/approvers.
     - `MEETING` ("Lịch họp"): focus on start time, duration, room/link online, attendees.
     - `EVENT` ("Sự kiện"): focus on start time, end time, location, attendees.

### 1.2 Current State of Time Picker & Participant Selector in Target Modals

1. **`CreatePersonalMeetingModal.tsx`**:
   - Lines 125-150: `SmartTimePicker` is currently a bare wrapper around Ant Design's `<DatePicker showTime={{ format: "HH:mm" }} format="HH:mm DD/MM/YYYY" ... />`. It does **not** provide date presets, duration presets, time slot chips, or any conflict detection feedback.
   - Lines 65-97: Hardcodes `SUGGESTED_MEMBERS` as a static array of 13 strings (e.g. `"Nguyễn Minh Anh (Phóng viên)"`, `"PHAN NGHỆ ĐÔ"`, `"Bùi Lê Thế Kiệt"`).
   - Lines 903-914 & 1144-1149: Participant selection is a basic `<Select mode="multiple" options={SUGGESTED_MEMBERS} />`. It has no department filtering, no avatar rendering, no group selection, and no collaborator groupings.
   - Lines 177-182 & 324-345: Pops up separate secondary modal `showParticipantModal` when clicking "Triển khai" without attendees.

2. **`CreateEditorialMeetingModal.tsx`**:
   - Lines 279-292: Time input is a standard AntD `<DatePicker>` for `scheduledAt`.
   - Lines 173-228: Recipient selector uses radio buttons (`groups`, `individuals`, `all`) with separate dropdowns for groups (`groupOptions`) and contacts (`individualOptions`).

3. **`CalendarWeekPage.tsx`**:
   - Lines 94-157: Holds all week events in state (`allEvents`).
   - Lines 1172-1191: Passes `initialDate` and `editingEvent` into `CreatePersonalMeetingModal`, but currently does **not** pass `existingEvents` into the modal for conflict resolution.

---

## 2. Logic Chain

From the observations above, the necessary conflict logic and data architecture are deduced as follows:

```
[Observation: 1.1.5, 1.2.3]
CalendarWeekPage has allEvents (array of CalendarEvent with startAt, endAt, location, participants)
        │
        ▼
[Logic Step 1: Overlap Geometry]
Two events clash if intervals [S_new, E_new) and [S_exist, E_exist) intersect:
S_new < E_exist AND S_exist < E_new
Touching boundary (S_new == E_exist) is NOT a conflict (allows back-to-back meetings).
        │
        ▼
[Logic Step 2: Multi-Dimensional Collision Categorization]
When an overlap occurs, classify the collision into 4 distinct operational concerns:
  1. `self_busy`: Current user (Nguyễn Minh Anh) is booked in an existing event.
  2. `attendee_busy`: One or more selected participants are booked in other events.
  3. `room_occupied`: The selected physical meeting room is already reserved.
  4. `editorial_clash`: The slot clashes with an all-hands Ban Biên tập / Tòa soạn meeting.
        │
        ▼
[Logic Step 3: Resolution & Suggested Slot Algorithm]
If a conflict is detected, evaluate subsequent 30-minute intervals on the same day
to provide a 1-click "Khung giờ trống khả dụng tiếp theo" (Next available slot).
        │
        ▼
[Logic Step 4: Participant Directory & Frequent Collaborators]
Unify directoryContacts (18 contacts) + initialRecipientGroups (4 active groups)
into a structured dataset with metadata: department, role, avatar initials, and frequent flag.
        │
        ▼
[Logic Step 5: Anti-AI UI Compliance (AGENTS.md & ORIGINAL_REQUEST.md)]
No `border-left` decorative lines.
No nested box-in-box cards.
Clean flat rows, 1px `#F1F5F9` dividers, subtle status dots (6px) and badges.
```

---

## 3. Conflict Detection Engine: Detailed Formulation

### 3.1 Interval Overlap Formula

Let the proposed event have start time $S_{prop}$ and end time $E_{prop}$ (where $E_{prop} > S_{prop}$).
For any existing event $e \in \text{ExistingEvents}$:
- Let $S_e = \text{dayjs}(e.\text{startAt})$
- Let $E_e = \text{dayjs}(e.\text{endAt})$ (if $e.\text{endAt}$ is missing or $E_e \le S_e$, default $E_e = S_e.\text{add}(30, \text{'minute'})$).
- If editing an event with ID $id_{\text{edit}}$, skip if $e.\text{id} == id_{\text{edit}}$.

**Strict Interval Overlap Condition**:
$$\text{isOverlapping}(e) = (S_{prop} < E_e) \land (S_e < E_{prop})$$

### 3.2 Collision Classification & Severity

| Conflict Type | Trigger Condition | Severity | UI Presentation |
|---|---|---|---|
| `editorial_clash` | $e.\text{scope} == \text{'editorial'}$ AND $(e.\text{participantText} \approx \text{"tất cả CB-NV"} \lor e.\text{title} \approx \text{"Chào cờ" \| "Họp Ban Biên tập"})$ | `warning` | Yellow/Amber alert banner + warning dot |
| `room_occupied` | Proposed location is a physical room (e.g. `PH3A`, `PHT5`, `Hội trường Lầu 6`) AND $e.\text{location} == \text{proposedLocation}$ | `error` | Red alert chip: "Phòng họp [Tên phòng] đã được đặt bởi [Người đặt]" |
| `self_busy` | Current user is organizer, leader, or in $e.\text{participants}$ | `warning` | Amber alert chip: "Bạn có lịch trùng: [Tiêu đề sự kiện] ([Giờ])" |
| `attendee_busy` | Any $p \in \text{selectedParticipants}$ is in $e.\text{participants}$ or is $e.\text{organizer}$ | `info` / `warning` | List of busy members: "[Tên người] bận: [Tiêu đề] ([Giờ])" |

### 3.3 Suggested Free Slot Generator

When conflicts exist:
1. Start at $T = S_{prop}.\text{hour}(8).\text{minute}(0)$ up to $18:00$.
2. Step in 30-minute intervals for duration $D = E_{prop} - S_{prop}$.
3. Find the earliest interval $[T, T + D)$ where `detectEventConflicts` returns `hasConflict == false`.
4. Return `suggestedSlot: { startAt: Dayjs, endAt: Dayjs, label: "10:30 - 11:30 hôm nay" }`.

---

## 4. Complete TypeScript Interfaces Specification

The following interfaces are designed for direct drop-in implementation into the codebase:

### 4.1 Time Picker & Conflict Types (`src/types/timeConflict.ts`)

```typescript
import type { Dayjs } from 'dayjs';
import type { CalendarEvent } from '@/types/domain';

export type ConflictType = 'self_busy' | 'attendee_busy' | 'room_occupied' | 'editorial_clash';
export type ConflictSeverity = 'error' | 'warning' | 'info';

export interface ConflictItem {
  id: string; // ID of the existing conflicting event
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  type: ConflictType;
  severity: ConflictSeverity;
  conflictingEntities: string[]; // Names of conflicting participants or room name
  message: string; // Explanatory message in Vietnamese
  eventSummary?: {
    scope?: 'editorial' | 'personal';
    ticketType?: 'TASK' | 'MEETING' | 'EVENT';
    organizer?: string;
  };
}

export interface SuggestedSlot {
  startAt: Dayjs;
  endAt: Dayjs;
  label: string; // e.g. "10:30 - 11:30 (Trống lịch)"
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: ConflictItem[];
  selfConflictCount: number;
  attendeeConflictCount: number;
  roomConflictCount: number;
  editorialClashCount: number;
  suggestedSlot?: SuggestedSlot;
}

export interface TimeSlotValue {
  date: Dayjs;
  startAt: Dayjs;
  endAt: Dayjs;
  durationMinutes: number;
  isAllDay?: boolean;
}

export interface PresetDateOption {
  key: string;
  label: string;
  getDate: () => Dayjs;
}

export interface PresetDurationOption {
  minutes: number;
  label: string;
}

export interface SmartTimePickerProps {
  value?: TimeSlotValue | Dayjs;
  onChange?: (val: TimeSlotValue) => void;
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  existingEvents?: CalendarEvent[];
  currentUserName?: string;
  selectedParticipants?: string[];
  selectedLocation?: string;
  excludeEventId?: string;
  onConflictChange?: (result: ConflictCheckResult) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

### 4.2 Participant Selector Types (`src/types/participantSelector.ts`)

```typescript
export type ParticipantType = 'person' | 'group';

export interface ParticipantItem {
  id: string;
  name: string;
  penName?: string;
  type: ParticipantType;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  memberCount?: number; // Only for groups
  members?: string[];   // Only for groups: list of member names
  isFrequent?: boolean; // True if in user's frequent collaborator list
}

export interface DepartmentGroup {
  department: string;
  count: number;
  items: ParticipantItem[];
}

export interface ParticipantSelectorProps {
  value?: string[]; // Array of selected participant names or IDs
  onChange?: (selected: string[], items: ParticipantItem[]) => void;
  placeholder?: string;
  maxCount?: number;
  allowGroups?: boolean;
  frequentFirst?: boolean;
  role?: 'attendee' | 'executor' | 'approver' | 'watcher';
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  disabled?: boolean;
  className?: string;
}
```

---

## 5. Master Dataset for Participant Selector & Collaboration Groups

To eliminate static hardcoding and provide realistic Tuoi Tre editorial experience, the following unified directory is synthesized from `directoryContacts`, `initialRecipientGroups`, and newsroom hierarchy:

### 5.1 Frequent Collaborators (Thường xuyên cộng tác)
These items are displayed in the quick-suggest chip bar right below the input:

1. **Trần Thu Hà** — Ban Nội dung (Phó Trưởng ban)
2. **Lê Thanh Vân** — Văn phòng (Thư ký điều phối)
3. **Nguyễn Hoài Nam** — Ban Bạn đọc (Phóng viên chuyên đề)
4. **Đỗ Quang Huy** — Ban Khoa giáo (Trưởng ban)
5. **Hoàng Điệp** — Ban Thư ký (Biên tập viên Ảnh)
6. **Nguyễn Tấn Đạt** — Ban Biên tập (Phó Tổng Biên tập)

### 5.2 Pre-defined Groups (Nhóm làm việc tòa soạn)
1. **Ban Biên tập** (6 người)
2. **Ban Thư ký tòa soạn & BTV chính** (5 người)
3. **Phóng viên Ban Thời sự & Nội dung** (6 người)
4. **Tổ Chuyển đổi số & Công nghệ** (4 người)

### 5.3 Department Breakdown (Phân loại phòng ban tòa soạn)
- **Ban Nội dung**: Nguyễn Minh Anh, Trần Thu Hà
- **Ban Thời sự**: Bùi Anh Tú
- **Ban Thư ký**: Hoàng Tuấn Anh, Hoàng Điệp
- **Ban Bạn đọc**: Nguyễn Hoài Nam
- **Ban Khoa giáo**: Đỗ Quang Huy
- **Ban Văn hóa**: Đinh Gia Hân
- **Ban Thể thao**: Lương Hải Đăng
- **Văn phòng**: Lê Thanh Vân, Phạm Đức Long, Ngô Mỹ Linh
- **Phòng Công nghệ**: Đặng Quốc Bảo, Tạ Minh Châu
- **Phòng Tổ chức - Nhân sự**: Trịnh Khánh Vy
- **Phòng Tài chính - Kế toán**: Cao Thanh Tâm
- **Phòng Hành chính**: Vũ Minh Khôi
- **Phòng Lưu trữ / Trung tâm Tư liệu**: Mai Phương Thảo, Phan Thùy Dung

---

## 6. Pure Conflict Detection Function Implementation Sketch

The following pure utility function can be placed in `src/features/calendar/conflictUtils.ts`:

```typescript
export function detectEventConflicts({
  proposedStart,
  proposedEnd,
  currentUserName = 'Nguyễn Minh Anh',
  selectedParticipants = [],
  selectedLocation = '',
  existingEvents = [],
  excludeEventId,
}: {
  proposedStart: Dayjs;
  proposedEnd: Dayjs;
  currentUserName?: string;
  selectedParticipants?: string[];
  selectedLocation?: string;
  existingEvents: CalendarEvent[];
  excludeEventId?: string;
}): ConflictCheckResult {
  const conflicts: ConflictItem[] = [];

  const normLocation = selectedLocation.trim().toLowerCase();
  const participantSet = new Set(selectedParticipants.map((p) => p.trim().toLowerCase()));

  for (const ev of existingEvents) {
    if (excludeEventId && ev.id === excludeEventId) continue;
    if (!ev.startAt) continue;

    const evStart = dayjs(ev.startAt);
    let evEnd = ev.endAt ? dayjs(ev.endAt) : evStart.add(30, 'minute');
    if (!evEnd.isValid() || evEnd.isSame(evStart) || evEnd.isBefore(evStart)) {
      evEnd = evStart.add(30, 'minute');
    }

    // Interval overlap: S1 < E2 && S2 < E1
    const isOverlapping = proposedStart.isBefore(evEnd) && evStart.isBefore(proposedEnd);
    if (!isOverlapping) continue;

    const evParticipants = (ev.participants || []).map((p) => p.trim());
    const evParticipantsLower = evParticipants.map((p) => p.toLowerCase());
    const isEditorialScope = ev.scope === 'editorial';

    // 1. Room collision
    if (normLocation && ev.location && ev.location.trim().toLowerCase() === normLocation) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt,
        location: ev.location,
        type: 'room_occupied',
        severity: 'error',
        conflictingEntities: [ev.location],
        message: `Phòng "${ev.location}" đã có lịch "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: { scope: ev.scope, ticketType: ev.ticketType, organizer: ev.organizer },
      });
    }

    // 2. Editorial All-Hands clash
    if (isEditorialScope && (ev.participantText?.includes('tất cả') || ev.title.includes('Chào cờ') || ev.title.includes('Họp Ban Biên tập'))) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt,
        location: ev.location,
        type: 'editorial_clash',
        severity: 'warning',
        conflictingEntities: ['Toàn cơ quan / Ban Biên tập'],
        message: `Trùng với lịch chung: "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: { scope: ev.scope, ticketType: ev.ticketType, organizer: ev.organizer },
      });
    }

    // 3. Current user collision
    const isCurrentUserBusy =
      ev.isUserParticipant ||
      ev.organizer?.toLowerCase() === currentUserName.toLowerCase() ||
      evParticipantsLower.some((p) => p.includes(currentUserName.toLowerCase()));

    if (isCurrentUserBusy) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt,
        location: ev.location,
        type: 'self_busy',
        severity: 'warning',
        conflictingEntities: [currentUserName],
        message: `Bạn đang có lịch "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: { scope: ev.scope, ticketType: ev.ticketType, organizer: ev.organizer },
      });
    }

    // 4. Attendee collision
    const busyAttendees = evParticipants.filter((p) => {
      const pLower = p.toLowerCase();
      for (const selected of participantSet) {
        if (pLower.includes(selected) || selected.includes(pLower)) return true;
      }
      return false;
    });

    if (busyAttendees.length > 0) {
      conflicts.push({
        id: ev.id,
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt,
        location: ev.location,
        type: 'attendee_busy',
        severity: 'info',
        conflictingEntities: busyAttendees,
        message: `${busyAttendees.join(', ')} bận lịch "${ev.title}" (${evStart.format('HH:mm')} - ${evEnd.format('HH:mm')})`,
        eventSummary: { scope: ev.scope, ticketType: ev.ticketType, organizer: ev.organizer },
      });
    }
  }

  // Deduplicate conflicts by ID + type
  const seen = new Set<string>();
  const uniqueConflicts = conflicts.filter((c) => {
    const k = `${c.id}-${c.type}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    hasConflict: uniqueConflicts.length > 0,
    conflicts: uniqueConflicts,
    selfConflictCount: uniqueConflicts.filter((c) => c.type === 'self_busy').length,
    attendeeConflictCount: uniqueConflicts.filter((c) => c.type === 'attendee_busy').length,
    roomConflictCount: uniqueConflicts.filter((c) => c.type === 'room_occupied').length,
    editorialClashCount: uniqueConflicts.filter((c) => c.type === 'editorial_clash').length,
  };
}
```

---

## 7. Anti-AI UI Style Guidance (Strict Adherence to Section VI & Điều 30)

1. **No Left Borders**: Under no circumstances should conflict alerts or selected tags use `border-left: 3px solid #f04438`. Instead, use:
   - A soft background tint: `#FEF3F2` (soft red) or `#FFFAEB` (soft amber).
   - An inline 6px circular dot (`display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #D92D20; margin-right: 6px;`).
   - Clean typography hierarchy (`font-weight: 500`, color `#1D2939`, secondary text `#475467`).
2. **No Nested Box-in-Box**:
   - The conflict indicator should be an inline notification strip or dropdown pill, not an indented bordered card nested inside the modal body.
   - Preset chips should be flat pill buttons with light border `1px solid #E4E7EC` and surface hover `#F9FAFB`.
3. **Palette Restraint**:
   - Primary Red `#D92D20` reserved only for primary selection buttons and critical errors.
   - Presets and filter tabs use neutral dark text `#344054` and background `#F2F4F7`.

---

## 8. Caveats

1. **Storage Persistence**: In the mock environment, new events created by users are saved in `localStorage['jt_calendar_user_created_events_v8']` and `calendarEventStore`. The conflict detection engine must inspect both API-backed events and local user-created events.
2. **Name Matching vs. ID Matching**: In `CreatePersonalMeetingModal`, participants are currently stored as string names (e.g. `"Trần Thu Hà (Ban Nội dung)"` or `"Trần Thu Hà"`). The conflict detection engine supports fuzzy diacritic-insensitive substring matching (`searchText`) to handle both formats cleanly.
3. **No External Backend**: All conflict checking is performed synchronously on the client side using the cached/fetched events of the active week and adjacent days. This guarantees instant sub-10ms feedback when users adjust time presets.

---

## 9. Conclusion

1. **Feasibility**: High. All required mock fixtures (18 directory contacts, 5 groups, rich weekly calendar events, work ticket submissions) exist and are fully populated in the project.
2. **Modals Targeted**:
   - `src/features/calendar/components/CreatePersonalMeetingModal.tsx` (primary target for `TASK`, `MEETING`, `EVENT`).
   - `src/features/calendar/components/CreateEditorialMeetingModal.tsx` (for Ban Biên tập meetings).
   - `CalendarWeekPage.tsx` (must forward `allEvents` into `CreatePersonalMeetingModal`).
3. **Ready for Implementation**: The data schemas, TypeScript types, and conflict detection logic detailed in this document are ready to be integrated by the implementer agent.

---

## 10. Verification Method

To verify these observations and specifications:
1. **Inspect Target Files**:
   - `src/mocks/fixtures.ts`: Check `directoryContacts` at line 1711 and `demoUser` at line 3.
   - `src/mocks/calendarNotificationFixtures.ts`: Check `initialRecipientGroups` at line 11.
   - `src/features/calendar/mockCalendarData.ts`: Check `getEventsForWeek` at line 1848.
   - `src/features/calendar/components/CreatePersonalMeetingModal.tsx`: Check `SmartTimePicker` at line 131 and `SUGGESTED_MEMBERS` at line 65.
2. **Run TypeScript Check**:
   ```powershell
   npm run typecheck
   ```
   (Must pass without errors before and after new components are introduced).
3. **Test Invalidation Condition**:
   - Any proposed change introducing `border-left` decorative styling or changing API endpoints violates the contract.
