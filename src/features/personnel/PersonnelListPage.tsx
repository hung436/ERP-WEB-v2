import { Avatar, Button, Dropdown, Drawer, Empty, Input, Modal, Select, Table, Tag, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BriefcaseBusiness, Eye, History, Pencil } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { evaluationCampaigns } from '@/mocks/evaluationFixtures';
import evaluationPersonnelRows from '@/mocks/evaluationPersonnelFixtures.json';
import { evaluationApi } from '@/services/api';
import type { EvaluationCampaignFixture } from '@/mocks/evaluationFixtures';
import type { EvaluationPeriod, EvaluationSheet } from '@/types/evaluation';
import type { PersonnelAssignment } from '@/types/personnel';
import './personnel-list.css';

type EvaluationPersonnelRow = (typeof evaluationPersonnelRows)[number] & { id: string };
type EvaluationGroup = 'BBT' | 'TKTS' | 'TPPB' | 'BTV' | 'NVND' | 'NVCN' | 'NVKD' | 'NVTS' | 'PVCT' | 'PVCM';
type EmploymentStatus = 'Đang công tác' | 'Tạm hoãn' | 'Đã nghỉ việc';
type WorkflowStep = { id: number; role: string; reviewer: string };
type PersonnelDocument = { name: string; date: string; size: string; type: string };

const groupOptions: { value: EvaluationGroup; label: string }[] = [
  { value: 'BBT', label: 'BBT (Ban Biên tập)' },
  { value: 'TKTS', label: 'TKTS (Thư ký tòa soạn)' },
  { value: 'TPPB', label: 'TPPB (Trưởng/phó đơn vị)' },
  { value: 'BTV', label: 'BTV (Biên tập viên)' },
  { value: 'NVND', label: 'NVND (Nhân viên nội dung)' },
  { value: 'NVCN', label: 'NVCN (Nhân viên công nghệ)' },
  { value: 'NVKD', label: 'NVKD (Nhân viên kinh doanh)' },
  { value: 'NVTS', label: 'NVTS (Nhân viên trị sự)' },
  { value: 'PVCT', label: 'PVCT (Phóng viên chính thức)' },
  { value: 'PVCM', label: 'PVCM (Phóng viên các mức)' },
];

const evaluationModels = [...new Set(evaluationPersonnelRows.map((row) => row.evaluationModel))];
const departmentOptions = [...new Set(evaluationPersonnelRows.map((row) => row.department))].sort((a, b) => a.localeCompare(b, 'vi'));
const personnelRows: EvaluationPersonnelRow[] = evaluationPersonnelRows.map((row) => ({
  ...row,
  id: `excel-${row.sourceRow}`,
}));
const employmentStatusOptions: EmploymentStatus[] = ['Đang công tác', 'Tạm hoãn', 'Đã nghỉ việc'];

const statusLabels: Record<EvaluationSheet['status'], string> = {
  draft: 'Đang xử lý',
  waiting: 'Chờ đánh giá',
  in_review: 'Đang đánh giá',
  completed: 'Hoàn tất',
  published: 'Đã công bố',
};

const statusColors: Record<EvaluationSheet['status'], string> = {
  draft: 'processing',
  waiting: 'warning',
  in_review: 'processing',
  completed: 'success',
  published: 'success',
};

const initialWorkflow: WorkflowStep[] = [
  { id: 1, role: 'Tự đánh giá', reviewer: 'Cá nhân tự đánh giá' },
  { id: 2, role: 'Cấp Quản lý', reviewer: 'Trần Xuân Toàn (Quản lý trực tiếp)' },
  { id: 3, role: 'Cấp Lãnh đạo', reviewer: 'Lê Xuân Trung (Ban Lãnh đạo)' },
  { id: 4, role: 'Hội đồng thi đua', reviewer: 'Hội đồng đánh giá chất lượng' },
];

const campaignStages = [
  { key: 'start', label: 'Bắt đầu', scheduleLabel: 'Bắt đầu tự đánh giá', icon: '▷' },
  { key: 'step1', label: 'Cấp chấm thứ 1', scheduleLabel: 'Cấp chấm thứ 1', icon: '👤' },
  { key: 'step2', label: 'Cấp chấm thứ 2', scheduleLabel: 'Cấp chấm thứ 2', icon: '✓' },
  { key: 'step3', label: 'Cấp chấm thứ 3', scheduleLabel: 'Cấp chấm thứ 3', icon: '📄' },
  { key: 'council', label: 'Hội đồng', scheduleLabel: 'Hội đồng', icon: '🏆' },
  { key: 'publish', label: 'Công bố', scheduleLabel: 'Công bố kết quả', icon: '📢' },
] as const;

type CampaignDateKey = (typeof campaignStages)[number]['key'];

const initialCampaignDates: Record<CampaignDateKey, string> = {
  start: '30/09/2026',
  step1: '01/11/2026',
  step2: '02/11/2026',
  step3: '03/11/2026',
  council: '05/11/2026',
  publish: '06/11/2026',
};

const emptyPeriods: EvaluationPeriod[] = [];
const emptySheets: EvaluationSheet[] = [];

const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

function findEvaluation(record: EvaluationPersonnelRow, sheets: EvaluationSheet[]) {
  return sheets.find((sheet) => sheet.employeeName.trim().toLocaleLowerCase('vi') === record.fullName.trim().toLocaleLowerCase('vi'));
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function getStageLabel(sheet?: EvaluationSheet) {
  if (!sheet) return 'Chưa có phiếu đánh giá trong kỳ này';
  if (sheet.status === 'published' || sheet.stage === 'published') return 'Đã công bố kết quả';
  const stages: Record<EvaluationSheet['stage'], string> = {
    self: 'Tự đánh giá',
    deputy: 'Cấp đánh giá thứ 1',
    manager: 'Cấp đánh giá thứ 2',
    editorial: 'Cấp đánh giá thứ 3',
    council: 'Hội đồng đánh giá',
    published: 'Đã công bố',
  };
  const reviewer = sheet.stageEvaluators?.[sheet.stage] ?? sheet.evaluatorName;
  return reviewer ? `${stages[sheet.stage]} · ${reviewer}` : stages[sheet.stage];
}

export function PersonnelListPage() {
  const navigate = useNavigate();
  const state = useAsyncData(async () => {
    const [periodsResult, evaluationsResult] = await Promise.all([
      evaluationApi.periods(),
      evaluationApi.sheets(),
    ]);
    return {
      periods: periodsResult.data,
      evaluations: evaluationsResult.data,
    };
  });

  const people = personnelRows;
  const periods = state.data?.periods ?? emptyPeriods;
  const sheets = state.data?.evaluations ?? emptySheets;
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const currentPeriod = periods.find((period) => period.id === selectedPeriodId) ?? periods[0];
  const periodSheets = sheets.filter((sheet) => sheet.periodId === currentPeriod?.id);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [group, setGroup] = useState<EvaluationGroup | ''>('');
  const [model, setModel] = useState('');
  const [modelOverrides, setModelOverrides] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState('');
  const [participationOverrides, setParticipationOverrides] = useState<Record<string, boolean>>({});
  const [assignmentOverrides, setAssignmentOverrides] = useState<Record<string, PersonnelAssignment[]>>({});
  const [departmentOverrides, setDepartmentOverrides] = useState<Record<string, string>>({});
  const [employmentStatuses, setEmploymentStatuses] = useState<Record<string, EmploymentStatus>>({});
  const [workflow, setWorkflow] = useState<WorkflowStep[]>(initialWorkflow);
  const [draggedStep, setDraggedStep] = useState<number | null>(null);
  const [modal, setModal] = useState<'roles' | 'history' | 'work-status' | 'campaign' | null>(null);
  const [roleDraft, setRoleDraft] = useState<PersonnelAssignment[]>([]);
  const [workStatusDraft, setWorkStatusDraft] = useState<EmploymentStatus>('Đang công tác');
  const [campaignStep, setCampaignStep] = useState(1);
  const [campaignName, setCampaignName] = useState('Đánh giá lao động Quý 3 năm 2026');
  const [campaignDates, setCampaignDates] = useState(initialCampaignDates);
  const [campaign, setCampaign] = useState(evaluationCampaigns[0]);
  const [criteriaSearch, setCriteriaSearch] = useState('');
  const [drawerGroup, setDrawerGroup] = useState<EvaluationGroup | null>(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [documents, setDocuments] = useState<Record<string, PersonnelDocument[]>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!selectedPeriodId && periods[0]) setSelectedPeriodId(periods[0].id);
  }, [periods, selectedPeriodId]);

  useEffect(() => {
    setPage(1);
  }, [search, department, group, model]);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return people.filter((person) => {
      const departmentValue = departmentOverrides[person.id] ?? person.department;
      const positions = assignmentOverrides[person.id]?.map((assignment) => assignment.position) ?? person.positions;
      const evaluationModel = modelOverrides[person.id] ?? person.evaluationModel;
      const searchable = [
        person.fullName,
        person.groupCode,
        departmentValue,
        ...positions,
        evaluationModel,
        person.reviewer1,
        person.reviewer2,
        person.reviewer3,
        person.councilReviewer,
      ].join(' ').toLocaleLowerCase('vi');
      return (
        (!query || searchable.includes(query)) &&
        (!department || departmentValue === department) &&
        (!group || person.groupCode === group) &&
        (!model || evaluationModel === model)
      );
    });
  }, [people, search, department, group, model, modelOverrides, assignmentOverrides, departmentOverrides]);

  const selectedPerson = people.find((person) => person.id === selectedId) ?? filteredPeople[0];
  const selectedEvaluation = selectedPerson ? findEvaluation(selectedPerson, periodSheets) : undefined;
  const selectedAssignments = selectedPerson
    ? assignmentOverrides[selectedPerson.id] ?? selectedPerson.positions.map((position, index) => ({
      department: departmentOverrides[selectedPerson.id] ?? selectedPerson.department,
      position,
      isPrimary: index === 0,
    }))
    : [];
  const selectedParticipates = selectedPerson
    ? participationOverrides[selectedPerson.id] ?? true
    : false;
  const selectedTemplate = selectedPerson
    ? modelOverrides[selectedPerson.id] ?? selectedPerson.evaluationModel
    : '';
  const selectedDocuments = selectedPerson ? documents[selectedPerson.id] ?? [] : [];
  const selectedDepartment = selectedPerson
    ? departmentOverrides[selectedPerson.id] ?? selectedPerson.department
    : '';
  const campaignGroupRows = groupOptions.map((option, index) => {
    const members = people.filter((person) => person.groupCode === option.value);
    return {
      ...option,
      index: index + 1,
      members,
      names: members.slice(0, 6).map((person) => person.fullName.toLocaleUpperCase('vi')),
    };
  });
  const visibleCampaignGroupRows = campaignGroupRows.filter((item) =>
    `${item.label} ${item.members.map((person) => person.fullName).join(' ')}`
      .toLocaleLowerCase('vi')
      .includes(criteriaSearch.trim().toLocaleLowerCase('vi'))
  );
  const drawerMembers = drawerGroup
    ? people.filter((person) =>
      person.groupCode === drawerGroup &&
      `${person.fullName} ${person.groupCode} ${person.positions.join(' ')} ${departmentOverrides[person.id] ?? person.department}`
        .toLocaleLowerCase('vi')
        .includes(drawerSearch.trim().toLocaleLowerCase('vi'))
    )
    : [];

  const openRoleEditor = (person: EvaluationPersonnelRow) => {
    setRoleDraft(assignmentOverrides[person.id] ?? person.positions.map((position, index) => ({
      department: departmentOverrides[person.id] ?? person.department,
      position,
      isPrimary: index === 0,
    })));
    setSelectedId(person.id);
    setModal('roles');
  };

  const saveRoles = () => {
    if (!selectedPerson) return;
    setAssignmentOverrides((previous) => ({ ...previous, [selectedPerson.id]: roleDraft }));
    const mainAssignment = roleDraft.find((assignment) => assignment.isPrimary) ?? roleDraft[0];
    if (mainAssignment) setDepartmentOverrides((previous) => ({ ...previous, [selectedPerson.id]: mainAssignment.department }));
    setModal(null);
    message.success('Đã cập nhật đơn vị và chức vụ trong phiên làm việc.');
  };

  const updateParticipation = (checked: boolean) => {
    if (!selectedPerson) return;
    setParticipationOverrides((previous) => ({ ...previous, [selectedPerson.id]: checked }));
    message.success(`${selectedPerson.fullName} ${checked ? 'tham gia' : 'không tham gia'} đánh giá.`);
  };

  const createCampaign = () => {
    const createdCampaign: EvaluationCampaignFixture = {
      id: `campaign-${Date.now()}`,
      name: campaignName.trim() || 'Đánh giá lao động Quý 3 năm 2026',
      status: 'active',
      start: campaignDates.start,
      step1: campaignDates.step1,
      step2: campaignDates.step2,
      step3: campaignDates.step3,
      council: campaignDates.council,
      publish: campaignDates.publish,
      flow: 'v1 | * v2',
    };
    setCampaign(createdCampaign);
    setCampaignName(createdCampaign.name);
    setCampaignStep(2);
    message.success(`Đã khởi tạo đợt thi đua: ${createdCampaign.name}`);
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setGroup('');
    setModel('');
    setPage(1);
  };

  const changeEmploymentStatus = (person: EvaluationPersonnelRow) => {
    setSelectedId(person.id);
    setWorkStatusDraft(employmentStatuses[person.id] ?? 'Đang công tác');
    setModal('work-status');
  };

  const saveEmploymentStatus = () => {
    if (!selectedPerson) return;
    setEmploymentStatuses((previous) => ({ ...previous, [selectedPerson.id]: workStatusDraft }));
    setModal(null);
    message.success(`Đã cập nhật tình trạng làm việc của ${selectedPerson.fullName}.`);
  };

  const viewPersonnelRecord = (person: EvaluationPersonnelRow) => {
    setSelectedId(person.id);
    document.getElementById('profilePanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const actionMenuItems: MenuProps['items'] = [
    { key: 'history', label: <span className="personnel-action-item action-blue"><History aria-hidden="true" size={15} />Lịch sử lưu file hồ sơ</span> },
    { key: 'view', label: <span className="personnel-action-item action-blue"><Eye aria-hidden="true" size={15} />Xem hồ sơ</span> },
    { key: 'edit', label: <span className="personnel-action-item action-green"><Pencil aria-hidden="true" size={15} />Chỉnh sửa bộ phận / chức vụ</span> },
    { key: 'status', label: <span className="personnel-action-item action-red"><BriefcaseBusiness aria-hidden="true" size={15} />Thay đổi tình trạng làm việc</span> },
  ];

  const onActionMenuClick = (person: EvaluationPersonnelRow, key: string) => {
    if (key === 'history') {
      setSelectedId(person.id);
      setModal('history');
    } else if (key === 'view') {
      viewPersonnelRecord(person);
    } else if (key === 'edit') {
      openRoleEditor(person);
    } else if (key === 'status') {
      changeEmploymentStatus(person);
    }
  };

  const columns: ColumnsType<EvaluationPersonnelRow> = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'name',
      width: 230,
      render: (_, person) => {
        return (
          <div className="person-cell">
            <Avatar size={32}>
              {initials(person.fullName)}
            </Avatar>
            <div className="person-info">
              <span className="person-name">{person.fullName}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Nhóm đối tượng',
      key: 'group',
      dataIndex: 'groupCode',
      width: 120,
      render: (value: string) => <span className="badge-mau">{value}</span>,
    },
    {
      title: 'Bộ phận công tác',
      dataIndex: 'department',
      key: 'department',
      width: 230,
      render: (value: string, person) => <span className="dept-badge">{departmentOverrides[person.id] ?? value}</span>,
    },
    {
      title: 'Chức vụ Đảng, Chính quyền, Đoàn thể',
      dataIndex: 'positions',
      key: 'positions',
      width: 310,
      render: (positions: string[], person) => (
        <div className="chuc-vu-stack">
          {(assignmentOverrides[person.id]?.map((assignment) => assignment.position) ?? positions).map((position, index) => (
            <div className="chuc-vu-line" key={`${position}-${index}`}>{position}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'ĐÁNH GIÁ LAO ĐỘNG',
      children: [
        {
          title: 'Cá nhân tự đánh giá',
          dataIndex: 'evaluationModel',
          key: 'evaluationModel',
          width: 180,
          render: (value: string, person) => <span className="badge-mau">{modelOverrides[person.id] ?? value}</span>,
        },
        { title: 'Cấp đánh giá thứ 1', dataIndex: 'reviewer1', key: 'reviewer1', width: 170, render: (value: string) => value || '—' },
        { title: 'Cấp đánh giá thứ 2', dataIndex: 'reviewer2', key: 'reviewer2', width: 170, render: (value: string) => value || '—' },
        { title: 'Cấp đánh giá thứ 3', dataIndex: 'reviewer3', key: 'reviewer3', width: 170, render: (value: string) => value || '—' },
        { title: 'Hội đồng đánh giá', dataIndex: 'councilReviewer', key: 'councilReviewer', width: 170, render: (value: string) => value || '—' },
      ],
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, person) => (
        <Dropdown
          menu={{ items: actionMenuItems, onClick: ({ key }) => onActionMenuClick(person, key) }}
          trigger={['click']}
        >
          <Button aria-label={`Thao tác với ${person.fullName}`} onClick={(event) => event.stopPropagation()}>
            Thao tác
          </Button>
        </Dropdown>
      ),
    },
  ];

  const importFile = (file?: File) => {
    if (!file) return;
    message.success(`Đã nạp file quy trình: ${file.name}`);
  };

  const importDocument = (file?: File) => {
    if (!file || !selectedPerson) return;
    const document: PersonnelDocument = {
      name: file.name,
      date: formatDate(new Date().toISOString()),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
    };
    setDocuments((previous) => ({
      ...previous,
      [selectedPerson.id]: [document, ...(previous[selectedPerson.id] ?? [])],
    }));
    message.success(`Đã import lý lịch: ${file.name}`);
  };

  const reorderWorkflow = (targetIndex: number) => {
    if (draggedStep === null || draggedStep === targetIndex) return;
    setWorkflow((previous) => {
      const next = [...previous];
      const [moved] = next.splice(draggedStep, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedStep(null);
  };

  return (
    <div className="module-page personnel-list-page">
      <main className="peopleos-shell">
        <header className="peopleos-mast">
          <div className="peopleos-brand">
            <div className="peopleos-logo">P</div>
            <span>PeopleOS</span>
          </div>
          <div className="peopleos-mast-right">
            <div className="peopleos-avatar">AD</div>
            <span>Quản trị viên</span>
          </div>
        </header>

        <section className="peopleos-intro">
          <h1>Quản trị nhân sự &amp; quy trình đánh giá</h1>
          <div className="peopleos-actions">
            <button className="peopleos-btn peopleos-btn-primary" onClick={() => { setCampaignStep(1); setModal('campaign'); }} type="button">＋ Tạo bình bầu</button>
            <button className="peopleos-btn peopleos-btn-green" onClick={() => message.info('Đang xuất file quy trình...')} type="button">⇩ Xuất file quy trình</button>
            <label className="peopleos-btn peopleos-btn-green peopleos-file-action">
              ⇧ Import quy trình
              <input accept=".xlsx,.xls" className="hidden-file" onChange={(event) => importFile(event.target.files?.[0])} type="file" />
            </label>
            <button className="peopleos-btn peopleos-btn-indigo" onClick={() => navigate('/personnel/create')} type="button">＋ Thêm nhân sự</button>
          </div>
        </section>

        {state.loading ? (
          <ContentSkeleton rows={4} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : (
          <>
            <div className="peopleos-workspace">
              <div className="peopleos-left-stack">
                <section className="peopleos-card peopleos-section">
                  <div className="peopleos-section-title">
                    <div>
                      <span className="section-kicker">Danh sách nhân sự</span>
                      <h2>Danh sách nhân sự &amp; Chức vụ</h2>
                    </div>
                    <Select
                      aria-label="Kỳ đánh giá"
                      onChange={setSelectedPeriodId}
                      options={periods.map((period: EvaluationPeriod) => ({ value: period.id, label: period.label }))}
                      value={currentPeriod?.id}
                    />
                  </div>

                  <div className="peopleos-toolbar">
                    <Input
                      aria-label="Tìm tên, chức vụ, bộ phận"
                      className="peopleos-search"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="⌕ Tìm tên, chức vụ, bộ phận..."
                      value={search}
                    />
                    <Select
                      allowClear
                      aria-label="Lọc bộ phận"
                      onChange={(value) => setDepartment(value ?? '')}
                      placeholder="Tất cả bộ phận"
                      value={department || undefined}
                    >
                      {[...new Set([...departmentOptions, ...Object.values(departmentOverrides)])].map((item) => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                    </Select>
                    <Select
                      allowClear
                      aria-label="Lọc nhóm đối tượng"
                      onChange={(value: EvaluationGroup | undefined) => setGroup(value ?? '')}
                      placeholder="Tất cả nhóm đối tượng"
                      value={group || undefined}
                    >
                      {groupOptions.map((item) => <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>)}
                    </Select>
                    <Select
                      allowClear
                      aria-label="Lọc mẫu đánh giá"
                      onChange={(value) => setModel(value ?? '')}
                      placeholder="Mọi mẫu đánh giá"
                      value={model || undefined}
                    >
                      {evaluationModels.map((item) => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                    </Select>
                    <Button className="btn sm" onClick={clearFilters}>Đặt lại</Button>
                  </div>

                  <div className="peopleos-tablewrap">
                    {filteredPeople.length ? (
                      <Table
                        columns={columns}
                        dataSource={filteredPeople}
                        onRow={(person) => ({
                          className: person.id === selectedPerson?.id ? 'peopleos-selected-row' : '',
                          onClick: () => setSelectedId(person.id),
                          onContextMenu: (event) => {
                            event.preventDefault();
                            openRoleEditor(person);
                          },
                        })}
                        pagination={{
                          current: page,
                          pageSize,
                          pageSizeOptions: [10, 25, 50, 100],
                          showQuickJumper: true,
                          showSizeChanger: true,
                          showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong ${total} hồ sơ`,
                          total: filteredPeople.length,
                          onChange: (nextPage, nextPageSize) => {
                            setPageSize(nextPageSize);
                            setPage(nextPageSize === pageSize ? nextPage : 1);
                          },
                        }}
                        rowKey="id"
                        scroll={{ x: 1870 }}
                      />
                    ) : (
                      <Empty description="Không tìm thấy nhân sự phù hợp" />
                    )}
                  </div>
                </section>
              </div>

              <aside className="peopleos-right-stack">
                <section className="peopleos-card peopleos-section" id="profilePanel">
                  <div className="peopleos-section-title">
                    <div>
                      <span className="section-kicker">Thông tin chi tiết</span>
                      <h2>Hồ sơ cá nhân</h2>
                    </div>
                    <Tag>{currentPeriod?.label}</Tag>
                  </div>

                  {!selectedPerson ? (
                    <Empty description="Chọn nhân sự để xem hồ sơ" />
                  ) : (
                    <div className="peopleos-profile-content">
                      <div className="peopleos-profile-top">
                        <Avatar className="peopleos-bigavatar" size={50}>
                          {initials(selectedPerson.fullName)}
                        </Avatar>
                        <div className="peopleos-profile-name">
                          <div className="peopleos-profile-name-head">
                            <h3>{selectedPerson.fullName}</h3>
                            <div className="peopleos-profile-badges">
                              <span className="badge-mau">{selectedTemplate}</span>
                              <Tag color={employmentStatuses[selectedPerson.id] === 'Đã nghỉ việc' ? 'error' : 'success'}>
                                {employmentStatuses[selectedPerson.id] ?? 'Đang công tác'}
                              </Tag>
                              <label className="eval-toggle-wrap">
                                <span className="eval-toggle-label">Tham gia đánh giá lao động:</span>
                                <span className="eval-switch">
                                  <input checked={selectedParticipates} onChange={(event) => void updateParticipation(event.target.checked)} type="checkbox" />
                                  <span className="eval-switch-slider" />
                                </span>
                                <span className="eval-toggle-status">{selectedParticipates ? 'Có' : 'Không'}</span>
                              </label>
                            </div>
                          </div>
                          <div className="profile-dept-line"><strong>Bộ phận công tác:</strong> {selectedDepartment}</div>
                          <div className="chuc-vu-full-box">
                            <span className="peopleos-role-heading">Đơn vị &amp; chức vụ công tác đầy đủ:</span>
                            {selectedAssignments.map((assignment, index) => (
                              <div className="role-item" key={`${assignment.department}-${assignment.position}-${index}`}>
                                <strong>{assignment.position}</strong>
                                <span>— {assignment.department}</span>
                                {assignment.isPrimary && <span className="peopleos-primary-role">Chính</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="peopleos-profile-actions">
                        <button className="peopleos-btn peopleos-btn-role" onClick={() => openRoleEditor(selectedPerson)} type="button">✎ Sửa bộ phận công tác / chức vụ</button>
                        <label className="peopleos-btn peopleos-btn-doc" htmlFor="profile-personnel-document">
                          ⇧ Import lý lịch
                          <input accept=".pdf,.doc,.docx" className="hidden-file" id="profile-personnel-document" onChange={(event) => importDocument(event.target.files?.[0])} type="file" />
                        </label>
                        <button className="peopleos-btn peopleos-btn-history" onClick={() => setModal('history')} type="button">▣ Lịch sử lưu file</button>
                      </div>

                      <div className="peopleos-subhead">
                        <strong>Đánh giá lao động hiện hành · <span>{currentPeriod?.label}</span></strong>
                        <button className="peopleos-inline-link" onClick={() => navigate('/evaluations')} type="button">Mở phiếu đánh giá ↗</button>
                      </div>
                      <div className="eval-highlight-two">
                        <div className="mini">
                          <span className="mini-label">Trạng thái</span>
                          {selectedEvaluation ? (
                            <>
                              <Tag color={statusColors[selectedEvaluation.status]}>{statusLabels[selectedEvaluation.status]}</Tag>
                              <small>{getStageLabel(selectedEvaluation)}</small>
                            </>
                          ) : (
                            <>
                              <Tag color="default">Chưa có phiếu</Tag>
                              <small>{selectedParticipates ? 'Chưa có dữ liệu đánh giá trong kỳ.' : 'Không tham gia đánh giá trong kỳ này.'}</small>
                            </>
                          )}
                        </div>
                        <div className="mini">
                          <span className="mini-label">Mẫu tiêu chí</span>
                          <Select
                            aria-label="Mẫu tiêu chí"
                            onChange={(value: string) => setModelOverrides((previous) => ({ ...previous, [selectedPerson.id]: value }))}
                            value={selectedTemplate}
                          >
                            {evaluationModels.map((item) => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                          </Select>
                          <small>Áp dụng bảng điểm theo đối tượng</small>
                        </div>
                      </div>

                      <div className="peopleos-subhead peopleos-workflow-title">
                        <strong>Quy trình đánh giá áp dụng</strong>
                        <Tag color="blue">Kéo thả thứ bậc</Tag>
                      </div>
                      <div className="peopleos-workflow-box">
                        <div className="peopleos-workflow-table-wrap">
                          <table className="wf-table">
                            <thead><tr><th> kéo </th><th>Thứ tự</th><th>Cấp đánh giá / Vai trò</th><th>Người phụ trách</th><th>Hệ số</th><th>Xóa</th></tr></thead>
                            <tbody>
                              {workflow.map((step, index) => (
                                <tr
                                  className="wf-row"
                                  draggable
                                  key={step.id}
                                  onDragStart={() => setDraggedStep(index)}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={() => reorderWorkflow(index)}
                                >
                                  <td><span className="drag-handle" title="Kéo để đổi thứ bậc">⋮⋮</span></td>
                                  <td><span className="badge-cap">Cấp {index + 1}</span></td>
                                  <td><Input aria-label={`Vai trò cấp ${index + 1}`} onChange={(event) => setWorkflow((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item))} size="small" value={step.role} /></td>
                                  <td><Input aria-label={`Người phụ trách cấp ${index + 1}`} onChange={(event) => setWorkflow((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, reviewer: event.target.value } : item))} size="small" value={step.reviewer} /></td>
                                  <td><span className="he-so-box">hệ số {index + 1}</span></td>
                                  <td><Button aria-label={`Xóa cấp ${index + 1}`} onClick={() => setWorkflow((previous) => previous.length > 1 ? previous.filter((_, itemIndex) => itemIndex !== index) : previous)} size="small" type="text">✕</Button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="peopleos-workflow-actions">
                          <Button onClick={() => setWorkflow((previous) => [...previous, { id: Date.now(), role: `Cấp phê duyệt ${previous.length + 1}`, reviewer: 'Chưa phân công' }])} size="small">＋ Thêm cấp</Button>
                          <div>
                            <Button onClick={() => setWorkflow(initialWorkflow)} size="small">Mặc định</Button>
                            <Button onClick={() => message.success('Đã lưu quy trình đánh giá.')} size="small" type="primary">✓ Lưu</Button>
                          </div>
                        </div>
                      </div>

                      <div className="peopleos-docs-section">
                        <div className="peopleos-docs-heading">
                          <strong>Tài liệu &amp; lý lịch đính kèm</strong>
                          <span>{selectedDocuments.length} tệp</span>
                        </div>
                        {selectedDocuments.length ? selectedDocuments.map((document, index) => (
                          <div className="doc-row" key={`${document.name}-${index}`}>
                            <span className={`doc-icon ${document.type.includes('DOC') ? 'doc' : ''}`}>{document.type}</span>
                            <div className="doc-info"><b>{document.name}</b><small>{document.date} · {document.size}</small></div>
                            <Button aria-label={`Xóa ${document.name}`} onClick={() => setDocuments((previous) => ({ ...previous, [selectedPerson.id]: selectedDocuments.filter((_, itemIndex) => itemIndex !== index) }))} size="small" type="text">×</Button>
                          </div>
                        )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài liệu đính kèm" />}
                      </div>
                    </div>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </main>

      <Modal
        className="peopleos-modal"
        footer={modal === 'roles' ? [
          <Button key="close" onClick={() => setModal(null)}>Đóng</Button>,
          <Button key="save" onClick={() => void saveRoles()} type="primary">Lưu thay đổi</Button>,
        ] : modal === 'history' ? <Button key="close" onClick={() => setModal(null)}>Đóng</Button> : modal === 'work-status' ? [
          <Button key="close" onClick={() => setModal(null)}>Hủy</Button>,
          <Button key="save" onClick={saveEmploymentStatus} type="primary">Lưu tình trạng</Button>,
        ] : null}
        onCancel={() => setModal(null)}
        open={modal === 'roles' || modal === 'history' || modal === 'work-status'}
        title={modal === 'roles' ? 'Sửa bộ phận công tác / chức vụ' : modal === 'history' ? 'Lịch sử lưu file & cập nhật hồ sơ' : 'Thay đổi tình trạng làm việc'}
        width={modal === 'roles' ? 860 : 580}
      >
        {modal === 'roles' ? (
          <div className="peopleos-role-modal">
            {roleDraft.map((assignment, index) => (
              <div className={`unit-card ${assignment.isPrimary ? 'is-main' : ''}`} key={`${assignment.department}-${index}`}>
                <div className="unit-card-header">
                  <strong>Đơn vị / Chức danh #{index + 1}</strong>
                  <div>
                    <label className="peopleos-main-toggle" htmlFor={`role-primary-${index}`}>
                      <input checked={assignment.isPrimary} id={`role-primary-${index}`} onChange={() => setRoleDraft((previous) => previous.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })))} type="checkbox" />
                      Đặt làm chính
                    </label>
                    <Button danger onClick={() => setRoleDraft((previous) => previous.length > 1 ? previous.filter((_, itemIndex) => itemIndex !== index) : previous)} size="small">Xóa</Button>
                  </div>
                </div>
                <div className="unit-grid">
                  <label htmlFor={`role-department-${index}`}>Đơn vị công tác
                    <Select id={`role-department-${index}`} onChange={(value) => setRoleDraft((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, department: value } : item))} options={[...new Set([...departmentOptions, assignment.department])].map((value) => ({ value, label: value }))} value={assignment.department} />
                  </label>
                  <label htmlFor={`role-position-${index}`}>Chức danh
                    <Input id={`role-position-${index}`} onChange={(event) => setRoleDraft((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, position: event.target.value } : item))} value={assignment.position} />
                  </label>
                  <label htmlFor={`role-specialty-${index}`}>Chuyên môn
                    <Input id={`role-specialty-${index}`} onChange={(event) => setRoleDraft((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, specialty: event.target.value } : item))} value={assignment.specialty ?? ''} />
                  </label>
                </div>
              </div>
            ))}
            <Button block onClick={() => setRoleDraft((previous) => [...previous, {
              department: selectedDepartment,
              position: '',
              specialty: '',
              isPrimary: previous.length === 0,
            }])}>＋ Thêm đơn vị / chức danh</Button>
          </div>
        ) : modal === 'history' ? (
          <div className="peopleos-history">
            <div className="peopleos-history-summary"><b>Hồ sơ: {selectedPerson?.fullName}</b><span>Tổng số tệp đã lưu: {selectedDocuments.length} tệp</span></div>
            {selectedDocuments.length ? selectedDocuments.map((document) => (
              <div className="peopleos-history-row" key={document.name}><Tag color="blue">{document.date}</Tag><div><b>{document.name}</b><small>{document.type} · {document.size}</small></div></div>
            )) : <Empty description="Chưa có lịch sử file trong phiên làm việc" />}
          </div>
        ) : modal === 'work-status' ? (
          <div className="peopleos-work-status-editor">
            <p>Chọn tình trạng làm việc cho <strong>{selectedPerson?.fullName}</strong>.</p>
            <Select
              aria-label="Tình trạng làm việc"
              onChange={(value: EmploymentStatus) => setWorkStatusDraft(value)}
              options={employmentStatusOptions.map((value) => ({ value, label: value }))}
              value={workStatusDraft}
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        className="peopleos-modal"
        footer={null}
        onCancel={() => setModal(null)}
        open={modal === 'campaign'}
        title={campaignStep === 1 ? 'Tạo & Quản lý đợt bình bầu' : 'Lịch trình & Bộ tiêu chí'}
        width={1180}
      >
        <div className="peopleos-campaign-steps">
          {campaignStep === 2 && <Button onClick={() => setCampaignStep(1)}>← Quay lại thiết lập</Button>}
          <Button onClick={() => setCampaignStep(1)} type={campaignStep === 1 ? 'primary' : 'default'}>① Thiết lập đợt thi đua</Button>
          <span aria-hidden="true" className="campaign-step-arrow">→</span>
          <Button onClick={() => setCampaignStep(2)} type={campaignStep === 2 ? 'primary' : 'default'}>② Lịch trình &amp; Bộ tiêu chí</Button>
        </div>
        {campaignStep === 1 ? (
          <div className="peopleos-campaign-content">
            <section className="camp-card">
              <div className="camp-card-head"><b>1. Thông tin đợt bình bầu</b><Tag color="red">Bắt buộc</Tag></div>
              <label htmlFor="campaign-name">TÊN ĐỢT ĐÁNH GIÁ / BÌNH BẦU</label>
              <Input id="campaign-name" onChange={(event) => setCampaignName(event.target.value)} value={campaignName} />
            </section>
            <section className="camp-card">
              <div className="camp-card-head"><b>2. Kế hoạch đánh giá</b></div>
              <div className="phase-grid">
                {campaignStages.map((stage) => (
                  <div className="phase-card" key={stage.key}>
                    <div className="phase-header"><span aria-hidden="true" className="phase-icon">{stage.icon}</span><span>{stage.label}</span></div>
                    <Input
                      aria-label={`Ngày ${stage.label}`}
                      className="phase-input"
                      onChange={(event) => setCampaignDates((previous) => ({ ...previous, [stage.key]: event.target.value }))}
                      placeholder="Chọn ngày (DD/MM/YYYY)"
                      value={campaignDates[stage.key]}
                    />
                  </div>
                ))}
              </div>
              <div className="peopleos-campaign-actions">
                <Button onClick={() => setModal(null)}>Hủy bỏ</Button>
                <Button onClick={createCampaign} type="primary">✓ Khởi tạo đợt thi đua</Button>
              </div>
            </section>
          </div>
        ) : (
          <div className="peopleos-campaign-content">
            <section className="camp-card">
              <div className="peopleos-campaign-title">Lịch trình thi đua: <strong>{campaign.name}</strong></div>
              <div className="sched-grid">
                {campaignStages.map((stage, index) => (
                  <div className={`sched-card ${campaign.status === 'active' && index === 2 ? 'active' : ''}`} key={stage.key}>
                    <div className="sched-card-meta"><span>{stage.label}</span>{campaign.status === 'active' && index < 2 && <span>Hoàn tất</span>}</div>
                    <b>{stage.scheduleLabel}</b>
                    <span className="sched-card-date">{campaign[stage.key]}</span>
                    {campaign.status === 'active' && index === 2 && <Tag color="success">Đang thực hiện</Tag>}
                  </div>
                ))}
              </div>
              <div className="campaign-export-actions">
                <div><b>XUẤT:</b><Button size="small" onClick={() => message.info('Đang xuất danh sách quy trình...')}>📄 Xuất DS Quy trình</Button><Button size="small" onClick={() => message.info('Đang xuất danh sách tiêu chí...')}>📄 Xuất DS Tiêu chí</Button><Button danger size="small" onClick={() => message.info('Đang xuất danh sách nhân viên...')}>⬇ Xuất DS Nhân viên</Button></div>
                <div><b>NHẬP:</b><Button size="small" onClick={() => message.info('Chức năng nhập DS Điểm')}>⬆ Nhập DS Điểm</Button><Button size="small" onClick={() => message.info('Chức năng nhập DS Tiêu chí')}>⬆ Nhập DS Tiêu chí</Button></div>
              </div>
            </section>
            <div className="campaign-data-warning"><span aria-hidden="true">🔒</span><span>Đợt thi đua đã bắt đầu thời gian đánh giá. Hệ thống đã tự động khóa tính năng nhập tiêu chí và xuất mẫu biểu để đảm bảo an toàn tính toàn vẹn dữ liệu.</span></div>
            <section className="camp-card">
              <div className="peopleos-criteria-heading">
                <strong>⊞ Danh sách Bộ tiêu chí đánh giá</strong>
                <Input aria-label="Tìm bộ tiêu chí hoặc người áp dụng" onChange={(event) => setCriteriaSearch(event.target.value)} placeholder="⌕ Tìm kiếm theo bộ tiêu chí hoặc người áp dụng..." value={criteriaSearch} />
              </div>
              <div className="camp-table-wrap">
                <table className="camp-table">
                  <thead><tr><th>STT</th><th>Tên bộ tiêu chí</th><th>Phạm vi áp dụng</th></tr></thead>
                  <tbody>
                    {visibleCampaignGroupRows.map((item) => (
                      <tr key={item.value}>
                        <td><span className="campaign-row-number">{item.index}</span></td>
                        <td><strong className="campaign-criteria-name">📁 {item.label.slice(item.label.indexOf('(') + 1, -1)}</strong><Tag color="blue">{item.members.length} người áp dụng</Tag></td>
                        <td>
                          <div className="campaign-person-tags">{item.names.map((name) => <span key={name}>{name}</span>)}</div>
                          <div className="campaign-group-actions">
                            <button onClick={() => { setDrawerGroup(item.value); setDrawerSearch(''); }} type="button">∨ + Xem thêm {Math.max(0, item.members.length - item.names.length)} người khác</button>
                            <button onClick={() => { setDrawerGroup(item.value); setDrawerSearch(''); }} type="button">👁 Xem danh sách đầy đủ ({item.members.length})</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visibleCampaignGroupRows.length && <Empty description="Không tìm thấy bộ tiêu chí phù hợp" />}
              </div>
              <div className="peopleos-criteria-footer"><span>Hiển thị {visibleCampaignGroupRows.length} trên tổng số {campaignGroupRows.length} bộ tiêu chí</span><Button disabled>&lt;</Button><Button disabled type="primary">1</Button><Button disabled>&gt;</Button></div>
            </section>
          </div>
        )}
      </Modal>
      <Drawer
        className="peopleos-drawer"
        onClose={() => setDrawerGroup(null)}
        open={drawerGroup !== null}
        title={<div><strong>{groupOptions.find((item) => item.value === drawerGroup)?.label}</strong><div className="campaign-drawer-count">{drawerMembers.length} nhân sự · Danh sách áp dụng đợt thi đua</div></div>}
        width={520}
      >
        <Input aria-label="Tìm nhanh nhân sự" onChange={(event) => setDrawerSearch(event.target.value)} placeholder="Tìm theo tên, mã NV, chức danh hoặc phòng ban..." value={drawerSearch} />
        <div className="campaign-drawer-list">
          {drawerMembers.map((person) => (
            <div className="campaign-drawer-person" key={person.id}>
              <Avatar>{initials(person.fullName)}</Avatar>
              <div><strong>{person.fullName}</strong><span>{person.groupCode} · {person.positions.join(', ')}</span><small>{departmentOverrides[person.id] ?? person.department}</small></div>
            </div>
          ))}
          {!drawerMembers.length && <Empty description="Không tìm thấy nhân sự phù hợp" />}
        </div>
      </Drawer>
    </div>
  );
}
