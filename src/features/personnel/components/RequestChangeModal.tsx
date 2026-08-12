import { Button, Checkbox, Form, Input, Modal, Upload, message } from 'antd';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';

import { changeRequestsApi } from '@/services/api';
import type { PersonalProfile, PersonnelChangeFieldItem } from '@/types/personnel';

interface RequestChangeModalProps {
  open: boolean;
  onClose: () => void;
  profile: PersonalProfile;
  onSuccess?: () => void;
}

const availableFields = [
  // I. Sơ yếu lý lịch (Thông tin cá nhân)
  { group: 'I. Thông tin cá nhân', key: 'fullName', label: 'Họ và tên khai sinh', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'penName', label: 'Tên thường gọi / Bút danh', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'birthDate', label: 'Ngày tháng năm sinh', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'hometown', label: 'Nơi sinh / Quê quán', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'permanentAddress', label: 'Địa chỉ thường trú (hộ khẩu)', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'currentAddress', label: 'Nơi ở hiện nay', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'identityNumber', label: 'Số CMND/CCCD (Ngày cấp, Nơi cấp)', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'phoneEmail', label: 'Điện thoại di động / Email', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'education', label: 'Trình độ văn hóa phổ thông', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'degree', label: 'Trình độ chuyên môn, kỹ thuật', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'politicalTheory', label: 'Lý luận chính trị', isTable: false },
  { group: 'I. Thông tin cá nhân', key: 'foreignLanguage', label: 'Ngoại ngữ / Tin học', isTable: false },

  // II. Lịch sử bản thân (2 mục: II.A & II.B)
  { group: 'II. Lịch sử bản thân', key: 'personalHistoryBefore', label: 'II.A Quá trình học tập, lao động trước khi được tuyển dụng vào cơ quan', isTable: true },
  { group: 'II. Lịch sử bản thân', key: 'employmentHistory', label: 'II.B Quá trình công tác từ khi được tuyển dụng vào cơ quan', isTable: true },

  // III. Những đặc điểm về lịch sử bản thân (1 mục)
  { group: 'III. Những đặc điểm về lịch sử bản thân', key: 'personalHistoryNotes', label: 'III. Những đặc điểm về lịch sử bản thân', isTable: false },

  // IV. Gia nhập Đảng Cộng sản Việt Nam (1 mục)
  { group: 'IV. Gia nhập Đảng Cộng sản Việt Nam', key: 'partyInfo', label: 'IV. Thông tin gia nhập Đảng CSVN (Ngày kết nạp, Ngày chính thức, Số thẻ Đảng)', isTable: false },

  // V. Tham gia các tổ chức chính trị, xã hội, hội nghề nghiệp (1 mục)
  { group: 'V. Tham gia các tổ chức chính trị, xã hội, hội nghề nghiệp', key: 'politicalOrganizations', label: 'V. Tham gia các tổ chức chính trị, xã hội, hội nghề nghiệp', isTable: true },

  // VI. Đào tạo, bồi dưỡng (1 mục)
  { group: 'VI. Đào tạo, bồi dưỡng về chuyên môn, nghiệp vụ, lý luận chính trị, ngoại ngữ', key: 'trainingHistory', label: 'VI. Đào tạo, bồi dưỡng về chuyên môn, nghiệp vụ, lý luận chính trị, ngoại ngữ', isTable: true },

  // VII. Khen thưởng (1 mục)
  { group: 'VII. Khen thưởng', key: 'rewardsHistory', label: 'VII. Khen thưởng', isTable: true },

  // VIII. Kỷ luật (1 mục)
  { group: 'VIII. Kỷ luật', key: 'disciplinesHistory', label: 'VIII. Kỷ luật', isTable: true },

  // IX. Hoàn cảnh kinh tế, quan hệ gia đình và thân tộc (1 mục)
  { group: 'IX. Hoàn cảnh kinh tế, quan hệ gia đình và thân tộc', key: 'familyRelations', label: 'IX. Hoàn cảnh kinh tế, quan hệ gia đình và thân tộc', isTable: true },

  // X. Quan hệ xã hội (1 mục)
  { group: 'X. Quan hệ xã hội', key: 'socialRelations', label: 'X. Quan hệ xã hội', isTable: true },

  // XI. Tự nhận xét (1 mục)
  { group: 'XI. Tự nhận xét', key: 'selfAssessment', label: 'XI. Tự nhận xét', isTable: false },
];

export function RequestChangeModal({ open, onClose, profile, onSuccess }: RequestChangeModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(['employmentHistory']);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // State arrays for each table section
  const [personalHistoryBeforeRows, setPersonalHistoryBeforeRows] = useState<Array<{ period: string; details: string }>>([
    { period: '2012 - 2016', details: 'Sinh viên Khoa Báo chí & Truyền thông - ĐH KHXH&NV TP.HCM' },
  ]);

  const [employmentRows, setEmploymentRows] = useState<Array<{ period: string; details: string }>>([
    { period: '06/2018 - 12/2021', details: 'Phóng viên - Ban Biên tập (Ban Thời sự - Chính trị)' },
    { period: '01/2022 - Nay', details: 'Biên tập viên - Ban Thư ký toà soạn' },
  ]);

  const [politicalOrgRows, setPoliticalOrgRows] = useState<Array<{ period: string; details: string }>>([
    { period: '2019 - Nay', details: 'Hội viên Chi hội Nhà báo Tòa soạn Báo Tuổi Trẻ' },
  ]);

  const [trainingRows, setTrainingRows] = useState<Array<{ institution: string; specialization: string; period: string; mode: string; qualification: string }>>([
    { institution: 'Học viện Báo chí & Tuyên truyền', specialization: 'Nghiệp vụ Báo chí nâng cao', period: '2022 - 2023', mode: 'Bồi dưỡng', qualification: 'Chứng chỉ nghiệp vụ' },
  ]);

  const [rewardRows, setRewardRows] = useState<Array<{ date: string; content: string; decision: string }>>([
    { date: '12/2024', content: 'Chiến sĩ thi đua cấp Tòa soạn năm 2024', decision: 'QĐ 125/QĐ-TS' },
  ]);

  const [disciplineRows, setDisciplineRows] = useState<Array<{ date: string; content: string; decision: string }>>([]);

  const [familyRows, setFamilyRows] = useState<Array<{ relation: string; fullNameYearDetails: string }>>([
    { relation: 'Cha', fullNameYearDetails: 'Nguyễn Văn A (SN 1962) - Cán bộ hưu trí, ngụ Q. Phú Nhuận, TP.HCM' },
    { relation: 'Mẹ', fullNameYearDetails: 'Trần Thị B (SN 1965) - Giáo viên hưu trí, ngụ Q. Phú Nhuận, TP.HCM' },
  ]);

  const [socialRows, setSocialRows] = useState<Array<{ relation: string; details: string }>>([]);

  const handleFieldToggle = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedFieldKeys((prev) => [...prev, key]);
    } else {
      setSelectedFieldKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  const getFieldValue = (key: string): string => {
    if (key === 'fullName') return profile.fullName;
    if (key === 'penName') return 'Chưa cập nhật';
    if (key === 'birthDate') return profile.birthDate || 'Chưa cập nhật';
    if (key === 'hometown') return `${profile.birthPlace || ''} / ${profile.hometown || ''}`;
    if (key === 'permanentAddress') return profile.permanentAddress || 'Chưa cập nhật';
    if (key === 'currentAddress') return profile.currentAddress || 'Chưa cập nhật';
    if (key === 'identityNumber') return `${profile.identityNumber} (Cấp ngày ${profile.identityIssuedDate} tại ${profile.identityIssuedPlace})`;
    if (key === 'phoneEmail') return `SĐT: ${profile.phone} - Email: ${profile.email}`;

    if (key === 'education') return profile.generalEducation || '12/12';
    if (key === 'degree') return profile.professionalQualification || 'Cử nhân';
    if (key === 'politicalTheory') return profile.politicalTheory || 'Trung cấp';
    if (key === 'foreignLanguage') return `Ngoại ngữ: ${profile.foreignLanguages} - Tin học: ${profile.informationTechnology}`;

    if (key === 'personalHistoryBefore') return `${profile.historyBeforeRecruitment?.length || 0} quá trình trước tuyển dụng`;
    if (key === 'employmentHistory') return `${profile.employmentHistory?.length || 0} quá trình công tác tại cơ quan`;
    if (key === 'personalHistoryNotes') return profile.personalHistoryNotes || 'Bản thân và gia đình chấp hành tốt pháp luật';

    if (key === 'partyInfo') return profile.partyOfficialDate ? `Chính thức: ${profile.partyOfficialDate} - Số thẻ Đảng: ${profile.partyCardNumber}` : 'Chưa kết nạp Đảng';
    if (key === 'politicalOrganizations') return `${profile.politicalOrganizationHistory?.length || 0} tổ chức / hội nghề nghiệp`;

    if (key === 'trainingHistory') return `${profile.trainingHistory?.length || 0} khóa bồi dưỡng nghiệp vụ`;
    if (key === 'rewardsHistory') return `${profile.rewards?.length || 0} hình thức khen thưởng`;
    if (key === 'disciplinesHistory') return profile.disciplines?.length ? `${profile.disciplines.length} hình thức kỷ luật` : 'Không có kỷ luật';
    if (key === 'familyRelations') return `${profile.familyRelations?.length || 0} thông tin quan hệ gia đình`;
    if (key === 'socialRelations') return `${profile.socialRelations?.length || 0} thông tin quan hệ xã hội`;
    if (key === 'selfAssessment') return profile.selfAssessment || 'Hoàn thành tốt mọi nhiệm vụ được giao';
    return '';
  };

  const getTableProposedValue = (key: string): string => {
    if (key === 'personalHistoryBefore') {
      return personalHistoryBeforeRows.map((r, i) => `[${i + 1}] ${r.period}: ${r.details}`).join(' \n');
    }
    if (key === 'employmentHistory') {
      return employmentRows.map((r, i) => `[${i + 1}] ${r.period}: ${r.details}`).join(' \n');
    }
    if (key === 'politicalOrganizations') {
      return politicalOrgRows.map((r, i) => `[${i + 1}] ${r.period}: ${r.details}`).join(' \n');
    }
    if (key === 'trainingHistory') {
      return trainingRows.map((r, i) => `[${i + 1}] ${r.institution} | ${r.specialization} | ${r.period} | ${r.mode} | ${r.qualification}`).join(' \n');
    }
    if (key === 'rewardsHistory') {
      return rewardRows.map((r, i) => `[${i + 1}] ${r.date}: ${r.content} (${r.decision})`).join(' \n');
    }
    if (key === 'disciplinesHistory') {
      return disciplineRows.map((r, i) => `[${i + 1}] ${r.date}: ${r.content} (${r.decision})`).join(' \n');
    }
    if (key === 'familyRelations') {
      return familyRows.map((r, i) => `[${i + 1}] ${r.relation}: ${r.fullNameYearDetails}`).join(' \n');
    }
    if (key === 'socialRelations') {
      return socialRows.map((r, i) => `[${i + 1}] ${r.relation}: ${r.details}`).join(' \n');
    }
    return '';
  };

  const handleSubmit = async () => {
    if (selectedFieldKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 trường thông tin cần thay đổi / bổ sung.');
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      const changeFields: PersonnelChangeFieldItem[] = selectedFieldKeys.map((key) => {
        const itemConfig = availableFields.find((f) => f.key === key);
        let proposedVal = values[`new_val_${key}`] || '';

        if (itemConfig?.isTable) {
          proposedVal = getTableProposedValue(key);
        }

        return {
          fieldKey: key,
          fieldLabel: itemConfig?.label || key,
          currentValue: getFieldValue(key),
          newValue: proposedVal,
        };
      });

      const payload = {
        personnelId: profile.id || 'pers-101',
        employeeCode: profile.employeeCode,
        fullName: profile.fullName,
        department: profile.department,
        profileType: '2A',
        fields: changeFields,
        reason: values.reason,
        attachmentName: fileList[0]?.name || 'Minh_Chung_Thay_Doi.pdf',
        requestedBy: profile.fullName,
      };

      const res = await changeRequestsApi.create(payload);
      message.success(res.message);
      form.resetFields();
      setSelectedFieldKeys(['employmentHistory']);
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

  const groups = Array.from(new Set(availableFields.map((f) => f.group)));

  return (
    <Modal
      footer={[
        <Button key="cancel" onClick={onClose} style={{ height: 40, fontSize: 14 }}>
          Hủy bỏ
        </Button>,
        <Button key="submit" loading={loading} onClick={handleSubmit} style={{ height: 40, fontSize: 14 }} type="primary" danger>
          Gửi yêu cầu thay đổi
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={<span style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Yêu cầu thay đổi / bổ sung thông tin Lý lịch (Mẫu 2A)</span>}
      width={1020}
    >
      <div style={{ padding: '8px 0', fontSize: 14 }}>
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 10 }}>
              Tích chọn các trường thông tin cần thay đổi / bổ sung:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#fafafa', padding: 16, borderRadius: 10, border: '1px solid #eaecf0' }}>
              {groups.map((groupName) => {
                const fieldsInGroup = availableFields.filter((f) => f.group === groupName);

                // Nhóm có nhiều ô tích (Nhóm I có 12 ô, Nhóm II có 2 ô II.A & II.B)
                if (fieldsInGroup.length > 1) {
                  return (
                    <div key={groupName} style={{ marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#d92d20', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 8, paddingBottom: 3, borderBottom: '1px solid #fee4e2' }}>
                        {groupName}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 14px' }}>
                        {fieldsInGroup.map((field) => (
                          <Checkbox
                            checked={selectedFieldKeys.includes(field.key)}
                            key={field.key}
                            onChange={(e) => handleFieldToggle(field.key, e.target.checked)}
                          >
                            <span style={{ fontSize: 14, color: '#1d2939' }}>
                              {field.label}
                            </span>
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Nhóm chỉ có 1 ô tích: GOM LẠI THÀNH 1 DÒNG DUY NHẤT (Không có tiêu đề đỏ phía trên)
                const singleField = fieldsInGroup[0];
                return (
                  <div key={groupName} style={{ padding: '2px 0' }}>
                    <Checkbox
                      checked={selectedFieldKeys.includes(singleField.key)}
                      key={singleField.key}
                      onChange={(e) => handleFieldToggle(singleField.key, e.target.checked)}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2939' }}>
                        {singleField.label}
                      </span>
                    </Checkbox>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Tables for selected fields */}
          {selectedFieldKeys.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 12 }}>
                Nhập nội dung đề xuất thay đổi cho các mục đã chọn ({selectedFieldKeys.length} mục):
              </label>

              {selectedFieldKeys.map((key) => {
                const fieldConfig = availableFields.find((f) => f.key === key);
                const curVal = getFieldValue(key);

                return (
                  <div key={key} style={{ background: '#ffffff', border: '1px solid #d0d5dd', borderRadius: 10, padding: '16px 18px', marginBottom: 16, boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 6 }}>
                      {fieldConfig?.label}
                    </div>

                    <div style={{ fontSize: 14, color: '#475467', marginBottom: 12, background: '#f9fafb', padding: '8px 12px', borderRadius: 6, border: '1px solid #eaecf0' }}>
                      Giá trị hiện tại: <strong style={{ color: '#101828', fontWeight: 600 }}>{curVal || '(Chưa có thông tin)'}</strong>
                    </div>

                    {/* II.A Quá trình học tập, lao động trước khi được tuyển dụng */}
                    {key === 'personalHistoryBefore' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '220px' }}>Từ tháng, năm – đến tháng, năm</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Quá trình học tập, lao động và hoạt động nổi bật</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '60px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {personalHistoryBeforeRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 6 }}>
                                  <Input
                                    onChange={(e) => {
                                      const next = [...personalHistoryBeforeRows];
                                      next[idx].period = e.target.value;
                                      setPersonalHistoryBeforeRows(next);
                                    }}
                                    placeholder="2012 - 2016"
                                    style={{ fontSize: 14 }}
                                    value={row.period}
                                  />
                                </td>
                                <td style={{ padding: 6 }}>
                                  <Input
                                    onChange={(e) => {
                                      const next = [...personalHistoryBeforeRows];
                                      next[idx].details = e.target.value;
                                      setPersonalHistoryBeforeRows(next);
                                    }}
                                    placeholder="Quá trình học tập / hoạt động..."
                                    style={{ fontSize: 14 }}
                                    value={row.details}
                                  />
                                </td>
                                <td style={{ padding: 6, textAlign: 'center' }}>
                                  <Button onClick={() => setPersonalHistoryBeforeRows(personalHistoryBeforeRows.filter((_, i) => i !== idx))} size="small" type="text" danger>
                                    ✕
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setPersonalHistoryBeforeRows([...personalHistoryBeforeRows, { period: '', details: '' }])} size="small">
                          + Thêm dòng quá trình trước tuyển dụng
                        </Button>
                      </div>
                    )}

                    {/* II.B Quá trình công tác từ khi được tuyển dụng */}
                    {key === 'employmentHistory' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '220px' }}>Từ tháng, năm – đến tháng, năm</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Chức danh, chức vụ, đơn vị công tác và nhiệm vụ</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '60px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employmentRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 6 }}>
                                  <Input
                                    onChange={(e) => {
                                      const next = [...employmentRows];
                                      next[idx].period = e.target.value;
                                      setEmploymentRows(next);
                                    }}
                                    placeholder="01/2022 - Nay"
                                    style={{ fontSize: 14 }}
                                    value={row.period}
                                  />
                                </td>
                                <td style={{ padding: 6 }}>
                                  <Input
                                    onChange={(e) => {
                                      const next = [...employmentRows];
                                      next[idx].details = e.target.value;
                                      setEmploymentRows(next);
                                    }}
                                    placeholder="Biên tập viên - Ban Thư ký toà soạn..."
                                    style={{ fontSize: 14 }}
                                    value={row.details}
                                  />
                                </td>
                                <td style={{ padding: 6, textAlign: 'center' }}>
                                  <Button onClick={() => setEmploymentRows(employmentRows.filter((_, i) => i !== idx))} size="small" type="text" danger>
                                    ✕
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setEmploymentRows([...employmentRows, { period: '', details: '' }])} size="small">
                          + Thêm dòng quá trình công tác
                        </Button>
                      </div>
                    )}

                    {/* V. Tham gia các tổ chức chính trị, xã hội, hội nghề nghiệp */}
                    {key === 'politicalOrganizations' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '220px' }}>Từ thời gian đến thời gian</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Tên tổ chức, nhiệm vụ và chức danh</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '60px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {politicalOrgRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 6 }}>
                                  <Input
                                    onChange={(e) => {
                                      const next = [...politicalOrgRows];
                                      next[idx].period = e.target.value;
                                      setPoliticalOrgRows(next);
                                    }}
                                    placeholder="2019 - Nay"
                                    style={{ fontSize: 14 }}
                                    value={row.period}
                                  />
                                </td>
                                <td style={{ padding: 6 }}>
                                  <Input
                                    onChange={(e) => {
                                      const next = [...politicalOrgRows];
                                      next[idx].details = e.target.value;
                                      setPoliticalOrgRows(next);
                                    }}
                                    placeholder="Tên tổ chức / hội nghề nghiệp..."
                                    style={{ fontSize: 14 }}
                                    value={row.details}
                                  />
                                </td>
                                <td style={{ padding: 6, textAlign: 'center' }}>
                                  <Button onClick={() => setPoliticalOrgRows(politicalOrgRows.filter((_, i) => i !== idx))} size="small" type="text" danger>
                                    ✕
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setPoliticalOrgRows([...politicalOrgRows, { period: '', details: '' }])} size="small">
                          + Thêm dòng tổ chức
                        </Button>
                      </div>
                    )}

                    {/* VI. Đào tạo, bồi dưỡng */}
                    {key === 'trainingHistory' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Tên trường, địa chỉ</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Chuyên ngành</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '130px' }}>Thời gian học</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '130px' }}>Chế độ học</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '140px' }}>Văn bằng, chứng chỉ</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '50px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trainingRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...trainingRows]; n[idx].institution = e.target.value; setTrainingRows(n); }} placeholder="Học viện Báo chí" style={{ fontSize: 13 }} value={row.institution} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...trainingRows]; n[idx].specialization = e.target.value; setTrainingRows(n); }} placeholder="Báo chí nâng cao" style={{ fontSize: 13 }} value={row.specialization} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...trainingRows]; n[idx].period = e.target.value; setTrainingRows(n); }} placeholder="2022 - 2023" style={{ fontSize: 13 }} value={row.period} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...trainingRows]; n[idx].mode = e.target.value; setTrainingRows(n); }} placeholder="Bồi dưỡng" style={{ fontSize: 13 }} value={row.mode} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...trainingRows]; n[idx].qualification = e.target.value; setTrainingRows(n); }} placeholder="Chứng chỉ" style={{ fontSize: 13 }} value={row.qualification} />
                                </td>
                                <td style={{ padding: 4, textAlign: 'center' }}>
                                  <Button onClick={() => setTrainingRows(trainingRows.filter((_, i) => i !== idx))} size="small" type="text" danger>✕</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setTrainingRows([...trainingRows, { institution: '', specialization: '', period: '', mode: '', qualification: '' }])} size="small">
                          + Thêm dòng đào tạo
                        </Button>
                      </div>
                    )}

                    {/* VII. Khen thưởng */}
                    {key === 'rewardsHistory' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '130px' }}>Tháng năm</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Nội dung và hình thức khen thưởng</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '220px' }}>Số quyết định khen thưởng</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '50px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rewardRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...rewardRows]; n[idx].date = e.target.value; setRewardRows(n); }} placeholder="12/2024" style={{ fontSize: 13 }} value={row.date} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...rewardRows]; n[idx].content = e.target.value; setRewardRows(n); }} placeholder="Chiến sĩ thi đua cơ sở" style={{ fontSize: 13 }} value={row.content} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...rewardRows]; n[idx].decision = e.target.value; setRewardRows(n); }} placeholder="QĐ 125/QĐ-TS" style={{ fontSize: 13 }} value={row.decision} />
                                </td>
                                <td style={{ padding: 4, textAlign: 'center' }}>
                                  <Button onClick={() => setRewardRows(rewardRows.filter((_, i) => i !== idx))} size="small" type="text" danger>✕</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setRewardRows([...rewardRows, { date: '', content: '', decision: '' }])} size="small">
                          + Thêm dòng khen thưởng
                        </Button>
                      </div>
                    )}

                    {/* VIII. Kỷ luật */}
                    {key === 'disciplinesHistory' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '130px' }}>Tháng năm</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Nội dung và hình thức kỷ luật</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '220px' }}>Cấp quyết định</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '50px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {disciplineRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...disciplineRows]; n[idx].date = e.target.value; setDisciplineRows(n); }} placeholder="Tháng năm" style={{ fontSize: 13 }} value={row.date} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...disciplineRows]; n[idx].content = e.target.value; setDisciplineRows(n); }} placeholder="Nội dung kỷ luật" style={{ fontSize: 13 }} value={row.content} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...disciplineRows]; n[idx].decision = e.target.value; setDisciplineRows(n); }} placeholder="Cấp quyết định" style={{ fontSize: 13 }} value={row.decision} />
                                </td>
                                <td style={{ padding: 4, textAlign: 'center' }}>
                                  <Button onClick={() => setDisciplineRows(disciplineRows.filter((_, i) => i !== idx))} size="small" type="text" danger>✕</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setDisciplineRows([...disciplineRows, { date: '', content: '', decision: '' }])} size="small">
                          + Thêm dòng kỷ luật
                        </Button>
                      </div>
                    )}

                    {/* IX. Hoàn cảnh kinh tế, quan hệ gia đình và thân tộc */}
                    {key === 'familyRelations' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '160px' }}>Quan hệ</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Họ tên, năm sinh, nghề nghiệp, nơi cư trú và hoàn cảnh kinh tế</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '50px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {familyRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...familyRows]; n[idx].relation = e.target.value; setFamilyRows(n); }} placeholder="Cha / Mẹ / Vợ" style={{ fontSize: 13 }} value={row.relation} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...familyRows]; n[idx].fullNameYearDetails = e.target.value; setFamilyRows(n); }} placeholder="Họ tên, năm sinh, nghề nghiệp..." style={{ fontSize: 13 }} value={row.fullNameYearDetails} />
                                </td>
                                <td style={{ padding: 4, textAlign: 'center' }}>
                                  <Button onClick={() => setFamilyRows(familyRows.filter((_, i) => i !== idx))} size="small" type="text" danger>✕</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setFamilyRows([...familyRows, { relation: '', fullNameYearDetails: '' }])} size="small">
                          + Thêm dòng người thân
                        </Button>
                      </div>
                    )}

                    {/* X. Quan hệ xã hội */}
                    {key === 'socialRelations' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaecf0' }}>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left', width: '160px' }}>Quan hệ</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, textAlign: 'left' }}>Thông tin cá nhân, quá trình công tác và nơi cư trú</th>
                              <th style={{ padding: '8px 10px', fontSize: 13, width: '50px', textAlign: 'center' }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {socialRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...socialRows]; n[idx].relation = e.target.value; setSocialRows(n); }} placeholder="Mối quan hệ" style={{ fontSize: 13 }} value={row.relation} />
                                </td>
                                <td style={{ padding: 4 }}>
                                  <Input onChange={(e) => { const n = [...socialRows]; n[idx].details = e.target.value; setSocialRows(n); }} placeholder="Thông tin chi tiết..." style={{ fontSize: 13 }} value={row.details} />
                                </td>
                                <td style={{ padding: 4, textAlign: 'center' }}>
                                  <Button onClick={() => setSocialRows(socialRows.filter((_, i) => i !== idx))} size="small" type="text" danger>✕</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button onClick={() => setSocialRows([...socialRows, { relation: '', details: '' }])} size="small">
                          + Thêm dòng quan hệ xã hội
                        </Button>
                      </div>
                    )}

                    {/* INPUTS THÔNG THƯỜNG CHO CÁC MỤC KHÔNG PHẢI BẢNG */}
                    {!fieldConfig?.isTable && (
                      <Form.Item
                        label={<span style={{ fontSize: 14, fontWeight: 600, color: '#344054' }}>Giá trị đề xuất thay đổi / bổ sung:</span>}
                        name={`new_val_${key}`}
                        rules={[{ required: true, message: `Vui lòng nhập nội dung thay đổi mới cho ${fieldConfig?.label}` }]}
                        style={{ marginBottom: 0 }}
                      >
                        {key === 'personalHistoryNotes' || key === 'selfAssessment' ? (
                          <Input.TextArea
                            placeholder={`Nhập thông tin đề xuất bổ sung/thay đổi chi tiết cho ${fieldConfig?.label}...`}
                            rows={3}
                            style={{ fontSize: 14 }}
                          />
                        ) : (
                          <Input
                            placeholder={`Nhập nội dung thay đổi mới cho ${fieldConfig?.label}...`}
                            style={{ height: 40, fontSize: 14 }}
                          />
                        )}
                      </Form.Item>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Form.Item
            label={<span style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Ghi chú / Lý do thay đổi</span>}
            name="reason"
          >
            <Input.TextArea placeholder="Nhập lý do hoặc thông tin giải trình thêm (nếu có)..." rows={3} style={{ fontSize: 14 }} />
          </Form.Item>

          <Form.Item label={<span style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Đính kèm file văn bằng / minh chứng (PDF, DOCX, JPG)</span>}>
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              maxCount={1}
              onChange={({ fileList: fl }) => setFileList(fl)}
            >
              <Button icon={<span style={{ fontSize: 16 }}>📎</span>} style={{ height: 40, fontSize: 14 }}>
                Chọn file minh chứng
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
