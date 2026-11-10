import { Alert, Avatar, Button, Form, Input, Modal, Select, Tabs, Tag, Upload, message } from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  FileDoneOutlined,
  LeftOutlined,
  PaperClipOutlined,
  RightOutlined,
  RollbackOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';

import { changeRequestsApi } from '@/services/api';
import type { PersonalProfile, PersonnelChangeFieldItem } from '@/types/personnel';

interface RequestChangeModalProps {
  open: boolean;
  onClose: () => void;
  profile: PersonalProfile;
  onSuccess?: () => void;
}

export type ChangeSectionKey =
  | 'sec1'
  | 'sec2'
  | 'sec3'
  | 'sec4'
  | 'sec5'
  | 'sec6'
  | 'sec7'
  | 'sec8'
  | 'sec9'
  | 'sec10'
  | 'sec11';

export interface SectionDef {
  key: ChangeSectionKey;
  numeral: string;
  title: string;
  shortName: string;
  icon: string;
}

export const SECTION_DEFINITIONS: SectionDef[] = [
  { key: 'sec1', numeral: 'I', title: 'I. Thông tin cơ bản & Hành chính', shortName: 'I. Thông tin cơ bản', icon: '👤' },
  { key: 'sec2', numeral: 'II', title: 'II. Quá trình công tác', shortName: 'II. Quá trình công tác', icon: '💼' },
  { key: 'sec3', numeral: 'III', title: 'III. Đặc điểm lịch sử bản thân', shortName: 'III. Lịch sử bản thân', icon: '📜' },
  { key: 'sec4', numeral: 'IV', title: 'IV. Gia nhập Đảng CSVN', shortName: 'IV. Gia nhập Đảng', icon: '🚩' },
  { key: 'sec5', numeral: 'V', title: 'V. Tổ chức CT-XH & Nghề nghiệp', shortName: 'V. Tổ chức CT-XH', icon: '🏛️' },
  { key: 'sec6', numeral: 'VI', title: 'VI. Đào tạo, bồi dưỡng & Bằng cấp', shortName: 'VI. Đào tạo bồi dưỡng', icon: '🎓' },
  { key: 'sec7', numeral: 'VII', title: 'VII. Khen thưởng', shortName: 'VII. Khen thưởng', icon: '🏅' },
  { key: 'sec8', numeral: 'VIII', title: 'VIII. Kỷ luật', shortName: 'VIII. Kỷ luật', icon: '⚖️' },
  { key: 'sec9', numeral: 'IX', title: 'IX. Hoàn cảnh gia đình & Thân tộc', shortName: 'IX. Quan hệ gia đình', icon: '👨‍👩‍👧' },
  { key: 'sec10', numeral: 'X', title: 'X. Quan hệ xã hội', shortName: 'X. Quan hệ xã hội', icon: '🤝' },
  { key: 'sec11', numeral: 'XI', title: 'XI. Tự nhận xét & Đánh giá', shortName: 'XI. Tự nhận xét', icon: '📝' },
];

interface FieldDef {
  key: string;
  label: string;
  section: ChangeSectionKey;
  currentVal: (p: PersonalProfile) => string;
  placeholderExample: string;
  isTextArea?: boolean;
}

const FIELD_DEFINITIONS: FieldDef[] = [
  // =========================================================================
  // MỤC I: THÔNG TIN CƠ BẢN VÀ HÀNH CHÍNH
  // =========================================================================
  {
    key: 'fullName',
    label: 'Họ và tên khai sinh',
    section: 'sec1',
    currentVal: (p) => p.fullName || '',
    placeholderExample: 'Ví dụ: Nguyễn Văn An (đính chính theo CCCD mới)',
  },
  {
    key: 'penName',
    label: 'Tên thường gọi / Bút danh',
    section: 'sec1',
    currentVal: (p) => (p as any).penName || 'Chưa cập nhật',
    placeholderExample: 'Ví dụ: Văn An, An Nguyễn',
  },
  {
    key: 'birthDate',
    label: 'Ngày tháng năm sinh',
    section: 'sec1',
    currentVal: (p) => p.birthDate || '',
    placeholderExample: 'Ví dụ: 15/08/1985 (sửa theo Giấy khai sinh/CCCD)',
  },
  {
    key: 'gender',
    label: 'Giới tính',
    section: 'sec1',
    currentVal: (p) => p.gender || 'Nam',
    placeholderExample: 'Ví dụ: Nam hoặc Nữ',
  },
  {
    key: 'hometown',
    label: 'Nơi sinh / Quê quán',
    section: 'sec1',
    currentVal: (p) => (p.birthPlace || p.hometown ? `${p.birthPlace || ''} / ${p.hometown || ''}` : 'Chưa cập nhật'),
    placeholderExample: 'Ví dụ: Xã Tân Thông Hội, Huyện Củ Chi, TP. Hồ Chí Minh',
  },
  {
    key: 'ethnicityReligion',
    label: 'Dân tộc & Tôn giáo',
    section: 'sec1',
    currentVal: (p) => `Dân tộc: ${p.ethnicity || 'Kinh'} · Tôn giáo: ${p.religion || 'Không'}`,
    placeholderExample: 'Ví dụ: Dân tộc: Kinh · Tôn giáo: Phật giáo',
  },
  {
    key: 'permanentAddress',
    label: 'Địa chỉ thường trú (hộ khẩu)',
    section: 'sec1',
    currentVal: (p) => p.permanentAddress || 'Chưa cập nhật',
    placeholderExample: 'Ví dụ: 123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM',
  },
  {
    key: 'currentAddress',
    label: 'Nơi ở hiện nay',
    section: 'sec1',
    currentVal: (p) => p.currentAddress || 'Chưa cập nhật',
    placeholderExample: 'Ví dụ: Chung cư Masteri Thảo Điền, 159 Xa Lộ Hà Nội, TP. Thủ Đức',
  },
  {
    key: 'identityNumber',
    label: 'Số CMND / Thẻ CCCD',
    section: 'sec1',
    currentVal: (p) => (p.identityNumber ? `${p.identityNumber} (Cấp ngày ${p.identityIssuedDate || ''} tại ${p.identityIssuedPlace || ''})` : 'Chưa cập nhật'),
    placeholderExample: 'Ví dụ: CCCD số 079084001234 (Cấp ngày 15/01/2025 tại Cục CS QLHC về TTXH)',
  },
  {
    key: 'phoneEmail',
    label: 'Số điện thoại di động / Email',
    section: 'sec1',
    currentVal: (p) => `SĐT: ${p.phone || '—'} · Email: ${p.email || '—'}`,
    placeholderExample: 'Ví dụ: SĐT mới: 0912 345 678 · Email mới: vanan.nguyen@tuoitre.com.vn',
  },
  {
    key: 'healthInfo',
    label: 'Tình trạng sức khỏe, Chiều cao, Cân nặng',
    section: 'sec1',
    currentVal: (p) => `Sức khỏe: ${p.healthStatus || 'Tốt'} · Chiều cao: ${p.height || '1m70'} · Cân nặng: ${p.weight || '65kg'}`,
    placeholderExample: 'Ví dụ: Sức khỏe: Tốt · Chiều cao: 1m72 · Cân nặng: 68kg · Nhóm máu: O',
  },
  {
    key: 'salaryRank',
    label: 'Ngạch viên chức, Bậc lương, Hệ số lương',
    section: 'sec1',
    currentVal: (p) => `Ngạch: ${p.civilServantRank || 'Phóng viên'} (${p.rankCode || '01.003'}) · Bậc: ${p.salaryGrade || '4/9'} · Hệ số: ${p.salaryCoefficient || '3.33'}`,
    placeholderExample: 'Ví dụ: Ngạch: Biên tập viên chính (01.002) · Bậc: 5/8 · Hệ số: 4.40',
  },

  // =========================================================================
  // MỤC II: QUÁ TRÌNH CÔNG TÁC
  // =========================================================================
  {
    key: 'employmentHistory',
    label: 'Quá trình công tác tại cơ quan (từ khi vào cơ quan đến nay)',
    section: 'sec2',
    currentVal: (p) => (p.employmentHistory?.length ? p.employmentHistory.map((item) => `${item.period}: ${item.details}`).join('; ') : 'Chưa có thông tin'),
    placeholderExample: 'Ví dụ: 01/2026 – Nay: Trưởng Ban Nội dung số — Ban Biên tập (Quyết định bổ nhiệm số 45/QĐ-TS)',
    isTextArea: true,
  },
  {
    key: 'historyBeforeRecruitment',
    label: 'Quá trình học tập/công tác trước khi tuyển dụng',
    section: 'sec2',
    currentVal: (p) => (p.historyBeforeRecruitment?.length ? p.historyBeforeRecruitment.map((item) => `${item.period}: ${item.details}`).join('; ') : 'Chưa có thông tin'),
    placeholderExample: 'Ví dụ: 09/2014 – 06/2018: Sinh viên Khoa Báo chí - ĐH KHXH&NV TP.HCM',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC III: ĐẶC ĐIỂM LỊCH SỬ BẢN THÂN
  // =========================================================================
  {
    key: 'personalHistoryNotes',
    label: 'Lịch sử bản thân (bị bắt, tù đày, làm việc cho chế độ cũ, quan hệ nước ngoài...)',
    section: 'sec3',
    currentVal: (p) => p.personalHistoryNotes || 'Bản thân không có vấn đề gì về lịch sử chính trị; không tham gia các tổ chức phản động hoặc làm việc cho chế độ cũ.',
    placeholderExample: 'Ví dụ: Khai rõ các mốc thời gian hoặc ghi rõ: "Không có tiền án tiền sự, không có quan hệ với tổ chức phản động."',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC IV: GIA NHẬP ĐẢNG CỘNG SẢN VIỆT NAM
  // =========================================================================
  {
    key: 'partyProbationaryInfo',
    label: 'Kết nạp Đảng CSVN (Ngày kết nạp, Chi bộ, Đảng bộ, Người giới thiệu)',
    section: 'sec4',
    currentVal: (p) => (p.partyProbationaryDate ? `Ngày vào Đảng: ${p.partyProbationaryDate} tại Chi bộ ${p.partyJoinBranch || '—'} thuộc Đảng bộ ${p.partyCommittee || '—'}. Người giới thiệu: ${(p.partyIntroducers || []).join(', ') || '—'}` : 'Chưa kết nạp Đảng'),
    placeholderExample: 'Ví dụ: Kết nạp Đảng ngày 19/05/2024 tại Chi bộ Ban Nội dung thuộc Đảng bộ Báo Tuổi Trẻ. Người giới thiệu: Nguyễn Văn A, Trần Thị B',
    isTextArea: true,
  },
  {
    key: 'partyOfficialInfo',
    label: 'Ngày chính thức & Số thẻ Đảng viên',
    section: 'sec4',
    currentVal: (p) => (p.partyOfficialDate ? `Ngày chính thức: ${p.partyOfficialDate}. Số thẻ Đảng: ${p.partyCardNumber || '—'} (Cấp ngày: ${p.partyCardIssuedDate || '—'})` : 'Chưa có thông tin'),
    placeholderExample: 'Ví dụ: Công nhận chính thức ngày 19/05/2025. Thẻ Đảng số: 03124567 cấp ngày 20/06/2025',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC V: TỔ CHỨC CHÍNH TRỊ - XÃ HỘI & NGHỀ NGHIỆP
  // =========================================================================
  {
    key: 'youthUnionInfo',
    label: 'Đoàn TNCS Hồ Chí Minh (Ngày gia nhập, Nơi kết nạp)',
    section: 'sec5',
    currentVal: (p) => (p.youthUnionJoinDate ? `Ngày vào Đoàn: ${p.youthUnionJoinDate} tại ${p.youthUnionJoinPlace || 'Trường THPT'}` : 'Đoàn viên Đoàn TNCS Hồ Chí Minh'),
    placeholderExample: 'Ví dụ: Kết nạp Đoàn ngày 26/03/2012 tại Chi đoàn THPT Chuyên Lê Hồng Phong, TP.HCM',
  },
  {
    key: 'politicalOrganizations',
    label: 'Tham gia các tổ chức chính trị - xã hội, Hội nghề nghiệp (Hội Nhà báo, Công đoàn...)',
    section: 'sec5',
    currentVal: (p) => (p.politicalOrganizationHistory?.length ? p.politicalOrganizationHistory.map((item) => `${item.period}: ${item.details}`).join('; ') : 'Hội viên Hội Nhà báo Việt Nam; Đoàn viên Công đoàn Báo Tuổi Trẻ'),
    placeholderExample: 'Ví dụ: 2022 – Nay: Ủy viên Ban chấp hành Chi hội Nhà báo Báo Tuổi Trẻ; Đoàn viên Công đoàn Báo Tuổi Trẻ',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC VI: ĐÀO TẠO, BỒI DƯỠNG & BẰNG CẤP
  // =========================================================================
  {
    key: 'generalEducation',
    label: 'Trình độ giáo dục phổ thông',
    section: 'sec6',
    currentVal: (p) => p.generalEducation || '12/12',
    placeholderExample: 'Ví dụ: 12/12 phổ thông trung học',
  },
  {
    key: 'degree',
    label: 'Trình độ chuyên môn cao nhất',
    section: 'sec6',
    currentVal: (p) => p.professionalQualification || 'Cử nhân Báo chí',
    placeholderExample: 'Ví dụ: Thạc sĩ Quản lý Báo chí & Truyền thông (ĐH KHXH&NV cấp ngày 20/05/2026)',
  },
  {
    key: 'politicalTheory',
    label: 'Lý luận chính trị',
    section: 'sec6',
    currentVal: (p) => p.politicalTheory || 'Cao cấp',
    placeholderExample: 'Ví dụ: Cao cấp Lý luận chính trị (Học viện Chính trị Quốc gia Hồ Chí Minh)',
  },
  {
    key: 'foreignLanguage',
    label: 'Ngoại ngữ & Trình độ',
    section: 'sec6',
    currentVal: (p) => p.foreignLanguages || 'Tiếng Anh C1',
    placeholderExample: 'Ví dụ: IELTS 7.5 (IDP cấp ngày 10/03/2026)',
  },
  {
    key: 'itSkill',
    label: 'Trình độ Tin học',
    section: 'sec6',
    currentVal: (p) => p.informationTechnology || 'Chứng chỉ Ứng dụng CNTT nâng cao',
    placeholderExample: 'Ví dụ: Chứng chỉ Ứng dụng CNTT nâng cao chuẩn Bộ TTTT',
  },
  {
    key: 'trainingHistory',
    label: 'Lịch sử đào tạo, bồi dưỡng chuyên môn nghiệp vụ',
    section: 'sec6',
    currentVal: (p) => (p.trainingHistory?.length ? p.trainingHistory.map((t) => `${t.period}: ${t.institution} — ${t.specialization} (${t.qualification}, hệ ${t.mode})`).join('; ') : 'Chưa có thông tin'),
    placeholderExample: 'Ví dụ: 09/2022 – 12/2024: Học viện Báo chí và Tuyên truyền — Thạc sĩ Báo chí (Văn bằng Thạc sĩ, hệ chính quy)',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC VII: KHEN THƯỞNG
  // =========================================================================
  {
    key: 'rewardsHistory',
    label: 'Khen thưởng (Bằng khen, Danh hiệu thi đua, Quyết định khen thưởng)',
    section: 'sec7',
    currentVal: (p) => (p.rewards?.length ? p.rewards.map((item) => `${item.date}: ${item.content} (${item.decision})`).join('; ') : 'Chiến sĩ thi đua cơ sở'),
    placeholderExample: 'Ví dụ: Bằng khen của Chủ tịch UBND TP.HCM năm 2025 theo Quyết định số 128/QĐ-UBND ngày 15/12/2025',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC VIII: KỶ LUẬT
  // =========================================================================
  {
    key: 'disciplinesHistory',
    label: 'Kỷ luật (Hình thức, Cơ quan quyết định, Thời hạn)',
    section: 'sec8',
    currentVal: (p) => (p.disciplines?.length ? p.disciplines.map((item) => `${item.date}: ${item.content} (${item.decision})`).join('; ') : 'Không có kỷ luật'),
    placeholderExample: 'Ví dụ: Đã hết thời hạn kỷ luật khiển trách theo Quyết định số 22/QĐ ngày...',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC IX: HOÀN CẢNH KINH TẾ, QUAN HỆ GIA ĐÌNH VÀ THÂN TỘC
  // =========================================================================
  {
    key: 'familyParents',
    label: 'Về Cha, Mẹ đẻ (Họ tên, năm sinh, nghề nghiệp, nơi cư trú, hoàn cảnh kinh tế)',
    section: 'sec9',
    currentVal: (p) => {
      const items = (p.familyRelations || []).filter((r) => /cha|mẹ|bố/i.test(r.relation));
      return items.length ? items.map((r) => `${r.relation}: ${r.details}`).join('; ') : 'Cha: Nguyễn Văn B, sinh năm 1955, hưu trí; Mẹ: Lê Thị C, sinh năm 1958, nội trú tại TP.HCM';
    },
    placeholderExample: 'Ví dụ: Cha: Nguyễn Văn B, sinh năm 1955, hưu trí; Mẹ: Lê Thị C, sinh năm 1958, nội trợ, cư trú tại Quận 3, TP.HCM. Kinh tế gia đình ổn định.',
    isTextArea: true,
  },
  {
    key: 'familySpouse',
    label: 'Về Vợ (hoặc Chồng) (Họ tên, năm sinh, nghề nghiệp, nơi cư trú, hoàn cảnh kinh tế)',
    section: 'sec9',
    currentVal: (p) => {
      const item = (p.familyRelations || []).find((r) => /vợ|chồng/i.test(r.relation));
      return item ? `${item.relation}: ${item.details}` : 'Chưa cập nhật thông tin vợ/chồng';
    },
    placeholderExample: 'Ví dụ: Chồng: Trần Quốc Huy, sinh năm 1988, Kỹ sư phần mềm; Hiện cư trú tại TP. Thủ Đức, TP. Hồ Chí Minh.',
    isTextArea: true,
  },
  {
    key: 'familyChildren',
    label: 'Về các Con (Họ tên, năm sinh, nghề nghiệp / học tập, nơi cư trú)',
    section: 'sec9',
    currentVal: (p) => {
      const items = (p.familyRelations || []).filter((r) => /con/i.test(r.relation));
      return items.length ? items.map((r) => `${r.relation}: ${r.details}`).join('; ') : 'Con: Trần Gia Hân, sinh năm 2018, học sinh Tiểu học';
    },
    placeholderExample: 'Ví dụ: Con gái: Trần Gia Hân, sinh năm 2018, hiện là học sinh Trường Tiểu học Nguyễn Huệ, TP.HCM',
    isTextArea: true,
  },
  {
    key: 'familySiblings',
    label: 'Về Anh, Chị, Em ruột (Họ tên, năm sinh, nghề nghiệp, nơi cư trú)',
    section: 'sec9',
    currentVal: (p) => {
      const items = (p.familyRelations || []).filter((r) => /anh|chị|em/i.test(r.relation));
      return items.length ? items.map((r) => `${r.relation}: ${r.details}`).join('; ') : 'Em gái: Nguyễn Thị Mai, sinh năm 1992, nhân viên văn phòng tại TP.HCM';
    },
    placeholderExample: 'Ví dụ: Em gái: Nguyễn Thị Mai, sinh năm 1992, Cử nhân Kinh tế, hiện làm việc tại Quận 1, TP.HCM',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC X: QUAN HỆ XÃ HỘI
  // =========================================================================
  {
    key: 'socialRelations',
    label: 'Quan hệ xã hội (Bố mẹ vợ/chồng, người nuôi dưỡng, quan hệ khác)',
    section: 'sec10',
    currentVal: (p) => (p.socialRelations?.length ? p.socialRelations.map((r) => `${r.relation}: ${r.details}`).join('; ') : 'Bố mẹ bên vợ/chồng: Chấp hành tốt đường lối chính sách của Đảng và pháp luật tại địa phương'),
    placeholderExample: 'Ví dụ: Bố chồng: Trần Văn D, sinh năm 1956, hưu trí; Mẹ chồng: Hoàng Thị E, sinh năm 1960, cư trú tại TP. Thủ Đức.',
    isTextArea: true,
  },

  // =========================================================================
  // MỤC XI: TỰ NHẬN XÉT & ĐÁNH GIÁ
  // =========================================================================
  {
    key: 'selfAssessment',
    label: 'Tự nhận xét bản thân (Ưu khuyết điểm, phẩm chất chính trị, đạo đức, năng lực công tác)',
    section: 'sec11',
    currentVal: (p) => p.selfAssessment || 'Luôn giữ vững lập trường tư tưởng chính trị vững vàng, ý thức kỷ luật tốt và tinh thần trách nhiệm cao. Chủ động học hỏi, hoàn thành xuất sắc các nhiệm vụ được giao.',
    placeholderExample: 'Ví dụ: Luôn giữ vững lập trường tư tưởng chính trị, trung thực, tận tụy với công việc, hoàn thành tốt nhiệm vụ được giao...',
    isTextArea: true,
  },
];

export function RequestChangeModal({ open, onClose, profile, onSuccess }: RequestChangeModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ChangeSectionKey>('sec1');
  const [proposedChanges, setProposedChanges] = useState<Record<string, string>>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Count changed fields
  const changedKeys = useMemo(() => {
    return Object.keys(proposedChanges).filter((k) => proposedChanges[k]?.trim().length > 0);
  }, [proposedChanges]);

  const getChangedCountInSection = (secKey: ChangeSectionKey) => {
    return FIELD_DEFINITIONS.filter((f) => f.section === secKey && proposedChanges[f.key]?.trim()).length;
  };

  const handleFieldChange = (key: string, val: string) => {
    setProposedChanges((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleRevertField = (key: string) => {
    setProposedChanges((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const currentSectionIndex = SECTION_DEFINITIONS.findIndex((s) => s.key === activeTab);
  const prevSection = currentSectionIndex > 0 ? SECTION_DEFINITIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < SECTION_DEFINITIONS.length - 1 ? SECTION_DEFINITIONS[currentSectionIndex + 1] : null;

  const handleSubmit = async () => {
    if (changedKeys.length === 0) {
      message.warning('Vui lòng nhập nội dung thay đổi cho ít nhất 1 trường dữ liệu.');
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      const changeFields: PersonnelChangeFieldItem[] = changedKeys.map((key) => {
        const itemDef = FIELD_DEFINITIONS.find((f) => f.key === key);
        return {
          fieldKey: key,
          fieldLabel: itemDef?.label || key,
          currentValue: itemDef ? itemDef.currentVal(profile) : '',
          newValue: proposedChanges[key].trim(),
        };
      });

      const payload = {
        personnelId: profile.id || 'pers-101',
        employeeCode: profile.employeeCode,
        fullName: profile.fullName,
        department: profile.department,
        profileType: '2A',
        fields: changeFields,
        reason: values.reason?.trim() || 'Cập nhật, bổ sung thông tin hồ sơ lý lịch cán bộ mẫu 2A',
        attachmentName: fileList[0]?.name || 'Minh_Chung_Thay_Doi.pdf',
        requestedBy: profile.fullName,
      };

      const res = await changeRequestsApi.create(payload);
      message.success(res.message || 'Gửi yêu cầu thay đổi lý lịch thành công!');
      form.resetFields();
      setProposedChanges({});
      setFileList([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldSection = (sectionKey: ChangeSectionKey) => {
    const fields = FIELD_DEFINITIONS.filter((f) => f.section === sectionKey);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map((field) => {
          const currentValText = field.currentVal(profile);
          const proposedVal = proposedChanges[field.key] || '';
          const isModified = proposedVal.trim().length > 0;

          return (
            <div
              key={field.key}
              style={{
                border: isModified ? '1.5px solid #2563eb' : '1px solid #e4e7ec',
                background: isModified ? '#f8faff' : '#ffffff',
                borderRadius: 10,
                padding: '16px 18px',
                transition: 'all 0.2s ease',
                boxShadow: isModified ? '0 2px 8px rgba(37, 99, 235, 0.08)' : '0 1px 2px rgba(16, 24, 40, 0.03)',
              }}
            >
              {/* Field title row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isModified ? '#1d4ed8' : '#1e293b' }}>
                    {field.label}
                  </span>
                  {isModified && (
                    <Tag color="blue" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
                      Đã nhập đề xuất thay đổi
                    </Tag>
                  )}
                </div>

                {isModified && (
                  <Button
                    icon={<RollbackOutlined />}
                    onClick={() => handleRevertField(field.key)}
                    size="small"
                    style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}
                    type="text"
                  >
                    Khôi phục ban đầu
                  </Button>
                )}
              </div>

              {/* Symmetrical 2 Columns: exactly 50% - 50% and vertically aligned */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  alignItems: 'stretch',
                }}
              >
                {/* Column 1: Dữ liệu hiện tại */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <FileDoneOutlined style={{ color: '#94a3b8' }} />
                    <span>Dữ liệu hiện tại trong hồ sơ:</span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minHeight: field.isTextArea ? 84 : 40,
                      background: isModified ? '#ffffff' : '#f8fafc',
                      border: '1px solid #d0d5dd',
                      borderRadius: 8,
                      padding: field.isTextArea ? '10px 12px' : '0 12px',
                      display: field.isTextArea ? 'block' : 'flex',
                      alignItems: 'center',
                      fontSize: 13.5,
                      color: currentValText ? '#101828' : '#98a2b3',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      overflowY: field.isTextArea ? 'auto' : 'hidden',
                      maxHeight: field.isTextArea ? 140 : undefined,
                    }}
                  >
                    {currentValText || '(Chưa có thông tin)'}
                  </div>
                </div>

                {/* Column 2: Dữ liệu đề xuất */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isModified ? '#1d4ed8' : '#2563eb',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <EditOutlined style={{ color: isModified ? '#1d4ed8' : '#2563eb' }} />
                    <span>Dữ liệu thay đổi đề xuất:</span>
                  </div>
                  {field.isTextArea ? (
                    <Input.TextArea
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholderExample}
                      rows={3}
                      style={{
                        flex: 1,
                        minHeight: 84,
                        fontSize: 13.5,
                        borderColor: isModified ? '#2563eb' : '#d0d5dd',
                        background: '#ffffff',
                        borderRadius: 8,
                      }}
                      value={proposedVal}
                    />
                  ) : (
                    <Input
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholderExample}
                      style={{
                        height: 40,
                        fontSize: 13.5,
                        borderColor: isModified ? '#2563eb' : '#d0d5dd',
                        background: '#ffffff',
                        borderRadius: 8,
                      }}
                      value={proposedVal}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose} style={{ height: 38, fontSize: 13.5, fontWeight: 500 }}>
          Hủy bỏ
        </Button>,
        <Button
          danger
          key="submit"
          loading={loading}
          onClick={handleSubmit}
          style={{
            height: 38,
            fontSize: 13.5,
            fontWeight: 600,
            background: changedKeys.length > 0 ? '#d92d20' : undefined,
            borderColor: changedKeys.length > 0 ? '#d92d20' : undefined,
          }}
          type="primary"
        >
          {changedKeys.length > 0 ? `Gửi yêu cầu thay đổi (${changedKeys.length} mục)` : 'Gửi yêu cầu thay đổi'}
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#fef3f2',
              color: '#d92d20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <EditOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: '#101828' }}>
              Yêu cầu thay đổi / Bổ sung thông tin Lý lịch (Mẫu 2A)
            </div>
            <div style={{ fontSize: 12, color: '#667085', fontWeight: 400 }}>
              Đối chiếu dữ liệu hiện hành và nhập nội dung đề xuất cập nhật theo các mục I đến XI của Sơ yếu lý lịch
            </div>
          </div>
        </div>
      }
      width={1020}
    >
      <div style={{ padding: '8px 0 4px', fontSize: 13.5 }}>
        {/* Profile Card Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={42} style={{ background: '#d92d20', fontWeight: 700, fontSize: 15 }}>
              {profile.fullName.split(' ').slice(-2).map((p) => p[0]).join('').toUpperCase()}
            </Avatar>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{profile.fullName}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Đơn vị: <strong>{profile.department}</strong> · Chức vụ: <strong>{profile.currentPosition}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="red" style={{ fontWeight: 600 }}>Lý lịch mẫu 2A</Tag>
            {changedKeys.length > 0 ? (
              <Tag color="blue" style={{ fontWeight: 700, padding: '2px 10px', fontSize: 12 }}>
                Đang thay đổi: {changedKeys.length} mục
              </Tag>
            ) : (
              <Tag color="default" style={{ fontSize: 12 }}>Chưa có thay đổi</Tag>
            )}
          </div>
        </div>

        {/* Quick section bar with arrows and dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
            <span>Đang xem mục:</span>
            <Select
              onChange={(key) => setActiveTab(key as ChangeSectionKey)}
              options={SECTION_DEFINITIONS.map((s) => ({
                value: s.key,
                label: `${s.title} ${getChangedCountInSection(s.key) ? `(${getChangedCountInSection(s.key)} thay đổi)` : ''}`,
              }))}
              style={{ width: 340 }}
              value={activeTab}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              disabled={!prevSection}
              icon={<LeftOutlined />}
              onClick={() => prevSection && setActiveTab(prevSection.key)}
              size="small"
              style={{ fontWeight: 600 }}
            >
              Mục trước
            </Button>
            <Button
              disabled={!nextSection}
              icon={<RightOutlined />}
              onClick={() => nextSection && setActiveTab(nextSection.key)}
              size="small"
              style={{ fontWeight: 600 }}
              type="primary"
            >
              Mục kế tiếp
            </Button>
          </div>
        </div>

        {/* Tab categories with arrow for moreIcon instead of "..." */}
        <Tabs
          activeKey={activeTab}
          items={SECTION_DEFINITIONS.map((section) => ({
            key: section.key,
            label: (
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                <span style={{ marginRight: 4 }}>{section.icon}</span>
                <span>{section.shortName}</span>
                {getChangedCountInSection(section.key) > 0 && (
                  <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, padding: '0 4px', borderRadius: 4, fontWeight: 700 }}>
                    {getChangedCountInSection(section.key)}
                  </Tag>
                )}
              </span>
            ),
            children: renderFieldSection(section.key),
          }))}
          onChange={(k) => setActiveTab(k as ChangeSectionKey)}
          style={{ marginBottom: 16 }}
        />

        {/* Common reason & proof file section */}
        <div
          style={{
            marginTop: 18,
            padding: '16px 18px',
            background: '#fafbfc',
            border: '1px solid #e4e7ec',
            borderRadius: 10,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(260px, 1fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#344054', marginBottom: 6 }}>
                Lý do / Căn cứ thay đổi
              </div>
              <Form form={form} layout="vertical">
                <Form.Item name="reason" style={{ margin: 0 }}>
                  <Input.TextArea
                    placeholder="Ví dụ: Đã nhận bằng Thạc sĩ vào tháng 05/2026, kính đề nghị Ban Tổ chức - Nhân sự cập nhật hồ sơ..."
                    rows={2}
                    style={{ fontSize: 13 }}
                  />
                </Form.Item>
              </Form>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#344054', marginBottom: 6 }}>
                Đính kèm file minh chứng (Bằng cấp, Quyết định)
              </div>
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                maxCount={3}
                onChange={({ fileList: fl }) => setFileList(fl)}
              >
                <Button icon={<PaperClipOutlined />} style={{ fontSize: 13, fontWeight: 500 }}>
                  Chọn tệp PDF, DOCX hoặc Ảnh
                </Button>
              </Upload>
              <div style={{ fontSize: 11.5, color: '#667085', marginTop: 4 }}>
                Khuyến khích đính kèm file scan văn bằng hoặc quyết định để được duyệt nhanh hơn
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
