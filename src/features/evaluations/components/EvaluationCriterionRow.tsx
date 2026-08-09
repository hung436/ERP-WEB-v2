import { Button, InputNumber } from 'antd';
import { useState } from 'react';

import type { EvaluationCriterion, EvaluationLevel, EvaluationStage } from '@/types/evaluation';

const stageLabels: Record<EvaluationStage, string> = { self: 'Tự đánh giá', deputy: 'Phó phòng/ban', manager: 'Trưởng phòng/ban', editorial: 'Ban biên tập', council: 'Hội đồng', published: 'Đã công bố' };

const findLevel = (criterion: EvaluationCriterion) => criterion.levels?.find((level) => criterion.score !== null && criterion.score >= level.min && criterion.score <= level.max) ?? null;

export function EvaluationCriterionRow({ criterion, order, readOnly, previousStages, onScoreChange, onOpenNote }: { criterion: EvaluationCriterion; order: number; readOnly: boolean; previousStages: EvaluationStage[]; onScoreChange: (score: number | null) => void; onOpenNote: () => void }) {
  const [selectedLevel, setSelectedLevel] = useState<EvaluationLevel | null>(findLevel(criterion));
  const systemLocked = criterion.type === 'system';
  const scoreLocked = readOnly || systemLocked || Boolean(criterion.levels && !selectedLevel);
  const minimum = selectedLevel?.min ?? criterion.min;
  const maximum = selectedLevel?.max ?? criterion.max;

  const chooseLevel = (level: EvaluationLevel) => {
    setSelectedLevel(level);
    if (criterion.score === null || criterion.score < level.min || criterion.score > level.max) onScoreChange(null);
  };

  return <article className={`evaluation-stream-row${criterion.score !== null ? ' answered' : ''}`}>
    <div className="evaluation-row-index"><span>{String(order).padStart(2, '0')}</span><i>{criterion.score !== null ? '✓' : ''}</i></div>
    <div className="evaluation-row-main"><h4>{criterion.title}</h4>{previousStages.length > 0 && <div className="evaluation-row-history" aria-label={`Lịch sử điểm: ${criterion.title}`}>{previousStages.map((stage) => <span key={stage}><small>{stageLabels[stage]}</small><strong>{criterion.stageScores?.[stage] ?? '—'}</strong></span>)}</div>}</div>
    <div className="evaluation-row-scoring">
      {criterion.levels && <div className="evaluation-level-inline" role="radiogroup" aria-label={`Mức đánh giá: ${criterion.title}`}>{criterion.levels.map((level) => <button aria-checked={selectedLevel?.label === level.label} className={selectedLevel?.label === level.label ? 'selected' : ''} disabled={readOnly} key={level.label} onClick={() => chooseLevel(level)} role="radio" type="button"><strong>{level.label}</strong><small>{level.min}–{level.max}</small></button>)}</div>}
      {systemLocked ? <div className="evaluation-system-score"><span>Đồng bộ</span><strong>{criterion.score ?? 0}/{criterion.max}</strong></div> : <div className="evaluation-score-inline"><label htmlFor={`evaluation-score-${criterion.id}`}>Điểm</label><InputNumber aria-label={`Nhập điểm: ${criterion.title}`} controls disabled={scoreLocked} id={`evaluation-score-${criterion.id}`} max={maximum} min={minimum} onChange={onScoreChange} placeholder={`${minimum}–${maximum}`} precision={0} value={criterion.score} /><span>/ {criterion.max}</span></div>}
    </div>
    <Button className={criterion.note ? 'evaluation-note-button has-note' : 'evaluation-note-button'} disabled={readOnly} onClick={onOpenNote}>{criterion.note ? 'Đã ghi chú' : 'Ghi chú'}</Button>
  </article>;
}
