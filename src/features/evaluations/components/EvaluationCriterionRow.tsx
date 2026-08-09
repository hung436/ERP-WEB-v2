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

  const isUnlimited = !criterion.max || criterion.max === 0;
  const hasLevels = Boolean(criterion.levels && criterion.levels.length > 0);
  const scoreLocked = readOnly || Boolean(hasLevels && !selectedLevel);
  const minimum = selectedLevel?.min ?? criterion.min;
  const maximum = isUnlimited ? undefined : (selectedLevel?.max ?? criterion.max);

  const chooseLevel = (level: EvaluationLevel) => {
    if (readOnly) return;
    setSelectedLevel(level);
    if (criterion.score === null || criterion.score < level.min || criterion.score > level.max) {
      onScoreChange(null);
    }
  };

  const isAnswered = criterion.score !== null;

  return (
    <article
      className={`evaluation-stream-row evaluation-criterion-card${isAnswered ? ' answered' : ''}${
        hasLevels ? ' has-levels' : ' no-levels'
      }`}
    >
      {/* Top Header Row: Title, History & Top-Right Corner Note Action */}
      <div className="card-top-row">
        <div className="card-title-group">
          <span className="card-index-badge">{String(order).padStart(2, '0')}</span>
          <div className="title-content">
            <div className="title-heading-wrap">
              <h4>{criterion.title}</h4>
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

        {/* If NO levels: Score box is also in the top row, aligned with title! */}
        {!hasLevels && (
          <div className="card-top-right-scoring">
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
          </div>
        )}

        {/* Corner Note Action Button */}
        <div className="card-corner-action">
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

      {/* Bottom Row (Only if HAS levels): Options on Left, Score Box on Right (Ngang với phương án)! */}
      {hasLevels && (
        <div className="card-bottom-row">
          <div
            className="evaluation-level-inline"
            role="radiogroup"
            aria-label={`Mức đánh giá: ${criterion.title}`}
          >
            {criterion.levels!.map((level) => {
              const isSelected = selectedLevel?.label === level.label;
              return (
                <Tooltip
                  key={level.label}
                  title={`${level.label} (${level.min}–${level.max} điểm)`}
                  mouseEnterDelay={0.3}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`level-btn${isSelected ? ' selected' : ''}`}
                    disabled={readOnly}
                    onClick={() => chooseLevel(level)}
                  >
                    <strong className="level-label">{level.label}</strong>
                    <small className="level-range">{level.min}–{level.max} điểm</small>
                  </button>
                </Tooltip>
              );
            })}
          </div>

          <div className="card-bottom-right-scoring">
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
          </div>
        </div>
      )}
    </article>
  );
}


