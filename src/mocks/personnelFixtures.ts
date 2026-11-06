import type { PersonalProfile, PersonnelChangeRequest } from '@/types/personnel';
import { demoUsers } from './usersFixtures';

export const personalProfile: PersonalProfile = {
  employeeCode: 'NV-2026-009',
  fullName: 'Nguyễn Minh Anh',
  phone: '0903 125 418',
  homePhone: '028 3822 1105',
  email: 'minhanh@tuoitre.com.vn',
  currentPosition: 'Phóng viên Điều tra & Đô thị',
  department: 'Ban Thời sự',
  birthDate: '15/03/1990',
  gender: 'Nữ',
  birthPlace: 'Thành phố Hồ Chí Minh',
  hometown: 'Xã Tân Thới, huyện Phong Điền, thành phố Cần Thơ',
  permanentAddress: '128 Nguyễn Đình Chiểu, phường Xuân Hòa, Thành phố Hồ Chí Minh',
  currentAddress: '42 Trần Quốc Thảo, phường Xuân Hòa, Thành phố Hồ Chí Minh',
  ethnicity: 'Kinh',
  religion: 'Không',
  nationality: 'Việt Nam',
  identityNumber: '079090012345',
  identityIssuedDate: '18/06/2021',
  identityIssuedPlace: 'Cục Cảnh sát quản lý hành chính về trật tự xã hội',
  familyBackground: 'Công chức, viên chức',
  occupationAtRecruitment: 'Phóng viên tập sự',
  generalEducation: '12/12',
  professionalQualification: 'Cử nhân Báo chí, chuyên ngành Báo in',
  politicalTheory: 'Trung cấp',
  foreignLanguages: 'Tiếng Anh – Bậc 4/6; Tiếng Pháp – Bậc 2/6',
  informationTechnology: 'Ứng dụng công nghệ thông tin cơ bản',
  revolutionParticipationDate: 'Không',
  revolutionActivity: 'Không',
  recruitmentDate: '01/08/2013',
  recruitingAgency: 'Báo Tuổi Trẻ',
  enlistmentDate: 'Không',
  dischargeDate: 'Không',
  militaryRank: 'Không',
  youthUnionJoinDate: '26/03/2005',
  youthUnionJoinPlace: 'Trường THPT Nguyễn Thị Minh Khai, Thành phố Hồ Chí Minh',
  partyProbationaryDate: '19/05/2018',
  partyOfficialDate: '19/05/2019',
  civilServantRank: 'Phóng viên hạng III',
  rankCode: 'V.11.02.06',
  salaryGrade: 'Bậc 4/9',
  salaryCoefficient: '3,33',
  salaryEffectiveFrom: '01/08/2025',
  awardedTitle: 'Chiến sĩ thi đua cơ sở năm 2024',
  healthStatus: 'Tốt',
  height: '162 cm',
  weight: '52 kg',
  workStrengths: 'Phỏng vấn, điều tra dữ liệu, biên tập nội dung đa nền tảng và phối hợp sản xuất tuyến bài chuyên đề.',
  historyBeforeRecruitment: [
    { period: '09/2008 – 06/2012', details: 'Học ngành Báo chí tại Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Thành phố Hồ Chí Minh.' },
    { period: '07/2012 – 07/2013', details: 'Cộng tác viên nội dung, tham gia sản xuất tin bài và các chuyên đề dành cho bạn đọc trẻ.' },
  ],
  employmentHistory: [
    { period: '08/2013 – 12/2016', details: 'Phóng viên tập sự, Ban Thời sự; phụ trách tin bài đô thị và dân sinh.' },
    { period: '01/2017 – 12/2021', details: 'Phóng viên, Ban Thời sự; thực hiện tuyến bài chuyên đề và điều tra dữ liệu.' },
    { period: '01/2022 – nay', details: 'Phóng viên hạng III, Ban Thời sự; biên tập nội dung đa nền tảng và phối hợp nhóm sản xuất tuyến bài tiêu điểm.' },
  ],
  personalHistoryNotes: 'Không có đặc điểm lịch sử cần khai báo bổ sung.',
  partyJoinBranch: 'Chi bộ Ban Thời sự',
  partyCommittee: 'Đảng bộ Báo Tuổi Trẻ',
  partyIntroducers: ['Nguyễn Viễn Sự – Trưởng Ban Thời sự', 'Lê Ngọc Hiển – Phó Trưởng ban Thư ký Tòa soạn'],
  partyCardNumber: 'HT-079018',
  partyCardIssuedDate: '19/05/2019',
  politicalOrganizationHistory: [
    { period: '03/2005 – 08/2008', details: 'Đoàn viên Đoàn TNCS Hồ Chí Minh, Trường THPT Nguyễn Thị Minh Khai.' },
    { period: '09/2008 – 06/2012', details: 'Tham gia Ban Chấp hành Chi đoàn khoa Báo chí và Truyền thông.' },
  ],
  trainingHistory: [
    { institution: 'ĐH KHXH&NV – ĐHQG TP.HCM', specialization: 'Báo chí – Báo in', period: '2008 – 2012', mode: 'Chính quy', qualification: 'Cử nhân' },
    { institution: 'Học viện Chính trị khu vực II', specialization: 'Lý luận chính trị', period: '2020 – 2021', mode: 'Vừa làm vừa học', qualification: 'Trung cấp' },
  ],
  rewards: [
    { date: '12/2024', content: 'Chiến sĩ thi đua cơ sở năm 2024', decision: 'QĐ 218/QĐ-TT' },
  ],
  disciplines: [],
  familyRelations: [
    { relation: 'Chồng', details: 'Trần Quốc Huy, sinh năm 1988, kỹ sư công nghệ thông tin; hiện cư trú tại Thành phố Hồ Chí Minh.' },
    { relation: 'Con', details: 'Trần Minh Khôi, sinh năm 2018, học sinh.' },
    { relation: 'Cha', details: 'Nguyễn Văn Thành, sinh năm 1960, cán bộ hưu trí; cư trú tại thành phố Cần Thơ.' },
    { relation: 'Mẹ', details: 'Lê Thị Thu, sinh năm 1963, giáo viên hưu trí; cư trú tại thành phố Cần Thơ.' },
  ],
  socialRelations: [],
  selfAssessment: 'Có lập trường tư tưởng vững vàng, ý thức kỷ luật tốt và tinh thần trách nhiệm cao. Chủ động nghiên cứu, phối hợp hiệu quả, tôn trọng đồng nghiệp và giữ gìn chuẩn mực nghề nghiệp. Có khả năng tổ chức tuyến bài, phân tích dữ liệu và thích ứng nhanh với phương thức sản xuất nội dung mới.',
};

/**
 * 20 nhân sự Báo Tuổi Trẻ tương ứng với 20 tài khoản demo trong usersFixtures.ts
 */
export const initialPersonnelList = demoUsers.map((u, index) => {
  const codeNum = String(index + 1).padStart(3, '0');
  const isMinhAnh = u.username === 'minhanh';
  
  // Xác định chuyên môn, phân loại hồ sơ và trạng thái
  let specialty = 'Báo chí & Truyền thông';
  let profileType: '2A' | '2B' | '2C' = '2A';
  let isPartyMember = true;
  let isYouthUnionMember = false;

  if (u.department.includes('Công nghệ')) {
    specialty = 'Công nghệ thông tin & Phần mềm';
    isPartyMember = false;
    isYouthUnionMember = true;
  } else if (u.department.includes('Media')) {
    specialty = 'Truyền hình & Sản xuất Video';
    if (u.role === 'employee') {
      isPartyMember = false;
      isYouthUnionMember = true;
      profileType = '2B';
    }
  } else if (u.department.includes('Tổ chức')) {
    specialty = 'Quản trị nhân sự';
  } else if (u.role === 'employee' && !isMinhAnh) {
    profileType = '2B';
    isYouthUnionMember = true;
  }

  return {
    id: isMinhAnh ? 'pers-101' : `pers-${codeNum}`,
    employeeCode: `NV-2026-${codeNum}`,
    fullName: u.fullName,
    penName: u.penName || u.fullName,
    photoUrl: undefined,
    birthDate: u.birthDate || '1985-01-01',
    gender: (u.fullName.includes('Anh') || u.fullName.includes('Hà') || u.fullName.includes('Vy') || u.fullName.includes('Hân') || u.fullName.includes('Trang')) ? 'Nữ' : 'Nam',
    phone: u.phone,
    extension: u.extension,
    email: u.email,
    secondaryEmail: `${u.username}@gmail.com`,
    employmentType: 'Biên chế chính thức',
    department: u.department,
    position: u.position,
    specialty,
    assignments: [
      { department: u.department, position: u.position, specialty, isPrimary: true },
    ],
    participateEvaluation: true,
    isYouthUnionMember,
    isPartyMember,
    leaveEffectiveDate: '2026-01-01',
    identityNumber: `0790${80 + (index % 15)}00${codeNum}`,
    identityIssuedDate: '2021-06-18',
    identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
    notes: `${u.position} – ${u.department}`,
    profileType,
    status: 'complete' as const,
    createdAt: '2026-01-15T08:30:00Z',
  };
});

export const initialChangeRequests: PersonnelChangeRequest[] = [
  {
    id: 'req-2026-001',
    code: 'YC-2026-001',
    personnelId: 'pers-101',
    employeeCode: 'NV-2026-009',
    fullName: 'Nguyễn Minh Anh',
    department: 'Ban Thời sự',
    profileType: '2A',
    fields: [
      { fieldKey: 'education', fieldLabel: 'Trình độ giáo dục phổ thông', currentValue: 'Cử nhân Báo chí', newValue: 'Thạc sĩ Báo chí & Truyền thông' },
      { fieldKey: 'foreignLanguage', fieldLabel: 'Trình độ Ngoại ngữ / Tin học', currentValue: 'B1', newValue: 'IELTS 7.5 (C1)' },
    ],
    reason: 'Bổ sung văn bằng Thạc sĩ Báo chí mới nhận và chứng chỉ IELTS quốc tế năm 2026',
    attachmentName: 'Bang_Thac_Si_Minh_Anh_2026.pdf',
    requestedBy: 'Nguyễn Minh Anh',
    requestedAt: '2026-11-02T09:30:00Z',
    status: 'new',
    snapshotPdfName: 'Ly_Lich_2A_NV2026009_v1.pdf',
  },
  {
    id: 'req-2026-002',
    code: 'YC-2026-002',
    personnelId: 'pers-018',
    employeeCode: 'NV-2026-018',
    fullName: 'Đỗ Quang Huy',
    department: 'Trung tâm Media & Podcast',
    profileType: '2B',
    fields: [
      { fieldKey: 'specialty', fieldLabel: 'Vị trí việc làm / Chuyên môn', currentValue: 'Kỹ thuật viên', newValue: 'Chuyên viên Dựng hình & Kỹ thuật số' },
    ],
    reason: 'Cập nhật chức danh vị trí việc làm sau khi hoàn thành kỳ thi chuyển ngạch',
    attachmentName: 'Quyet_Dinh_Chuyen_Ngach_QuangHuy.pdf',
    requestedBy: 'Đỗ Quang Huy',
    requestedAt: '2026-11-03T14:15:00Z',
    status: 'in_progress',
    snapshotPdfName: 'Ly_Lich_2B_NV2026018_v2.pdf',
  },
  {
    id: 'req-2026-003',
    code: 'YC-2026-003',
    personnelId: 'pers-012',
    employeeCode: 'NV-2026-012',
    fullName: 'Trần Thu Hà',
    department: 'Ban Kinh tế',
    profileType: '2A',
    fields: [
      { fieldKey: 'currentAddress', fieldLabel: 'Nơi ở hiện nay', currentValue: '123 Nguyễn Thị Minh Khai, Q.3, TP.HCM', newValue: '456 Võ Văn Tần, P. Võ Thị Sáu, Q.3, TP.HCM' },
    ],
    reason: 'Cập nhật địa chỉ thường trú và nơi ở mới theo Căn cước công dân gắn chíp',
    attachmentName: 'Thong_Bao_Cu_Tru_ThuHa.pdf',
    requestedBy: 'Trần Thu Hà',
    requestedAt: '2026-11-01T11:00:00Z',
    status: 'approved',
    reviewedBy: 'Trịnh Khánh Vy (Trưởng phòng Tổ chức - Cán bộ)',
    reviewedAt: '2026-11-02T15:20:00Z',
    reviewComment: 'Chấp nhận phê duyệt cập nhật địa chỉ cư trú mới.',
    snapshotPdfName: 'Ly_Lich_2A_NV2026012_v1.pdf',
  },
  {
    id: 'req-2026-004',
    code: 'YC-2026-004',
    personnelId: 'pers-010',
    employeeCode: 'NV-2026-010',
    fullName: 'Bùi Anh Tú',
    department: 'Ban Thời sự',
    profileType: '2B',
    fields: [
      { fieldKey: 'rewardsHistory', fieldLabel: 'VII. Khen thưởng', currentValue: 'Chiến sĩ thi đua cơ sở', newValue: 'Chiến sĩ thi đua cấp Bộ năm 2025' },
    ],
    reason: 'Cập nhật quyết định khen thưởng chiến sĩ thi đua cấp Bộ năm 2025.',
    attachmentName: 'Bang_Khen_Cap_Bo_AnhTu.pdf',
    requestedBy: 'Bùi Anh Tú',
    requestedAt: '2026-11-01T08:45:00Z',
    status: 'returned',
    reviewedBy: 'Trịnh Khánh Vy (Trưởng phòng Tổ chức - Cán bộ)',
    reviewedAt: '2026-11-02T14:30:00Z',
    reviewComment: 'Trả về: File scan Bằng khen bị mờ không đọc được số quyết định. Vui lòng tải lại bản quét màu rõ nét.',
    snapshotPdfName: 'Ly_Lich_2B_NV2026010_v1.pdf',
  },
];

export const initialWorkUnits = [
  { id: 'unit-1', name: 'Ban Biên tập', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3838', type: 'Chính quyền' as const, personnelCount: 4, createdAt: '2024-01-15' },
  { id: 'unit-2', name: 'Ban Thư ký Tòa soạn', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3839', type: 'Chính quyền' as const, personnelCount: 18, createdAt: '2024-01-15' },
  { id: 'unit-3', name: 'Ban Thời sự', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3840', type: 'Chính quyền' as const, personnelCount: 26, createdAt: '2024-01-15' },
  { id: 'unit-4', name: 'Ban Kinh tế', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3841', type: 'Chính quyền' as const, personnelCount: 20, createdAt: '2024-02-01' },
  { id: 'unit-5', name: 'Ban Quốc tế', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3842', type: 'Chính quyền' as const, personnelCount: 14, createdAt: '2024-02-01' },
  { id: 'unit-6', name: 'Ban Văn hóa - Giải trí', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3843', type: 'Chính quyền' as const, personnelCount: 16, createdAt: '2024-02-01' },
  { id: 'unit-7', name: 'Ban Thể thao', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3844', type: 'Chính quyền' as const, personnelCount: 15, createdAt: '2024-02-01' },
  { id: 'unit-8', name: 'Ban Bạn đọc & Pháp luật', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3845', type: 'Chính quyền' as const, personnelCount: 18, createdAt: '2024-02-01' },
  { id: 'unit-9', name: 'Trung tâm Media & Podcast', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3846', type: 'Chính quyền' as const, personnelCount: 22, createdAt: '2024-02-01' },
  { id: 'unit-10', name: 'Phòng Tổ chức - Cán bộ', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3847', type: 'Chính quyền' as const, personnelCount: 10, createdAt: '2024-02-01' },
  { id: 'unit-11', name: 'Ban Quản trị & Công nghệ', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3848', type: 'Chính quyền' as const, personnelCount: 12, createdAt: '2024-02-01' },
  { id: 'unit-12', name: 'Đoàn Thanh niên Báo Tuổi Trẻ', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3850', type: 'Đoàn, công đoàn' as const, personnelCount: 8, createdAt: '2024-01-20' },
  { id: 'unit-13', name: 'Công đoàn Báo Tuổi Trẻ', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3851', type: 'Đoàn, công đoàn' as const, personnelCount: 6, createdAt: '2024-01-20' },
  { id: 'unit-14', name: 'Đảng ủy Báo Tuổi Trẻ', address: '60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM', phone: '028 3997 3860', type: 'Đảng' as const, personnelCount: 5, createdAt: '2024-01-10' },
];

export const initialPositionTitles = [
  { id: 'pos-1', name: 'Tổng Biên tập', unitType: 'Chính quyền' as const, personnelCount: 1, createdAt: '2024-01-01' },
  { id: 'pos-2', name: 'Phó Tổng Biên tập', unitType: 'Chính quyền' as const, personnelCount: 3, createdAt: '2024-01-01' },
  { id: 'pos-3', name: 'Trưởng ban', unitType: 'Chính quyền' as const, personnelCount: 9, createdAt: '2024-01-15' },
  { id: 'pos-4', name: 'Phó Trưởng ban', unitType: 'Chính quyền' as const, personnelCount: 14, createdAt: '2024-01-15' },
  { id: 'pos-5', name: 'Phóng viên Điều tra & Đô thị', unitType: 'Chính quyền' as const, personnelCount: 22, createdAt: '2024-01-15' },
  { id: 'pos-6', name: 'Biên tập viên chính', unitType: 'Chính quyền' as const, personnelCount: 35, createdAt: '2024-01-15' },
  { id: 'pos-7', name: 'Chuyên viên Dựng hình & Kỹ thuật số', unitType: 'Chính quyền' as const, personnelCount: 8, createdAt: '2024-02-01' },
  { id: 'pos-8', name: 'Quản trị viên Hệ thống IT', unitType: 'Chính quyền' as const, personnelCount: 6, createdAt: '2024-02-01' },
  { id: 'pos-9', name: 'Trưởng phòng Tổ chức - Cán bộ', unitType: 'Chính quyền' as const, personnelCount: 1, createdAt: '2024-02-01' },
  { id: 'pos-10', name: 'Bí thư Đoàn Thanh niên', unitType: 'Đoàn, công đoàn' as const, personnelCount: 1, createdAt: '2024-02-01' },
  { id: 'pos-11', name: 'Chủ tịch Công đoàn', unitType: 'Đoàn, công đoàn' as const, personnelCount: 1, createdAt: '2024-02-01' },
  { id: 'pos-12', name: 'Bí thư Đảng ủy', unitType: 'Đảng' as const, personnelCount: 1, createdAt: '2024-01-10' },
];

export const initialSpecialties = [
  { id: 'spec-1', name: 'Báo chí & Truyền thông', description: 'Phóng viên, biên tập viên tin tức, phóng sự điều tra và bài viết chuyên đề', personnelCount: 65, createdAt: '2024-01-10' },
  { id: 'spec-2', name: 'Truyền hình & Sản xuất Video', description: 'Quay phim, dựng phim, kỹ thuật trường quay và sản xuất podcast số', personnelCount: 18, createdAt: '2024-01-15' },
  { id: 'spec-3', name: 'Công nghệ thông tin & Phần mềm', description: 'Quản trị hạ tầng máy chủ, hệ thống CMS, ERP tòa soạn và an ninh mạng', personnelCount: 12, createdAt: '2024-01-15' },
  { id: 'spec-4', name: 'Quản trị nhân sự', description: 'Tổ chức cán bộ, thi đua khen thưởng, đào tạo và chính sách lao động', personnelCount: 8, createdAt: '2024-02-01' },
  { id: 'spec-5', name: 'Tài chính - Kế toán', description: 'Quản lý tài chính, thanh toán nhuận bút, kế toán phát hành và ngân sách', personnelCount: 10, createdAt: '2024-02-01' },
];

export const initialUnitPositionMappings = [
  { id: 'map-1', unitId: 'unit-1', unitName: 'Ban Biên tập', positionId: 'pos-1', positionName: 'Tổng Biên tập', createdAt: '2024-01-01' },
  { id: 'map-2', unitId: 'unit-1', unitName: 'Ban Biên tập', positionId: 'pos-2', positionName: 'Phó Tổng Biên tập', createdAt: '2024-01-01' },
  { id: 'map-3', unitId: 'unit-3', unitName: 'Ban Thời sự', positionId: 'pos-3', positionName: 'Trưởng ban', createdAt: '2024-01-15' },
  { id: 'map-4', unitId: 'unit-3', unitName: 'Ban Thời sự', positionId: 'pos-5', positionName: 'Phóng viên Điều tra & Đô thị', createdAt: '2024-01-15' },
  { id: 'map-5', unitId: 'unit-9', unitName: 'Trung tâm Media & Podcast', positionId: 'pos-7', positionName: 'Chuyên viên Dựng hình & Kỹ thuật số', createdAt: '2024-02-01' },
  { id: 'map-6', unitId: 'unit-10', unitName: 'Phòng Tổ chức - Cán bộ', positionId: 'pos-9', positionName: 'Trưởng phòng Tổ chức - Cán bộ', createdAt: '2024-02-01' },
  { id: 'map-7', unitId: 'unit-11', unitName: 'Ban Quản trị & Công nghệ', positionId: 'pos-8', positionName: 'Quản trị viên Hệ thống IT', createdAt: '2024-02-01' },
  { id: 'map-8', unitId: 'unit-14', unitName: 'Đảng ủy Báo Tuổi Trẻ', positionId: 'pos-12', positionName: 'Bí thư Đảng ủy', createdAt: '2024-01-10' },
];

export const initialResignedEmployees = [
  { id: 'res-1', employeeCode: 'NV-2023-088', fullName: 'Vũ Hoàng Nam', department: 'Ban Thời sự', reason: 'Chuyển công tác theo nguyện vọng cá nhân', resignationDate: '15/10/2026', attachmentName: 'Quyet_Dinh_Nghi_Viec_VuHoangNam.pdf' },
  { id: 'res-2', employeeCode: 'NV-2022-045', fullName: 'Trần Thị Thu Thảo', department: 'Ban Kinh tế', reason: 'Nghỉ hưởng chế độ hưu trí theo quy định', resignationDate: '01/10/2026', attachmentName: 'Quyet_Dinh_Huu_Tri_ThuThao.pdf' },
  { id: 'res-3', employeeCode: 'NV-2024-012', fullName: 'Đặng Quốc Bảo', department: 'Ban Quản trị & Công nghệ', reason: 'Đi học tập chuyên sâu tại nước ngoài', resignationDate: '20/09/2026', attachmentName: 'Don_Xin_Thoi_Viec_DangQuocBao.pdf' },
  { id: 'res-4', employeeCode: 'NV-2021-099', fullName: 'Ngô Thanh Sơn', department: 'Trung tâm Media & Podcast', reason: 'Thay đổi định hướng nghề nghiệp', resignationDate: '30/08/2026', attachmentName: 'Quyet_Dinh_Thoi_Viec_NgoThanhSon.pdf' },
];
