import type React from 'react';
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
  onChange?: (val: TimeSlotValue | Dayjs) => void;
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  existingEvents?: CalendarEvent[];
  currentUserName?: string;
  selectedParticipants?: string[];
  selectedLocation?: string;
  excludeEventId?: string;
  onConflictChange?: (result: ConflictCheckResult) => void;
  disabled?: boolean;
  status?: '' | 'warning' | 'error';
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  mode?: 'single' | 'range';
  allowPast?: boolean;
}

export type ParticipantType = 'person' | 'group';

export interface ParticipantItem {
  id: string;
  name: string;
  penName?: string;
  type?: ParticipantType;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  memberCount?: number; // Only for groups
  members?: string[]; // Only for groups: list of member names
  isFrequent?: boolean; // True if in user's frequent collaborator list
}

export interface DepartmentGroup {
  department: string;
  count: number;
  items: ParticipantItem[];
}

export interface SmartParticipantPickerProps {
  excludeNames?: string[];
  value?: string[]; // Array of selected participant names or IDs
  onChange?: (selected: string[], items?: ParticipantItem[]) => void;
  placeholder?: string;
  maxCount?: number;
  maxSelected?: number; // Alias for maxCount
  allowGroups?: boolean;
  frequentFirst?: boolean;
  showFrequentCollaborators?: boolean;
  showQuickGroups?: boolean;
  departmentFilter?: boolean;
  targetRole?: 'participants' | 'executors' | 'approvers' | 'watchers' | 'attendee';
  role?: 'participants' | 'executors' | 'approvers' | 'watchers' | 'attendee';
  ticketType?: 'TASK' | 'MEETING' | 'EVENT';
  disabled?: boolean;
  status?: '' | 'warning' | 'error';
  className?: string;
  style?: React.CSSProperties;
}
