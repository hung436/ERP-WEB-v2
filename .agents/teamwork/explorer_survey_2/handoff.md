# Handoff Report — Explorer 2: Design System & UX Spec Explorer

**Role**: Explorer 2 (Design System, Anti-AI UI & UX Spec Explorer)  
**Working Directory**: `d:\tuoitreproject\ERP-WEB-v2\.agents\teamwork\explorer_survey_2`  
**Date & UTC**: 2026-11-04T17:27:00Z  
**Target Modules**: `CreatePersonalMeetingModal.tsx`, `CreateEditorialMeetingModal.tsx`, `WorkTicketFormModal.tsx`, `/calendar/week`  

---

## 1. Observation

Direct investigation of the codebase and project documentation revealed the following exact facts, line numbers, and architectural patterns:

### 1.1 Anti-AI UI Mandate in Project Contract (`AGENTS.md`)
- **`AGENTS.md: Điều 30` (Những hình thức bị cấm & Chuẩn mực "Anti-AI UI")**:
  > *"NGUYÊN TẮC CỐT LÕI: Tuyệt đối không để người dùng nhận ra hoặc có cảm giác giao diện được sinh ra từ AI.*  
  > *Tuyệt đối không dùng style `border-left` trang trí (ví dụ: `border-left: 3px solid ...` trên thẻ card, dòng danh sách, khối ghi chú, tiêu đề phụ, thông báo...). Đây là dấu hiệu đặc trưng nhất của UI do AI tạo ra. Khi cần phân biệt trạng thái hoặc phân loại, chỉ dùng chấm tròn nhỏ (`6px` dot), chữ màu tinh tế hoặc badge nhẹ.*  
  > *Hạn chế tối đa đóng khung bố cục (`box-in-box`): Không bọc từng mục nhỏ trong khung viền (`border`) + bo góc + đổ bóng lồng bên trong một cột hoặc panel đã có khung. Ưu tiên bố cục danh sách phẳng (flat rows), khoảng trắng (whitespace), phân cấp chữ (typography) và đường kẻ phân cách ngang cực mảnh (`1px solid #f1f5f9`).*  
  > *Màu đỏ thương hiệu `#D92D20` chỉ được dùng có kiểm soát cho: Logo, Primary action, Active navigation, Điểm nhấn. Không dùng đỏ làm màu nền diện rộng."*
- **`AGENTS.md: Điều 47` (Tiêu chí nghiệm thu giao diện)**:
  > *"Có tính thẩm mỹ cao, tự nhiên như sản phẩm được thiết kế thủ công bởi đội ngũ Product Design chuyên nghiệp... Tuyệt đối không sử dụng `border-left` trang trí ở bất kỳ thành phần nào. Hạn chế đóng khung bố cục chồng chéo (`box-in-box`); ưu tiên bề mặt phẳng, thoáng và đường phân cách mảnh."*

### 1.2 Design Tokens and System Architecture
- **`docs/02_KIEN_TRUC_VA_DESIGN_SYSTEM.md` & `tailwind.config.js`**:
  - **Brand Colors**:
    - `Brand Red`: `#D92D20`
    - `Brand Red Hover`: `#B42318`
    - `Brand Red Active`: `#912018`
    - `Brand Red Soft`: `#FEF3F2`
  - **Neutral Colors**:
    - `Text Primary`: `#1D2939` (Hoặc `#0F172A`)
    - `Text Secondary`: `#475467`
    - `Text Muted`: `#667085` (Hoặc `#94A3B8`)
    - `Border`: `#E4E7EC` (Hoặc `#E2E8F0`)
    - `Border Light / Subtle Divider`: `#F1F5F9`
    - `Surface`: `#FFFFFF`
    - `Surface Secondary`: `#F9FAFB`
    - `Page Background`: `#F5F7FA`
  - **Module & Semantic Colors**:
    - `Tasks`: `#D92D20`
    - `Calendar / Meetings`: `#7F56D9` (Soft: `#F4F3FF`)
    - `Chat`: `#039855` (Soft: `#ECFDF3`)
    - `Mail`: `#1570EF` (Soft: `#EFF8FF`)
    - `Announcements / Warning`: `#DC6803` (Soft: `#FFFAEB`, Border: `#FED7AA`)
    - `Success`: `#039855` (Soft: `#ECFDF3`)
    - `Error`: `#D92D20` (Soft: `#FEF3F2`)
  - **Typography**:
    - Primary Font: `Inter, system-ui, sans-serif`
    - Sizes: Micro `11px`, Caption `12-13px`, Body `14px`, Heading Sub `15-16px`, Heading Page `18-20px`
    - Weights: Regular `400`, Medium `500`, Semi-bold `600`, Bold `700`
  - **Radii**: Small `6px`, Medium `10px`, Large `14px`, Pill `999px`, Avatar `50%`.
  - **Shadows**:
    - Soft: `0 1px 2px rgba(16, 24, 40, 0.06)`
    - Card: `0 4px 12px rgba(16, 24, 40, 0.08)`

### 1.3 Reference Anti-AI Implementation in Codebase
- **`src/features/calendar/components/DayScheduleDrawer.tsx` (Lines 209-245)**:
  - Demonstrates the explicit Anti-AI standard:
    ```tsx
    // Màu sắc thẻ theo 3 theme chuẩn Anti-AI (không dùng border-left):
    // - Lịch BBT có tham gia: theme-red (nền phớt đỏ nhạt, viền đỏ nhạt)
    // - Lịch Cá nhân: theme-blue (nền phớt xanh nhạt, viền xanh nhạt)
    // - Lịch BBT không tham gia: theme-gray (nền trắng/xám phẳng, viền xám nhạt)
    ```
- **`src/features/calendar/components/DayScheduleDrawer.css` (Lines 258-275)**:
  - `.day-event-card { display: flex; flex-direction: row; gap: 14px; padding: 12px 14px; border-radius: 10px; }`
  - Completely eliminates `border-left` decoration; uses subtle divider on time column: `border-right: 1px solid #f1f5f9`.

### 1.4 Existing Limitations in Current Target Modals
1. **`CreatePersonalMeetingModal.tsx`**:
   - Lines 131–150: Current `SmartTimePicker` is an elementary wrapper around Antd `DatePicker`:
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
     *Lacks*: Quick date presets, duration chips, conflict detection, auto-synchronization between start/end times.
   - Lines 903–914 & 1144–1150: Current participant picker is a plain Antd `Select mode="multiple"` pointing to `SUGGESTED_MEMBERS`:
     ```tsx
     <Select mode="multiple" allowClear options={SUGGESTED_MEMBERS} placeholder="..." className="jt-modern-select" />
     ```
     *Lacks*: Department filtering tabs, user avatars, frequent collaborator chips, quick groups, 1-click removal tags.
   - Lines 1160–1205: Secondary sub-modal popup for selecting participants also uses the same rudimentary select.
2. **`CreateEditorialMeetingModal.tsx`**:
   - Lines 186–228 & 279–293: Uses standard Antd `Select mode="multiple"` and basic `DatePicker format="DD/MM/YYYY HH:mm"` without quick presets, duration chips, conflict alert, or rich member cards.
3. **`WorkTicketFormModal.tsx`**:
   - Lines 110 & 148: Uses flat `Select mode="multiple"` from `followerOptions` and standard `DatePicker` without presets or conflict detection.
4. **Data Availability**:
   - `src/mocks/fixtures.ts:1711`: 18 detailed `directoryContacts` covering 10+ departments (`Ban Nội dung`, `Văn phòng`, `Ban Bạn đọc`, `Ban Khoa giáo`, `Phòng Lưu trữ`, `Phòng Hành chính`, `Ban Thư ký`, `Ban Thời sự`, `Trung tâm Tư liệu`, `Phòng Công nghệ`, `Ban Văn hóa`, `Ban Thể thao`, `Phòng Tài chính`, `Phòng Tổ chức`).
   - `src/utils/avatar.ts`: `avatarTone(name)` generates cohesive pastel tones (`avatar-tone-0` through `avatar-tone-7`), and `nameInitials(name)` extracts clean 2-letter initials.

---

## 2. Logic Chain

From the direct observations, the reasoning follows:

1. **Anti-AI Rule Enforcement (Observation 1.1, 1.3)**:
   - AI-generated UI typically relies on cheap visual crutches: `border-left: 3px solid #color` to indicate urgency/type, and recursive cards (`card inside card inside card`) to group elements.
   - In professional enterprise software (Google Workspace, Linear, Apple macOS Human Interface), visual structure is established through **whitespace hierarchy (12px, 16px)**, **flat list rows**, **1px micro-dividers (`#f1f5f9`)**, and **subtle 6px dot indicators**.
   - Therefore, any warning banner, member list item, or time preset MUST adhere to flat layout with no `border-left`.

2. **UX Rationale for "Thời gian" (SmartTimePicker) (Observation 1.4.1, 1.4.2)**:
   - In a fast-paced newsroom (Báo Tuổi Trẻ), reporters and editors create meetings and tasks with common cadences: "Hôm nay", "Ngày mai", or "Thứ Hai tuần tới" at standard time slots (09:00, 14:00) lasting 30, 45, or 60 minutes.
   - Requiring users to open an Antd calendar grid, scroll two dropdown columns for hours/minutes, and repeat the process for end-time causes heavy friction (6-8 clicks).
   - Providing **1-touch Date Presets** + **Duration Chips (30m, 45m, 60m, 90m, 120m)** reduces time-selection effort from 8 clicks to **2 clicks**.
   - Furthermore, overlapping assignments are a primary pain point in newsrooms. A **Visual Conflict Warning** that compares input ranges against `existingEvents` in real-time provides high executive value. To comply with Anti-AI rules, this warning must be a soft amber container (`#fffbeb`) with full-perimeter 1px border (`#fed7aa`), 6px amber dot, and an actionable "Dời lịch" chip, strictly avoiding `border-left`.

3. **UX Rationale for "Chọn thành phần" (SmartParticipantPicker) (Observation 1.4.1, 1.4.4)**:
   - A plain multi-select with 18+ contacts in a flat dropdown without visual avatars or departmental scoping is unwieldy.
   - Editors frequently collaborate with the same 4–5 team members (e.g., reporters in their desk). A **"Thường xuyên cộng tác" (Frequent Collaborators)** section allows 1-click addition.
   - For inter-departmental meetings, organizing contacts by **Phòng ban / Ban chuyên môn** (e.g., Ban Biên tập, Ban Nội dung, Văn phòng, Công nghệ) enables quick filtering without typing.
   - Selected members should be displayed as **Rich Avatar Chips** with instant removal (`x`) and overflow management, giving clear situational awareness of attendee count.

---

## 3. Comprehensive UX & Design System Specification

### 3.1 Strict Anti-AI UI Design Guidelines

| Dimension | Prohibited (AI Signature) | Mandatory (Professional Product Design) |
|---|---|---|
| **Border Accents** | `border-left: 3px/4px solid <color>` on cards, rows, alerts, tabs | Clean perimeter borders `1px solid #e2e8f0` or subtle 6px status dot (`width: 6px; height: 6px; border-radius: 50%`) |
| **Layout Nesting** | Nested box-in-box (`card > subcard > item card` with borders & shadows) | Flat lists (flat rows with `1px solid #f1f5f9` dividers), generous whitespace (12-16px) |
| **Brand Color** | Red `#D92D20` flooding large headers, backgrounds, or alerts | Controlled usage: Primary CTA buttons, Tuổi Trẻ mark, active selection dot/indicator |
| **Shadows** | Heavy, dark, multi-tier elevation shadows | Subtle ambient shadow: `0 1px 2px rgba(16, 24, 40, 0.06)` or `none` |
| **Visual Indicators** | Heavy colored icons or bright gradient banners | Micro-dots (`6px`), pastel tone avatars (`avatarTone`), neutral pill tags with 1px border |

---

### 3.2 Specification: Ô "Thời gian" (`SmartTimePicker`)

#### Component Architecture & Layout
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📅 THỜI GIAN                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Hôm nay (T4 06/08)]  [Ngày mai (T5 07/08)]  [Thứ Hai tuần tới (11/08)]  [📅 Tùy chỉnh] │
│                                                                             │
│ 🕒 BẮT ĐẦU: [ 09:00 ▼ ]    ĐẾN: [ 10:00 ]   (Ngày 06/08/2026)              │
│                                                                             │
│ ⏱️ THỜI LƯỢNG:                                                               │
│ [ 30 phút ]  [ 45 phút ]  [● 60 phút (Đang chọn)]  [ 90 phút ]  [ 120 phút ]│
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ CẢNH BÁO TRÙNG LỊCH (Anti-AI Flat Surface, No border-left):              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Phát hiện trùng lịch với 1 sự kiện khác                              │ │
│ │    • 09:00 - 10:30: Họp giao ban Ban Biên tập (Phòng họp 1)             │ │
│ │    [ Gợi ý: Dời sang 10:30 → ]    [ Gợi ý: Chuyển sang 14:00 chiều → ]  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Feature Specifications:
1. **Quick Date Presets Bar**:
   - `Hôm nay`: Ngày hiện tại (`vietnamNow()`).
   - `Ngày mai`: Ngày kế tiếp (`vietnamNow().add(1, 'day')`).
   - `Thứ Hai tuần tới`: Ngày đầu tuần kế tiếp (`vietnamNow().add(1, 'week').startOf('isoWeek')`).
   - `Tùy chọn ngày`: Antd `DatePicker` thu gọn chỉ kích hoạt khi người dùng muốn chọn ngày xa hơn.
   - Active state: Background `#fef3f2`, border `#fecdca`, text `#b42318`, font-weight `600`.
   - Inactive state: Background `#f8fafc`, border `#e2e8f0`, text `#475467`, hover `#f1f5f9`.
2. **Flexible Duration Chips**:
   - Standard presets: `30 phút`, `45 phút`, `60 phút`, `90 phút`, `120 phút`, `Cả ngày` (All Day).
   - Behavior:
     - Selecting a duration chip automatically recalculates `endAt = startAt.add(duration, 'minute')`.
     - Changing `endAt` manually matches the closest chip or marks duration as "Tùy chỉnh".
   - Support for Single Point-in-time (`TASK` / Deadline mode):
     - Displays time presets: `Cuối giờ sáng (11:30)`, `Đầu giờ chiều (14:00)`, `Cuối giờ chiều (17:30)`, `Hết ngày (23:59)`.
3. **Visual Conflict Warning Banner (Anti-AI Compliant)**:
   - **Trigger condition**: When `[startAt, endAt]` overlaps with any event in `existingEvents` for current user / selected room / participants.
   - **Styling**:
     - Background: `#fffbeb` (amber-50).
     - Perimeter border: `1px solid #fed7aa` (amber-200).
     - Radius: `8px`.
     - Padding: `10px 14px`.
     - **STRICTLY NO `border-left`**.
   - **Content**:
     - Status icon: `AlertTriangle` / `ExclamationCircle` (color: `#d97706`, size: `15px`).
     - Title: `"Phát hiện trùng lịch sự kiện (" + count + ")"` (font-weight: `600`, color: `#92400e`).
     - Overlapping item: Bulleted with `6px` circular amber dot (`#d97706`).
     - Actionable Resolution Chips: Quick buttons that adjust `startAt` to the first available slot immediately after the conflicting event (e.g., `"Dời sang 10:30"`).

#### TypeScript Interface Proposal:
```typescript
export interface SmartTimePickerValue {
  date: Dayjs;
  startAt: Dayjs;
  endAt?: Dayjs;
  durationMinutes?: number;
  isAllDay?: boolean;
}

export interface SmartTimePickerProps {
  mode?: 'single' | 'range'; // 'single' for Task/Event deadline, 'range' for Meeting
  value?: Dayjs | [Dayjs, Dayjs] | SmartTimePickerValue;
  onChange?: (val: Dayjs | [Dayjs, Dayjs] | SmartTimePickerValue) => void;
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  existingEvents?: CalendarEvent[];
  participants?: string[];
  disabled?: boolean;
  className?: string;
}
```

---

### 3.3 Specification: Ô "Chọn thành phần" (`SmartParticipantPicker`)

#### Component Architecture & Layout
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 👥 CHỌN THÀNH PHẦN                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏷️ ĐÃ CHỌN (3):                                                             │
│ [ (MA) Nguyễn Minh Anh ✕ ]  [ (TH) Trần Thu Hà ✕ ]  [ (TV) Lê Thanh Vân ✕ ] │
│                                                              [ Xóa tất cả ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⭐ THƯỜNG XUYÊN CỘNG TÁC:                                                   │
│ [ + (TN) Nguyễn Tấn Đạt ]  [ + (QH) Đỗ Quang Huy ]  [ + (AT) Bùi Anh Tú ]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏢 LỌC THEO PHÒNG BAN:                                                      │
│ [ Tất cả (18) ] [ Ban Biên tập (3) ] [ Ban Nội dung (4) ] [ Văn phòng (3) ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔍 [ Tìm theo họ tên, bút danh, phòng ban...                              ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 DANH SÁCH NHÂN SỰ (Flat Rows, No Box-in-Box):                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ (MA)  Nguyễn Minh Anh (Minh Anh)              Phóng viên · Ban Nội dung  │ │
│ │       minhanh@noibo.vn · Máy lẻ 2101                         [ ✓ Đã chọn]│ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ (TH)  Trần Thu Hà (Thu Hà)                  Phó Trưởng ban · Ban Nội dung │ │
│ │       thuhatran@noibo.vn · Máy lẻ 2102                       [ ✓ Đã chọn]│ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ (PL)  Phạm Đức Long                                Chuyên viên · Văn phòng│ │
│ │       duclong@noibo.vn · Máy lẻ 2201                               [ + ]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Feature Specifications:
1. **Department & Editorial Unit Filter Tabs**:
   - Filter bar using light pill tabs or Antd `Segmented` / horizontal scroll buttons:
     - `Tất cả (18)`
     - `Ban Biên tập (3)`
     - `Ban Nội dung & Thời sự (6)`
     - `Khối Chuyên đề (Khoa giáo, Bạn đọc, Văn hóa, Thể thao) (5)`
     - `Văn phòng & Công nghệ (4)`
   - Dynamically filters the contact list instantly with zero lag.
2. **Frequent Collaborators (Thường xuyên cộng tác)**:
   - Evaluates the top 4–6 contacts most frequently assigned or scheduled with the current user.
   - Rendered as lightweight interactive pills with 20px pastel avatars and a `+` badge.
   - Clicking a chip adds the member directly to the selection.
3. **Quick Group Selection (Nhóm cộng tác nhanh)**:
   - Preset groups: `"Ban Thư ký tòa soạn"`, `"Tổ Phóng viên Nội dung"`, `"Ban Bạn đọc"`.
   - 1-click adds all group members simultaneously.
4. **Selected Tags Bar**:
   - Each selected member is displayed as an avatar tag:
     - Circular avatar `18px` with tone from `avatarTone(name)`.
     - Full name / short name.
     - Single-touch `CloseOutlined` (`✕`) remove button.
   - "Xóa tất cả" link appears when `selected.length >= 2`.
5. **Flat Contact List with Avatar & Metadata**:
   - Each row is a flat grid: `[Avatar 32px] [Name + Pen Name + Department + Email] [Checkmark / Select Button]`.
   - Hover state: Background `#f8fafc`.
   - Border divider: `border-bottom: 1px solid #f1f5f9`.
   - **NO box-in-box cards**: No individual card borders around each person inside the list container.
6. **Multi-Role Support**:
   - Configurable for:
     - `participants`: General attendees (Lịch họp / Sự kiện).
     - `executors`: Main assignees (Phiếu công việc).
     - `approvers`: Leaders responsible for approval.
     - `watchers`: People who follow and receive read-only notifications.

#### TypeScript Interface Proposal:
```typescript
export interface SmartParticipantPickerProps {
  value?: string[]; // Member names or IDs
  onChange?: (val: string[]) => void;
  placeholder?: string;
  role?: 'participants' | 'executors' | 'approvers' | 'watchers';
  maxSelected?: number;
  showFrequentCollaborators?: boolean;
  showQuickGroups?: boolean;
  departmentFilter?: boolean;
  disabled?: boolean;
  className?: string;
}
```

---

## 4. Caveats

1. **Local State vs Backend Directory Synchronization**:
   - In the mock environment, `directoryContacts` in `src/mocks/fixtures.ts` contains 18 records. Future backend integration should allow `SmartParticipantPicker` to either accept an external contact list via props or fetch via `directoryApi.list()`.
2. **Conflict Checking Scope**:
   - Conflict detection in this prototype operates against client-side events loaded in `CalendarWeekPage` (`userCreatedEvents` and `rawEvents`). It does not simulate live external calendar synchronizations (Google Calendar or Exchange Server), which is explicitly out of scope per Điều 9 of `AGENTS.md`.
3. **Form Integration**:
   - Both components must support standard Ant Design Form integration (`value` and `onChange` props) so they can seamlessly replace `<DatePicker>` and `<Select>` inside `<Form.Item name="time">` and `<Form.Item name="participants">` without breaking existing form submission handlers.

---

## 5. Conclusion

1. **Current State**: Existing pickers in `CreatePersonalMeetingModal.tsx`, `CreateEditorialMeetingModal.tsx`, and `WorkTicketFormModal.tsx` are generic Ant Design inputs that require high manual effort and lack domain-specific assistance (presets, duration calculation, conflict detection, department filtering, collaborator shortcuts).
2. **Anti-AI Feasibility**: Implementing `SmartTimePicker` and `SmartParticipantPicker` with flat rows, 1px `#f1f5f9` micro-dividers, 6px dots, and soft full-perimeter borders (`#fed7aa`) completely satisfies the Anti-AI mandate (zero `border-left`, zero nested boxes).
3. **Next Steps for Architecture & Implementation**:
   - Architect will specify file paths (`src/features/calendar/components/SmartTimePicker.tsx`, `src/features/calendar/components/SmartParticipantPicker.tsx`, and shared styling).
   - Implementers will plug these components into `CreatePersonalMeetingModal.tsx`, `CreateEditorialMeetingModal.tsx`, and `WorkTicketFormModal.tsx`.

---

## 6. Verification Method

Independent verification of the specifications and compliance can be performed as follows:

### 6.1 Codebase Inspection Check
1. **No Decorative `border-left`**:
   - Command:
     ```powershell
     Select-String -Path "src/features/calendar/components/*.tsx","src/features/calendar/components/*.css" -Pattern "border-left:\s*[2-9]px"
     ```
   - Expectation: Zero matches for decorative colored left borders.
2. **Component Integration Points**:
   - Inspect `src/features/calendar/components/CreatePersonalMeetingModal.tsx` at lines 880–915 and 998–1150 to confirm `<SmartTimePicker>` and `<SmartParticipantPicker>` replace `<DatePicker>` and `<Select mode="multiple">`.
   - Inspect `src/features/calendar/components/CreateEditorialMeetingModal.tsx` at lines 172–202 and 278–293.

### 6.2 Standard Project Test Commands
Run the standard validation commands to confirm zero regressions:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
All commands must execute and pass without errors.
