import React from 'react';
import { Button, Popconfirm, Tag, Tooltip, message } from 'antd';
import {
  Crown,
  FileEdit,
  MessageSquare,
  RotateCcw,
  User,
  Wrench,
} from 'lucide-react';

export type SimulationRole = 'approver' | 'creator' | 'executor' | 'consultee';

export interface SimulationRoleInfo {
  id: SimulationRole;
  title: string;
  userName: string;
  roleTitle: string;
  description: string;
  icon: React.ReactNode;
  tagColor: string;
}

export const SIMULATION_ROLES: SimulationRoleInfo[] = [
  {
    id: 'approver',
    title: 'Lãnh đạo phê duyệt',
    userName: 'Nguyễn Tấn Đạt',
    roleTitle: 'Phó Tổng Biên tập',
    description: 'Có quyền Duyệt, Không duyệt, hoặc Lấy ý kiến tham vấn (Phiếu công việc & Sự kiện)',
    icon: <Crown size={15} style={{ color: '#d97706' }} />,
    tagColor: 'gold',
  },
  {
    id: 'creator',
    title: 'Người tạo phiếu / Trưởng ban',
    userName: 'Bùi Lê Thế Kiệt',
    roleTitle: 'Trưởng ban Công nghệ',
    description: 'Khởi tạo phiếu mới (3 loại), sửa nội dung phiếu, thêm người theo dõi, thu hồi/hủy phiếu',
    icon: <FileEdit size={15} style={{ color: '#2563eb' }} />,
    tagColor: 'blue',
  },
  {
    id: 'executor',
    title: 'Người triển khai',
    userName: 'Nguyễn Minh Anh',
    roleTitle: 'Phóng viên / Chuyên viên',
    description: 'Tiếp nhận phân công, gửi trao đổi thảo luận, bấm "Hoàn thành" báo cáo kết quả',
    icon: <Wrench size={15} style={{ color: '#16a34a' }} />,
    tagColor: 'green',
  },
  {
    id: 'consultee',
    title: 'Người được lấy ý kiến',
    userName: 'TS. Trần Quốc Hùng',
    roleTitle: 'Chuyên gia khách mời',
    description: 'Nhận yêu cầu tham vấn từ Lãnh đạo -> Viết ý kiến phản hồi & gửi lại cho Người duyệt',
    icon: <MessageSquare size={15} style={{ color: '#7c3aed' }} />,
    tagColor: 'purple',
  },
];

interface RoleSimulationBarProps {
  currentRole: SimulationRole;
  onRoleChange: (role: SimulationRole) => void;
  onResetData: () => void;
}

export function RoleSimulationBar({
  currentRole,
  onRoleChange,
  onResetData,
}: RoleSimulationBarProps) {
  const activeRoleInfo =
    SIMULATION_ROLES.find((r) => r.id === currentRole) || SIMULATION_ROLES[0];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '10px 16px',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Cụm bên trái: Nhãn thanh điều khiển & Danh sách 4 vai trò */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
          <User size={15} style={{ color: '#64748b' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Giả lập vai trò:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {SIMULATION_ROLES.map((role) => {
            const isActive = role.id === currentRole;
            return (
              <Tooltip key={role.id} title={role.description}>
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange(role.id);
                    message.info(`Đã chuyển sang vai trò: ${role.title} (${role.userName})`);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: isActive ? 650 : 500,
                    border: isActive ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                    background: isActive ? '#fef2f2' : '#ffffff',
                    color: isActive ? '#dc2626' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {role.icon}
                  <span>
                    <strong>{role.title}:</strong> {role.userName}
                  </span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Cụm bên phải: Quyền hạn hiện hành & Nút Khôi phục dữ liệu gốc */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'none' }}>
          <Tag color={activeRoleInfo.tagColor}>
            {activeRoleInfo.roleTitle}
          </Tag>
        </div>

        <Popconfirm
          title="Khôi phục dữ liệu gốc?"
          description="Toàn bộ lịch họp, phiếu công việc và bình luận bạn vừa tạo/sửa sẽ được đặt lại về dữ liệu ban đầu."
          okText="Khôi phục"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => {
            onResetData();
            message.success('Đã khôi phục dữ liệu mẫu ban đầu');
          }}
        >
          <Button
            size="small"
            icon={<RotateCcw size={13} />}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              borderRadius: 6,
              fontSize: 12,
              color: '#475569',
            }}
          >
            Khôi phục dữ liệu gốc
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}
