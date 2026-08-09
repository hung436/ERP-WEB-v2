import { Button, Empty, Input, Modal, Progress, Select, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ContentSkeleton, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { EvaluationCriterionRow } from '@/features/evaluations/components/EvaluationCriterionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { evaluationApi } from '@/services/api';
import type { EvaluationCriterion, EvaluationPeriod, EvaluationSheet, EvaluationStage } from '@/types/evaluation';
import '@/features/evaluations/evaluation-workspace.css';

type EvaluationMode = 'self' | 'scoring' | 'council';

const modeOptions = [
  { value: 'self', label: 'Phiếu của tôi' },
  { value: 'scoring', label: 'Chấm nhân viên' },
  { value: 'council', label: 'Hội đồng đánh giá' },
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

function EvaluationWorkspace({
  periods,
  sheets,
  onReload,
}: {
  periods: EvaluationPeriod[];
  sheets: EvaluationSheet[];
  onReload: () => void;
}) {
  const [mode, setMode] = useState<EvaluationMode>('self');
  const [periodId, setPeriodId] = useState(periods.find((p) => p.status === 'active')?.id ?? periods[0]?.id ?? '');

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

  const [sheetId, setSheetId] = useState('');
  const [draft, setDraft] = useState<EvaluationSheet | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteCriterionId, setNoteCriterionId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => {
    const selected = availableSheets.find((sheet) => sheet.id === sheetId) ?? availableSheets[0] ?? null;
    setSheetId(selected?.id ?? '');
    setDraft(selected);
  }, [availableSheets, sheetId]);

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
          <div className="evaluation-control">
            <span>Chế độ làm việc</span>
            <Select
              aria-label="Chế độ đánh giá"
              onChange={(value) => {
                setMode(value);
                setSheetId('');
              }}
              options={modeOptions}
              value={mode}
            />
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

          {mode !== 'self' && (
            <div className="evaluation-control evaluation-employee-select">
              <span>Nhân sự đánh giá</span>
              <Select
                aria-label="Nhân sự được đánh giá"
                onChange={setSheetId}
                options={availableSheets.map((sheet) => ({
                  value: sheet.id,
                  label: `${sheet.employeeName} · ${sheet.department}`,
                }))}
                placeholder="Chọn nhân sự"
                value={sheetId || undefined}
              />
            </div>
          )}
        </div>
      </header>

      {draft ? (
        <>
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
              <span className="live-tag">⚡ Cập nhật tức thì</span>
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

