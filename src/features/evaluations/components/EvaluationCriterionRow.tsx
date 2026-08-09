import { Button, InputNumber, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

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

export function EvaluationCriterionRow({
  criterion,
  order,
  readOnly,
  previousStages,
  onScoreChange,
  onOpenNote,
}: {
  criterion: EvaluationCriterion;
  order: number;
  readOnly: boolean;
  previousStages: EvaluationStage[];
  onScoreChange: (score: number | null) => void;
  onOpenNote: () => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<EvaluationLevel | null>(findLevel(criterion));

  useEffect(() => {
    const matched = findLevel(criterion);
    if (matched) {
      setSelectedLevel(matched);
    }
  }, [criterion.score, criterion.levels]);

  const systemLocked = criterion.type === 'system';
  const scoreLocked = readOnly || systemLocked || Boolean(criterion.levels && !selectedLevel);
  const minimum = selectedLevel?.min ?? criterion.min;
  const maximum = selectedLevel?.max ?? criterion.max;

  const chooseLevel = (level: EvaluationLevel) => {
    if (readOnly || systemLocked) return;
    setSelectedLevel(level);
    if (criterion.score === null || criterion.score < level.min || criterion.score > level.max) {
      onScoreChange(null);
    }
  };

  const isAnswered = criterion.score !== null;

  return (
    <article className={`evaluation-stream-row${isAnswered ? ' answered' : ''}`}>
      <div className="evaluation-row-index">
        <span>{String(order).padStart(2, '0')}</span>
        <i className="status-icon">{isAnswered ? '✓' : '•'}</i>
      </div>

      <div className="evaluation-row-main">
        <div className="evaluation-title-wrap">
          <h4>{criterion.title}</h4>
          {criterion.type === 'system' && (
            <span className="badge-system-sync">Tự động đồng bộ</span>
          )}
        </div>

        {previousStages.length > 0 && (
          <div className="evaluation-row-history" aria-label={`Lịch sử điểm: ${criterion.title}`}>
            {previousStages.map((stage) => {
              const val = criterion.stageScores?.[stage];
              return (
                <span key={stage} className={`history-pill stage-${stage}`}>
                  <small>{stageLabels[stage]}</small>
                  <strong>{val !== undefined && val !== null ? `${val} đ` : '—'}</strong>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="evaluation-row-scoring">
        {criterion.levels && criterion.levels.length > 0 && (
          <div
            className="evaluation-level-inline"
            role="radiogroup"
            aria-label={`Mức đánh giá: ${criterion.title}`}
          >
            {criterion.levels.map((level) => {
              const isSelected = selectedLevel?.label === level.label;
              return (
                <button
                  key={level.label}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`level-btn${isSelected ? ' selected' : ''}`}
                  disabled={readOnly || systemLocked}
                  onClick={() => chooseLevel(level)}
                >
                  <strong className="level-label">{level.label}</strong>
                  <small className="level-range">{level.min}–{level.max} điểm</small>
                </button>
              );
            })}
          </div>
        )}

        {systemLocked ? (
          <div className="evaluation-system-score">
            <span>Hệ thống KPI</span>
            <strong>{criterion.score ?? 0} / {criterion.max}</strong>
          </div>
        ) : (
          <div className="evaluation-score-inline">
            <label htmlFor={`evaluation-score-${criterion.id}`}>Điểm</label>
            <InputNumber
              id={`evaluation-score-${criterion.id}`}
              aria-label={`Nhập điểm: ${criterion.title}`}
              min={minimum}
              max={maximum}
              precision={0}
              controls
              disabled={scoreLocked}
              value={criterion.score}
              onChange={onScoreChange}
              placeholder={`${minimum}–${maximum}`}
            />
            <span className="score-max">/ {criterion.max}</span>
          </div>
        )}
      </div>

      <div className="evaluation-row-actions">
        <Tooltip title={criterion.note ? `Ghi chú: ${criterion.note}` : 'Thêm ghi chú/minh chứng'}>
          <Button
            className={`evaluation-note-button${criterion.note ? ' has-note' : ''}`}
            disabled={readOnly}
            onClick={onOpenNote}
          >
            {criterion.note ? 'Đã ghi chú' : 'Ghi chú'}
          </Button>
        </Tooltip>
        {criterion.note && (
          <div className="note-snippet-text" title={criterion.note}>
            📝 {criterion.note}
          </div>
        )}
      </div>
    </article>
  );
}


