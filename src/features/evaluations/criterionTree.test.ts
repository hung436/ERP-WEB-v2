import { describe, expect, it } from 'vitest';

import {
  computeCriterionMax,
  computeCriterionScore,
  isCriterionAnswered,
  patchCriterionTree,
} from '@/features/evaluations/criterionTree';
import type { EvaluationCriterion } from '@/types/evaluation';

const leaf = (id: string, max: number, score: number | null = null): EvaluationCriterion => ({
  id,
  groupId: 'g',
  title: id,
  type: 'number',
  min: 0,
  max,
  score,
});

/** Câu 1: nhập điểm ở cha (0 - 5đ), các ý 1.1..1.5 chỉ để theo dõi. */
const manualParent: EvaluationCriterion = {
  ...leaf('c1', 5, null),
  type: 'grouped',
  scoreMode: 'manual',
  children: [leaf('c1-1', 1), leaf('c1-2', 1)],
};

/** Câu 3: điểm cha = 3.1 + 3.2, mỗi ý con lại có các ý chi tiết chỉ để theo dõi. */
const sumParent: EvaluationCriterion = {
  ...leaf('c3', 0, null),
  type: 'grouped',
  scoreMode: 'sum',
  children: [
    { ...leaf('c3-1', 4), type: 'grouped', scoreMode: 'manual', children: [leaf('c3-1-1', 1)] },
    { ...leaf('c3-2', 3), type: 'grouped', scoreMode: 'manual', children: [leaf('c3-2-1', 1)] },
  ],
};

describe('criterionTree', () => {
  it('câu nhiều cấp nhập tay chỉ tính điểm ở tiêu chí cha', () => {
    expect(computeCriterionMax(manualParent)).toBe(5);
    expect(isCriterionAnswered(manualParent)).toBe(false);
    const scored = patchCriterionTree(manualParent, 'c1', { score: 4 });
    expect(computeCriterionScore(scored)).toBe(4);
    expect(isCriterionAnswered(scored)).toBe(true);
  });

  it('câu nhiều cấp kiểu tổng tự cộng điểm từ các ý con', () => {
    expect(computeCriterionMax(sumParent)).toBe(7);
    let tree = patchCriterionTree(sumParent, 'c3-1', { score: 3 });
    expect(tree.score).toBe(3);
    expect(isCriterionAnswered(tree)).toBe(false);
    tree = patchCriterionTree(tree, 'c3-2', { score: 2 });
    expect(tree.score).toBe(5);
    expect(isCriterionAnswered(tree)).toBe(true);
  });

  it('không đụng tới các loại tiêu chí cũ', () => {
    const plain = leaf('n1', 10, 8);
    expect(computeCriterionMax(plain)).toBe(10);
    expect(computeCriterionScore(plain)).toBe(8);
    expect(isCriterionAnswered(plain)).toBe(true);
    expect(patchCriterionTree(plain, 'other', { score: 1 })).toEqual(plain);
  });
});
