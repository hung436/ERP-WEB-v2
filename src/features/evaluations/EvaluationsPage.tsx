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
  mode === 'self'
    ? []
    : sheet.stage === 'published'
    ? stageOrder
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
  const [activeTab, setActiveTab] = useState<'groups' | 'workflow'>('groups');
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
      title="⚙️ Quản lý Nhóm & Quy trình Đánh giá Lao động (Admin)"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Lưu & Đóng</Button>,
      ]}
      width={840}
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
            type={activeTab === 'workflow' ? 'primary' : 'default'}
            onClick={() => setActiveTab('workflow')}
          >
            🔄 Quy trình xử lý 5 cấp
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
          <div className="workflow-manager-panel">
            <div className="workflow-intro">
              <h4>🔄 Cấu hình Quy trình xử lý & Phê duyệt Đánh giá Lao động (5 Cấp)</h4>
              <p>Hệ thống tự động chuyển tiếp hồ sơ đánh giá theo đúng thứ tự các cấp phê duyệt bên dưới:</p>
            </div>

            <div className="workflow-steps-cards">
              <div className="workflow-step-card active">
                <span className="step-num">Cấp 1</span>
                <div className="step-detail">
                  <strong>Tự đánh giá cá nhân</strong>
                  <small>Nhân viên tự chấm điểm và gửi minh chứng kết quả công việc (Hạn 5 ngày)</small>
                </div>
                <Tag color="blue">Kích hoạt</Tag>
              </div>
              <div className="workflow-step-card">
                <span className="step-num">Cấp 2</span>
                <div className="step-detail">
                  <strong>Đánh giá cấp Phó phòng/ban</strong>
                  <small>Phó đơn vị rà soát điểm tự chấm và đưa ra nhận xét (Hạn 3 ngày)</small>
                </div>
                <Tag color="blue">Kích hoạt</Tag>
              </div>
              <div className="workflow-step-card">
                <span className="step-num">Cấp 3</span>
                <div className="step-detail">
                  <strong>Phê duyệt Trưởng phòng/ban</strong>
                  <small>Trưởng đơn vị chấm điểm chính thức và xác nhận xếp loại (Hạn 3 ngày)</small>
                </div>
                <Tag color="blue">Kích hoạt</Tag>
              </div>
              <div className="workflow-step-card">
                <span className="step-num">Cấp 4</span>
                <div className="step-detail">
                  <strong>Rà soát Ban Biên tập / Phòng Tổ chức</strong>
                  <small>Tổng hợp số liệu toàn cơ quan, kiểm tra tính đồng đều giữa các ban (Hạn 2 ngày)</small>
                </div>
                <Tag color="blue">Kích hoạt</Tag>
              </div>
              <div className="workflow-step-card">
                <span className="step-num">Cấp 5</span>
                <div className="step-detail">
                  <strong>Chốt kết quả Hội đồng Thi đua Khen thưởng</strong>
                  <small>Chốt điểm thi đua chính thức và công bố kết quả toàn cơ quan (Hạn 2 ngày)</small>
                </div>
                <Tag color="green">Chốt công bố</Tag>
              </div>
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
  const [periodList, setPeriodList] = useState<EvaluationPeriod[]>(periods);
  const [label, setLabel] = useState('');
  const [dueAt, setDueAt] = useState('2026-09-30');

  useEffect(() => {
    setPeriodList(periods);
  }, [periods]);

  const handleCreate = () => {
    if (!label.trim()) {
      message.error('Vui lòng nhập tên kỳ đánh giá mới');
      return;
    }
    const created: EvaluationPeriod = {
      id: `period-${Date.now()}`,
      label: label.trim(),
      startAt: new Date().toISOString(),
      dueAt: new Date(dueAt).toISOString(),
      status: 'active',
    };
    const updated = [created, ...periodList];
    setPeriodList(updated);
    onAddPeriod(created);
    setLabel('');
    message.success(`Đã khởi tạo kỳ đánh giá "${created.label}" thành công`);
  };

  const toggleStatus = (id: string) => {
    const updated = periodList.map((p) =>
      p.id === id ? { ...p, status: (p.status === 'active' ? 'closed' : 'active') as 'active' | 'closed' } : p
    );
    setPeriodList(updated);
    message.success('Đã cập nhật trạng thái kỳ đánh giá');
  };

  return (
    <Modal
      title="📅 Quản lý Kỳ đánh giá Lao động (Admin)"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Lưu & Đóng</Button>,
      ]}
      width={720}
      destroyOnHidden
    >
      <div className="admin-periods-modal-body">
        <div className="create-period-box">
          <h4>+ Khởi tạo Kỳ đánh giá Lao động mới</h4>
          <div className="create-period-form">
            <Input
              placeholder="Tên kỳ đánh giá (ví dụ: Đánh giá lao động Quý IV/2026)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <div className="due-date-picker">
              <span>Hạn hoàn thành:</span>
              <Input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
            <Button type="primary" onClick={handleCreate}>Tạo kỳ đánh giá</Button>
          </div>
        </div>

        <div className="period-list-container">
          <h4>📋 Danh sách các Kỳ đánh giá trong hệ thống ({periodList.length})</h4>
          <div className="period-cards-list">
            {periodList.map((p) => (
              <div key={p.id} className="period-card">
                <div className="period-card-info">
                  <strong>{p.label}</strong>
                  <small>Hạn hoàn thành: {formatDate(p.dueAt)}</small>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSheetId = searchParams.get('sheetId') ?? '';

  const [periods, setPeriods] = useState<EvaluationPeriod[]>(initialPeriods);
  const [mode, setMode] = useState<EvaluationMode>('self');
  const [periodId, setPeriodId] = useState(periods.find((p) => p.status === 'active')?.id ?? periods[0]?.id ?? '');
  const [sheetId, setSheetIdState] = useState(paramSheetId);

  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);
  const [managePeriodsOpen, setManagePeriodsOpen] = useState(false);

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
      sheets.filter(
        (sheet) =>
          sheet.periodId === periodId &&
          (mode === 'self'
            ? sheet.employeeCode === 'NV-001'
            : mode === 'scoring'
            ? sheet.employeeCode !== 'NV-001' && sheet.stage !== 'council'
            : sheet.employeeCode !== 'NV-001' && (sheet.stage === 'council' || sheet.status === 'published'))
      ),
    [mode, periodId, sheets]
  );

  const [draft, setDraft] = useState<EvaluationSheet | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteCriterionId, setNoteCriterionId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => {
    if (mode === 'self') {
      const selected = availableSheets[0] ?? null;
      setDraft(selected);
    } else {
      const selected = availableSheets.find((sheet) => sheet.id === sheetId) ?? null;
      setDraft(selected);
    }
  }, [availableSheets, mode, sheetId]);

  const selectEmployeeSheet = (id: string) => {
    setSheetId(id);
  };

  const criteria = useMemo(() => draft?.groups.flatMap((group) => group.criteria) ?? [], [draft]);
  const answered = criteria.filter((criterion) => criterion.score !== null).length;
  const completion = criteria.length > 0 ? Math.round((answered / criteria.length) * 100) : 0;
  const currentStage: EvaluationStage =
    mode === 'self' ? 'self' : mode === 'council' ? 'council' : draft?.stage === 'published' ? 'council' : draft?.stage ?? 'deputy';
  const previousStages = draft ? previousStagesFor(draft, mode) : [];
  const readOnly = !draft || draft.status === 'published' || (mode === 'self' && draft.status !== 'draft');
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
    if (!draft) return;
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
            <h1>Đánh giá lao động</h1>
          </div>
        </div>

        <div className="evaluation-workspace-controls">
          {/* Admin Management Action Buttons */}
          {(user?.role === 'admin' || true) && (
            <div className="admin-actions-bar">
              <Button
                className="admin-btn group-mgr-btn"
                onClick={() => setManageGroupsOpen(true)}
              >
                ⚙️ Quản lý nhóm & Quy trình
              </Button>
              <Button
                className="admin-btn period-mgr-btn"
                onClick={() => setManagePeriodsOpen(true)}
              >
                📅 Quản lý kỳ đánh giá
              </Button>
            </div>
          )}

          {/* Flat Underline Tabs (Ant Design Line Tab Aesthetic) */}
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

      {mode !== 'self' && !sheetId ? (
        <EmployeeEvaluationListTable
          sheets={availableSheets}
          onSelectSheet={selectEmployeeSheet}
        />
      ) : draft ? (
        <>
          {/* Back to Employee List Button when in scoring/council mode */}
          {mode !== 'self' && (
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
                {readOnly
                  ? 'Phiếu ở chế độ chỉ đọc'
                  : completion === 100
                  ? '✓ Đã hoàn thành chấm điểm toàn bộ 100% tiêu chí'
                  : `Còn ${criteria.length - answered} tiêu chí chưa có điểm`}
              </strong>
              <small>
                {readOnly
                  ? 'Kết quả đã được chuyển sang cấp xử lý tiếp theo hoặc công bố chính thức.'
                  : 'Điểm tổng và lịch sử cập nhật tức thời trên toàn hệ thống.'}
              </small>
            </div>

            {!readOnly && (
              <div className="actionbar-buttons">
                <Button loading={saving} onClick={() => void persist(false)}>
                  Lưu bản nháp
                </Button>
                <Button
                  type="primary"
                  disabled={completion < 100}
                  loading={saving}
                  onClick={() => void persist(true)}
                >
                  {mode === 'self'
                    ? 'Gửi phiếu'
                    : mode === 'council'
                    ? 'Chốt kết quả'
                    : 'Hoàn tất chấm điểm'}
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

      {/* Admin Modals */}
      <AdminManageGroupsModal
        open={manageGroupsOpen}
        onClose={() => setManageGroupsOpen(false)}
      />

      <AdminManagePeriodsModal
        open={managePeriodsOpen}
        periods={periods}
        onClose={() => setManagePeriodsOpen(false)}
        onAddPeriod={(newPeriod) => {
          setPeriods([newPeriod, ...periods]);
          setPeriodId(newPeriod.id);
        }}
      />
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

