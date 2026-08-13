import { Avatar, Button, Tag } from 'antd';
import { DownloadOutlined, FormOutlined, HistoryOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { ChangeHistoryDrawer } from '@/features/personnel/components/ChangeHistoryDrawer';
import { RequestChangeModal } from '@/features/personnel/components/RequestChangeModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { changeRequestsApi, personnelApi } from '@/services/api';
import type { PersonalProfile, PersonnelRecordItem } from '@/types/personnel';
import './personnel-profile.css';

const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

const profileSections = [
  { numeral: 'I', title: 'Thông tin cá nhân' },
  { numeral: 'II', title: 'Lịch sử bản thân' },
  { numeral: 'III', title: 'Đặc điểm lịch sử' },
  { numeral: 'IV', title: 'Gia nhập Đảng' },
  { numeral: 'V', title: 'Tổ chức, đoàn thể' },
  { numeral: 'VI', title: 'Đào tạo, bồi dưỡng' },
  { numeral: 'VII', title: 'Khen thưởng' },
  { numeral: 'VIII', title: 'Kỷ luật' },
  { numeral: 'IX', title: 'Gia đình, thân tộc' },
  { numeral: 'X', title: 'Quan hệ xã hội' },
  { numeral: 'XI', title: 'Tự nhận xét' },
] as const;

function convertRecordToProfile(record: PersonnelRecordItem): PersonalProfile {
  return {
    id: record.id,
    employeeCode: record.employeeCode,
    fullName: record.fullName,
    avatarUrl: record.photoUrl,
    phone: record.phone,
    homePhone: record.extension ? `Nội bộ: ${record.extension}` : '--',
    email: record.email,
    currentPosition: record.position,
    department: record.department,
    birthDate: record.birthDate || '01/01/1990',
    gender: record.gender || 'Nam',
    birthPlace: 'TP. Hồ Chí Minh',
    hometown: 'TP. Hồ Chí Minh',
    permanentAddress: '123 Tuổi Trẻ, P.8, Q. Phú Nhuận, TP.HCM',
    currentAddress: '123 Tuổi Trẻ, P.8, Q. Phú Nhuận, TP.HCM',
    ethnicity: 'Kinh',
    religion: 'Không',
    nationality: 'Việt Nam',
    identityNumber: record.identityNumber || '079090001122',
    identityIssuedDate: record.identityIssuedDate || '15/06/2021',
    identityIssuedPlace: record.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH',
    familyBackground: 'Cán bộ viên chức',
    occupationAtRecruitment: record.position,
    generalEducation: '12/12',
    professionalQualification: record.specialty || 'Cử nhân Báo chí & Truyền thông',
    politicalTheory: 'Trung cấp',
    foreignLanguages: 'Anh văn B2',
    informationTechnology: 'Ứng dụng CNTT cơ bản',
    revolutionParticipationDate: '--',
    revolutionActivity: '--',
    recruitmentDate: '01/06/2018',
    recruitingAgency: 'Tòa soạn Báo Tuổi Trẻ',
    enlistmentDate: '--',
    dischargeDate: '--',
    militaryRank: '--',
    youthUnionJoinDate: '26/03/2010',
    youthUnionJoinPlace: 'Trường THPT Chuyên',
    partyProbationaryDate: record.isPartyMember ? '03/02/2020' : '--',
    partyOfficialDate: record.isPartyMember ? '03/02/2021' : '--',
    civilServantRank: 'Phóng viên / Biên tập viên',
    rankCode: '01.014',
    salaryGrade: '4/9',
    salaryCoefficient: '3.33',
    salaryEffectiveFrom: '01/01/2024',
    awardedTitle: 'Chiến sĩ thi đua cơ sở',
    healthStatus: 'Tốt',
    height: '168 cm',
    weight: '62 kg',
    workStrengths: record.notes || 'Chuyên môn nghiệp vụ vững vàng',
    historyBeforeRecruitment: [
      { period: '2012 - 2016', details: 'Học tập tại Đại học Xã hội và Nhân văn' },
    ],
    employmentHistory: (record.assignments || []).map((a) => ({
      period: '2018 - Nay',
      details: `${a.position} - ${a.department} ${a.isPrimary ? '(Đơn vị chính)' : '(Kiêm nhiệm)'}`,
    })),
    personalHistoryNotes: 'Bản thân và gia đình chấp hành tốt chính sách pháp luật.',
    partyJoinBranch: record.isPartyMember ? 'Chi bộ Chi hội Nhà báo' : '--',
    partyCommittee: record.isPartyMember ? 'Đảng bộ Báo Tuổi Trẻ' : '--',
    partyIntroducers: ['Nguyễn Văn A', 'Trần Thị B'],
    partyCardNumber: record.isPartyMember ? '28.091234' : '--',
    partyCardIssuedDate: record.isPartyMember ? '19/05/2021' : '--',
    politicalOrganizationHistory: [],
    trainingHistory: [],
    rewards: [],
    disciplines: [],
    familyRelations: [],
    socialRelations: [],
    selfAssessment: 'Luôn hoàn thành tốt các nhiệm vụ chuyên môn được giao.',
  };
}

function ProfileSectionNav() {
  const [activeSection, setActiveSection] = useState('I');

  const navigateToSection = (event: MouseEvent<HTMLAnchorElement>, numeral: string) => {
    event.preventDefault();
    document.getElementById(`personnel-section-${numeral}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(numeral);
  };

  return (
    <aside className="personnel-section-nav">
      <div className="personnel-section-nav-heading">
        <span><ModuleIcon module="personnel" size={16} /></span>
        <div><strong>Mục lục hồ sơ</strong></div>
      </div>
      <nav aria-label="Các mục hồ sơ nhân sự">
        {profileSections.map((section) => (
          <a
            aria-current={activeSection === section.numeral ? 'location' : undefined}
            className={activeSection === section.numeral ? 'active' : ''}
            href={`#personnel-section-${section.numeral}`}
            key={section.numeral}
            onClick={(event) => navigateToSection(event, section.numeral)}
          >
            <b>{section.numeral}</b>
            <span>{section.title}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

function FormField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`personnel-form-field${wide ? ' wide' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function FormRow({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }) {
  return <dl className={`personnel-form-row columns-${columns}`}>{children}</dl>;
}

function RomanSection({ numeral, title, children }: { numeral: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`personnel-section-${numeral}`} className="personnel-roman-section">
      <h2 id={`personnel-section-${numeral}`}><span>{numeral}.</span>{title}</h2>
      {children}
    </section>
  );
}

function DataTable<T>({ columns, rows, emptyText }: { columns: Array<{ title: string; value: (row: T) => string }>; rows: T[]; emptyText: string }) {
  return (
    <div className="personnel-table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.title}>{column.title}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, rowIndex) => (
            <tr key={rowIndex}>{columns.map((column) => <td key={column.title}>{column.value(row)}</td>)}</tr>
          )) : (
            <tr><td className="personnel-table-empty" colSpan={columns.length}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProfileDocument({ profile }: { profile: PersonalProfile }) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  const historyState = useAsyncData(async () => (await changeRequestsApi.list()).data);
  const historyList = (historyState.data ?? []).filter(
    (req) => req.personnelId === profile.id || req.employeeCode === profile.employeeCode
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Action bar — right-aligned compact buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            const fileName = `Ly_lich_2A_${profile.employeeCode}_${new Date().toISOString().slice(0, 10)}.pdf`;
            import('antd').then(({ message: msg }) => msg.success(`Đang tải xuống file Lý lịch: ${fileName}`));
          }}
          style={{ height: 36, fontSize: 13.5, fontWeight: 600, borderColor: '#e4e7ec', color: '#475467' }}
        >
          Tải file
        </Button>
        <Button
          icon={<HistoryOutlined />}
          onClick={() => setHistoryDrawerOpen(true)}
          style={{ height: 36, fontSize: 13.5, fontWeight: 600, borderColor: '#e4e7ec', color: '#475467' }}
        >
          Lịch sử chỉnh sửa ({historyList.length})
        </Button>
        <Button
          icon={<FormOutlined />}
          onClick={() => setRequestModalOpen(true)}
          style={{ height: 36, fontSize: 13.5, fontWeight: 600, background: '#d92d20', borderColor: '#d92d20', color: '#fff' }}
        >
          Yêu cầu thay đổi
        </Button>
      </div>

      <article aria-labelledby="personnel-section-I" className="personnel-form-document">
        <header className="personnel-document-masthead">
          <div className="personnel-document-context"><span><ModuleIcon module="personnel" size={17} /></span><div><small>Mẫu hồ sơ điện tử</small><strong>2A / {profile.employeeCode}</strong></div></div>
          <div className="personnel-document-title"><span>Hồ sơ cán bộ, viên chức</span><h1 id="personnel-section-I">I. Sơ yếu lý lịch</h1></div>
          <Tag bordered={false} className="personnel-verified"><span aria-hidden>✓</span> Đã xác minh</Tag>
        </header>

        <section aria-label="Thông tin nhận diện" className="personnel-identity-block">
          <figure className="personnel-photo"><Avatar className="personnel-photo-avatar" shape="square" size={132} src={profile.avatarUrl}>{initials(profile.fullName)}</Avatar><figcaption>Ảnh 4 × 6</figcaption></figure>
          <div className="personnel-identity-fields">
            <FormRow columns={1}><FormField label="Họ và tên khai sinh" value={profile.fullName.toUpperCase()} /></FormRow>
            <FormRow><FormField label="Sinh ngày" value={profile.birthDate} /><FormField label="Giới tính" value={profile.gender} /></FormRow>
            <FormRow columns={1}><FormField label="Nơi sinh" value={profile.birthPlace} /></FormRow>
            <FormRow columns={1}><FormField label="Quê quán" value={profile.hometown} /></FormRow>
            <FormRow><FormField label="Chức vụ hiện tại" value={profile.currentPosition} /><FormField label="Đơn vị công tác" value={profile.department} /></FormRow>
          </div>
        </section>

        <div className="personnel-document-body">
          <section aria-label="Thông tin cá nhân" className="personnel-form-section">
            <FormRow columns={1}><FormField label="Địa chỉ thường trú (hộ khẩu)" value={profile.permanentAddress} /></FormRow>
            <FormRow columns={1}><FormField label="Nơi ở hiện nay" value={profile.currentAddress} /></FormRow>
            <FormRow columns={3}><FormField label="Dân tộc" value={profile.ethnicity} /><FormField label="Tôn giáo" value={profile.religion} /><FormField label="Quốc tịch" value={profile.nationality} /></FormRow>
            <FormRow columns={3}><FormField label="Số CMND/CCCD" value={profile.identityNumber} /><FormField label="Ngày cấp" value={profile.identityIssuedDate} /><FormField label="Nơi cấp" value={profile.identityIssuedPlace} /></FormRow>
            <FormRow columns={3}><FormField label="Điện thoại nhà" value={profile.homePhone} /><FormField label="Điện thoại di động" value={profile.phone} /><FormField label="Email" value={profile.email} /></FormRow>
          </section>

          <section aria-label="Xuất thân và học vấn" className="personnel-form-section">
            <FormRow><FormField label="Thành phần gia đình xuất thân" value={profile.familyBackground} /><FormField label="Nghề nghiệp khi được tuyển dụng" value={profile.occupationAtRecruitment} /></FormRow>
            <div className="personnel-education"><span className="personnel-inline-label">Trình độ học vấn</span><div><FormField label="Văn hóa phổ thông" value={profile.generalEducation} /><FormField label="Chuyên môn, kỹ thuật" value={profile.professionalQualification} /><FormField label="Lý luận chính trị" value={profile.politicalTheory} /><FormField label="Ngoại ngữ" value={profile.foreignLanguages} /><FormField label="Tin học" value={profile.informationTechnology} /></div></div>
          </section>

          <section aria-label="Quá trình tham gia và tuyển dụng" className="personnel-form-section">
            <FormRow columns={3}><FormField label="Ngày tuyển dụng" value={profile.recruitmentDate} /><FormField label="Cơ quan tuyển dụng" value={profile.recruitingAgency} /><FormField label="Tham gia cách mạng" value={profile.revolutionParticipationDate} /></FormRow>
            <FormRow columns={3}><FormField label="Ngày vào Đảng (dự bị)" value={profile.partyProbationaryDate} /><FormField label="Ngày chính thức" value={profile.partyOfficialDate} /><FormField label="Số thẻ Đảng" value={profile.partyCardNumber} /></FormRow>
            <FormRow columns={3}><FormField label="Ngày nhập ngũ" value={profile.enlistmentDate} /><FormField label="Ngày xuất ngũ" value={profile.dischargeDate} /><FormField label="Quân hàm" value={profile.militaryRank} /></FormRow>
          </section>

          <section aria-label="Tình trạng sức khỏe và tài sản" className="personnel-form-section last">
            <FormRow columns={3}><FormField label="Tình trạng sức khỏe" value={profile.healthStatus} /><FormField label="Chiều cao" value={profile.height} /><FormField label="Cân nặng" value={profile.weight} /></FormRow>
          </section>
        </div>

        <div className="personnel-extended-sections">
          <RomanSection numeral="II" title="Lịch sử bản thân">
            <div className="personnel-subsection"><h3>II.A Trước khi được tuyển dụng vào cơ quan</h3><DataTable columns={[{ title: 'Từ tháng, năm – đến tháng, năm', value: (row) => row.period }, { title: 'Quá trình học tập, lao động và hoạt động nổi bật', value: (row) => row.details }]} emptyText="Chưa có thông tin trước tuyển dụng" rows={profile.historyBeforeRecruitment} /></div>
            <div className="personnel-subsection"><h3>II.B Quá trình công tác từ khi được tuyển dụng</h3><DataTable columns={[{ title: 'Từ tháng, năm – đến tháng, năm', value: (row) => row.period }, { title: 'Chức danh, chức vụ, đơn vị công tác và nhiệm vụ', value: (row) => row.details }]} emptyText="Chưa có quá trình công tác" rows={profile.employmentHistory} /></div>
          </RomanSection>

          <RomanSection numeral="III" title="Những đặc điểm về lịch sử bản thân"><div className="personnel-note-panel">{profile.personalHistoryNotes}</div></RomanSection>

          <RomanSection numeral="IV" title="Gia nhập Đảng Cộng sản Việt Nam">
            <div className="personnel-roman-form"><FormRow columns={3}><FormField label="Ngày được kết nạp vào Đảng" value={profile.partyProbationaryDate} /><FormField label="Tại Chi bộ" value={profile.partyJoinBranch} /><FormField label="Thuộc Đảng bộ" value={profile.partyCommittee} /></FormRow><FormRow><FormField label="Người giới thiệu thứ nhất" value={profile.partyIntroducers[0] ?? 'Chưa có thông tin'} /><FormField label="Người giới thiệu thứ hai" value={profile.partyIntroducers[1] ?? 'Chưa có thông tin'} /></FormRow><FormRow columns={3}><FormField label="Ngày tuyên bố chính thức" value={profile.partyOfficialDate} /><FormField label="Số thẻ Đảng viên" value={profile.partyCardNumber} /><FormField label="Ngày cấp thẻ" value={profile.partyCardIssuedDate} /></FormRow></div>
          </RomanSection>

          <RomanSection numeral="V" title="Tham gia các tổ chức chính trị, xã hội, hội nghề nghiệp"><DataTable columns={[{ title: 'Từ thời gian đến thời gian', value: (row) => row.period }, { title: 'Tên tổ chức, nhiệm vụ và chức danh', value: (row) => row.details }]} emptyText="Chưa có thông tin tham gia tổ chức" rows={profile.politicalOrganizationHistory} /></RomanSection>

          <RomanSection numeral="VI" title="Đào tạo, bồi dưỡng về chuyên môn, nghiệp vụ, lý luận chính trị, ngoại ngữ"><DataTable columns={[{ title: 'Tên trường, địa chỉ', value: (row) => row.institution }, { title: 'Chuyên ngành', value: (row) => row.specialization }, { title: 'Thời gian học', value: (row) => row.period }, { title: 'Chế độ học', value: (row) => row.mode }, { title: 'Văn bằng, chứng chỉ', value: (row) => row.qualification }]} emptyText="Chưa có thông tin đào tạo" rows={profile.trainingHistory} /></RomanSection>

          <RomanSection numeral="VII" title="Khen thưởng"><DataTable columns={[{ title: 'Tháng năm', value: (row) => row.date }, { title: 'Nội dung và hình thức khen thưởng', value: (row) => row.content }, { title: 'Số quyết định khen thưởng', value: (row) => row.decision }]} emptyText="Chưa có thông tin khen thưởng" rows={profile.rewards} /></RomanSection>

          <RomanSection numeral="VIII" title="Kỷ luật"><DataTable columns={[{ title: 'Tháng năm', value: (row) => row.date }, { title: 'Nội dung và hình thức kỷ luật', value: (row) => row.content }, { title: 'Cấp quyết định', value: (row) => row.decision }]} emptyText="Không có thông tin kỷ luật" rows={profile.disciplines} /></RomanSection>

          <RomanSection numeral="IX" title="Hoàn cảnh kinh tế, quan hệ gia đình và thân tộc"><DataTable columns={[{ title: 'Quan hệ', value: (row) => row.relation }, { title: 'Họ tên, năm sinh, nghề nghiệp, nơi cư trú và hoàn cảnh kinh tế', value: (row) => row.details }]} emptyText="Chưa có thông tin quan hệ gia đình" rows={profile.familyRelations} /></RomanSection>

          <RomanSection numeral="X" title="Quan hệ xã hội"><DataTable columns={[{ title: 'Quan hệ', value: (row) => row.relation }, { title: 'Thông tin cá nhân, quá trình công tác và nơi cư trú', value: (row) => row.details }]} emptyText="Chưa có dữ liệu quan hệ xã hội" rows={profile.socialRelations} /></RomanSection>

          <RomanSection numeral="XI" title="Tự nhận xét"><div className="personnel-assessment"><p>{profile.selfAssessment}</p><span>{profile.fullName}</span></div></RomanSection>
        </div>

        <footer className="personnel-document-footer"><span><ModuleIcon module="personnel" size={14} /> Hồ sơ điện tử nội bộ</span><span>{profile.employeeCode}</span></footer>
      </article>

      <RequestChangeModal
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => historyState.reload()}
        open={requestModalOpen}
        profile={profile}
      />

      <ChangeHistoryDrawer
        employeeCode={profile.employeeCode}
        fullName={profile.fullName}
        historyRequests={historyList}
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
      />
    </div>
  );
}

export function PersonnelProfilePage() {
  const { id } = useParams<{ id?: string }>();

  const state = useAsyncData(async () => {
    if (id) {
      const recordRes = await personnelApi.get(id);
      if (recordRes.data) {
        return convertRecordToProfile(recordRes.data);
      }
    }
    return (await personnelApi.profile()).data;
  }, id || '');

  return (
    <div className="module-page personnel-profile-page">
      {state.loading ? (
        <ContentSkeleton rows={12} />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={state.reload} />
      ) : !state.data ? (
        <EmptyState description="Chưa có lý lịch cá nhân" />
      ) : (
        <div className="personnel-profile-layout">
          <ProfileSectionNav />
          <ProfileDocument profile={state.data} />
        </div>
      )}
    </div>
  );
}
