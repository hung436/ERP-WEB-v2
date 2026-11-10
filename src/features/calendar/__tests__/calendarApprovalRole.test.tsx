import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import * as authContext from '@/features/auth/AuthContext';
import { demoUsers } from '@/mocks/usersFixtures';
import type { CalendarEvent, User } from '@/types/domain';

import { CalendarEventDetailModal } from '../components/CalendarEventDetailModal';

describe('CalendarEventDetailModal Approval Roles for Demo Accounts', () => {
  const proposalEvent: CalendarEvent = {
    id: 'prop-event-01',
    title: 'Đề xuất kế hoạch tổ chức tuyến bài điều tra đô thị',
    type: 'event',
    ticketType: 'EVENT',
    workflowType: 'PROPOSAL',
    scope: 'personal',
    organizer: 'Nguyễn Minh Anh',
    leader: undefined,
    startAt: '2026-11-08T15:00:00Z',
    endAt: '2026-11-08T17:30:00Z',
    approvalStatus: 'PENDING',
    isUserParticipant: false,
    participants: ['Nguyễn Minh Anh', 'Lê Thanh Vân'],
    approvers: [
      { id: 'user-xuantrung', name: 'Lê Xuân Trung (Phó Tổng Biên tập)', status: 'PENDING' },
    ],
    agenda: 'Đề xuất kế hoạch tổ chức tuyến bài điều tra đô thị',
  };

  it('Lãnh đạo xuantrung (APPROVER) khi mở phiếu đề xuất PENDING sẽ thấy nút Duyệt phiếu', () => {
    const leaderUser: User = {
      id: 'user-xuantrung',
      username: 'xuantrung',
      fullName: 'Lê Xuân Trung',
      penName: 'Xuân Trung',
      email: 'xuantrung@tuoitre.com.vn',
      department: 'Ban Biên tập',
      position: 'Phó Tổng Biên tập',
      role: 'leadership',
    };

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: leaderUser,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      isInitializing: false,
    });

    render(
      <CalendarEventDetailModal
        event={proposalEvent}
        onClose={vi.fn()}
        onUpdateEvent={vi.fn()}
        open={true}
      />
    );

    expect(screen.getByText('Chi tiết phiếu')).toBeInTheDocument();
    const approveBtn = screen.getByRole('button', { name: /Duyệt phiếu/i });
    expect(approveBtn).toBeInTheDocument();
  });

  it('Phóng viên minhanh (CREATOR) khi mở phiếu đề xuất PENDING sẽ KHÔNG thấy nút Duyệt phiếu', () => {
    const reporterUser: User = {
      id: 'user-001',
      username: 'minhanh',
      fullName: 'Nguyễn Minh Anh',
      penName: 'Minh Anh',
      email: 'minhanh@tuoitre.com.vn',
      department: 'Ban Thời sự',
      position: 'Phóng viên',
      role: 'employee',
    };

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: reporterUser,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      isInitializing: false,
    });

    render(
      <CalendarEventDetailModal
        event={proposalEvent}
        onClose={vi.fn()}
        onUpdateEvent={vi.fn()}
        open={true}
      />
    );

    expect(screen.getByText('Chi tiết phiếu')).toBeInTheDocument();
    const approveBtn = screen.queryByRole('button', { name: /Duyệt phiếu/i });
    expect(approveBtn).toBeNull();
  });

  it('mỗi người duyệt chỉ cập nhật dòng của mình và phiếu chờ đủ lượt duyệt', async () => {
    const account = (username: string) => demoUsers.find((user) => user.username === username)!;
    const first = account('hoangnguyen');
    const second = account('xuantoan');
    const auth = vi.spyOn(authContext, 'useAuth');
    const signIn = (user: User) => auth.mockReturnValue({
      user, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn(), isInitializing: false,
    });
    const event: CalendarEvent = {
      ...proposalEvent,
      id: 'multiple-approvers-test',
      approvers: [first, second].map((user) => ({ id: user.id, name: user.fullName, status: 'PENDING' })),
    };
    const updated = vi.fn<(event: CalendarEvent) => void>();
    const view = (record: CalendarEvent) => (
      <CalendarEventDetailModal event={record} onClose={vi.fn()} onUpdateEvent={updated} open />
    );
    const approve = async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Duyệt phiếu' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận duyệt' }));
    };

    signIn(first);
    const { rerender } = render(view(event));
    await approve();
    const partial = updated.mock.calls[0][0];
    expect(partial.approvalStatus).toBe('PENDING');
    expect(partial.approvers?.map((person) => person.status)).toEqual(['APPROVED', 'PENDING']);

    signIn(second);
    rerender(view(partial));
    await approve();
    const complete = updated.mock.calls[1][0];
    expect(complete.approvalStatus).toBe('APPROVED');
    expect(complete.approvers?.map((person) => person.status)).toEqual(['APPROVED', 'APPROVED']);
  });
});
