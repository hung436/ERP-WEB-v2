import { Button, Empty, Input, Modal, Progress, Select, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { EvaluationCriterionRow } from '@/features/evaluations/components/EvaluationCriterionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { evaluationApi } from '@/services/api';
import type { EvaluationCriterion, EvaluationPeriod, EvaluationSheet, EvaluationStage } from '@/types/evaluation';
import '@/features/evaluations/evaluation-workspace.css';

type EvaluationMode = 'self' | 'scoring' | 'council';

const UserIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TeamIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CouncilIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="21" x2="21" y2="21" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 3 2 9 22 9 12 3" />
  </svg>
);

const modeOptions = [
  { value: 'self', label: 'Phiếu của tôi', icon: <UserIcon /> },
  { value: 'scoring', label: 'Chấm nhân viên', icon: <TeamIcon /> },
  { value: 'council', label: 'Hội đồng đánh giá', icon: <CouncilIcon /> },
];

const stageOrder: EvaluationStage[] = ['self', 'deputy', 'manager', 'editorial', 'council'];

const stageLabels: Record<EvaluationStage, string> = {
  self: 'Tự đánh giá',
  deputy: 'Phó phòng/ban',
  manager: 'Trưởng phòng/ban',
  editorial: 'Ban biên tập',
  council: 'Hội đồng',
  published: 'Đã công bố',
};

const statusLabels: Record<EvaluationSheet['status'], string> = {
  draft: 'Bản nháp',
  waiting: 'Chờ chấm',
  in_review: 'Đang đánh giá',
  completed: 'Đã hoàn tất',
  published: 'Đã công bố',
};

const initials = (name: string) =>
  name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));

const totalScore = (sheet: EvaluationSheet) =>
  sheet.groups.reduce(
    (total, group) =>
      total +
      group.criteria.reduce(
        (sum, criterion) => sum + (criterion.score ?? 0) * (group.kind === 'deduction' ? -1 : 1),
        0
      ),
    0
  );

const previousStagesFor = (sheet: EvaluationSheet, mode: EvaluationMode) =>
  sheet.status === 'published' || sheet.stage === 'published'
    ? stageOrder
    : mode === 'self'
    ? []
    : stageOrder.slice(0, Math.max(1, stageOrder.indexOf(mode === 'council' ? 'council' : sheet.stage)));

function EmployeeEvaluationListTable({
  sheets,
  onSelectSheet,
}: {
  sheets: EvaluationSheet[];
  onSelectSheet: (id: string) => void;
}) {
  return (
    <section className="employee-evaluation-table-card">
      <div className="table-card-header">
        <div>
          <h3>📋 Bảng tổng hợp lịch sử chấm điểm các cấp ({sheets.length} nhân sự)</h3>
          <p>Nhấp vào nhân sự trong bảng bên dưới để mở chi tiết phiếu chấm điểm</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="employee-history-table">
          <thead>
            <tr>
              <th>Nhân sự</th>
              <th>Chức danh & Phòng ban</th>
              <th>Tự đánh giá</th>
              <th>Phó phòng</th>
              <th>Trưởng phòng</th>
              <th>Ban biên tập</th>
              <th>Hội đồng</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Phiếu chấm</th>
            </tr>
          </thead>
          <tbody>
            {sheets.map((sheet) => {
              const isDone = sheet.status === 'published' || sheet.status === 'completed';
              return (
                <tr
                  key={sheet.id}
                  className="history-row"
                  onClick={() => onSelectSheet(sheet.id)}
                >
                  <td>
                    <div className="person-cell">
                      <span className="person-avatar">{initials(sheet.employeeName)}</span>
                      <div className="person-info">
                        <strong>{sheet.employeeName}</strong>
                        <small>{sheet.employeeCode}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="dept-cell">
                      <strong>{sheet.position}</strong>
                      <small>{sheet.department}</small>
                    </div>
                  </td>
                  <td>
                    <strong className="score-val">{sheet.stageTotals?.self ?? '—'}</strong>
                  </td>
                  <td>
                    <strong className="score-val">{sheet.stageTotals?.deputy ?? '—'}</strong>
                  </td>
                  <td>
                    <strong className="score-val">{sheet.stageTotals?.manager ?? '—'}</strong>
                  </td>
                  <td>
                    <strong className="score-val">{sheet.stageTotals?.editorial ?? '—'}</strong>
                  </td>
                  <td>
                    <strong className="score-val highlight-council">{sheet.stageTotals?.council ?? '—'}</strong>
                  </td>
                  <td>
                    <span className={`status-badge status-${sheet.status}`}>
                      {statusLabels[sheet.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className={`table-soft-action-btn${isDone ? ' done' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSheet(sheet.id);
                      }}
                    >
                      {isDone ? 'Xem phiếu' : 'Chấm điểm'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useAuth } from '@/features/auth/AuthContext';

function AdminManageGroupsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'groups' | 'flowchart'>('groups');
  const [selectedEmpCode, setSelectedEmpCode] = useState('NV-001');

  const [groups, setGroups] = useState<EvaluationGroup[]>([
    {
      id: 'grp-01',
      title: '1. Kết quả thực hiện nhiệm vụ chuyên môn',
      kind: 'normal',
      criteria: [
        { id: 'crit-01', groupId: 'grp-01', title: 'Khối lượng và tiến độ công việc', type: 'number', min: 0, max: 40, score: 38 },
        { id: 'crit-02', groupId: 'grp-01', title: 'Chất lượng xuất bản & Tỷ lệ lỗi', type: 'number', min: 0, max: 30, score: 28 },
      ],
    },
    {
      id: 'grp-02',
      title: '2. Kỷ luật lao động & Quy chế cơ quan',
      kind: 'normal',
      criteria: [
        { id: 'crit-03', groupId: 'grp-02', title: 'Đúng giờ & Bảo mật thông tin', type: 'number', min: 0, max: 30, score: 29 },
      ],
    },
    {
      id: 'grp-03',
      title: '3. Đóng góp sáng kiến & Thành tích vượt trội',
      kind: 'bonus',
      criteria: [
        { id: 'crit-04', groupId: 'grp-03', title: 'Sáng kiến cải tiến quy trình công tác', type: 'number', min: 0, max: 10, score: 5 },
      ],
    },
    {
      id: 'grp-04',
      title: '4. Vi phạm quy định & Trừ điểm kỷ luật',
      kind: 'deduction',
      criteria: [
        { id: 'crit-05', groupId: 'grp-04', title: 'Trễ hạn hồ sơ hoặc sai sót bài viết', type: 'number', min: 0, max: 10, score: 0 },
      ],
    },
  ]);

  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupKind, setNewGroupKind] = useState<'normal' | 'bonus' | 'deduction'>('normal');

  const employeeFlows: Record<string, { name: string; dept: string; pos: string; steps: { stage: string; reviewer: string; role: string; status: 'completed' | 'current' | 'pending'; time?: string }[] }> = {
    'NV-001': {
      name: 'Nguyễn Minh Anh',
      dept: 'Ban Nội dung',
      pos: 'Phóng viên',
      steps: [
        { stage: 'Giai đoạn 1: Tự đánh giá', reviewer: 'Nguyễn Minh Anh', role: 'Chính chủ tự chấm', status: 'completed', time: '05/08/2026 14:30' },
        { stage: 'Giai đoạn 2: Phó phòng đánh giá', reviewer: 'Trần Thu Hà', role: 'Phó Ban Nội dung', status: 'completed', time: '07/08/2026 09:15' },
        { stage: 'Giai đoạn 3: Trưởng phòng duyệt', reviewer: 'Lê Thanh Vân', role: 'Trưởng Ban Nội dung', status: 'current', time: 'Đang xử lý' },
        { stage: 'Giai đoạn 4: Ban Biên tập rà soát', reviewer: 'Hoàng Tuấn Anh', role: 'Trưởng Ban Thư ký Biên tập', status: 'pending' },
        { stage: 'Giai đoạn 5: Hội đồng chốt điểm', reviewer: 'Hội đồng Thi đua', role: 'Chủ tịch & Các Ủy viên', status: 'pending' },
      ],
    },
    'NV-005': {
      name: 'Đỗ Quang Huy',
      dept: 'Ban Khoa giáo',
      pos: 'Biên tập viên',
      steps: [
        { stage: 'Giai đoạn 1: Tự đánh giá', reviewer: 'Đỗ Quang Huy', role: 'Chính chủ tự chấm', status: 'completed', time: '04/08/2026 16:45' },
        { stage: 'Giai đoạn 2: Phó phòng đánh giá', reviewer: 'Phạm Đức Long', role: 'Phó Ban Khoa giáo', status: 'completed', time: '06/08/2026 10:20' },
        { stage: 'Giai đoạn 3: Trưởng phòng duyệt', reviewer: 'Vũ Minh Trí', role: 'Trưởng Ban Khoa giáo', status: 'completed', time: '08/08/2026 11:00' },
        { stage: 'Giai đoạn 4: Ban Biên tập rà soát', reviewer: 'Hoàng Tuấn Anh', role: 'Trưởng Ban Thư ký Biên tập', status: 'current', time: 'Đang rà soát' },
        { stage: 'Giai đoạn 5: Hội đồng chốt điểm', reviewer: 'Hội đồng Thi đua', role: 'Chủ tịch & Các Ủy viên', status: 'pending' },
      ],
    },
    'NV-002': {
      name: 'Trần Thu Hà',
      dept: 'Ban Nội dung',
      pos: 'Phó Ban Nội dung',
      steps: [
        { stage: 'Giai đoạn 1: Tự đánh giá', reviewer: 'Trần Thu Hà', role: 'Chính chủ tự chấm', status: 'completed', time: '03/08/2026 09:00' },
        { stage: 'Giai đoạn 2: Phó phòng đánh giá', reviewer: 'Bỏ qua (Cấp Phó ban)', role: 'Tự động chuyển cấp Trưởng ban', status: 'completed', time: '03/08/2026 09:00' },
        { stage: 'Giai đoạn 3: Trưởng phòng duyệt', reviewer: 'Lê Thanh Vân', role: 'Trưởng Ban Nội dung', status: 'completed', time: '05/08/2026 15:30' },
        { stage: 'Giai đoạn 4: Ban Biên tập rà soát', reviewer: 'Hoàng Tuấn Anh', role: 'Trưởng Ban Thư ký Biên tập', status: 'completed', time: '07/08/2026 16:00' },
        { stage: 'Giai đoạn 5: Hội đồng chốt điểm', reviewer: 'Hội đồng Thi đua', role: 'Chủ tịch Hội đồng', status: 'completed', time: '09/08/2026 10:00' },
      ],
    },
  };

  const currentFlow = employeeFlows[selectedEmpCode] ?? employeeFlows['NV-001'];

  const handleAddGroup = () => {
    if (!newGroupTitle.trim()) {
      message.error('Vui lòng nhập tên nhóm tiêu chí');
      return;
    }
    const createdGroup: EvaluationGroup = {
      id: `grp-${Date.now()}`,
      title: `${groups.length + 1}. ${newGroupTitle.trim()}`,
      kind: newGroupKind,
      criteria: [],
    };
    setGroups([...groups, createdGroup]);
    setNewGroupTitle('');
    message.success('Đã thêm nhóm tiêu chí mới thành công');
  };

  return (
    <Modal
      title="⚙️ Quản lý Nhóm tiêu chí & Quy trình Flow chấm từng nhân sự"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Lưu & Đóng</Button>,
      ]}
      width={920}
      destroyOnHidden
    >
      <div className="admin-modal-body">
        <div className="admin-modal-tabs">
          <Button
            type={activeTab === 'groups' ? 'primary' : 'default'}
            onClick={() => setActiveTab('groups')}
          >
            📋 Nhóm & Tiêu chí đánh giá ({groups.length} nhóm)
          </Button>
          <Button
            type={activeTab === 'flowchart' ? 'primary' : 'default'}
            onClick={() => setActiveTab('flowchart')}
          >
            🔄 Flowchart Quy trình chấm của từng nhân sự
          </Button>
        </div>

        {activeTab === 'groups' ? (
          <div className="groups-manager-panel">
            <div className="add-group-card">
              <h4>+ Thêm Nhóm Tiêu chí mới</h4>
              <div className="add-group-row">
                <Input
                  placeholder="Tên nhóm tiêu chí (ví dụ: Kỹ năng phối hợp & Làm việc nhóm)"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                />
                <Select
                  value={newGroupKind}
                  onChange={(val) => setNewGroupKind(val)}
                  options={[
                    { value: 'normal', label: 'Tiêu chuẩn' },
                    { value: 'bonus', label: 'Điểm thưởng (+)' },
                    { value: 'deduction', label: 'Điểm trừ (-)' },
                  ]}
                />
                <Button type="primary" onClick={handleAddGroup}>Thêm nhóm</Button>
              </div>
            </div>

            <div className="groups-list">
              {groups.map((group) => (
                <div key={group.id} className="group-item-card">
                  <div className="group-item-header">
                    <strong>{group.title}</strong>
                    <Tag color={group.kind === 'bonus' ? 'green' : group.kind === 'deduction' ? 'red' : 'blue'}>
                      {group.kind === 'bonus' ? 'Điểm thưởng (+)' : group.kind === 'deduction' ? 'Điểm trừ (-)' : 'Tiêu chuẩn'}
                    </Tag>
                  </div>
                  <div className="group-criteria-mini-list">
                    {group.criteria.length > 0 ? (
                      group.criteria.map((c) => (
                        <div key={c.id} className="criterion-mini-row">
                          <span>• {c.title}</span>
                          <Tag>Tối đa {c.max} điểm</Tag>
                        </div>
                      ))
                    ) : (
                      <small style={{ color: '#98a2b3' }}>Chưa có tiêu chí nào trong nhóm này</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flowchart-manager-panel">
            <div className="emp-select-flow-header">
              <div>
                <h4>🔄 Sơ đồ Flow tiến trình chấm chi tiết theo cá nhân</h4>
                <p>Theo dõi chính xác luồng chuyển duyệt, người thụ lý chấm điểm & mốc thời gian của từng cán bộ</p>
              </div>
              <div className="emp-flow-picker">
                <span>Chọn nhân sự:</span>
                <Select
                  value={selectedEmpCode}
                  onChange={(val) => setSelectedEmpCode(val)}
                  style={{ width: 280 }}
                  options={[
                    { value: 'NV-001', label: 'Nguyễn Minh Anh (NV-001) · Ban Nội dung' },
                    { value: 'NV-005', label: 'Đỗ Quang Huy (NV-005) · Ban Khoa giáo' },
                    { value: 'NV-002', label: 'Trần Thu Hà (NV-002) · Phó Ban Nội dung' },
                  ]}
                />
              </div>
            </div>

            <div className="emp-flow-summary-card">
              <div className="emp-flow-avatar">{initials(currentFlow.name)}</div>
              <div className="emp-flow-meta">
                <strong>{currentFlow.name} ({selectedEmpCode})</strong>
                <small>{currentFlow.pos} · {currentFlow.dept}</small>
              </div>
            </div>

            {/* Interactive Flowchart Stepper */}
            <div className="flowchart-nodes-container">
              {currentFlow.steps.map((step, idx) => (
                <div key={idx} className={`flowchart-node-card status-${step.status}`}>
                  <div className="node-step-index">{idx + 1}</div>
                  <div className="node-content">
                    <span className="node-stage-label">{step.stage}</span>
                    <strong className="node-reviewer-name">👤 {step.reviewer}</strong>
                    <small className="node-reviewer-role">{step.role}</small>
                    {step.time && <span className="node-timestamp">⏱️ {step.time}</span>}
                  </div>
                  <div className="node-status-tag">
                    <Tag color={step.status === 'completed' ? 'green' : step.status === 'current' ? 'orange' : 'default'}>
                      {step.status === 'completed' ? '✓ Đã hoàn tất' : step.status === 'current' ? '⏳ Đang chấm' : '⚪ Chưa tới lượt'}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AdminManagePeriodsModal({
  open,
  periods,
  onClose,
  onAddPeriod,
}: {
  open: boolean;
  periods: EvaluationPeriod[];
  onClose: () => void;
  onAddPeriod: (newPeriod: EvaluationPeriod) => void;
}) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'importers'>('timeline');
  const [periodList, setPeriodList] = useState<EvaluationPeriod[]>(periods);
  const [label, setLabel] = useState('');

  // 5 Stage Timeline Milestones
  const [milestones, setMilestones] = useState<{ stageLabel: string; startAt: string; dueAt: string }[]>([
    { stageLabel: '1. Tự đánh giá cá nhân', startAt: '2026-08-01', dueAt: '2026-08-10' },
    { stageLabel: '2. Phó phòng đánh giá', startAt: '2026-08-11', dueAt: '2026-08-15' },
    { stageLabel: '3. Trưởng phòng phê duyệt', startAt: '2026-08-16', dueAt: '2026-08-20' },
    { stageLabel: '4. Ban Biên tập rà soát', startAt: '2026-08-21', dueAt: '2026-08-25' },
    { stageLabel: '5. Hội đồng chốt & công bố', startAt: '2026-08-26', dueAt: '2026-08-30' },
  ]);

  // Importers state
  const [importMode, setImportMode] = useState<'employees' | 'criteria' | 'scores'>('employees');
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);

  useEffect(() => {
    setPeriodList(periods);
  }, [periods]);

  const handleMilestoneDateChange = (index: number, field: 'startAt' | 'dueAt', value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleCreate = () => {
    if (!label.trim()) {
      message.error('Vui lòng nhập tên kỳ đánh giá mới');
      return;
    }
    const created: EvaluationPeriod = {
      id: `period-${Date.now()}`,
      label: label.trim(),
      startAt: new Date(milestones[0].startAt).toISOString(),
      dueAt: new Date(milestones[4].dueAt).toISOString(),
      status: 'active',
    };
    const updated = [created, ...periodList];
    setPeriodList(updated);
    onAddPeriod(created);
    setLabel('');
    message.success(`Đã khởi tạo kỳ đánh giá "${created.label}" cùng 5 mốc thời gian chấm thành công`);
  };

  const toggleStatus = (id: string) => {
    const updated = periodList.map((p) =>
      p.id === id ? { ...p, status: (p.status === 'active' ? 'closed' : 'active') as 'active' | 'closed' } : p
    );
    setPeriodList(updated);
    message.success('Đã cập nhật trạng thái kỳ đánh giá');
  };

  const handleSimulateFileUpload = (mode: 'employees' | 'criteria' | 'scores') => {
    if (mode === 'employees') {
      setImportedFileName('Danh_sach_Nhan_vien_Q3_2026.xlsx');
      setImportPreviewData([
        { code: 'NV-010', name: 'Trần Văn Hoàng', dept: 'Ban Bạn đọc', pos: 'Phóng viên' },
        { code: 'NV-011', name: 'Ngô Thanh Sơn', dept: 'Ban Thời sự', pos: 'Biên tập viên' },
        { code: 'NV-012', name: 'Lê Minh Hương', dept: 'Văn phòng', pos: 'Chuyên viên' },
      ]);
    } else if (mode === 'criteria') {
      setImportedFileName('Ma_tran_Tieu_chi_Danh_gia_2026.csv');
      setImportPreviewData([
        { group: 'Chuyên môn', title: 'Hoàn thành chỉ tiêu bài viết xuất bản', maxScore: 40 },
        { group: 'Kỷ luật', title: 'Chấp hành giờ giấc & Nội quy tòa soạn', maxScore: 30 },
        { group: 'Sáng kiến', title: 'Đề xuất tuyến bài đoạt giải báo chí', maxScore: 15 },
      ]);
    } else {
      setImportedFileName('Bang_diem_KPI_He_thong_Q3.xlsx');
      setImportPreviewData([
        { code: 'NV-001', name: 'Nguyễn Minh Anh', kpiScore: 88, autoPoints: 10 },
        { code: 'NV-002', name: 'Trần Thu Hà', kpiScore: 92, autoPoints: 10 },
        { code: 'NV-005', name: 'Đỗ Quang Huy', kpiScore: 85, autoPoints: 8 },
      ]);
    }
    message.success('Đã đọc dữ liệu tệp thành công! Vui lòng kiểm tra bản xem trước.');
  };

  const handleExecuteImport = () => {
    message.success(`Đã import thành công ${importPreviewData.length} bản ghi vào hệ thống đánh giá!`);
    setImportedFileName(null);
    setImportPreviewData([]);
  };

  return (
    <Modal
      title="📅 Quản lý Kỳ đánh giá Lao động & Bộ Import Dữ liệu (Admin)"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Lưu & Đóng</Button>,
      ]}
      width={900}
      destroyOnHidden
    >
      <div className="admin-periods-modal-body">
        <div className="admin-modal-tabs">
          <Button
            type={activeTab === 'timeline' ? 'primary' : 'default'}
            onClick={() => setActiveTab('timeline')}
          >
            📅 Thiết lập Kỳ & Mốc thời gian 5 thời điểm chấm
          </Button>
          <Button
            type={activeTab === 'importers' ? 'primary' : 'default'}
            onClick={() => setActiveTab('importers')}
          >
            📥 Import Dữ liệu Excel / CSV (Nhân sự, Tiêu chí, Bảng điểm)
          </Button>
        </div>

        {activeTab === 'timeline' ? (
          <div className="periods-timeline-panel">
            <div className="create-period-box">
              <h4>+ Khởi tạo Kỳ đánh giá & Thiết lập mốc thời gian từng giai đoạn chấm</h4>
              <div className="create-period-main-row">
                <Input
                  placeholder="Tên kỳ đánh giá (ví dụ: Đánh giá lao động Quý IV/2026)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  style={{ width: 340 }}
                />
                <Button type="primary" onClick={handleCreate}>+ Tạo kỳ đánh giá mới</Button>
              </div>

              {/* 5 Stage Milestones Config Matrix */}
              <div className="milestones-config-matrix">
                <h5>⏱️ Mốc thời gian tương ứng với 5 thời điểm chấm:</h5>
                <div className="milestones-grid">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="milestone-config-card">
                      <strong className="m-stage-title">{m.stageLabel}</strong>
                      <div className="m-date-inputs">
                        <label>
                          <span>Ngày mở:</span>
                          <input
                            type="date"
                            value={m.startAt}
                            onChange={(e) => handleMilestoneDateChange(idx, 'startAt', e.target.value)}
                          />
                        </label>
                        <label>
                          <span>Hạn chót:</span>
                          <input
                            type="date"
                            value={m.dueAt}
                            onChange={(e) => handleMilestoneDateChange(idx, 'dueAt', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="period-list-container">
              <h4>📋 Danh sách các Kỳ đánh giá hiện có ({periodList.length})</h4>
              <div className="period-cards-list">
                {periodList.map((p) => (
                  <div key={p.id} className="period-card">
                    <div className="period-card-info">
                      <strong>{p.label}</strong>
                      <small>Thời gian kỳ: {formatDate(p.startAt)} – {formatDate(p.dueAt)}</small>
                    </div>
                    <div className="period-card-actions">
                      <Tag color={p.status === 'active' ? 'green' : 'default'}>
                        {p.status === 'active' ? 'Đang diễn ra' : 'Đã đóng kỳ'}
                      </Tag>
                      <Button size="small" onClick={() => toggleStatus(p.id)}>
                        {p.status === 'active' ? 'Đóng kỳ' : 'Mở lại kỳ'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="importers-panel">
            <div className="importer-mode-selector">
              <span>Chọn loại dữ liệu cần Import:</span>
              <div className="importer-buttons">
                <Button
                  type={importMode === 'employees' ? 'primary' : 'default'}
                  onClick={() => { setImportMode('employees'); setImportedFileName(null); setImportPreviewData([]); }}
                >
                  👤 Import Danh sách Nhân viên
                </Button>
                <Button
                  type={importMode === 'criteria' ? 'primary' : 'default'}
                  onClick={() => { setImportMode('criteria'); setImportedFileName(null); setImportPreviewData([]); }}
                >
                  📋 Import Ma trận Tiêu chí
                </Button>
                <Button
                  type={importMode === 'scores' ? 'primary' : 'default'}
                  onClick={() => { setImportMode('scores'); setImportedFileName(null); setImportPreviewData([]); }}
                >
                  📊 Import Bảng điểm KPI / Có sẵn
                </Button>
              </div>
            </div>

            {/* Dropzone Simulation */}
            <div className="import-dropzone" onClick={() => handleSimulateFileUpload(importMode)}>
              <div className="dropzone-icon">📁</div>
              <strong>Nhấp vào đây để chọn tệp Excel (.xlsx) hoặc CSV để Import</strong>
              <p>Hỗ trợ tệp bảng tính mẫu tiêu chuẩn. Hệ thống tự động khớp cột dữ liệu.</p>
              <Button size="small" onClick={(e) => { e.stopPropagation(); handleSimulateFileUpload(importMode); }}>
                Chọn tệp mẫu mô phỏng
              </Button>
            </div>

            {/* File & Preview Data */}
            {importedFileName && (
              <div className="import-preview-box">
                <div className="imported-file-badge">
                  <span>📄 Tệp đã chọn: <strong>{importedFileName}</strong></span>
                  <Tag color="green">Đã kiểm tra định dạng OK</Tag>
                </div>

                <h5>Bản xem trước dữ liệu ({importPreviewData.length} bản ghi):</h5>
                <div className="preview-table-wrapper">
                  <table className="mini-preview-table">
                    <thead>
                      {importMode === 'employees' ? (
                        <tr><th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Chức danh</th></tr>
                      ) : importMode === 'criteria' ? (
                        <tr><th>Nhóm</th><th>Nội dung tiêu chí</th><th>Điểm tối đa</th></tr>
                      ) : (
                        <tr><th>Mã NV</th><th>Họ tên</th><th>Điểm KPI</th><th>Điểm cộng tự động</th></tr>
                      )}
                    </thead>
                    <tbody>
                      {importPreviewData.map((item, i) => (
                        <tr key={i}>
                          {importMode === 'employees' ? (
                            <><td>{item.code}</td><td>{item.name}</td><td>{item.dept}</td><td>{item.pos}</td></>
                          ) : importMode === 'criteria' ? (
                            <><td>{item.group}</td><td>{item.title}</td><td>{item.maxScore}</td></>
                          ) : (
                            <><td>{item.code}</td><td>{item.name}</td><td>{item.kpiScore}</td><td>+{item.autoPoints}</td></>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="import-actions-row">
                  <Button type="primary" onClick={handleExecuteImport}>
                    ✓ Tiến hành Import vào Hệ thống
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function EvaluationWorkspace({
  periods: initialPeriods,
  sheets,
  onReload,
}: {
  periods: EvaluationPeriod[];
  sheets: EvaluationSheet[];
  onReload: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSheetId = searchParams.get('sheetId') ?? '';

  const [periods, setPeriods] = useState<EvaluationPeriod[]>(initialPeriods);
  const [mode, setMode] = useState<EvaluationMode>('self');
  const [adminTab, setAdminTab] = useState<'monitor' | 'periods' | 'import' | 'groups'>('monitor');
  const [periodId, setPeriodId] = useState(periods.find((p) => p.status === 'active')?.id ?? periods[0]?.id ?? '');
  const [sheetId, setSheetIdState] = useState(paramSheetId);

  // Admin Period Milestones State
  const [label, setLabel] = useState('');
  const [milestones, setMilestones] = useState<{ stageLabel: string; startAt: string; dueAt: string }[]>([
    { stageLabel: '1. Tự đánh giá cá nhân', startAt: '2026-08-01', dueAt: '2026-08-10' },
    { stageLabel: '2. Phó phòng đánh giá', startAt: '2026-08-11', dueAt: '2026-08-15' },
    { stageLabel: '3. Trưởng phòng phê duyệt', startAt: '2026-08-16', dueAt: '2026-08-20' },
    { stageLabel: '4. Ban Biên tập rà soát', startAt: '2026-08-21', dueAt: '2026-08-25' },
    { stageLabel: '5. Hội đồng chốt & công bố', startAt: '2026-08-26', dueAt: '2026-08-30' },
  ]);

  // Admin Importers State
  const [importMode, setImportMode] = useState<'employees' | 'criteria' | 'scores'>('employees');
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);

  // Admin Groups & Flowchart State
  const [groups, setGroups] = useState<EvaluationGroup[]>([
    {
      id: 'grp-01',
      title: '1. Kết quả thực hiện nhiệm vụ chuyên môn',
      kind: 'normal',
      criteria: [
        { id: 'crit-01', groupId: 'grp-01', title: 'Khối lượng và tiến độ công việc', type: 'number', min: 0, max: 40, score: 38 },
        { id: 'crit-02', groupId: 'grp-01', title: 'Chất lượng xuất bản & Tỷ lệ lỗi', type: 'number', min: 0, max: 30, score: 28 },
      ],
    },
    {
      id: 'grp-02',
      title: '2. Kỷ luật lao động & Quy chế cơ quan',
      kind: 'normal',
      criteria: [
        { id: 'crit-03', groupId: 'grp-02', title: 'Đúng giờ & Bảo mật thông tin', type: 'number', min: 0, max: 30, score: 29 },
      ],
    },
    {
      id: 'grp-03',
      title: '3. Đóng góp sáng kiến & Thành tích vượt trội',
      kind: 'bonus',
      criteria: [
        { id: 'crit-04', groupId: 'grp-03', title: 'Sáng kiến cải tiến quy trình công tác', type: 'number', min: 0, max: 10, score: 5 },
      ],
    },
    {
      id: 'grp-04',
      title: '4. Vi phạm quy định & Trừ điểm kỷ luật',
      kind: 'deduction',
      criteria: [
        { id: 'crit-05', groupId: 'grp-04', title: 'Trễ hạn hồ sơ hoặc sai sót bài viết', type: 'number', min: 0, max: 10, score: 0 },
      ],
    },
  ]);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupKind, setNewGroupKind] = useState<'normal' | 'bonus' | 'deduction'>('normal');
  const [selectedEmpCode, setSelectedEmpCode] = useState('NV-001');

  const employeeFlows: Record<string, { name: string; dept: string; pos: string; steps: { stage: string; reviewer: string; role: string; status: 'completed' | 'current' | 'pending'; time?: string }[] }> = {
    'NV-001': {
      name: 'Nguyễn Minh Anh',
      dept: 'Ban Nội dung',
      pos: 'Phóng viên',
      steps: [
        { stage: 'Giai đoạn 1: Tự đánh giá', reviewer: 'Nguyễn Minh Anh', role: 'Chính chủ tự chấm', status: 'completed', time: '05/08/2026 14:30' },
        { stage: 'Giai đoạn 2: Phó phòng đánh giá', reviewer: 'Trần Thu Hà', role: 'Phó Ban Nội dung', status: 'completed', time: '07/08/2026 09:15' },
        { stage: 'Giai đoạn 3: Trưởng phòng duyệt', reviewer: 'Lê Thanh Vân', role: 'Trưởng Ban Nội dung', status: 'current', time: 'Đang xử lý' },
        { stage: 'Giai đoạn 4: Ban Biên tập rà soát', reviewer: 'Hoàng Tuấn Anh', role: 'Trưởng Ban Thư ký Biên tập', status: 'pending' },
        { stage: 'Giai đoạn 5: Hội đồng chốt điểm', reviewer: 'Hội đồng Thi đua', role: 'Chủ tịch & Các Ủy viên', status: 'pending' },
      ],
    },
    'NV-005': {
      name: 'Đỗ Quang Huy',
      dept: 'Ban Khoa giáo',
      pos: 'Biên tập viên',
      steps: [
        { stage: 'Giai đoạn 1: Tự đánh giá', reviewer: 'Đỗ Quang Huy', role: 'Chính chủ tự chấm', status: 'completed', time: '04/08/2026 16:45' },
        { stage: 'Giai đoạn 2: Phó phòng đánh giá', reviewer: 'Phạm Đức Long', role: 'Phó Ban Khoa giáo', status: 'completed', time: '06/08/2026 10:20' },
        { stage: 'Giai đoạn 3: Trưởng phòng duyệt', reviewer: 'Vũ Minh Trí', role: 'Trưởng Ban Khoa giáo', status: 'completed', time: '08/08/2026 11:00' },
        { stage: 'Giai đoạn 4: Ban Biên tập rà soát', reviewer: 'Hoàng Tuấn Anh', role: 'Trưởng Ban Thư ký Biên tập', status: 'current', time: 'Đang rà soát' },
        { stage: 'Giai đoạn 5: Hội đồng chốt điểm', reviewer: 'Hội đồng Thi đua', role: 'Chủ tịch & Các Ủy viên', status: 'pending' },
      ],
    },
    'NV-002': {
      name: 'Trần Thu Hà',
      dept: 'Ban Nội dung',
      pos: 'Phó Ban Nội dung',
      steps: [
        { stage: 'Giai đoạn 1: Tự đánh giá', reviewer: 'Trần Thu Hà', role: 'Chính chủ tự chấm', status: 'completed', time: '03/08/2026 09:00' },
        { stage: 'Giai đoạn 2: Phó phòng đánh giá', reviewer: 'Bỏ qua (Cấp Phó ban)', role: 'Tự động chuyển cấp Trưởng ban', status: 'completed', time: '03/08/2026 09:00' },
        { stage: 'Giai đoạn 3: Trưởng phòng duyệt', reviewer: 'Lê Thanh Vân', role: 'Trưởng Ban Nội dung', status: 'completed', time: '05/08/2026 15:30' },
        { stage: 'Giai đoạn 4: Ban Biên tập rà soát', reviewer: 'Hoàng Tuấn Anh', role: 'Trưởng Ban Thư ký Biên tập', status: 'completed', time: '07/08/2026 16:00' },
        { stage: 'Giai đoạn 5: Hội đồng chốt điểm', reviewer: 'Hội đồng Thi đua', role: 'Chủ tịch Hội đồng', status: 'completed', time: '09/08/2026 10:00' },
      ],
    },
  };

  const currentFlow = employeeFlows[selectedEmpCode] ?? employeeFlows['NV-001'];

  const setSheetId = (id: string) => {
    setSheetIdState(id);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) {
          next.set('sheetId', id);
        } else {
          next.delete('sheetId');
        }
        return next;
      },
      { replace: true }
    );
  };

  const availableSheets = useMemo(
    () =>
      sheets.filter((sheet) => {
        if (sheet.periodId !== periodId) return false;
        if (isAdmin) return true;
        return mode === 'self'
          ? sheet.employeeCode === 'NV-001'
          : mode === 'scoring'
          ? sheet.employeeCode !== 'NV-001' && sheet.stage !== 'council'
          : sheet.employeeCode !== 'NV-001' && (sheet.stage === 'council' || sheet.status === 'published');
      }),
    [isAdmin, mode, periodId, sheets]
  );

  const [draft, setDraft] = useState<EvaluationSheet | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteCriterionId, setNoteCriterionId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => {
    if (sheetId) {
      const found = sheets.find((s) => s.id === sheetId);
      if (found) {
        if (found.periodId !== periodId) {
          setPeriodId(found.periodId);
        }
        setDraft(found);
        return;
      }
    }
    if (isAdmin) {
      const selected = availableSheets.find((sheet) => sheet.id === sheetId) ?? null;
      setDraft(selected);
    } else if (mode === 'self') {
      const selected = availableSheets[0] ?? null;
      setDraft(selected);
    } else {
      const selected = availableSheets.find((sheet) => sheet.id === sheetId) ?? null;
      setDraft(selected);
    }
  }, [availableSheets, isAdmin, mode, periodId, sheetId, sheets]);

  const selectEmployeeSheet = (id: string) => {
    setSheetId(id);
  };

  const criteria = useMemo(() => draft?.groups.flatMap((group) => group.criteria) ?? [], [draft]);
  const answered = criteria.filter((criterion) => criterion.score !== null).length;
  const completion = criteria.length > 0 ? Math.round((answered / criteria.length) * 100) : 0;
  const currentStage: EvaluationStage =
    mode === 'self' ? 'self' : mode === 'council' ? 'council' : draft?.stage === 'published' ? 'council' : draft?.stage ?? 'deputy';
  const previousStages = draft ? previousStagesFor(draft, mode) : [];
  const readOnly = isAdmin || !draft || draft.status === 'published' || (mode === 'self' && draft.status !== 'draft');
  const noteCriterion = criteria.find((criterion) => criterion.id === noteCriterionId) ?? null;

  const updateCriterion = (id: string, patch: Partial<EvaluationCriterion>) =>
    setDraft((value) =>
      value
        ? {
            ...value,
            groups: value.groups.map((group) => ({
              ...group,
              criteria: group.criteria.map((criterion) => (criterion.id === id ? { ...criterion, ...patch } : criterion)),
            })),
          }
        : value
    );

  const openNote = (criterion: EvaluationCriterion) => {
    setNoteCriterionId(criterion.id);
    setNoteValue(criterion.note ?? '');
  };

  const saveNote = () => {
    if (noteCriterion) updateCriterion(noteCriterion.id, { note: noteValue.trim() });
    setNoteCriterionId(null);
  };

  const persist = async (finish = false) => {
    if (!draft || isAdmin) return;
    setSaving(true);
    try {
      const action = finish ? (mode === 'self' ? 'submit' : 'approve') : 'save';
      const result = await evaluationApi.save(draft, action);
      setDraft(result.data);
      message.success(
        finish
          ? mode === 'self'
            ? 'Đã gửi phiếu tự đánh giá'
            : mode === 'council'
            ? 'Đã chốt kết quả Hội đồng'
            : 'Đã hoàn tất chấm điểm'
          : 'Đã lưu thay đổi'
      );
      onReload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể lưu phiếu đánh giá.');
    } finally {
      setSaving(false);
    }
  };

  const handleMilestoneDateChange = (index: number, field: 'startAt' | 'dueAt', value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleCreatePeriod = () => {
    if (!label.trim()) {
      message.error('Vui lòng nhập tên kỳ đánh giá mới');
      return;
    }
    const created: EvaluationPeriod = {
      id: `period-${Date.now()}`,
      label: label.trim(),
      startAt: new Date(milestones[0].startAt).toISOString(),
      dueAt: new Date(milestones[4].dueAt).toISOString(),
      status: 'active',
    };
    setPeriods([created, ...periods]);
    setPeriodId(created.id);
    setLabel('');
    message.success(`Đã khởi tạo kỳ đánh giá "${created.label}" thành công`);
  };

  const togglePeriodStatus = (id: string) => {
    const updated = periods.map((p) =>
      p.id === id ? { ...p, status: (p.status === 'active' ? 'closed' : 'active') as 'active' | 'closed' } : p
    );
    setPeriods(updated);
    message.success('Đã cập nhật trạng thái kỳ đánh giá');
  };

  const handleAddGroup = () => {
    if (!newGroupTitle.trim()) {
      message.error('Vui lòng nhập tên nhóm tiêu chí');
      return;
    }
    const createdGroup: EvaluationGroup = {
      id: `grp-${Date.now()}`,
      title: `${groups.length + 1}. ${newGroupTitle.trim()}`,
      kind: newGroupKind,
      criteria: [],
    };
    setGroups([...groups, createdGroup]);
    setNewGroupTitle('');
    message.success('Đã thêm nhóm tiêu chí mới thành công');
  };

  const handleSimulateFileUpload = (mode: 'employees' | 'criteria' | 'scores') => {
    if (mode === 'employees') {
      setImportedFileName('Danh_sach_Nhan_vien_Q3_2026.xlsx');
      setImportPreviewData([
        { code: 'NV-010', name: 'Trần Văn Hoàng', dept: 'Ban Bạn đọc', pos: 'Phóng viên' },
        { code: 'NV-011', name: 'Ngô Thanh Sơn', dept: 'Ban Thời sự', pos: 'Biên tập viên' },
        { code: 'NV-012', name: 'Lê Minh Hương', dept: 'Văn phòng', pos: 'Chuyên viên' },
      ]);
    } else if (mode === 'criteria') {
      setImportedFileName('Ma_tran_Tieu_chi_Danh_gia_2026.csv');
      setImportPreviewData([
        { group: 'Chuyên môn', title: 'Hoàn thành chỉ tiêu bài viết xuất bản', maxScore: 40 },
        { group: 'Kỷ luật', title: 'Chấp hành giờ giấc & Nội quy tòa soạn', maxScore: 30 },
        { group: 'Sáng kiến', title: 'Đề xuất tuyến bài đoạt giải báo chí', maxScore: 15 },
      ]);
    } else {
      setImportedFileName('Bang_diem_KPI_He_thong_Q3.xlsx');
      setImportPreviewData([
        { code: 'NV-001', name: 'Nguyễn Minh Anh', kpiScore: 88, autoPoints: 10 },
        { code: 'NV-002', name: 'Trần Thu Hà', kpiScore: 92, autoPoints: 10 },
        { code: 'NV-005', name: 'Đỗ Quang Huy', kpiScore: 85, autoPoints: 8 },
      ]);
    }
    message.success('Đã đọc dữ liệu tệp thành công! Vui lòng kiểm tra bản xem trước.');
  };

  const handleExecuteImport = () => {
    message.success(`Đã import thành công ${importPreviewData.length} bản ghi vào hệ thống đánh giá!`);
    setImportedFileName(null);
    setImportPreviewData([]);
  };

  return (
    <div className="evaluation-workspace">
      {/* Header Bar */}
      <header className="evaluation-workspace-header">
        <div className="evaluation-workspace-brand">
          <span className="brand-icon">
            <ModuleIcon module="evaluations" size={24} />
          </span>
          <div>
            <small>Không gian làm việc ERP</small>
            <h1>Đánh giá lao động {isAdmin && <Tag color="gold" style={{ marginLeft: 8 }}>👑 Quản trị viên</Tag>}</h1>
          </div>
        </div>

        <div className="evaluation-workspace-controls">
          {/* Admin Dedicated Inline Page Tabs */}
          {isAdmin ? (
            <div className="admin-page-tabs" role="tablist">
              <button
                type="button"
                className={`admin-page-tab-btn${adminTab === 'monitor' ? ' active' : ''}`}
                onClick={() => { setAdminTab('monitor'); setSheetId(''); }}
              >
                📊 Giám sát & Bảng điểm
              </button>
              <button
                type="button"
                className={`admin-page-tab-btn${adminTab === 'periods' ? ' active' : ''}`}
                onClick={() => setAdminTab('periods')}
              >
                📅 Quản lý Kỳ & Mốc thời gian
              </button>
              <button
                type="button"
                className={`admin-page-tab-btn${adminTab === 'import' ? ' active' : ''}`}
                onClick={() => setAdminTab('import')}
              >
                📥 Import Dữ liệu Excel/CSV
              </button>
              <button
                type="button"
                className={`admin-page-tab-btn${adminTab === 'groups' ? ' active' : ''}`}
                onClick={() => setAdminTab('groups')}
              >
                ⚙️ Nhóm tiêu chí & Flowchart
              </button>
            </div>
          ) : (
            /* Flat Underline Tabs for regular employees */
            <div className="evaluation-flat-tabs" role="radiogroup" aria-label="Chế độ làm việc">
              {modeOptions.map((opt) => {
                const isActive = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-label={opt.label}
                    aria-checked={isActive}
                    className={`flat-tab-btn${isActive ? ' active' : ''}`}
                    onClick={() => {
                      setMode(opt.value as EvaluationMode);
                      setSheetId('');
                    }}
                  >
                    <span className="tab-icon" aria-hidden="true">{opt.icon}</span>
                    <span className="tab-label">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="evaluation-control">
            <span>Kỳ đánh giá</span>
            <Select
              aria-label="Kỳ đánh giá"
              onChange={(value) => {
                setPeriodId(value);
                setSheetId('');
              }}
              options={periods.map((period) => ({ value: period.id, label: period.label }))}
              value={periodId}
            />
          </div>
        </div>
      </header>

      {/* Admin Full Page View Sections (No Popups!) */}
      {isAdmin && adminTab === 'periods' ? (
        <section className="admin-page-section">
          <div className="create-period-box">
            <h4>+ Khởi tạo Kỳ đánh giá & Thiết lập mốc thời gian 5 thời điểm chấm</h4>
            <div className="create-period-main-row">
              <Input
                placeholder="Tên kỳ đánh giá (ví dụ: Đánh giá lao động Quý IV/2026)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{ width: 380 }}
              />
              <Button type="primary" onClick={handleCreatePeriod}>+ Tạo kỳ đánh giá mới</Button>
            </div>

            <div className="milestones-config-matrix">
              <h5>⏱️ Mốc thời gian tương ứng với 5 thời điểm chấm:</h5>
              <div className="milestones-grid">
                {milestones.map((m, idx) => (
                  <div key={idx} className="milestone-config-card">
                    <strong className="m-stage-title">{m.stageLabel}</strong>
                    <div className="m-date-inputs">
                      <label>
                        <span>Ngày mở:</span>
                        <input
                          type="date"
                          value={m.startAt}
                          onChange={(e) => handleMilestoneDateChange(idx, 'startAt', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Hạn chót:</span>
                        <input
                          type="date"
                          value={m.dueAt}
                          onChange={(e) => handleMilestoneDateChange(idx, 'dueAt', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="period-list-container" style={{ marginTop: 20 }}>
            <h4>📋 Danh sách các Kỳ đánh giá hiện có ({periods.length})</h4>
            <div className="period-cards-list">
              {periods.map((p) => (
                <div key={p.id} className="period-card">
                  <div className="period-card-info">
                    <strong>{p.label}</strong>
                    <small>Thời gian kỳ: {formatDate(p.startAt)} – {formatDate(p.dueAt)}</small>
                  </div>
                  <div className="period-card-actions">
                    <Tag color={p.status === 'active' ? 'green' : 'default'}>
                      {p.status === 'active' ? 'Đang diễn ra' : 'Đã đóng kỳ'}
                    </Tag>
                    <Button size="small" onClick={() => togglePeriodStatus(p.id)}>
                      {p.status === 'active' ? 'Đóng kỳ' : 'Mở lại kỳ'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : isAdmin && adminTab === 'import' ? (
        <section className="admin-page-section">
          <div className="importers-panel">
            <div className="importer-mode-selector">
              <span>Chọn loại dữ liệu cần Import:</span>
              <div className="importer-buttons">
                <Button
                  type={importMode === 'employees' ? 'primary' : 'default'}
                  onClick={() => { setImportMode('employees'); setImportedFileName(null); setImportPreviewData([]); }}
                >
                  👤 Import Danh sách Nhân viên
                </Button>
                <Button
                  type={importMode === 'criteria' ? 'primary' : 'default'}
                  onClick={() => { setImportMode('criteria'); setImportedFileName(null); setImportPreviewData([]); }}
                >
                  📋 Import Ma trận Tiêu chí
                </Button>
                <Button
                  type={importMode === 'scores' ? 'primary' : 'default'}
                  onClick={() => { setImportMode('scores'); setImportedFileName(null); setImportPreviewData([]); }}
                >
                  📊 Import Bảng điểm KPI / Có sẵn
                </Button>
              </div>
            </div>

            <div className="import-dropzone" onClick={() => handleSimulateFileUpload(importMode)}>
              <div className="dropzone-icon">📁</div>
              <strong>Nhấp vào đây để chọn tệp Excel (.xlsx) hoặc CSV để Import</strong>
              <p>Hỗ trợ tệp bảng tính mẫu tiêu chuẩn. Hệ thống tự động khớp cột dữ liệu.</p>
              <Button size="small" onClick={(e) => { e.stopPropagation(); handleSimulateFileUpload(importMode); }}>
                Chọn tệp mẫu mô phỏng
              </Button>
            </div>

            {importedFileName && (
              <div className="import-preview-box">
                <div className="imported-file-badge">
                  <span>📄 Tệp đã chọn: <strong>{importedFileName}</strong></span>
                  <Tag color="green">Đã kiểm tra định dạng OK</Tag>
                </div>

                <h5>Bản xem trước dữ liệu ({importPreviewData.length} bản ghi):</h5>
                <div className="preview-table-wrapper">
                  <table className="mini-preview-table">
                    <thead>
                      {importMode === 'employees' ? (
                        <tr><th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Chức danh</th></tr>
                      ) : importMode === 'criteria' ? (
                        <tr><th>Nhóm</th><th>Nội dung tiêu chí</th><th>Điểm tối đa</th></tr>
                      ) : (
                        <tr><th>Mã NV</th><th>Họ tên</th><th>Điểm KPI</th><th>Điểm cộng tự động</th></tr>
                      )}
                    </thead>
                    <tbody>
                      {importPreviewData.map((item, i) => (
                        <tr key={i}>
                          {importMode === 'employees' ? (
                            <><td>{item.code}</td><td>{item.name}</td><td>{item.dept}</td><td>{item.pos}</td></>
                          ) : importMode === 'criteria' ? (
                            <><td>{item.group}</td><td>{item.title}</td><td>{item.maxScore}</td></>
                          ) : (
                            <><td>{item.code}</td><td>{item.name}</td><td>{item.kpiScore}</td><td>+{item.autoPoints}</td></>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="import-actions-row">
                  <Button type="primary" onClick={handleExecuteImport}>
                    ✓ Tiến hành Import vào Hệ thống
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : isAdmin && adminTab === 'groups' ? (
        <section className="admin-page-section">
          <div className="groups-manager-panel" style={{ marginBottom: 24 }}>
            <div className="add-group-card">
              <h4>+ Thêm Nhóm Tiêu chí mới</h4>
              <div className="add-group-row">
                <Input
                  placeholder="Tên nhóm tiêu chí (ví dụ: Kỹ năng phối hợp & Làm việc nhóm)"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                />
                <Select
                  value={newGroupKind}
                  onChange={(val) => setNewGroupKind(val)}
                  options={[
                    { value: 'normal', label: 'Tiêu chuẩn' },
                    { value: 'bonus', label: 'Điểm thưởng (+)' },
                    { value: 'deduction', label: 'Điểm trừ (-)' },
                  ]}
                />
                <Button type="primary" onClick={handleAddGroup}>Thêm nhóm</Button>
              </div>
            </div>

            <div className="groups-list">
              {groups.map((group) => (
                <div key={group.id} className="group-item-card">
                  <div className="group-item-header">
                    <strong>{group.title}</strong>
                    <Tag color={group.kind === 'bonus' ? 'green' : group.kind === 'deduction' ? 'red' : 'blue'}>
                      {group.kind === 'bonus' ? 'Điểm thưởng (+)' : group.kind === 'deduction' ? 'Điểm trừ (-)' : 'Tiêu chuẩn'}
                    </Tag>
                  </div>
                  <div className="group-criteria-mini-list">
                    {group.criteria.length > 0 ? (
                      group.criteria.map((c) => (
                        <div key={c.id} className="criterion-mini-row">
                          <span>• {c.title}</span>
                          <Tag>Tối đa {c.max} điểm</Tag>
                        </div>
                      ))
                    ) : (
                      <small style={{ color: '#98a2b3' }}>Chưa có tiêu chí nào trong nhóm này</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flowchart-manager-panel">
            <div className="emp-select-flow-header">
              <div>
                <h4>🔄 Sơ đồ Flow tiến trình chấm chi tiết theo cá nhân</h4>
                <p>Theo dõi chính xác luồng chuyển duyệt, người thụ lý chấm điểm & mốc thời gian của từng cán bộ</p>
              </div>
              <div className="emp-flow-picker">
                <span>Chọn nhân sự:</span>
                <Select
                  value={selectedEmpCode}
                  onChange={(val) => setSelectedEmpCode(val)}
                  style={{ width: 280 }}
                  options={[
                    { value: 'NV-001', label: 'Nguyễn Minh Anh (NV-001) · Ban Nội dung' },
                    { value: 'NV-005', label: 'Đỗ Quang Huy (NV-005) · Ban Khoa giáo' },
                    { value: 'NV-002', label: 'Trần Thu Hà (NV-002) · Phó Ban Nội dung' },
                  ]}
                />
              </div>
            </div>

            <div className="emp-flow-summary-card">
              <div className="emp-flow-avatar">{initials(currentFlow.name)}</div>
              <div className="emp-flow-meta">
                <strong>{currentFlow.name} ({selectedEmpCode})</strong>
                <small>{currentFlow.pos} · {currentFlow.dept}</small>
              </div>
            </div>

            <div className="flowchart-nodes-container">
              {currentFlow.steps.map((step, idx) => (
                <div key={idx} className={`flowchart-node-card status-${step.status}`}>
                  <div className="node-step-index">{idx + 1}</div>
                  <div className="node-content">
                    <span className="node-stage-label">{step.stage}</span>
                    <strong className="node-reviewer-name">👤 {step.reviewer}</strong>
                    <small className="node-reviewer-role">{step.role}</small>
                    {step.time && <span className="node-timestamp">⏱️ {step.time}</span>}
                  </div>
                  <div className="node-status-tag">
                    <Tag color={step.status === 'completed' ? 'green' : step.status === 'current' ? 'orange' : 'default'}>
                      {step.status === 'completed' ? '✓ Đã hoàn tất' : step.status === 'current' ? '⏳ Đang chấm' : '⚪ Chưa tới lượt'}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (isAdmin || mode !== 'self') && !sheetId ? (
        <EmployeeEvaluationListTable
          sheets={availableSheets}
          onSelectSheet={selectEmployeeSheet}
        />
      ) : draft ? (
        <>
          {/* Back to Employee List Button */}
          {(isAdmin || mode !== 'self') && (
            <div className="back-to-list-bar">
              <Button type="link" onClick={() => setSheetId('')}>
                ← Quay lại danh sách nhân sự ({availableSheets.length})
              </Button>
            </div>
          )}

          {/* Overview Cards Bar */}
          <section className="evaluation-overview">
            <div className="evaluation-person">
              <span className="avatar-box">{initials(draft.employeeName)}</span>
              <div>
                <small className="period-badge">{draft.periodLabel}</small>
                <strong>{draft.employeeName}</strong>
                <p>{draft.employeeCode} · {draft.position} · {draft.department}</p>
              </div>
            </div>

            <div className="evaluation-overview-metric">
              <small>Tiến độ chấm</small>
              <strong>{completion}%</strong>
              <Progress percent={completion} showInfo={false} strokeColor="#D92D20" size="small" />
            </div>

            <div className="evaluation-overview-metric highlight-score">
              <small>Tổng điểm hiện tại</small>
              <strong className="live-score">{totalScore(draft)}</strong>
            </div>

            <div className="evaluation-overview-metric">
              <small>Hạn hoàn thành</small>
              <strong>{formatDate(draft.dueAt)}</strong>
              <span>Đã chấm {answered}/{criteria.length} tiêu chí</span>
            </div>

            <div className="evaluation-overview-status">
              <small>Trạng thái & Cấp</small>
              <strong>{stageLabels[currentStage]}</strong>
              <span className={`status-${draft.status}`}>{statusLabels[draft.status]}</span>
            </div>
          </section>

          {/* Previous Stage Scores History */}
          {previousStages.length > 0 && (
            <section className="evaluation-stage-summary" aria-label="Điểm tổng theo từng cấp">
              <span className="summary-title">Lịch sử tổng điểm</span>
              <div className="stages-flow">
                {previousStages.map((stage) => (
                  <div key={stage} className="stage-item">
                    <small>{stageLabels[stage]}</small>
                    <strong>{draft.stageTotals?.[stage] ?? '—'}</strong>
                  </div>
                ))}
                <div className="stage-item current">
                  <small>{stageLabels[currentStage]} (Hiện tại)</small>
                  <strong>{totalScore(draft)}</strong>
                </div>
              </div>
            </section>
          )}

          {/* Criteria Main Stream */}
          <section className="evaluation-stream" aria-label="Danh sách tiêu chí đánh giá">
            {draft.groups.map((group) => {
              const groupAnswered = group.criteria.filter((c) => c.score !== null).length;
              const groupScore = group.criteria.reduce((sum, c) => sum + (c.score ?? 0), 0);

              return (
                <section className="evaluation-stream-group" key={group.id}>
                  <header>
                    <div className="group-title-box">
                      <span className={`kind-icon kind-${group.kind}`}>
                        {group.kind === 'bonus' ? '+' : group.kind === 'deduction' ? '−' : '•'}
                      </span>
                      <div>
                        <h2>{group.title}</h2>
                        <p>
                          Hoàn thành {groupAnswered}/{group.criteria.length} tiêu chí
                        </p>
                      </div>
                    </div>
                    <strong className="group-score-sum">
                      Tổng nhóm: {groupScore} điểm
                    </strong>
                  </header>
                  <div className="group-rows-container">
                    {group.criteria.map((criterion) => (
                      <EvaluationCriterionRow
                        key={`${draft.id}-${criterion.id}`}
                        criterion={criterion}
                        order={criteria.findIndex((item) => item.id === criterion.id) + 1}
                        previousStages={previousStages}
                        readOnly={readOnly}
                        onOpenNote={() => openNote(criterion)}
                        onScoreChange={(score) => updateCriterion(criterion.id, { score })}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </section>

          {/* Sticky Bottom Action Bar */}
          <footer className="evaluation-actionbar">
            <div className="actionbar-info">
              <strong>
                {isAdmin
                  ? '🛡️ Chế độ Giám sát Hệ thống (Dành cho Admin)'
                  : readOnly
                  ? 'Phiếu ở chế độ chỉ đọc'
                  : completion === 100
                  ? '✓ Đã hoàn thành chấm điểm toàn bộ 100% tiêu chí'
                  : `Còn ${criteria.length - answered} tiêu chí chưa có điểm`}
              </strong>
              <small>
                {isAdmin
                  ? 'Tài khoản Admin không tham gia tự chấm hay chấm điểm. Admin quản lý nhóm, quy trình và kỳ đánh giá.'
                  : readOnly
                  ? 'Kết quả đã được chuyển sang cấp xử lý tiếp theo hoặc công bố chính thức.'
                  : 'Điểm tổng và lịch sử cập nhật tức thời trên toàn hệ thống.'}
              </small>
            </div>

            {!readOnly && !isAdmin && (
              <div className="actionbar-buttons">
                <Button
                  className="btn-save-draft"
                  loading={saving}
                  onClick={() => void persist(false)}
                >
                  <span className="btn-icon">💾</span>
                  <span>Lưu bản nháp</span>
                </Button>
                <Button
                  type="primary"
                  className={`btn-submit-evaluation stage-${mode}`}
                  disabled={completion < 100}
                  loading={saving}
                  onClick={() => void persist(true)}
                >
                  <span className="btn-submit-icon" aria-hidden="true">
                    {mode === 'self' ? '🚀' : mode === 'council' ? '👑' : '✅'}
                  </span>
                  <span className="btn-submit-text">
                    {mode === 'self'
                      ? 'Gửi phiếu đánh giá'
                      : mode === 'council'
                      ? 'Chốt kết quả đánh giá'
                      : 'Hoàn tất chấm điểm'}
                  </span>
                </Button>
              </div>
            )}
          </footer>
        </>
      ) : (
        <section className="evaluation-empty">
          <Empty description="Không có phiếu đánh giá nào phù hợp với lựa chọn hiện tại" />
        </section>
      )}

      {/* Note Modal */}
      <Modal
        title="Ghi chú tiêu chí"
        open={Boolean(noteCriterion)}
        onOk={saveNote}
        onCancel={() => setNoteCriterionId(null)}
        okText="Lưu ghi chú"
        cancelText="Hủy"
        destroyOnHidden
        width={580}
      >
        <div className="evaluation-note-modal">
          {noteCriterion && (
            <>
              <div className="note-criterion-header">
                <Tag color="red">Tiêu chí {criteria.findIndex((c) => c.id === noteCriterion.id) + 1}</Tag>
                <strong>{noteCriterion.title}</strong>
              </div>
              <p className="note-guide">
                Ghi lại căn cứ, kết quả cụ thể, đường dẫn bài viết hoặc minh chứng cần lưu kèm tiêu chí này.
              </p>

              <Input.TextArea
                aria-label="Nội dung ghi chú"
                rows={6}
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Nhập nội dung ghi chú hoặc minh chứng..."
                maxLength={2000}
                showCount
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export function EvaluationsPage() {
  const state = useAsyncData(async () => {
    const [periods, sheets] = await Promise.all([evaluationApi.periods(), evaluationApi.sheets()]);
    return { periods: periods.data, sheets: sheets.data };
  });

  if (state.loading)
    return (
      <div className="module-page">
        <ContentSkeleton rows={10} />
      </div>
    );

  if (state.error || !state.data)
    return <ErrorState message={state.error ?? 'Không thể tải dữ liệu đánh giá.'} onRetry={state.reload} />;

  return (
    <EvaluationWorkspace
      periods={state.data.periods}
      sheets={state.data.sheets}
      onReload={state.reload}
    />
  );
}

