import { demoUser } from '@/mocks/fixtures';
import type { WorkTicketSubmission } from '@/types/domain';

// Chỉ người phụ trách bước hiện tại mới có quyền Duyệt/Không duyệt — người theo dõi (follower)
// chỉ được xem và bình luận, không được coi là "đang chờ xử lý" dù phiếu ở trạng thái pending_review.
export function isMyTurn(ticket: WorkTicketSubmission) {
  return ticket.status === 'pending' && ticket.steps[ticket.currentStep]?.assignee === demoUser.fullName;
}

export function isFollowing(ticket: WorkTicketSubmission) {
  return ticket.followers.some((follower) => follower.name === demoUser.fullName);
}
