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
    setSelectedLevel(matched);
  }, [criterion.score, criterion.levels]);

  const isUnlimited = !criterion.max || criterion.max === 0;
  const hasLevels = Boolean(criterion.levels && criterion.levels.length > 0);
  const scoreLocked = readOnly;
  const minimum = criterion.min;
  const maximum = isUnlimited ? undefined : criterion.max;

  const chooseLevel = (level: EvaluationLevel) => {
    if (readOnly) return;
    setSelectedLevel(level);
    if (criterion.score === null || criterion.score < level.min || criterion.score > level.max) {
      onScoreChange(level.max);
    }
  };

  const isAnswered = criterion.score !== null;

  return (
    <article
      className={`evaluation-stream-row evaluation-radio-card${isAnswered ? ' answered' : ''}${
        hasLevels ? ' has-levels' : ' no-levels'
      }`}
    >
      {/* Top Header: Title, History & Top-Right Toolbar (Score Input + Note Button) */}
      <header className="radio-card-header">
        <div className="header-left">
          <span className="card-index-badge">{String(order).padStart(2, '0')}</span>
          <div className="title-content">
            <div className="title-heading-wrap">
              <Tooltip title={criterion.title} mouseEnterDelay={0.4}>
                <h4>{criterion.title}</h4>
              </Tooltip>
              {isUnlimited && <span className="badge-unlimited">Điểm mở</span>}
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
        </div>

        {/* Top-Right Toolbar: Score Input + Note Button (Unified 100% Alignment across ALL cards!) */}
        <div className="header-right-toolbar">
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
              placeholder={isUnlimited ? 'Nhập điểm' : `${minimum}–${maximum}`}
            />
            {!isUnlimited && <span className="score-max">/ {criterion.max}</span>}
          </div>

          <div className="card-note-wrapper">
            <Tooltip title={criterion.note ? `Ghi chú: ${criterion.note}` : 'Thêm ghi chú/minh chứng'}>
              <Button
                className={`evaluation-note-button${criterion.note ? ' has-note' : ''}`}
                disabled={readOnly}
                onClick={onOpenNote}
              >
                <span className="btn-icon" aria-hidden="true">{criterion.note ? '✓' : '📝'}</span>
                <span>{criterion.note ? 'Đã ghi chú' : 'Ghi chú'}</span>
              </Button>
            </Tooltip>

            {criterion.note && (
              <div className="note-card-preview" title={criterion.note}>
                <span className="note-pin" aria-hidden="true">📌</span>
                <span className="note-content">{criterion.note}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Radio Options List Body (Only when HAS levels) */}
      {hasLevels && (
        <div
          className="radio-options-body"
          role="radiogroup"
          aria-label={`Mức đánh giá: ${criterion.title}`}
        >
          {criterion.levels!.map((level) => {
            const isSelected = selectedLevel?.label === level.label;
            return (
              <button
                key={level.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`radio-option-item${isSelected ? ' selected' : ''}`}
                disabled={readOnly}
                onClick={() => chooseLevel(level)}
              >
                <span className="radio-indicator" aria-hidden="true">
                  <span className="radio-dot" />
                </span>
                <span className="radio-label-text">{level.label}</span>
                <span className="radio-range-badge">{level.min}–{level.max} điểm</span>
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}


