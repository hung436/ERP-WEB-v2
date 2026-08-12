import { Alert, Button, DatePicker, Form, Input, Modal, Radio, Select, Switch, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { personnelApi } from '@/services/api';
import type { CreatePersonnelPayload, PersonnelAssignment } from '@/types/personnel';
import './create-personnel.css';

const { Option } = Select;
const { TextArea } = Input;

const departmentOptions = [
  'Ban Biên tập',
  'Ban Thư ký toà soạn',
  'Ban Công nghệ thông tin',
  'Ban Tài chính - Kế toán',
  'Ban Tổ chức - Nhân sự',
  'Ban Quảng cáo & Phát hành',
  'Ban Thời sự - Chính trị',
  'Ban Vấn đề - Sự kiện',
  'Ban Văn hóa - Giải trí',
  'Ban Bạn đọc',
];

const positionOptions = [
  'Trưởng ban',
  'Phó Trưởng ban',
  'Phóng viên chuyên trách',
  'Phóng viên',
  'Biên tập viên',
  'Chuyên viên công nghệ',
  'Kỹ sư phần mềm',
  'Chuyên viên Nhân sự',
  'Kế toán viên',
  'Chuyên viên Kinh doanh',
  'Nhân viên hành chính',
];

const employmentTypes = [
  'Biên chế chính thức',
  'Hợp đồng lao động xác định thời hạn',
  'Hợp đồng lao động không xác định thời hạn',
  'Thử việc',
  'Cộng tác viên',
  'Chuyên gia cố vấn',
];

const specialtyOptions = [
  'Báo chí & Truyền thông',
  'Công nghệ thông tin & Phần mềm',
  'Tài chính - Kế toán',
  'Quản trị nhân sự',
  'Thiết kế đồ họa & Đa phương tiện',
  'Luật & Pháp lý',
  'Ngôn ngữ & Dịch thuật',
];

export function CreatePersonnelPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ code?: string; message: string } | null>(null);

  const [primaryIndex, setPrimaryIndex] = useState<number>(0);

  useEffect(() => {
    if (isEditMode && id) {
      setFetchingData(true);
      personnelApi.get(id)
        .then((res) => {
          if (res.data) {
            const record = res.data;
            form.setFieldsValue({
              fullName: record.fullName,
              penName: record.penName,
              birthDate: record.birthDate ? dayjs(record.birthDate) : undefined,
              gender: record.gender || 'Nam',
              phone: record.phone,
              extension: record.extension,
              email: record.email,
              secondaryEmail: record.secondaryEmail,
              employmentType: record.employmentType,
              participateEvaluation: record.participateEvaluation,
              isYouthUnionMember: record.isYouthUnionMember,
              isPartyMember: record.isPartyMember,
              leaveEffectiveDate: record.leaveEffectiveDate ? dayjs(record.leaveEffectiveDate) : undefined,
              identityNumber: record.identityNumber,
              identityIssuedDate: record.identityIssuedDate ? dayjs(record.identityIssuedDate) : undefined,
              identityIssuedPlace: record.identityIssuedPlace,
              notes: record.notes,
              assignments: record.assignments && record.assignments.length > 0 ? record.assignments : [{ department: record.department, position: record.position, specialty: record.specialty }],
            });

            if (record.photoUrl) setPhotoUrl(record.photoUrl);

            const pIdx = record.assignments?.findIndex((a) => a.isPrimary);
            if (pIdx !== undefined && pIdx !== -1) setPrimaryIndex(pIdx);
          }
        })
        .catch((err) => {
          message.error(err instanceof Error ? err.message : 'Không thể tải hồ sơ nhân sự.');
        })
        .finally(() => {
          setFetchingData(false);
        });
    }
  }, [id, isEditMode, form]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (actionType: 'submit' | 'complete' | 'update') => {
    setSubmitError(null);
    try {
      const values = await form.validateFields();
      setLoading(true);

      const rawAssignments = (values.assignments as PersonnelAssignment[]) || [];
      const assignments: PersonnelAssignment[] = rawAssignments.map((item, idx) => ({
        department: item?.department || '',
        position: item?.position || '',
        specialty: item?.specialty,
        isPrimary: idx === primaryIndex,
      }));

      const primaryAssignment = assignments[primaryIndex] || assignments[0];

      const payload: CreatePersonnelPayload = {
        photoUrl: photoUrl ?? undefined,
        fullName: values.fullName,
        penName: values.penName,
        birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : undefined,
        gender: values.gender,
        participateEvaluation: Boolean(values.participateEvaluation),
        employmentType: values.employmentType,
        isYouthUnionMember: Boolean(values.isYouthUnionMember),
        isPartyMember: Boolean(values.isPartyMember),
        leaveEffectiveDate: values.leaveEffectiveDate ? dayjs(values.leaveEffectiveDate).format('YYYY-MM-DD') : undefined,
        phone: values.phone,
        extension: values.extension,
        department: primaryAssignment?.department || '',
        position: primaryAssignment?.position || '',
        isPrimaryAssignment: true,
        specialty: primaryAssignment?.specialty,
        assignments,
        identityNumber: values.identityNumber,
        identityIssuedDate: values.identityIssuedDate ? dayjs(values.identityIssuedDate).format('YYYY-MM-DD') : undefined,
        identityIssuedPlace: values.identityIssuedPlace,
        email: values.email,
        secondaryEmail: values.secondaryEmail,
        notes: values.notes,
        action: actionType === 'update' ? 'complete' : actionType,
      };

      if (isEditMode && id) {
        const response = await personnelApi.update(id, payload);
        if (response.success) {
          setSuccessResult({
            message: response.message,
          });
        }
      } else {
        const response = await personnelApi.create(payload);
        if (response.success && response.data) {
          setSuccessResult({
            code: response.data.code,
            message: response.data.message,
          });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Vui lòng kiểm tra và điền đầy đủ các mục bắt buộc (*).');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="module-page create-personnel-page" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#667085' }}>Đang tải dữ liệu hồ sơ nhân sự...</p>
      </div>
    );
  }

  return (
    <div className="module-page create-personnel-page">
      <header className="create-personnel-page-head">
        <h1>{isEditMode ? 'Chỉnh sửa hồ sơ nhân sự' : 'Tạo hồ sơ mới'}</h1>
      </header>

      {submitError && (
        <Alert
          className="create-personnel-alert"
          closable
          description={submitError}
          message="Chưa hoàn tất các thông tin bắt buộc (*)"
          onClose={() => setSubmitError(null)}
          showIcon
          type="error"
        />
      )}

      <Form
        form={form}
        initialValues={{
          gender: 'Nam',
          participateEvaluation: true,
          isYouthUnionMember: false,
          isPartyMember: false,
          employmentType: 'Biên chế chính thức',
          assignments: [
            {
              department: undefined,
              position: undefined,
              specialty: undefined,
            },
          ],
        }}
        layout="vertical"
        requiredMark={false}
      >
        <div className="create-personnel-flat-form">
          {/* Định danh cá nhân & Ảnh 3x4 */}
          <div className="create-personnel-top-identity">
            <div>
              <input
                accept="image/*"
                onChange={handlePhotoUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
              />
              <div
                className="create-personnel-photo-box"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                title="Tải ảnh 3x4"
              >
                {photoUrl ? (
                  <img alt="Ảnh 3x4" className="create-personnel-photo-preview" src={photoUrl} />
                ) : (
                  <div className="create-personnel-photo-placeholder">
                    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
                      <path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span>Tải ảnh 3x4</span>
                  </div>
                )}
              </div>
              {photoUrl && (
                <Button onClick={handleRemovePhoto} size="small" style={{ marginTop: 4, width: '100%', fontSize: 11 }} danger>
                  Xóa ảnh
                </Button>
              )}
            </div>

            <div>
              <div className="create-personnel-row-2">
                <Form.Item
                  label={<span className="create-personnel-label">Họ và tên khai sinh <span className="req">*</span></span>}
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập Họ và tên khai sinh' }]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Form.Item
                  label={<span className="create-personnel-label">Tên thường goi/ Bút danh</span>}
                  name="penName"
                >
                  <Input placeholder="Nhập tên thường gọi hoặc bút danh" />
                </Form.Item>
              </div>

              <div className="create-personnel-row-2">
                <Form.Item
                  label={<span className="create-personnel-label">Ngày tháng năm sinh</span>}
                  name="birthDate"
                >
                  <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày sinh" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  label={<span className="create-personnel-label">Giới tính</span>}
                  name="gender"
                >
                  <Select>
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="create-personnel-divider" />

          {/* Thông tin liên hệ */}
          <div className="create-personnel-section-title">
            Thông tin liên hệ
          </div>
          <div className="create-personnel-row-4">
            <Form.Item
              label={<span className="create-personnel-label">Số điện thoại <span className="req">*</span></span>}
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập Số điện thoại' },
                { pattern: /^[0-9+\s-]{8,15}$/, message: 'Số điện thoại không hợp lệ' },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Số nội bộ</span>}
              name="extension"
            >
              <Input placeholder="Nhập số nội bộ" />
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Email <span className="req">*</span></span>}
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập Email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="Nhập địa chỉ email" />
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Email khác</span>}
              name="secondaryEmail"
              rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input placeholder="Nhập email khác" />
            </Form.Item>
          </div>

          <div className="create-personnel-divider" />

          {/* Đơn vị / Chức danh & Chuyên môn */}
          <div className="create-personnel-section-title">
            <span>Đơn vị / Chức danh & Chuyên môn <span className="req">*</span></span>
          </div>

          <Form.List name="assignments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => {
                  const isPrimary = primaryIndex === index;

                  return (
                    <div className="create-personnel-assignment-box" key={key}>
                      <div className="create-personnel-assignment-box-head">
                        <div className="create-personnel-assignment-box-title">
                          <span>
                            Đơn vị / Chức danh {fields.length > 1 ? `#${index + 1}` : ''}
                          </span>
                          <Radio
                            checked={isPrimary}
                            onChange={() => setPrimaryIndex(index)}
                          >
                            <span style={{ fontSize: 13, fontWeight: isPrimary ? 600 : 400 }}>Đặt làm chính</span>
                          </Radio>
                        </div>

                        <div className="create-personnel-assignment-box-actions">
                          {fields.length > 1 && (
                            <button
                              className="btn-remove-assignment-subdued"
                              onClick={() => {
                                remove(name);
                                if (primaryIndex === index) {
                                  setPrimaryIndex(0);
                                } else if (primaryIndex > index) {
                                  setPrimaryIndex(primaryIndex - 1);
                                }
                              }}
                              type="button"
                              title="Gỡ bỏ mục này"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="create-personnel-assignment-box-body">
                        <div className="create-personnel-row-3">
                          <Form.Item
                            {...restField}
                            label={<span className="create-personnel-label">Đơn vị công tác <span className="req">*</span></span>}
                            name={[name, 'department']}
                            rules={[{ required: true, message: 'Vui lòng chọn Đơn vị công tác' }]}
                          >
                            <Select placeholder="Chọn đơn vị công tác">
                              {departmentOptions.map((dept) => (
                                <Option key={dept} value={dept}>{dept}</Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label={<span className="create-personnel-label">Chức danh <span className="req">*</span></span>}
                            name={[name, 'position']}
                            rules={[{ required: true, message: 'Vui lòng chọn Chức danh' }]}
                          >
                            <Select placeholder="Chọn chức danh">
                              {positionOptions.map((pos) => (
                                <Option key={pos} value={pos}>{pos}</Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label={<span className="create-personnel-label">Chuyên môn</span>}
                            name={[name, 'specialty']}
                          >
                            <Select allowClear placeholder="Chọn chuyên môn">
                              {specialtyOptions.map((spec) => (
                                <Option key={spec} value={spec}>{spec}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  className="btn-add-assignment"
                  onClick={() => {
                    add({ department: undefined, position: undefined, specialty: undefined });
                  }}
                  type="button"
                >
                  + Thêm đơn vị / chức danh công tác
                </button>
              </>
            )}
          </Form.List>

          <div className="create-personnel-divider" />

          {/* Chế độ lao động & Đoàn thể */}
          <div className="create-personnel-section-title">
            Chế độ lao động & Đoàn thể
          </div>
          <div className="create-personnel-row-3">
            <Form.Item
              label={<span className="create-personnel-label">Đối tượng lao động <span className="req">*</span></span>}
              name="employmentType"
              rules={[{ required: true, message: 'Vui lòng chọn Đối tượng lao động' }]}
            >
              <Select placeholder="Chọn đối tượng lao động">
                {employmentTypes.map((type) => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Tham gia ĐGLĐ</span>}
              name="participateEvaluation"
              valuePropName="checked"
            >
              <div className="create-personnel-switch-box">
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </div>
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Ngày nghỉ phép</span>}
              name="leaveEffectiveDate"
            >
              <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày nghỉ phép" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Đoàn thanh niên</span>}
              name="isYouthUnionMember"
              valuePropName="checked"
            >
              <div className="create-personnel-switch-box">
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </div>
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Đảng Cộng sản Việt Nam</span>}
              name="isPartyMember"
              valuePropName="checked"
            >
              <div className="create-personnel-switch-box">
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </div>
            </Form.Item>
          </div>

          <div className="create-personnel-divider" />

          {/* Căn cước công dân */}
          <div className="create-personnel-section-title">
            Căn cước công dân
          </div>
          <div className="create-personnel-row-3">
            <Form.Item
              label={<span className="create-personnel-label">Số CCCD/CMND</span>}
              name="identityNumber"
            >
              <Input placeholder="Nhập số CCCD/CMND" />
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Ngày cấp</span>}
              name="identityIssuedDate"
            >
              <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày cấp" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label={<span className="create-personnel-label">Nơi cấp</span>}
              name="identityIssuedPlace"
            >
              <Input placeholder="Nhập nơi cấp" />
            </Form.Item>
          </div>

          <div className="create-personnel-divider" />

          {/* Ghi chú */}
          <div className="create-personnel-section-title">
            Ghi chú
          </div>
          <Form.Item
            name="notes"
            style={{ marginBottom: 0 }}
          >
            <TextArea placeholder="Nhập ghi chú thêm..." rows={2} />
          </Form.Item>
        </div>

        {/* Footer Actions */}
        <div className="create-personnel-footer-actions">
          <div className="create-personnel-footer-btns">
            {isEditMode ? (
              <button
                className="btn-hoan-tat-ho-so"
                disabled={loading}
                onClick={() => handleSubmit('update')}
                type="button"
              >
                Cập nhật
              </button>
            ) : (
              <>
                <button
                  className="btn-gui-ho-so"
                  disabled={loading}
                  onClick={() => handleSubmit('submit')}
                  type="button"
                >
                  Gửi hồ sơ
                </button>

                <button
                  className="btn-hoan-tat-ho-so"
                  disabled={loading}
                  onClick={() => handleSubmit('complete')}
                  type="button"
                >
                  Hoàn tất hồ sơ
                </button>
              </>
            )}
          </div>
        </div>
      </Form>

      <Modal
        cancelText={isEditMode ? 'Tiếp tục chỉnh sửa' : 'Tạo hồ sơ khác'}
        okText="Về danh sách hồ sơ"
        onCancel={() => {
          setSuccessResult(null);
          if (!isEditMode) {
            form.resetFields();
            setPhotoUrl(null);
          }
        }}
        onOk={() => navigate('/personnel/list')}
        open={Boolean(successResult)}
        title={isEditMode ? 'Cập nhật hồ sơ thành công' : 'Tạo hồ sơ thành công'}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: '14px', color: '#101828' }}>{successResult?.message}</p>
          {successResult?.code && (
            <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: '8px', border: '1px solid #eaecf0', marginTop: '10px' }}>
              <span style={{ fontSize: '13px', color: '#667085' }}>Mã nhân sự: </span>
              <strong style={{ fontSize: '15px', color: '#d92d20' }}>{successResult?.code}</strong>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
