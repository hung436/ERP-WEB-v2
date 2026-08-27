import type { EvaluationCriterion } from '@/types/evaluation';

/** Tiêu chí có ý con (câu nhiều cấp). */
export const hasChildren = (criterion: EvaluationCriterion) =>
  Boolean(criterion.children && criterion.children.length > 0);

/** Tiêu chí cha lấy điểm bằng tổng các ý con (ví dụ câu 3 = 3.1 + 3.2). */
export const isSumCriterion = (criterion: EvaluationCriterion) =>
  hasChildren(criterion) && criterion.scoreMode === 'sum';

/** Node được phép nhập điểm trực tiếp trên giao diện. */
export const isEditableCriterion = (criterion: EvaluationCriterion) => !isSumCriterion(criterion);

/** Danh sách các node thực sự nhận điểm nhập tay của một tiêu chí. */
export const getScorableNodes = (criterion: EvaluationCriterion): EvaluationCriterion[] =>
  isSumCriterion(criterion) ? criterion.children!.flatMap(getScorableNodes) : [criterion];

/** Điểm hiệu lực: node tổng thì cộng từ con, node thường lấy điểm đã nhập. */
export const computeCriterionScore = (criterion: EvaluationCriterion): number | null => {
  if (!isSumCriterion(criterion)) return criterion.score ?? null;
  const values = criterion
    .children!.map(computeCriterionScore)
    .filter((value): value is number => value !== null && value !== undefined);
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : null;
};

/** Điểm tối đa: node tổng thì cộng trần điểm các con. */
export const computeCriterionMax = (criterion: EvaluationCriterion): number =>
  isSumCriterion(criterion)
    ? criterion.children!.reduce((sum, child) => sum + computeCriterionMax(child), 0)
    : criterion.max ?? 0;

/** Tiêu chí được coi là đã chấm khi mọi ô nhập điểm của nó đã có giá trị. */
export const isCriterionAnswered = (criterion: EvaluationCriterion) =>
  getScorableNodes(criterion).every((node) => node.score !== null && node.score !== undefined);

/** Đồng bộ lại điểm tổng của các node cha sau khi điểm con thay đổi. */
export const syncCriterionScores = (criterion: EvaluationCriterion): EvaluationCriterion => {
  if (!hasChildren(criterion)) return criterion;
  const children = criterion.children!.map(syncCriterionScores);
  const next: EvaluationCriterion = { ...criterion, children };
  return isSumCriterion(next) ? { ...next, score: computeCriterionScore(next) } : next;
};

/** Cập nhật một node bất kỳ trong cây (kể cả ý con) rồi tính lại điểm tổng. */
export const patchCriterionTree = (
  criterion: EvaluationCriterion,
  id: string,
  patch: Partial<EvaluationCriterion>
): EvaluationCriterion => {
  const matched = criterion.id === id ? { ...criterion, ...patch } : criterion;
  if (!hasChildren(matched)) return matched;
  return syncCriterionScores({
    ...matched,
    children: matched.children!.map((child) => patchCriterionTree(child, id, patch)),
  });
};

/** Số hiệu hiển thị của ý con: ưu tiên code khai báo sẵn, nếu không thì sinh theo thứ tự. */
export const childCode = (child: EvaluationCriterion, parentCode: string, index: number) =>
  child.code ?? `${parentCode}.${index + 1}`;

/** Tìm một tiêu chí ở bất kỳ cấp nào kèm số hiệu hiển thị của nó (32, 32.1...). */
export const findCriterionWithCode = (
  criteria: EvaluationCriterion[],
  id: string
): { node: EvaluationCriterion; code: string } | null => {
  const walk = (
    list: EvaluationCriterion[],
    parentCode: string
  ): { node: EvaluationCriterion; code: string } | null => {
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      const code = parentCode ? childCode(node, parentCode, index) : node.code ?? String(index + 1);
      if (node.id === id) return { node, code };
      if (node.children) {
        const found = walk(node.children, code);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(criteria, '');
};
