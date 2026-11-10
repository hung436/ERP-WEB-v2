# Handoff Report: Codebase & Calendar Modals Investigation

**Agent**: Explorer 1 (Codebase & Calendar Modals Explorer)  
**Working Directory**: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_1`  
**Milestone**: Investigation & Survey Complete  
**Date**: 2026-11-04 (UTC)

---

## 1. Observation

### 1.1 Routing & Calendar Page Shell
- **Routing**: In `src/routes/AppRoutes.tsx`:
  - Line 60: `<Route path="calendar" element={<Navigate replace to="/calendar/week" />} />`
  - Line 61: `<Route path="calendar/week" element={<CalendarWeekPage />} />`
  - Lines 62-65: Sub-routes `/calendar/notifications` (`CalendarNotificationsPage`) and `/calendar/groups` (`CalendarGroupsPage`) wrapped by `<AdminRoute fallback="/calendar/week" />`.
- **CalendarWeekPage Component**: `src/features/calendar/CalendarWeekPage.tsx` (1,198 lines):
  - State management:
    - `userCreatedEvents`: stored in state (lines 96-149) and persisted to `localStorage` under key `jt_calendar_events_v8`.
    - `allEvents`: derived via `getEventsForWeek(week, rawEvents)` (lines 152-157).
    - `createDate`: `Dayjs | null` (line 176). Triggered by toolbar "+ Tạo" button (line 1080: `onClick={() => setCreateDate(selectedDate)}`) or from `DayScheduleDrawer.tsx` (line 130: `onCreateEvent={(day) => setCreateDate(day)}`).
    - `editingEvent`: `CalendarEvent | null` (line 177).
    - `selectedEvent`: `CalendarEvent | null` (line 173).
  - Modal rendering in `CalendarWeekPage.tsx`:
    - Lines 1161-1170: `<CalendarEventDetailModal key={selectedEvent.id} event={selectedEvent} open={Boolean(selectedEvent)} ... />`
    - Lines 1172-1191:
      ```tsx
      {(createDate || editingEvent) && (
        <CreatePersonalMeetingModal
          open={Boolean(createDate || editingEvent)}
          initialDate={createDate}
          editingEvent={editingEvent}
          onClose={() => {
            setCreateDate(null);
            setEditingEvent(null);
          }}
          onSuccess={(record) => {
            if (editingEvent) {
              handleUpdateEvent(record);
            } else {
              handleCreateSuccess(record);
            }
            setEditingEvent(null);
            setCreateDate(null);
          }}
        />
      )}
      ```

---

### 1.2 Target Modals & Current Implementations

#### A. `CreatePersonalMeetingModal.tsx` (`src/features/calendar/components/CreatePersonalMeetingModal.tsx`)
This modal handles **all 3 main ticket types** in the week calendar:
1. `TASK`: **"Phiếu công việc"** (Booking / Job Ticket)
2. `MEETING`: **"Lịch họp"** (Personal Meeting)
3. `EVENT`: **"Sự kiện"** (Agency Event)

- **Step Architecture**:
  - `step === 0` (lines 627-657): Template Picker modal (`jt-user-template-modal`). Renders cards for `TASK` ("Phiếu công việc"), `MEETING` ("Lịch họp"), and `EVENT` ("Sự kiện"). Clicking a card transitions to `step = 1`.
  - `step === 1` (lines 659-1157): Form modal (`jt-create-template-modal`, width `680px`).
- **Current Date/Time Picker**:
  - Embedded component `SmartTimePicker` (lines 125-150):
    ```tsx
    function SmartTimePicker({ value, onChange }: SmartTimePickerProps) {
      return (
        <DatePicker
          value={value}
          onChange={(val) => { if (val) onChange?.(val); }}
          showTime={{ format: "HH:mm" }}
          format="HH:mm DD/MM/YYYY"
          needConfirm
          allowClear={false}
          className="jt-modern-picker"
          style={{ width: "100%", height: 36, borderRadius: 6 }}
          placeholder="Chọn thời gian..."
        />
      );
    }
    ```
  - Used at:
    - Line 895: `<SmartTimePicker ticketType={ticketType} />` (inside Form.Item `name="time"` for `TASK` and `EVENT`).
    - Line 1014: `<SmartTimePicker ticketType="MEETING" />` (inside Form.Item `name="startAt"` for `MEETING`).
  - **Deficiencies observed**:
    - No presets ("Hôm nay", "Ngày mai", next weekdays).
    - No duration selection (30m, 45m, 60m, 90m).
    - Zero conflict detection (does not check against existing events in the calendar).
- **Current Participant Selection**:
  - Uses static constant `SUGGESTED_MEMBERS` (lines 65-97), containing 13 flat strings:
    - e.g. `"Nguyễn Minh Anh (Phóng viên)"`, `"Trần Thu Hà (Ban Nội dung)"`, `"Lê Thanh Vân (Văn phòng)"`, `"Nguyễn Tấn Đạt (Phó Tổng Biên tập)"`.
  - Used at:
    - Line 903: `<Select mode="multiple" allowClear options={SUGGESTED_MEMBERS} placeholder={ticketType === "TASK" ? "Chọn thành phần thực hiện công việc..." : "Chọn thành phần tham gia sự kiện..."} className="jt-modern-select" />` (Form.Item `name="participants"`).
    - Line 1144: `<Select mode="multiple" options={SUGGESTED_MEMBERS} placeholder="Chọn nhân sự tham dự cuộc họp..." className="jt-modern-select" />` (Form.Item `name="participants"`).
    - Sub-modal `showParticipantModal` (line 1196): `<Select mode="multiple" options={SUGGESTED_MEMBERS} ... />`.
    - Sub-modal `showApproverModal` (line 1238): `<Select mode="multiple" options={SUGGESTED_MEMBERS} ... />`.
  - **Deficiencies observed**:
    - Flat list without department filtering/tabs.
    - No avatar visuals or role indicators in tags.
    - No frequent collaborator recommendation chips.

---

#### B. `CreateEditorialMeetingModal.tsx` (`src/features/calendar/components/CreateEditorialMeetingModal.tsx`)
Used in `CalendarNotificationsPage.tsx` (lines 9, 234) for editorial board announcements & meetings.
- **Current Date/Time Picker**:
  - Lines 283-292:
    ```tsx
    <DatePicker
      allowClear
      format="DD/MM/YYYY HH:mm"
      minDate={dayjs()}
      placeholder="Chọn ngày & giờ hẹn gửi"
      showTime={{ format: 'HH:mm' }}
      size="middle"
      style={{ width: '100%' }}
    />
    ```
  - Inside Form.Item `name="scheduledAt"`.
- **Current Participant Selection**:
  - Lines 173-228:
    - `recipientType`: `'groups' | 'individuals' | 'all'`.
    - If `groups`: AntD `<Select mode="multiple" options={groupOptions} ... />` loaded via `calendarGroupApi.list()`.
    - If `individuals`: AntD `<Select mode="multiple" options={individualOptions} ... />` loaded via `directoryApi.list()`.
    - No quick avatar tags, no frequent collaborator shortcuts.

---

#### C. `CalendarEventDetailModal.tsx` (`src/features/calendar/components/CalendarEventDetailModal.tsx`)
- Lines 2178-2187: When editing event time in the detail modal, it currently renders a bare AntD `DatePicker`:
  ```tsx
  <DatePicker
    allowClear={false}
    format="HH:mm DD/MM/YYYY"
    id="edit-ticket-datetime"
    needConfirm
    onChange={(val) => setEditDateTime(val)}
    showTime={{ format: 'HH:mm' }}
    style={{ width: '100%' }}
    value={editDateTime}
  />
  ```
- Line 2004: When adding watchers/followers, uses `SUGGESTED_MEMBERS`.

---

#### D. `WorkTicketFormModal.tsx` (`src/features/work-tickets/components/WorkTicketFormModal.tsx`)
- Formal administrative ticket form ("PHIẾU CÔNG VIỆC", "ĐƠN XIN NGHỈ PHÉP", "PHIẾU ĐỀ XUẤT V/v đi nước ngoài").
- Uses `followerOptions` from `src/mocks/workTicketFixtures.ts` and date-only `DatePicker` (`DD/MM/YYYY`).

---

### 1.3 Available Data Sources in Codebase

| Data Entity | Source File | Data Structure & Attributes | Available Contacts / Groups |
|---|---|---|---|
| **Directory Contacts** | `src/mocks/fixtures.ts` (lines 1711-1730) | `DirectoryContact` (`id`, `fullName`, `penName`, `department`, `phone`, `email`, `extension`) | 18 staff across 10+ departments: Ban Nội dung, Văn phòng, Ban Bạn đọc, Ban Khoa giáo, Phòng Lưu trữ, Phòng Hành chính, Ban Thư ký, Ban Thời sự, Trung tâm Tư liệu, Phòng Công nghệ, Ban Văn hóa, Ban Thể thao, Phòng Tài chính, Phòng Tổ chức |
| **Recipient Groups** | `src/mocks/calendarNotificationFixtures.ts` (lines 11-52) | `CalendarRecipientGroup` (`id`, `name`, `description`, `members: string[]`, `status`) | 5 groups: Ban Biên tập, Ban Thư ký tòa soạn & BTV chính, Phóng viên Ban Thời sự & Nội dung, Tổ Chuyển đổi số & Công nghệ, Hội đồng Tuyển dụng |
| **Followers / Staff** | `src/mocks/workTicketFixtures.ts` (lines 12-20) | `WorkTicketFollower` (`id`, `name`, `positionName`, `departmentName`) | 7 key leaders & specialists |
| **Calendar Events** | `src/features/calendar/mockCalendarData.ts` & `src/mocks/fixtures.ts` | `CalendarEvent` (`id`, `title`, `startAt`, `endAt`, `location`, `participants: string[]`, `organizer`, `leader`, `ticketType`) | Rich events in Week 41 & Week 42 for testing overlap / conflicts |

---

## 2. Logic Chain

1. **Unification of Modal Roles**:
   - The user request targets "các modal tạo lịch họp và phiếu công việc trong phân hệ Lịch làm việc (`/calendar/week`)".
   - `CreatePersonalMeetingModal.tsx` is the unified modal governing both "Lịch họp" (`ticketType === "MEETING"`), "Phiếu công việc" (`ticketType === "TASK"`), and "Sự kiện" (`ticketType === "EVENT"`).
   - `CreateEditorialMeetingModal.tsx` governs editorial board meetings.

2. **Integration Architecture for "Thời gian" (R1)**:
   - Create a reusable, modular component: `EnhancedTimePicker.tsx` in `src/features/calendar/components/`.
   - **Form Contract**:
     - Form value is a `Dayjs` object (or optional end time / duration).
     - Compatible with AntD Form `value` / `onChange` protocol.
   - **Features to implement**:
     - **Preset buttons**: "Hôm nay", "Ngày mai", "Đầu tuần tới", "Cuối tuần".
     - **Time slot & Duration selector**:
       - Start time picker + quick duration chips: `30 phút`, `45 phút`, `60 phút`, `90 phút`, `120 phút`.
       - Automatic calculation of `endAt = startAt.add(duration, 'minute')`.
     - **Conflict Detection Engine**:
       - Receive `existingEvents?: CalendarEvent[]` (passed from `CalendarWeekPage` or fetched via `calendarApi`).
       - Check if `[proposedStart, proposedEnd]` overlaps with any event where the current user or selected participants are involved.
       - Display a clean Anti-AI warning:
         - Subtle red or amber banner (e.g. background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`).
         - **STRICT ANTI-AI**: Absolutely NO `border-left` decoration (e.g. no `border-left: 3px solid #ef4444`).
         - Shows exact conflicting event title and time slot (e.g. *"Trùng giờ với: Họp giao ban tin ca 1 (08:30 - 09:30)"*).

3. **Integration Architecture for "Chọn thành phần" (R2)**:
   - Create a reusable, modular component: `EnhancedParticipantSelector.tsx` in `src/features/calendar/components/`.
   - **Form Contract**:
     - Value: `string[]` (names of selected members or composite id/name).
     - Compatible with AntD Form `value` / `onChange`.
   - **Features to implement**:
     - **Department / Unit Quick Filter**: Tabs or pill filter for "Tất cả", "Ban Biên tập", "Ban Nội dung", "Ban Thời sự", "Ban Thư ký", "Phòng Công nghệ", "Văn phòng".
     - **Frequent Collaborators (Cộng tác thường xuyên)**:
       - 4-5 quick addition chips at the top:
         - Trần Thu Hà (Ban Nội dung)
         - Nguyễn Hoài Nam (Ban Bạn đọc)
         - Lê Thanh Vân (Văn phòng)
         - Đỗ Quang Huy (Ban Khoa giáo)
         - Nguyễn Tấn Đạt (Phó Tổng Biên tập)
       - Clicking a chip immediately adds them if not already selected.
     - **Avatar & Identity Display**:
       - Tag rendering in the input: 20px circular avatar with name initials + distinct color tone (`avatarTone(name)` from `@/utils/avatar`), user's full name, and removable close icon.
       - Dropdown menu items: Display avatar, full name, pen name (bút danh), position, and department badge.

4. **Integration Points in Target Files**:

| Target File | Exact Lines to Modify | Proposed Replacement | Backward Compatibility |
|---|---|---|---|
| `CalendarWeekPage.tsx` | Line 1173 | Pass `existingEvents={allEvents}` into `<CreatePersonalMeetingModal>` | Existing save handlers remain unchanged |
| `CreatePersonalMeetingModal.tsx` | Lines 99-106 | Add `existingEvents?: CalendarEvent[]` to `CreatePersonalMeetingModalProps` | Default to empty array if omitted |
| `CreatePersonalMeetingModal.tsx` | Lines 894-896 & 1013-1015 | Replace `<SmartTimePicker>` with `<EnhancedTimePicker existingEvents={existingEvents} ... />` | Field names `time` and `startAt` preserved |
| `CreatePersonalMeetingModal.tsx` | Lines 903-914 & 1144-1150 | Replace `<Select options={SUGGESTED_MEMBERS}>` with `<EnhancedParticipantSelector ... />` | Field name `participants` preserved |
| `CreatePersonalMeetingModal.tsx` | Lines 1196-1204 & 1238-1246 | Sub-modals for Deploy & Propose can also leverage `<EnhancedParticipantSelector>` | Maintains validation rules |
| `CreateEditorialMeetingModal.tsx` | Lines 283-292 | Replace basic `DatePicker` with `<EnhancedTimePicker>` | Field name `scheduledAt` preserved |
| `CreateEditorialMeetingModal.tsx` | Lines 209-220 | Replace individual select with `<EnhancedParticipantSelector>` | `selectedIndividuals` array preserved |

5. **Anti-AI UI Guardrails (R3 & AGENTS.md)**:
   - No `border-left` decorative indicators on conflict banners, cards, or chips.
   - Flat rows, whitespace separation, thin dividers (`1px solid #f1f5f9`), 6px dot status indicators.
   - Brand Red `#D92D20` reserved strictly for primary actions ("Tạo", "Lưu thay đổi", active tab highlight).

---

## 3. Caveats

1. **Scope Boundary**:
   - The task is frontend prototype enhancement. Backend and database persistence are out of scope (handled via mock API and local storage `jt_calendar_events_v8`).
2. **Test Assertions in `calendar-week.test.tsx`**:
   - Tests currently verify exact DOM text including `"Thời gian"`, `"Nội dung"`, `"Chọn thành phần"`, `"Thành phần tham gia"`, `"Phiếu công việc"`, `"Lịch họp"`, `"Tạo"`, `"Triển khai"`, `"Đề xuất"`.
   - Any new component markup must preserve these accessible names and labels to prevent test regressions.
3. **Data Type Preservation**:
   - AntD Form expects `dayjs` instance for time fields and `string[]` for participant fields. Preserving these exact signatures ensures 100% interoperability with `handleExecuteFinalSubmit`.

---

## 4. Conclusion

- The codebase has clean, modular entry points for both Time picking and Participant selection.
- All target modals (`CreatePersonalMeetingModal.tsx`, `CreateEditorialMeetingModal.tsx`, and `CalendarEventDetailModal.tsx`) are identified with exact line numbers.
- Full directory mock data (`directoryContacts`, `chatMembers`, `initialRecipientGroups`) already exists in `src/mocks/fixtures.ts` and can be leveraged immediately for department categorization, avatars, and frequent collaborator suggestions.
- Implementing two focused components (`EnhancedTimePicker.tsx` and `EnhancedParticipantSelector.tsx`) will satisfy all requirements of R1, R2, and R3 while maintaining zero regressions across the codebase.

---

## 5. Verification Method

To independently verify these findings:
1. Inspect routes: `AppRoutes.tsx` lines 60-65.
2. Inspect modal triggers: `CalendarWeekPage.tsx` lines 1076-1083 and lines 1172-1191.
3. Inspect `CreatePersonalMeetingModal.tsx` lines 37-63 (`TICKET_TYPE_ITEMS`), lines 125-150 (`SmartTimePicker`), lines 894-914 (`TASK` fields), lines 998-1038 and 1127-1151 (`MEETING` fields).
4. Run project verification commands:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
