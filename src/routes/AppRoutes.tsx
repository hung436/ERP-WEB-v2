import { Route, Routes } from 'react-router-dom';

import { AnnouncementsPage } from '@/features/announcements/AnnouncementsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DirectoryPage } from '@/features/directory/DirectoryPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { MailPage } from '@/features/mail/MailPage';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { EvaluationsPage } from '@/features/evaluations/EvaluationsPage';
import { PersonnelProfilePage } from '@/features/personnel/PersonnelProfilePage';
import { AppLayout } from '@/layouts/AppLayout';

export function AppRoutes() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route index element={<DashboardPage />} /><Route path="tasks" element={<TasksPage />} /><Route path="documents" element={<DocumentsPage />} /><Route path="evaluations" element={<EvaluationsPage />} /><Route path="personnel/profile" element={<PersonnelProfilePage />} /><Route path="calendar" element={<CalendarPage />} /><Route path="chat" element={<ChatPage />} /><Route path="mail" element={<MailPage />} /><Route path="announcements" element={<AnnouncementsPage />} /><Route path="directory" element={<DirectoryPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Route></Routes>;
}
