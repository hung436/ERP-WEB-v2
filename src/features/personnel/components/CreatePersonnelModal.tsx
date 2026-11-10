import { Alert, Button, Form, Input, Modal, Select, Switch, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { personnelApi } from '@/services/api';
import type { CreatePersonnelPayload } from '@/types/personnel';

interface CreatePersonnelModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newRow?: any) => void;
}

interface AssignmentItem {
  id: string;
  department: string;
  position: string;
  specialty?: string;
  isPrimary: boolean;
}

const departmentOptions = [
  'Ban Biên tập',
  'Ban Thư ký toà soạn',
  'Ban Nội dung & Xuất bản',
  'Ban Công nghệ thông tin',
  'Ban Tài chính - Kế toán',
  'Ban Tổ chức - Nhân sự',
  'Ban Kỹ thuật & Công nghệ',
  'Ban Kinh tế - Xã hội',
  'Ban Quảng cáo & Phát hành',
  'Ban Thời sự - Chính trị',
  'Ban Vấn đề - Sự kiện',
  'Ban Văn hóa - Giải trí',
  'Ban Bạn đọc',
  'Đoàn Thanh niên Báo Tuổi Trẻ',
  'Công đoàn Báo Tuổi Trẻ',
  'Đảng ủy Báo Tuổi Trẻ',
];

const positionOptions = [
  'Tổng Biên tập',
  'Phó Tổng Biên tập',
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

export function CreatePersonnelModal({ open, onClose, onSuccess }: CreatePersonnelModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: 'asg-1',
      department: '',
      position: '',
      specialty: undefined,
      isPrimary: true,
    },
  ]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setErrorMsg(null);
      setAssignments([
        {
          id: 'asg-1',
          department: '',
          position: '',
          specialty: undefined,
          isPrimary: true,
        },
      ]);
    }
  }, [open, form]);

  const handleAddAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      {
        id: `asg-${Date.now()}`,
        department: '',
        position: '',
        specialty: undefined,
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((a) => a.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleSetPrimary = (index: number, checked: boolean) => {
    setAssignments((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimary: i === index ? checked : checked ? false : item.isPrimary,
      }))
    );
  };

  const handleAssignmentChange = (
    index: number,
    field: 'department' | 'position' | 'specialty',
    value: string
  ) => {
    setAssignments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    try {
      const values = await form.validateFields();

      if (assignments.length === 0) {
        setErrorMsg('Vui lòng thêm ít nhất một đơn vị / chức danh công tác.');
        return;
      }

      for (let i = 0; i < assignments.length; i++) {
        const asg = assignments[i];
        if (!asg.department || !asg.position) {
          setErrorMsg(`Vui lòng chọn đầy đủ Đơn vị công tác và Chức danh cho Đơn vị / Chức danh #${i + 1}.`);
          return;
        }
      }

      const primaryAsg = assignments.find((a) => a.isPrimary) || assignments[0];

      setLoading(true);

      const payload: CreatePersonnelPayload = {
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() || '',
        email: values.email?.trim() || '',
        employmentType: values.employmentType || 'Biên chế chính thức',
        department: primaryAsg.department,
        position: primaryAsg.position,
        specialty: primaryAsg.specialty,
        isPrimaryAssignment: true,
        participateEvaluation: true,
        isPartyMember: false,
        isYouthUnionMember: false,
        assignments: assignments.map((a) => ({
          department: a.department,
          position: a.position,
          specialty: a.specialty,
          isPrimary: a.isPrimary,
        })),
        action: 'complete',
      };

      const res = await personnelApi.create(payload);
      if (res.success) {
        message.success(res.data?.message || 'Thêm nhân sự mới thành công!');
        form.resetFields();
        onClose();
        const primaryAsg = assignments.find((a) => a.isPrimary) || assignments[0];
        const newRecord = {
          id: res.data?.id || `eval-nv-${Date.now()}`,
          sourceRow: Date.now() % 10000,
          fullName: values.fullName.trim(),
          groupCode: 'NLD',
          department: primaryAsg.department,
          positions: assignments.map((a) => a.position),
          evaluationModel: 'ĐÁNH GIÁ MẪU 1',
          reviewer1: 'Tự đánh giá',
          reviewer2: 'Cấp Quản lý',
          reviewer3: 'Cấp Lãnh đạo',
          councilReviewer: 'Hội đồng thi đua',
          employmentType: values.employmentType || 'Biên chế chính thức',
        };
        if (onSuccess) onSuccess(newRecord);
      } else {
        setErrorMsg(res.message || 'Không thể tạo hồ sơ nhân sự.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Vui lòng kiểm tra và điền đầy đủ các thông tin bắt buộc (*).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose} style={{ height: 38, fontSize: 13.5, fontWeight: 500 }}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          loading={loading}
          onClick={handleSubmit}
          style={{
            height: 38,
            fontSize: 13.5,
            fontWeight: 600,
            background: '#1570ef',
            borderColor: '#1570ef',
            color: '#ffffff',
          }}
          type="primary"
        >
          ＋ Lưu hồ sơ nhân sự
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
              background: '#eff6ff',
              color: '#1570ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <UserAddOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: '#101828' }}>Thêm mới hồ sơ nhân sự</div>
          </div>
        </div>
      }
      width={840}
    >
      <div style={{ padding: '12px 0 4px', fontSize: 13.5 }}>
        {errorMsg && (
          <Alert
            closable
            description={errorMsg}
            message="Chưa hoàn tất thông tin"
            onClose={() => setErrorMsg(null)}
            showIcon
            style={{ marginBottom: 16 }}
            type="error"
          />
        )}

        <Form
          form={form}
          initialValues={{
            employmentType: 'Biên chế chính thức',
          }}
          layout="vertical"
          requiredMark={false}
        >
          {/* Thông tin cơ bản: Họ và tên, SĐT, Email, Đối tượng lao động */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 16 }}>
            <Form.Item
              label={<span style={{ fontWeight: 600, color: '#344054' }}>Họ và tên <span style={{ color: '#d92d20' }}>*</span></span>}
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn An" style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: '#344054' }}>Đối tượng lao động <span style={{ color: '#d92d20' }}>*</span></span>}
              name="employmentType"
              rules={[{ required: true, message: 'Vui lòng chọn đối tượng lao động' }]}
            >
              <Select placeholder="Chọn đối tượng lao động" style={{ height: 36 }}>
                {employmentTypes.map((type) => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: '#344054' }}>Số điện thoại</span>}
              name="phone"
            >
              <Input placeholder="Ví dụ: 0903 123 456" style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: '#344054' }}>Email</span>}
              name="email"
            >
              <Input placeholder="Ví dụ: an.nguyen@tuoitre.com.vn" style={{ height: 36 }} />
            </Form.Item>
          </div>

          {/* Nhóm Đơn vị / Chức danh & Chuyên môn */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#344054',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 10,
              }}
            >
              ĐƠN VỊ / CHỨC DANH & CHUYÊN MÔN <span style={{ color: '#d92d20' }}>*</span>
            </div>

            {assignments.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e4e7ec',
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 12,
                  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                }}
              >
                {/* Header card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ display: 'inline-block', borderBottom: '2px solid #d92d20', paddingBottom: 2 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#101828' }}>
                        Đơn vị / Chức danh #{index + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Switch
                        checked={item.isPrimary}
                        onChange={(checked) => handleSetPrimary(index, checked)}
                        size="small"
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: item.isPrimary ? '#d92d20' : '#475467',
                        }}
                      >
                        Đặt làm chính
                      </span>
                    </div>
                  </div>

                  {assignments.length > 1 && (
                    <button
                      onClick={() => handleRemoveAssignment(index)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fecdd3',
                        color: '#d92d20',
                        borderRadius: 4,
                        padding: '2px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.15s ease',
                      }}
                      type="button"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* 3 Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#344054', marginBottom: 4 }}>
                      Đơn vị công tác <span style={{ color: '#d92d20' }}>*</span>
                    </div>
                    <Select
                      onChange={(val) => handleAssignmentChange(index, 'department', val)}
                      placeholder="Chọn đơn vị công tác"
                      showSearch
                      style={{ width: '100%', height: 36 }}
                      value={item.department || undefined}
                    >
                      {departmentOptions.map((dept) => (
                        <Select.Option key={dept} value={dept}>
                          {dept}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#344054', marginBottom: 4 }}>
                      Chức danh <span style={{ color: '#d92d20' }}>*</span>
                    </div>
                    <Select
                      onChange={(val) => handleAssignmentChange(index, 'position', val)}
                      placeholder="Chọn chức danh"
                      showSearch
                      style={{ width: '100%', height: 36 }}
                      value={item.position || undefined}
                    >
                      {positionOptions.map((pos) => (
                        <Select.Option key={pos} value={pos}>
                          {pos}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#344054', marginBottom: 4 }}>
                      Chuyên môn
                    </div>
                    <Select
                      allowClear
                      onChange={(val) => handleAssignmentChange(index, 'specialty', val)}
                      placeholder="Chọn chuyên môn"
                      style={{ width: '100%', height: 36 }}
                      value={item.specialty || undefined}
                    >
                      {specialtyOptions.map((spec) => (
                        <Select.Option key={spec} value={spec}>
                          {spec}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            {/* + Thêm đơn vị / chức danh công tác */}
            <button
              onClick={handleAddAssignment}
              style={{
                width: '100%',
                height: 40,
                border: '1px dashed #12b76a',
                borderRadius: 6,
                background: '#ffffff',
                color: '#027a48',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                transition: 'all 0.15s ease',
              }}
              type="button"
            >
              + Thêm đơn vị / chức danh công tác
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default CreatePersonnelModal;
