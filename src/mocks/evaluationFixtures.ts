import { syncCriterionScores } from '@/features/evaluations/criterionTree';
import type { EvaluationCriterion, EvaluationGroup, EvaluationPeriod, EvaluationSheet, EvaluationStage } from '@/types/evaluation';

const stageOrder: EvaluationStage[] = ['self', 'deputy', 'manager', 'editorial', 'council'];

export const evaluationPeriods: EvaluationPeriod[] = [
  { id: '2026-q3', label: 'Quý III/2026', startAt: '2026-08-01T08:00:00+07:00', dueAt: '2026-08-15T17:00:00+07:00', status: 'active' },
  { id: '2026-q2', label: 'Quý II/2026', startAt: '2026-04-01T08:00:00+07:00', dueAt: '2026-04-15T17:00:00+07:00', status: 'closed' },
];

const numberCriterion = (id: string, groupId: string, title: string, max = 5, score: number | null = null) => ({ id, groupId, title, type: 'number' as const, min: 0, max, score });
const choiceCriterion = (
  id: string,
  groupId: string,
  title: string,
  max: number,
  score: number | null = null,
  customLevels?: { label: string; min: number; max: number }[]
) => ({
  id,
  groupId,
  title,
  type: 'choice' as const,
  min: 0,
  max,
  score,
  levels: customLevels ?? [
    { label: 'Chưa hoàn thành', min: 0, max: Math.round(max * 0.49) },
    { label: 'Hoàn thành', min: Math.round(max * 0.5), max: Math.round(max * 0.79) },
    { label: 'Hoàn thành tốt', min: Math.round(max * 0.8), max },
  ],
});

/** Ý con chỉ để theo dõi (không có ô nhập điểm), ví dụ 1.1, 1.2... của câu 1. */
const subItem = (id: string, groupId: string, title: string, max = 1): EvaluationCriterion => ({
  id,
  groupId,
  title,
  type: 'number',
  min: 0,
  max,
  score: null,
});

/**
 * Tiêu chí nhiều cấp.
 * - scoreMode 'manual': chỉ nhập điểm ở tiêu chí cha (câu 1: 0 - 5đ, các ý 1.1..1.5 chỉ để theo dõi).
 * - scoreMode 'sum': điểm cha cộng tự động từ các ý con (câu 3 = 3.1 + 3.2).
 */
const groupedCriterion = (
  id: string,
  groupId: string,
  title: string,
  max: number,
  scoreMode: 'manual' | 'sum',
  children: EvaluationCriterion[],
  score: number | null = null
): EvaluationCriterion => ({
  id,
  groupId,
  title,
  type: 'grouped',
  min: 0,
  max,
  score,
  scoreMode,
  children,
});

const baseGroups: EvaluationGroup[] = [
  {
    id: 'duties',
    title: 'I. Thực hiện chức trách, nhiệm vụ',
    kind: 'normal',
    criteria: [
      choiceCriterion(
        'd1',
        'duties',
        'Thực hiện nhiệm vụ chuyên môn theo đúng kế hoạch, phân công của lãnh đạo ban và quy trình xuất bản tin bài của tòa soạn',
        45,
        38,
        [
          { label: 'Chưa hoàn thành chỉ tiêu được giao hoặc để xảy ra sai sót nghiệp vụ', min: 0, max: 22 },
          { label: 'Hoàn thành khối lượng công việc được giao đúng tiến độ và chất lượng yêu cầu', min: 23, max: 36 },
          { label: 'Hoàn thành tốt toàn bộ nhiệm vụ, có bài viết chất lượng cao hoặc sáng kiến', min: 37, max: 45 },
        ]
      ),
      choiceCriterion(
        'd2',
        'duties',
        'Bảo đảm chất lượng tin bài, kiểm tra tính chính xác của số liệu và tiến độ xuất bản được giao',
        30,
        24,
        [
          { label: 'Cần cải thiện tốc độ xử lý', min: 0, max: 14 },
          { label: 'Đảm bảo chất lượng và đúng tiến độ cam kết', min: 15, max: 23 },
          { label: 'Chất lượng xuất sắc, hoàn thành trước thời hạn', min: 24, max: 30 },
        ]
      ),
      choiceCriterion('d3', 'duties', 'Chủ động đề xuất giải pháp nâng cao hiệu quả công việc chuyên môn và ứng dụng công nghệ mới', 20, 16),
      numberCriterion('d4', 'duties', 'Khả năng xử lý công việc độc lập, phối hợp liên phòng ban và chịu trách nhiệm về kết quả cuối cùng', 10, 8),
      numberCriterion('d5', 'duties', 'Mức độ hoàn thành các chỉ tiêu kế hoạch công tác được duyệt trong quý', 10, 8),
      numberCriterion('d6', 'duties', 'Hiệu quả sử dụng thời gian, nguồn lực và trang thiết bị làm việc được giao', 5, 4),
      numberCriterion('d7', 'duties', 'Thực hiện nghiêm túc chế độ báo cáo định kỳ và cập nhật tiến độ công việc trên hệ thống', 5, null),
      numberCriterion('d8', 'duties', 'Khả năng thích ứng, linh hoạt xử lý các sự cố hoặc nhiệm vụ phát sinh ngoài kế hoạch', 5, null),
    ],
  },
  { id: 'compliance', title: 'II. Chấp hành pháp luật, quy chế cơ quan', kind: 'normal', criteria: [
    numberCriterion('c1', 'compliance', 'Chấp hành pháp luật và nội quy của cơ quan', 5, 5),
    numberCriterion('c2', 'compliance', 'Thực hiện đầy đủ quy trình và quy chế chuyên môn', 5, 4),
    numberCriterion('c3', 'compliance', 'Nhiệt tình, tận tụy và chủ động trong công việc', 5, 4),
    numberCriterion('c4', 'compliance', 'Thực hành tiết kiệm, chống tham nhũng và lãng phí', 5, 5),
    numberCriterion('c5', 'compliance', 'Bảo mật thông tin, dữ liệu và tài sản của cơ quan', 5, 5),
    numberCriterion('c6', 'compliance', 'Chấp hành thời gian và kỷ luật làm việc', 5, 4),
  ] },
  { id: 'qualities', title: 'III. Phẩm chất, tinh thần phối hợp', kind: 'normal', criteria: [
    choiceCriterion('q1', 'qualities', 'Tinh thần hợp tác, phối hợp và hỗ trợ đồng nghiệp', 5, 4),
    numberCriterion('q2', 'qualities', 'Thái độ giao tiếp và ứng xử trong môi trường làm việc', 5, 4),
    numberCriterion('q3', 'qualities', 'Hỗ trợ tập thể và chia sẻ kinh nghiệm nghiệp vụ', 5, 4),
    numberCriterion('q4', 'qualities', 'Tiếp thu phản hồi và điều chỉnh trong công việc', 5, 4),
    numberCriterion('q5', 'qualities', 'Tinh thần học tập và nâng cao trình độ chuyên môn', 5, 5),
    numberCriterion('q6', 'qualities', 'Giữ gìn đoàn kết nội bộ và văn hóa cơ quan', 5, 5),
    numberCriterion('q7', 'qualities', 'Tinh thần trách nhiệm đối với công việc chung', 5, 4),
  ] },
  { id: 'bonus', title: 'IV. Điểm cộng', kind: 'bonus', criteria: [
    { ...numberCriterion('b1', 'bonus', 'Sáng kiến cải tiến được công nhận và áp dụng', 30, 5), type: 'system' },
    { ...numberCriterion('b2', 'bonus', 'Hoàn thành nhiệm vụ đột xuất được ghi nhận', 10, 2), type: 'system' },
    { ...numberCriterion('b3', 'bonus', 'Được khen thưởng trong kỳ đánh giá', 0, 0), type: 'system' },
    { ...numberCriterion('b4', 'bonus', 'Tham gia đào tạo hoặc chia sẻ nghiệp vụ nội bộ', 5, 3), type: 'system' },
    { ...numberCriterion('b5', 'bonus', 'Đóng góp hoạt động tập thể được ghi nhận', 0, 0), type: 'system' },
  ] },
  { id: 'deduction', title: 'V. Điểm trừ', kind: 'deduction', criteria: [
    numberCriterion('m1', 'deduction', 'Vi phạm thời gian làm việc', 5, 0),
    numberCriterion('m2', 'deduction', 'Không hoàn thành nhiệm vụ đúng thời hạn', 5, 0),
    numberCriterion('m3', 'deduction', 'Vi phạm quy trình hoặc quy định của cơ quan', 5, 0),
    numberCriterion('m4', 'deduction', 'Ảnh hưởng đến tiến độ hoặc kết quả chung của tập thể', 5, 0),
  ] },
  {
    id: 'cadre',
    title: 'VI. Tiêu chí đánh giá nhiều cấp',
    kind: 'normal',
    criteria: [
      groupedCriterion(
        'g1',
        'cadre',
        'Về chính trị, tư tưởng',
        5,
        'manual',
        [
          subItem('g1-1', 'cadre', 'Tuyệt đối trung thành với Đảng, với Tổ quốc và Nhân dân; kiên định lý tưởng cách mạng, chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh, mục tiêu độc lập dân tộc, chủ nghĩa xã hội và đường lối đổi mới của Đảng.'),
          subItem('g1-2', 'cadre', 'Có lập trường, quan điểm, bản lĩnh chính trị vững vàng, không dao động trước mọi khó khăn, thách thức; kiên quyết bảo vệ nền tảng tư tưởng, Cương lĩnh, đường lối của Đảng, Hiến pháp và pháp luật của Nhà nước.'),
          subItem('g1-3', 'cadre', 'Có tinh thần yêu nước sâu sắc, tận tuỵ phục vụ Nhân dân, sâu sát cơ sở, luôn hành động vì lợi ích của Nhân dân, đặt lợi ích của Đảng, quốc gia, dân tộc, Nhân dân, tập thể lên trên lợi ích cá nhân.'),
          subItem('g1-4', 'cadre', 'Tuyệt đối chấp hành sự phân công của tổ chức, yên tâm công tác và hoàn thành tốt mọi nhiệm vụ được giao; tích cực nghiên cứu, học tập các chủ trương, nghị quyết của Đảng, chính sách, pháp luật của Nhà nước.'),
          subItem('g1-5', 'cadre', 'Có năng lực tư duy và tầm nhìn đáp ứng với yêu cầu thay đổi của tình hình thực tiễn; phát huy tinh thần chủ động, đổi mới, sáng tạo; phấn đấu vì mục tiêu phát triển của tổ chức, cơ quan, đơn vị.'),
        ],
        4
      ),
      groupedCriterion(
        'g3',
        'cadre',
        'Năng lực lãnh đạo, quản lý và năng lực chuyên môn, nghiệp vụ theo yêu cầu của vị trí việc làm; khả năng đáp ứng yêu cầu thực thi nhiệm vụ được giao; thái độ công tác trong thực hiện nhiệm vụ; tinh thần đổi mới sáng tạo, dám nghĩ, dám làm, dám chịu trách nhiệm vì lợi ích chung',
        7,
        'sum',
        [
          groupedCriterion(
            'g3-1',
            'cadre',
            'Năng lực lãnh đạo, quản lý',
            4,
            'manual',
            [
              subItem('g3-1-1', 'cadre', 'Có tư duy, khả năng hoạch định đường lối, chính sách và lãnh đạo, chỉ đạo tổ chức thực hiện đóng góp vào mục tiêu phát triển chung của địa phương, tổ chức, cơ quan, đơn vị.'),
              subItem('g3-1-2', 'cadre', 'Có tầm nhìn, phương pháp làm việc khoa học; có năng lực tổng hợp, phân tích và dự báo.'),
              subItem('g3-1-3', 'cadre', 'Có năng lực, kinh nghiệm thực tiễn để cụ thể hoá và tổ chức thực hiện có hiệu quả đường lối, chủ trương của Đảng, chính sách, pháp luật của Nhà nước ở lĩnh vực, địa bàn công tác được phân công phụ trách.'),
              subItem('g3-1-4', 'cadre', 'Có khả năng chỉ đạo, điều hành hoạt động của tổ chức, cơ quan, đơn vị, phân công công việc khoa học, giám sát chặt chẽ, giữ gìn kỷ cương, kỷ luật.'),
            ],
            3
          ),
          groupedCriterion(
            'g3-2',
            'cadre',
            'Năng lực chuyên môn, nghiệp vụ theo vị trí việc làm',
            3,
            'manual',
            [
              subItem('g3-2-1', 'cadre', 'Có kiến thức chuyên sâu về lĩnh vực công tác được phân công; am hiểu quy định pháp luật, quy trình nghiệp vụ có liên quan đến vị trí việc làm.'),
              subItem('g3-2-2', 'cadre', 'Có khả năng phát hiện các vấn đề mới, khó và những hạn chế, bất cập trong thực tiễn; chủ động đề xuất chủ trương, chính sách, nhiệm vụ, giải pháp phù hợp, khả thi, hiệu quả để tháo gỡ điểm nghẽn, thúc đẩy phát triển.'),
              subItem('g3-2-3', 'cadre', 'Có kỹ năng xử lý công việc độc lập, làm việc nhóm hiệu quả.'),
            ],
            3
          ),
        ]
      ),
    ],
  },
];

const cloneGroups = (progress: number, stage: EvaluationStage | 'published' = 'self'): EvaluationGroup[] => {
  const isPublished = stage === 'published';
  const stageIdx = isPublished ? 5 : stageOrder.indexOf(stage as EvaluationStage);

  return baseGroups.map((group) => ({
    ...group,
    criteria: group.criteria.map((criterion, index) => {
      const self = criterion.score ?? 0;
      const deputy = Math.max(0, self - (index % 4 === 0 ? 1 : 0));
      const manager = Math.max(0, deputy - (index % 5 === 0 ? 1 : 0));
      const editorial = Math.max(0, manager - (index % 6 === 0 ? 1 : 0));
      const council = editorial;
      const publishedVal = council;

      const scores: Partial<Record<EvaluationStage | 'published', number>> = {};
      if (stageIdx >= 0) scores.self = self;
      if (stageIdx >= 1) scores.deputy = deputy;
      if (stageIdx >= 2) scores.manager = manager;
      if (stageIdx >= 3) scores.editorial = editorial;
      if (stageIdx >= 4) scores.council = council;
      if (isPublished) scores.published = publishedVal;

      const notesObj = {
        self: index === 0 ? 'Đã hoàn thành 15 bài xuất bản chất lượng cao, đúng tiến độ.' : index === 1 ? 'Kiểm tra kỹ số liệu xuất bản.' : undefined,
        deputy: stageIdx >= 1 && index === 0 ? 'Đã rà soát nghiệp vụ, thống nhất mức điểm tốt.' : undefined,
        manager: stageIdx >= 2 && index === 0 ? 'Đồng ý phê duyệt xếp loại xuất sắc.' : undefined,
      };

      const currentScore = isPublished
        ? publishedVal
        : stage === 'deputy'
        ? deputy
        : stage === 'manager'
        ? manager
        : stage === 'editorial'
        ? editorial
        : stage === 'council'
        ? council
        : self;

      // Tiêu chí nhiều cấp kiểu "tự động cộng": điểm nằm ở các ý con nên phải nhân bản theo cấp
      const cloneChildren = (node: EvaluationCriterion): EvaluationCriterion => {
        if (!node.children) return { ...node };
        if (node.scoreMode !== 'sum') return { ...node, children: node.children.map((child) => ({ ...child })) };
        return {
          ...node,
          children: node.children.map((child) => {
            const childSelf = child.score ?? 0;
            const childScores: Partial<Record<EvaluationStage, number>> = {};
            if (stageIdx >= 0) childScores.self = childSelf;
            if (stageIdx >= 1) childScores.deputy = childSelf;
            if (stageIdx >= 2) childScores.manager = childSelf;
            if (stageIdx >= 3) childScores.editorial = childSelf;
            if (stageIdx >= 4) childScores.council = childSelf;
            if (isPublished) childScores.published = childSelf;
            return { ...cloneChildren(child), score: childSelf, stageScores: childScores };
          }),
        };
      };

      const cloned: EvaluationCriterion = {
        ...cloneChildren(criterion),
        score: progress < 100 && index > 5 && group.id === 'duties' ? null : currentScore,
        stageScores: scores,
        stageNotes: Object.values(notesObj).some(Boolean) ? notesObj : undefined,
        levels: criterion.levels?.map((level) => ({ ...level })),
      };

      return syncCriterionScores(cloned);
    }),
  }));
};

const defaultEvaluators = {
  self: 'Nguyễn Minh Anh',
  deputy: 'Trần Văn Bình',
  manager: 'Phạm Quốc Nam',
  editorial: 'Hoàng Thị Lan',
  council: 'Hội đồng chuyên môn',
};

export const evaluationSheets: EvaluationSheet[] = [
  { id: 'eval-self-q3', employeeName: 'Nguyễn Minh Anh', employeeCode: 'NV-001', department: 'Ban Nội dung', position: 'Phóng viên', periodId: '2026-q3', periodLabel: 'Quý III/2026', status: 'draft', stage: 'self', progress: 88, selfScore: 165, currentScore: 165, stageTotals: { self: 165 }, stageEvaluators: defaultEvaluators, dueAt: '2026-08-15T17:00:00+07:00', updatedAt: '2026-08-07T10:20:00+07:00', groups: cloneGroups(88, 'self') },
  { id: 'eval-van-q3', employeeName: 'Lê Thanh Vân', employeeCode: 'NV-014', department: 'Ban Nội dung', position: 'Biên tập viên', periodId: '2026-q3', periodLabel: 'Quý III/2026', status: 'waiting', stage: 'deputy', progress: 100, selfScore: 165, currentScore: 161, stageTotals: { self: 165, deputy: 161 }, stageEvaluators: { ...defaultEvaluators, self: 'Lê Thanh Vân' }, dueAt: '2026-08-12T17:00:00+07:00', updatedAt: '2026-08-06T16:10:00+07:00', groups: cloneGroups(100, 'deputy') },
  { id: 'eval-huy-q3', employeeName: 'Đỗ Quang Huy', employeeCode: 'NV-026', department: 'Ban Khoa giáo', position: 'Phóng viên', periodId: '2026-q3', periodLabel: 'Quý III/2026', status: 'in_review', stage: 'manager', progress: 100, selfScore: 165, currentScore: 158, stageTotals: { self: 165, deputy: 161, manager: 158 }, stageEvaluators: { ...defaultEvaluators, self: 'Đỗ Quang Huy' }, dueAt: '2026-08-13T17:00:00+07:00', updatedAt: '2026-08-07T08:45:00+07:00', groups: cloneGroups(100, 'manager') },
  { id: 'eval-mai-q3', employeeName: 'Mai Phương Thảo', employeeCode: 'NV-031', department: 'Phòng Lưu trữ', position: 'Chuyên viên', periodId: '2026-q3', periodLabel: 'Quý III/2026', status: 'in_review', stage: 'council', progress: 100, selfScore: 165, currentScore: 155, stageTotals: { self: 165, deputy: 161, manager: 158, editorial: 155, council: 155 }, stageEvaluators: { ...defaultEvaluators, self: 'Mai Phương Thảo' }, dueAt: '2026-08-14T17:00:00+07:00', updatedAt: '2026-08-06T14:30:00+07:00', groups: cloneGroups(100, 'council') },
  { id: 'eval-self-q2', employeeName: 'Nguyễn Minh Anh', employeeCode: 'NV-001', department: 'Ban Nội dung', position: 'Phóng viên', periodId: '2026-q2', periodLabel: 'Quý II/2026', status: 'published', stage: 'published', progress: 100, selfScore: 165, currentScore: 155, stageTotals: { self: 165, deputy: 161, manager: 158, editorial: 155, council: 155, published: 155 }, stageEvaluators: defaultEvaluators, dueAt: '2026-04-15T17:00:00+07:00', updatedAt: '2026-04-25T09:00:00+07:00', groups: cloneGroups(100, 'published') },
  { id: 'eval-van-q2', employeeName: 'Lê Thanh Vân', employeeCode: 'NV-014', department: 'Ban Nội dung', position: 'Biên tập viên', periodId: '2026-q2', periodLabel: 'Quý II/2026', status: 'published', stage: 'published', progress: 100, selfScore: 165, currentScore: 155, stageTotals: { self: 165, deputy: 161, manager: 158, editorial: 155, council: 155, published: 155 }, stageEvaluators: { ...defaultEvaluators, self: 'Lê Thanh Vân' }, dueAt: '2026-04-15T17:00:00+07:00', updatedAt: '2026-04-25T09:00:00+07:00', groups: cloneGroups(100, 'published') },
];
