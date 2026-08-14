import { Navigate, Route, Routes } from 'react-router-dom';

import { AccountProfilePage } from '@/features/account/AccountProfilePage';
import { AnnouncementsPage } from '@/features/announcements/AnnouncementsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { CalendarGroupsPage } from '@/features/calendar/CalendarGroupsPage';
import { CalendarNotificationsPage } from '@/features/calendar/CalendarNotificationsPage';
import { MeetingPage } from '@/features/meeting/MeetingPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DirectoryPage } from '@/features/directory/DirectoryPage';
import { CreateDocumentTemplatePage } from '@/features/documents/CreateDocumentTemplatePage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { DocumentStatisticsPage } from '@/features/documents/DocumentStatisticsPage';
import { DocumentTemplatesPage } from '@/features/documents/DocumentTemplatesPage';
import { MailPage } from '@/features/mail/MailPage';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { EvaluationsPage } from '@/features/evaluations/EvaluationsPage';
import { CreatePersonnelPage } from '@/features/personnel/CreatePersonnelPage';
import { PersonnelChangeRequestsPage } from '@/features/personnel/PersonnelChangeRequestsPage';
import { PersonnelDataExtractionPage } from '@/features/personnel/PersonnelDataExtractionPage';
import { PersonnelListPage } from '@/features/personnel/PersonnelListPage';
import { PersonnelManagementPage } from '@/features/personnel/PersonnelManagementPage';
import { PersonnelPermissionsPage } from '@/features/personnel/PersonnelPermissionsPage';
import { PersonnelProfilePage } from '@/features/personnel/PersonnelProfilePage';
import { AppLayout } from '@/layouts/AppLayout';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/templates" element={<DocumentTemplatesPage />} />
          <Route path="documents/templates/create" element={<CreateDocumentTemplatePage />} />
          <Route path="documents/templates/edit/:id" element={<CreateDocumentTemplatePage />} />
          <Route path="documents/statistics" element={<DocumentStatisticsPage />} />
          <Route path="evaluations" element={<EvaluationsPage />} />
          <Route path="personnel" element={<Navigate replace to="/personnel/profile" />} />
          <Route path="personnel/list" element={<PersonnelListPage />} />
          <Route path="personnel/management" element={<PersonnelManagementPage />} />
          <Route path="personnel/extraction" element={<PersonnelDataExtractionPage />} />
          <Route path="personnel/permissions" element={<PersonnelPermissionsPage />} />
          <Route path="personnel/change-requests" element={<PersonnelChangeRequestsPage />} />

          <Route path="personnel/profile" element={<PersonnelProfilePage />} />
          <Route path="personnel/resume/:id" element={<PersonnelProfilePage />} />
          <Route path="personnel/create" element={<CreatePersonnelPage />} />
          <Route path="personnel/edit/:id" element={<CreatePersonnelPage />} />
          <Route path="calendar" element={<CalendarNotificationsPage />} />
          <Route path="calendar/notifications" element={<CalendarNotificationsPage />} />
          <Route path="calendar/groups" element={<CalendarGroupsPage />} />
          <Route path="account" element={<AccountProfilePage />} />
          <Route path="meeting" element={<MeetingPage />} />
          <Route path="meetings" element={<MeetingPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="mail" element={<MailPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
