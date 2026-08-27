import { Button, InputNumber, Modal, Tooltip } from 'antd';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  childCode,
  computeCriterionMax,
  computeCriterionScore,
  hasChildren,
  isCriterionAnswered,
  isSumCriterion,
} from '@/features/evaluations/criterionTree';
import type { EvaluationCriterion, EvaluationLevel, EvaluationStage } from '@/types/evaluation';

const stageLabels: Record<EvaluationStage, string> = {
  self: 'Tự đánh giá',
  deputy: 'Phó phòng/ban',
  manager: 'Trưởng phòng/ban',
  editorial: 'Ban biên tập',
  council: 'Hội đồng',
  published: 'Đã công bố',
};

const findLevel = (criterion: EvaluationCriterion) =>
  criterion.levels?.find(
    (level) => criterion.score !== null && criterion.score >= level.min && criterion.score <= level.max
  ) ?? null;

const getStageOptionLevel = (criterion: EvaluationCriterion, score: number | null | undefined) => {
  if (score === null || score === undefined || !criterion.levels) return null;
  return criterion.levels.find((level) => score >= level.min && score <= level.max) ?? null;
};

/**
 * Một dòng ý con của tiêu chí nhiều cấp.
 * - `editable`: ý con này được nhập điểm (cha của nó là node tính tổng).
 * - Ý con chỉ để theo dõi sẽ hiển thị trần điểm thay cho ô nhập.
 */
function CriterionSubRow({
  node,
  code,
  depth,
  editable,
  readOnly,
  onScoreChange,
  onOpenNote,
}: {
  node: EvaluationCriterion;
  code: string;
  depth: number;
  editable: boolean;
  readOnly: boolean;
  onScoreChange: (id: string, score: number | null) => void;
  /** Ghi chú đi kèm ô nhập điểm của chính ý con này. */
  onOpenNote?: (id: string) => void;
}) {
  const isSum = isSumCriterion(node);
  const nodeChildren = node.children ?? [];
  const maxScore = computeCriterionMax(node);
  const sumScore = computeCriterionScore(node);
  const showInput = editable && !readOnly && !isSum;
  // Ý không có con (31.1, 3.1.1...) dùng dấu đầu dòng; chỉ mục có ý con bên trong mới giữ số hiệu
  const useBullet = nodeChildren.length === 0;
  // Ý con tự chấm điểm (32.1, 32.2) hiển thị khoảng điểm giống tiêu chí cha
  const showRange = editable && !isSum;
  // Ý chỉ để theo dõi: trần điểm viết liền cuối câu, không cần cột điểm riêng
  const isDisplayOnly = !editable && !isSum;

  return (
    <div className={`criterion-subtree-item depth-${depth}`}>
      <div
        className={`criterion-subtree-row${isSum ? ' is-sum' : ''}${
          nodeChildren.length > 0 ? ' is-section' : ''
        }${showInput ? ' is-editable' : ' is-readonly'}`}
      >
        <p className="subtree-title">
          {useBullet ? (
            <span className="subtree-bullet" aria-hidden="true">
              •
            </span>
          ) : (
            <span className="subtree-code">{code}</span>
          )}{' '}
          {node.title}
          {showRange && (
            <span className="title-range-badge" style={{ fontStyle: 'italic' }}>
              ({maxScore} điểm)
            </span>
          )}
          {isDisplayOnly && nodeChildren.length > 0 && (
            <span className="title-range-badge" style={{ fontStyle: 'italic' }}>
              ({maxScore} điểm)
            </span>
          )}
          {isDisplayOnly && nodeChildren.length === 0 && (
            <span className="subtree-max-inline" style={{ fontStyle: 'italic' }}>
              ({maxScore} điểm)
            </span>
          )}
        </p>
        {!isDisplayOnly && (
        <div className="subtree-score-slot">
          {showInput ? (
            <div className="evaluation-score-inline">
              <label htmlFor={`evaluation-score-${node.id}`}>Điểm</label>
              <InputNumber
                id={`evaluation-score-${node.id}`}
                aria-label={`Nhập điểm: ${node.title}`}
                min={node.min}
                max={maxScore || undefined}
                precision={0}
                controls={false}
                value={node.score}
                onChange={(value) => onScoreChange(node.id, value)}
                placeholder={`${node.min} - ${maxScore}`}
              />
            </div>
          ) : isSum ? (
            <span className="subtree-sum-badge" aria-label={`Điểm tổng hợp: ${node.title}`}>
              <strong>{sumScore ?? '—'}</strong>
              <small>/ {maxScore} điểm</small>
            </span>
          ) : (
            <span className="subtree-max-badge">
              {node.score !== null && node.score !== undefined ? (
                <strong>{node.score}</strong>
              ) : null}
              <small>/ {maxScore} điểm</small>
            </span>
          )}
        </div>
        )}

        {showInput && onOpenNote && (
          <Tooltip title={node.note ? `Ghi chú: ${node.note}` : 'Thêm ghi chú/minh chứng'}>
            <Button
              aria-label={`${node.note ? 'Chỉnh sửa' : 'Thêm'} ghi chú: ${node.title}`}
              className={`evaluation-note-button${node.note ? ' has-note' : ''}`}
              onClick={() => onOpenNote(node.id)}
            >
              <span className="btn-icon" aria-hidden="true">{node.note ? '📝' : '💬'}</span>
            </Button>
          </Tooltip>
        )}
      </div>

      {node.note && (
        <div
          className="criterion-personal-note-card subtree-note-card"
          aria-label={`Ghi chú cá nhân: ${node.title}`}
          onClick={!readOnly && onOpenNote ? () => onOpenNote(node.id) : undefined}
          style={{ cursor: !readOnly && onOpenNote ? 'pointer' : 'default' }}
        >
          <div className="note-card-header">
            <span className="note-card-title">
              <span className="note-icon" aria-hidden="true">📝</span>
              <strong>Ghi chú &amp; minh chứng ý {code}:</strong>
            </span>
          </div>
          <p className="note-card-body">{node.note}</p>
        </div>
      )}

      {nodeChildren.length > 0 && (
        <div className="criterion-subtree-children">
          {nodeChildren.map((child, idx) => (
            <CriterionSubRow
              key={child.id}
              node={child}
              code={childCode(child, code, idx)}
              depth={depth + 1}
              editable={isSum && !isSumCriterion(child)}
              readOnly={readOnly}
              onScoreChange={onScoreChange}
              onOpenNote={onOpenNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EvaluationCriterionRow({
  criterion,
  order,
  readOnly,
  previousStages,
  onScoreChange,
  onChildScoreChange,
  onOpenNote,
  onOpenChildNote,
}: {
  criterion: EvaluationCriterion;
  order: number;
  readOnly: boolean;
  previousStages: EvaluationStage[];
  onScoreChange: (score: number | null) => void;
  /** Cập nhật điểm cho một ý con của tiêu chí nhiều cấp. */
  onChildScoreChange?: (childId: string, score: number | null) => void;
  onOpenNote: () => void;
  /** Mở ghi chú của một ý con (câu tính tổng: ghi chú nằm cùng ô nhập điểm). */
  onOpenChildNote?: (childId: string) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<EvaluationLevel | null>(findLevel(criterion));
  const [pendingLevel, setPendingLevel] = useState<EvaluationLevel | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isSingleLine, setIsSingleLine] = useState(true);

  useLayoutEffect(() => {
    if (titleRef.current) {
      setIsSingleLine(titleRef.current.offsetHeight <= 28);
    }
  }, [criterion.title]);

  useEffect(() => {
    const matched = findLevel(criterion);
    setSelectedLevel(matched);
  }, [criterion.score, criterion.levels]);

  const isGrouped = hasChildren(criterion);
  const isSumMode = isSumCriterion(criterion);
  const groupedMax = computeCriterionMax(criterion);
  const groupedScore = computeCriterionScore(criterion);
  const isUnlimited = isGrouped ? groupedMax === 0 : !criterion.max || criterion.max === 0;
  const hasLevels = Boolean(criterion.levels && criterion.levels.length > 0);
  const scoreLocked = readOnly;
  const minimum = criterion.min;
  const maximum = isUnlimited ? undefined : isGrouped ? groupedMax : criterion.max;
  const handleChildScoreChange = (childId: string, score: number | null) =>
    onChildScoreChange?.(childId, score);

  const handleOpenScoreModal = (level?: EvaluationLevel | null) => {
    if (readOnly) return;
    const targetLevel = level || selectedLevel || criterion.levels?.[0] || null;
    setPendingLevel(targetLevel);
    const initial =
      criterion.score !== null
        ? criterion.score
        : targetLevel
        ? targetLevel.max
        : criterion.max || criterion.min || 0;
    setTempScore(initial);
    setIsScoreModalOpen(true);
  };

  const handleConfirmScoreModal = () => {
    if (pendingLevel) {
      setSelectedLevel(pendingLevel);
    }
    onScoreChange(tempScore);
    setIsScoreModalOpen(false);
  };

  const isAnswered = isCriterionAnswered(criterion);

  return (
    <article
      id={`evaluation-score-${criterion.id}`}
      className={`evaluation-stream-row evaluation-radio-card${isAnswered ? ' answered' : ''}${
        hasLevels ? ' has-levels' : ' no-levels'
      }${isGrouped ? ' has-children' : ''}`}
    >
      {/* Top Header: Title, Stage Score Pills & Toolbar */}
      <header className={`radio-card-header${isSingleLine ? ' single-line' : ' multi-line'}`}>
        <div className="header-left">
          <span className="card-index-badge">{criterion.code ?? String(order).padStart(2, '0')}</span>
          <div className="title-content">
            <h4 ref={titleRef} className="title-heading">
              <span>{criterion.title}</span>
              {!hasLevels && !isSumMode && (
                <span className="title-range-badge" style={{ fontStyle: 'italic' }}>
                  {isUnlimited ? '(Điểm mở)' : `(${maximum} điểm)`}
                </span>
              )}
            </h4>
          </div>
        </div>

        {/* Top-Right Toolbar: Hide all input controls & note buttons in readOnly/published mode */}
        {!readOnly || isSumMode ? (
          <div className="header-right-toolbar">
            {isSumMode && (
              <div className="evaluation-score-sum" aria-label={`Điểm tổng hợp: ${criterion.title}`}>
                <label>Điểm tổng</label>
                <strong className="sum-value">{groupedScore ?? '—'}</strong>
                <span className="score-max">/ {groupedMax} điểm</span>
              </div>
            )}

            {!readOnly && !hasLevels && !isSumMode && (
              <div className="evaluation-score-inline" id={`evaluation-score-${criterion.id}`}>
                <label htmlFor={`evaluation-score-${criterion.id}`}>Điểm</label>
                <InputNumber
                  id={`evaluation-score-${criterion.id}`}
                  aria-label={`Nhập điểm: ${criterion.title}`}
                  min={minimum}
                  max={maximum}
                  precision={0}
                  controls={false}
                  disabled={scoreLocked}
                  value={criterion.score}
                  onChange={onScoreChange}
                  placeholder={isUnlimited ? 'Nhập điểm' : `${minimum} - ${maximum}`}
                />
              </div>
            )}

            {!readOnly && !isSumMode && (
            <div className="card-note-wrapper">
              <Tooltip title={criterion.note ? `Ghi chú: ${criterion.note}` : 'Thêm ghi chú/minh chứng'}>
                <Button
                  aria-label={criterion.note ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú'}
                  className={`evaluation-note-button${criterion.note ? ' has-note' : ''}`}
                  onClick={onOpenNote}
                >
                  <span className="btn-icon" aria-hidden="true">{criterion.note ? '📝' : '💬'}</span>
                </Button>
              </Tooltip>
            </div>
            )}
          </div>
        ) : null}
      </header>

      {/* Cây ý con của tiêu chí nhiều cấp (chỉ hiển thị để theo dõi hoặc nhập điểm từng ý) */}
      {isGrouped && (
        <div className="criterion-subtree" aria-label={`Các ý chi tiết: ${criterion.title}`}>
          {criterion.children!.map((child, idx) => (
            <CriterionSubRow
              key={child.id}
              node={child}
              code={childCode(child, criterion.code ?? String(order), idx)}
              depth={1}
              editable={isSumMode && !isSumCriterion(child)}
              readOnly={readOnly}
              onScoreChange={handleChildScoreChange}
              onOpenNote={onOpenChildNote}
            />
          ))}
        </div>
      )}

      {/* Radio Options List Body (Sleek & Uncluttered) */}
      {hasLevels && (
        <div
          className="radio-options-body"
          role="radiogroup"
          aria-label={`Mức đánh giá: ${criterion.title}`}
        >
          {criterion.levels!.map((level, idx) => {
            const optionLetter = String.fromCharCode(65 + idx);
            const publishedVal = criterion.stageScores?.['published'] ?? (readOnly ? criterion.score : null);
            const isPublishedMatch =
              publishedVal !== null &&
              publishedVal !== undefined &&
              publishedVal >= level.min &&
              publishedVal <= level.max;
            const isSelected = isPublishedMatch || selectedLevel?.label === level.label;

            return (
              <button
                key={level.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`radio-option-item${
                  isPublishedMatch ? ' published-winner' : isSelected ? ' selected' : ''
                }`}
                disabled={readOnly}
                onClick={() => handleOpenScoreModal(level)}
              >
                <span className="radio-indicator" aria-hidden="true">
                  <span className="radio-dot" />
                </span>
                <div className="radio-content-inline">
                  <span className="radio-option-letter">{optionLetter}.</span>
                  <span className="radio-label-text">{level.label}</span>
                  <span className="radio-range-badge" style={{ fontStyle: 'italic' }}>
                    ({level.max} điểm)
                  </span>
                </div>
                {!readOnly && isSelected && criterion.score !== null && (
                  <span className="radio-evaluated-score">
                    <strong>{criterion.score}</strong> <small>điểm</small>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Sleek Personal Note Card Display */}
      {criterion.note && (
        <div
          className="criterion-personal-note-card"
          aria-label={`Ghi chú cá nhân: ${criterion.title}`}
          onClick={!readOnly ? onOpenNote : undefined}
          style={{ cursor: !readOnly ? 'pointer' : 'default' }}
        >
          <div className="note-card-header">
            <span className="note-card-title">
              <span className="note-icon" aria-hidden="true">📝</span>
              <strong>Ghi chú & minh chứng cá nhân:</strong>
            </span>
            {!readOnly && (
              <button
                type="button"
                className="btn-edit-note-inline"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNote();
                }}
                title="Chỉnh sửa ghi chú"
              >
                ✏️ Chỉnh sửa
              </button>
            )}
          </div>
          <p className="note-card-body">{criterion.note}</p>
        </div>
      )}

      {/* Sleek Stage Comparison Bar & Notes */}
      {previousStages.length > 0 && (
        <div className="criterion-stage-history-container" aria-label={`Lịch sử điểm chấm: ${criterion.title}`}>
          {/* 1-Line Compact Stage Score Comparison Flow */}
          <div className="stage-comparison-strip">
            {previousStages.map((stage, idx) => {
              const val =
                stage === 'published'
                  ? criterion.stageScores?.['published'] ?? criterion.score
                  : criterion.stageScores?.[stage] ?? (stage === 'self' ? criterion.score : undefined);

              if (val === null || val === undefined) return null;

              const matchedOpt = getStageOptionLevel(criterion, val);
              const optIdx = criterion.levels && matchedOpt ? criterion.levels.findIndex((l) => l.label === matchedOpt.label) : -1;
              const optLetter = optIdx !== -1 ? String.fromCharCode(65 + optIdx) : null;

              return (
                <div key={stage} className="stage-chip-item">
                  {idx > 0 && <span className="stage-chip-arrow">→</span>}
                  <span className={`stage-score-chip stage-${stage}`}>
                    <span className="chip-stage-label">{stageLabels[stage]}:</span>
                    {optLetter && <strong className="chip-stage-letter">{optLetter}.</strong>}
                    <strong className="chip-stage-score">{val}đ</strong>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stage Notes / Proof Quotes (Only rendered if notes exist!) */}
          {previousStages.some((stage) => criterion.stageNotes?.[stage] || (stage === 'self' && criterion.note)) && (
            <div className="stage-notes-list">
              {previousStages.map((stage) => {
                const noteText = criterion.stageNotes?.[stage] || (stage === 'self' ? criterion.note : undefined);
                if (!noteText) return null;

                return (
                  <div key={`note-${stage}`} className={`stage-note-bubble stage-${stage}`}>
                    <div className="note-bubble-header">
                      <span className="note-bubble-author">📝 Ghi chú {stageLabels[stage].toLowerCase()}:</span>
                    </div>
                    <p className="note-bubble-text">“{noteText}”</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ultra-Minimal Score Input Modal */}
      <Modal
        title={
          <div className="minimal-modal-title">
            <span aria-hidden="true">🎯</span>
            <h3>Nhập điểm đánh giá (Câu {order})</h3>
          </div>
        }
        open={isScoreModalOpen}
        onOk={handleConfirmScoreModal}
        onCancel={() => setIsScoreModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
        width={360}
        className="criterion-score-popup-modal minimal"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <InputNumber
              autoFocus
              min={pendingLevel ? pendingLevel.min : minimum}
              max={pendingLevel ? pendingLevel.max : maximum}
              precision={0}
              value={tempScore}
              onChange={(val) => setTempScore(val ?? (pendingLevel ? pendingLevel.min : minimum))}
              onPressEnter={handleConfirmScoreModal}
              style={{ width: 120, height: 46, fontSize: 22, fontWeight: 800, textAlign: 'center' }}
            />
            <span style={{ fontSize: 16, color: '#475467', fontWeight: 700 }}>
              / {pendingLevel ? pendingLevel.max : (isUnlimited ? 'Mở' : criterion.max)} điểm
            </span>
          </div>
          <small style={{ color: '#64748b', fontSize: 12 }}>
            Khoảng điểm: {pendingLevel ? `${pendingLevel.min} - ${pendingLevel.max}` : `${minimum} - ${isUnlimited ? 'Không giới hạn' : criterion.max}`} điểm
          </small>
        </div>
      </Modal>
    </article>
  );
}


