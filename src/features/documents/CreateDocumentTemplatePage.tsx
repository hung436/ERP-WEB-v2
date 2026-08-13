import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Tag,
  Upload,
  message,
} from 'antd';
import type { RcFile } from 'antd/es/upload';
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { useAsyncData } from '@/hooks/useAsyncData';
import { customDocumentTemplateApi, personnelManagementApi } from '@/services/api';
import type { TemplateWorkflowStep, WorkflowStepAssignee } from '@/types/domain';
import './document-templates.css';

const { Option } = Select;

const categoryOptions = [
  'Đơn hành chính',
  'Hành chính - Nhân sự',
  'Tài chính - Kế toán',
  'Ban Biên tập & Xuất bản',
  'Ban Thư ký toà soạn',
  'Công nghệ thông tin',
  'Quản trị cơ sở vật chất',
];

const roleOptions = [
  'Người đề xuất',
  'Người phê duyệt chính',
  'Người xem xét',
  'Người thẩm định',
  'Người ký duyệt',
  'Người theo dõi / Nhận thông báo',
];

export function CreateDocumentTemplatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [fileContentPreview, setFileContentPreview] = useState<string>('');

  // Workflow steps state with assignees items array
  const [steps, setSteps] = useState<TemplateWorkflowStep[]>([
    {
      stepIndex: 1,
      positionName: 'Nhân viên',
      departmentName: 'Ban Tổ chức hành chính - bảo vệ',
      roleName: 'Người đề xuất',
      assignees: [
        { id: '1-1', positionName: 'Nhân viên', departmentName: 'Ban Tổ chức hành chính - bảo vệ' },
        { id: '1-2', positionName: 'Nhân viên', departmentName: 'Ban Tổ chức hành chính - bảo vệ' },
        { id: '1-3', positionName: 'Nhân viên', departmentName: 'Ban Tổ chức hành chính - bảo vệ' },
      ],
    },
    {
      stepIndex: 2,
      positionName: 'Phó Trưởng ban',
      departmentName: 'Ban Tổ chức hành chính - quản trị',
      roleName: 'Người xem xét',
      actionType: 'process',
      continueOnReject: true,
      assignees: [
        { id: '2-1', positionName: 'Phó Trưởng ban', departmentName: 'Ban Tổ chức hành chính - quản trị' },
      ],
    },
    {
      stepIndex: 3,
      positionName: 'Phó Trưởng ban',
      departmentName: 'Ban Tổ chức hành chính - Hành chính',
      roleName: 'Người phê duyệt chính',
      actionType: 'process',
      continueOnReject: false,
      assignees: [
        { id: '3-1', positionName: 'Phó Trưởng ban', departmentName: 'Ban Tổ chức hành chính - Hành chính' },
      ],
    },
  ]);

  // Step Modal state
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepForm] = Form.useForm();

  const unitsState = useAsyncData(async () => (await personnelManagementApi.units.list()).data);
  const posState = useAsyncData(async () => (await personnelManagementApi.positions.list()).data);

  const watchedName = Form.useWatch('name', form);

  // Fetch data if edit mode
  useEffect(() => {
    if (id) {
      customDocumentTemplateApi.get(id).then((res) => {
        const item = res.data;
        if (item) {
          form.setFieldsValue({
            category: item.category,
            name: item.name,
            fileName: item.fileName,
          });
          if (item.fileContent) setFileContentPreview(item.fileContent);
          if (item.steps && item.steps.length > 0) {
            setSteps(item.steps);
          }
        }
      }).catch((err) => {
        message.error(err instanceof Error ? err.message : 'Không thể tải dữ liệu tài liệu mẫu.');
      });
    }
  }, [id, form]);

  // Handle open step modal for add step
  const handleOpenAddStepModal = () => {
    setEditingStepIndex(null);
    stepForm.resetFields();
    stepForm.setFieldsValue({
      positionName: (posState.data ?? [])[0]?.name || 'Nhân viên',
      departmentName: (unitsState.data ?? [])[0]?.name || 'Ban Tổ chức hành chính - bảo vệ',
      roleName: 'Người xem xét',
      continueOnReject: false,
    });
    setStepModalOpen(true);
  };

  // Handle open step modal for edit / add assignee
  const handleOpenEditStepModal = (index: number) => {
    setEditingStepIndex(index);
    const step = steps[index];
    stepForm.setFieldsValue({
      positionName: step.positionName,
      departmentName: step.departmentName,
      roleName: step.roleName,
      continueOnReject: !!step.continueOnReject,
    });
    setStepModalOpen(true);
  };

  // Remove a single assignee item from a step
  const handleRemoveAssigneeItem = (stepIdx: number, assigneeId: string) => {
    const updated = steps.map((step, idx) => {
      if (idx !== stepIdx) return step;
      const currentAssignees = step.assignees && step.assignees.length > 0
        ? step.assignees
        : [{ id: `${stepIdx + 1}-1`, positionName: step.positionName, departmentName: step.departmentName }];

      if (currentAssignees.length <= 1) {
        message.warning('Mỗi bước phải có ít nhất 1 chức danh / đơn vị.');
        return step;
      }

      const filtered = currentAssignees.filter((item) => item.id !== assigneeId);
      message.success('Đã xóa 1 đơn vị/chức danh khỏi bước.');
      return {
        ...step,
        assignees: filtered,
        positionName: filtered[0].positionName,
        departmentName: filtered[0].departmentName,
      };
    });
    setSteps(updated);
  };

  // Save step from modal
  const handleSaveStepModal = async () => {
    try {
      const values = await stepForm.validateFields();
      if (editingStepIndex !== null) {
        // Edit existing step & add new assignee item
        const updated = [...steps];
        const currentStep = updated[editingStepIndex];
        const existingAssignees = currentStep.assignees || [
          { id: `${editingStepIndex + 1}-1`, positionName: currentStep.positionName, departmentName: currentStep.departmentName },
        ];

        const newAssigneeItem: WorkflowStepAssignee = {
          id: `${editingStepIndex + 1}-${Date.now()}`,
          positionName: values.positionName,
          departmentName: values.departmentName,
        };

        updated[editingStepIndex] = {
          ...currentStep,
          positionName: values.positionName,
          departmentName: values.departmentName,
          roleName: values.roleName,
          continueOnReject: editingStepIndex === 0 ? undefined : values.continueOnReject,
          assignees: [...existingAssignees, newAssigneeItem],
        };
        setSteps(updated);
        message.success('Đã thêm 1 chức danh/đơn vị vào bước.');
      } else {
        // Add new step
        const nextIdx = steps.length + 1;
        const newStep: TemplateWorkflowStep = {
          stepIndex: nextIdx,
          positionName: values.positionName,
          departmentName: values.departmentName,
          roleName: values.roleName,
          actionType: 'process',
          continueOnReject: !!values.continueOnReject,
          assignees: [
            { id: `${nextIdx}-1`, positionName: values.positionName, departmentName: values.departmentName },
          ],
        };
        setSteps([...steps, newStep]);
      }
      setStepModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      message.warning('Quy trình phải có tối thiểu 1 bước phê duyệt.');
      return;
    }
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepIndex: i + 1 }));
    setSteps(updated);
  };

  const handleSaveTemplate = async () => {
    try {
      const values = await form.validateFields();
      if (steps.length === 0) {
        message.warning('Vui lòng thêm ít nhất 1 bước cho quy trình tài liệu.');
        return;
      }

      const payload = {
        ...(isEdit ? { id } : {}),
        category: values.category,
        name: values.name,
        fileName: values.fileName || `${(values.name || 'tai_lieu_mau').toLowerCase().replace(/\s+/g, '_')}.html`,
        fileContent: fileContentPreview || `<!DOCTYPE html><html><body><h2>${values.name}</h2></body></html>`,
        steps,
      };

      const res = await customDocumentTemplateApi.save(payload);
      message.success(res.message);
      navigate('/documents/templates');
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  return (
    <div className="module-page create-document-template-page modern-erp-layout">
      {/* Top Action Header Bar */}
      <header className="create-template-header">
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/documents/templates')}>
            Quay lại danh sách
          </Button>
          <h1 className="page-main-title">{isEdit ? 'Sửa tài liệu mẫu' : 'Tạo tài liệu mẫu mới'}</h1>
        </div>

        <div className="header-action-buttons">
          <Button onClick={() => navigate('/documents/templates')}>
            Hủy bỏ
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveTemplate}
            className="save-template-primary-btn"
            type="primary"
          >
            {isEdit ? 'Lưu cập nhật' : 'Lưu tài liệu mẫu'}
          </Button>
        </div>
      </header>

      <Form
        form={form}
        initialValues={{
          category: 'Đơn hành chính',
          name: 'ĐƠN XIN NGHỈ PHÉP (HÀNH CHÍNH - BẢO VỆ - NHÂN VIÊN)',
        }}
        layout="vertical"
      >
        {/* Modern 2-Column Grid Layout */}
        <div className="modern-template-grid-container">
          {/* CỘT BÊN TRÁI: Thông tin cơ bản + Live Paper Document Preview (~62% width) */}
          <div className="modern-template-left-column">
            {/* Card 1: Thông tin cơ bản — GỒM NHÓM TÀI LIỆU, TÊN TÀI LIỆU VÀ NÚT UPLOAD FILE HTML */}
            <Card className="modern-card-container">
              <Row gutter={[16, 12]}>
                <Col lg={7} md={8} sm={24} xs={24}>
                  <Form.Item
                    label="Nhóm Tài liệu *"
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn nhóm tài liệu' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select placeholder="Chọn nhóm tài liệu">
                      {categoryOptions.map((cat) => (
                        <Option key={cat} value={cat}>{cat}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col lg={11} md={10} sm={24} xs={24}>
                  <Form.Item
                    label="Tên Tài liệu *"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu mẫu' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Ví dụ: Đơn xin nghỉ phép (Hành chính - Bảo vệ - Nhân viên)" />
                  </Form.Item>
                </Col>

                <Col lg={6} md={6} sm={24} xs={24}>
                  <Form.Item label="Upload file HTML" style={{ marginBottom: 0 }}>
                    <Upload
                      beforeUpload={(file: RcFile) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const text = e.target?.result as string;
                          setFileContentPreview(text);
                        };
                        reader.readAsText(file);
                        form.setFieldsValue({ fileName: file.name });
                        message.success(`Đã chọn file HTML: ${file.name}`);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} style={{ width: '100%', fontWeight: 500 }}>
                        {form.getFieldValue('fileName') || 'Tải file .html'}
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Card 2: Xem trước Mẫu Đơn Paper View */}
            <Card className="modern-card-container" style={{ marginTop: 16 }}>
              <div className="modern-paper-frame">
                <div className="modern-paper-logo">
                  <img alt="Tuổi Trẻ" src={tuoiTreLogo} />
                </div>

                <h2 className="modern-paper-title">
                  {watchedName ? watchedName.toUpperCase() : 'ĐƠN XIN NGHỈ PHÉP'}
                </h2>

                {fileContentPreview ? (
                  <div dangerouslySetInnerHTML={{ __html: fileContentPreview }} className="custom-html-preview-body" />
                ) : (
                  <div className="modern-paper-form">
                    <div className="paper-form-row">
                      <span className="paper-label">Họ tên:</span>
                      <span className="paper-dotted-line" />
                    </div>

                    <div className="paper-form-row">
                      <span className="paper-label">Bộ phận công tác:</span>
                      <span className="paper-dotted-line" />
                    </div>

                    <div className="paper-form-two-cols">
                      <div className="paper-form-row" style={{ flex: 1 }}>
                        <span className="paper-label">Từ ngày:</span>
                        <span className="paper-dotted-line" />
                      </div>
                      <div className="paper-form-row" style={{ flex: 1 }}>
                        <span className="paper-label">Đến hết ngày:</span>
                        <span className="paper-dotted-line" />
                      </div>
                    </div>

                    <div className="paper-form-row">
                      <span className="paper-label">Lý do:</span>
                      <span className="paper-dotted-line" />
                    </div>

                    <div className="paper-form-row">
                      <span className="paper-label">Địa điểm nghỉ:</span>
                      <span className="paper-dotted-line" />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <Button className="paper-green-action-btn" type="primary">
                    GỬI ĐƠN
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* CỘT BÊN PHẢI: Quy trình phê duyệt (~38% width) */}
          <div className="modern-template-right-column">
            <Card
              className="modern-card-container workflow-card-right"
              title={
                <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', textAlign: 'center' }}>
                  Quy trình
                </div>
              }
            >
              {/* Simplified Step Cards Container */}
              <div className="simplified-workflow-list">
                {steps.map((step, index) => {
                  const isFirst = index === 0;
                  const assigneesList = step.assignees && step.assignees.length > 0
                    ? step.assignees
                    : [{ id: `${index + 1}-1`, positionName: step.positionName, departmentName: step.departmentName }];

                  return (
                    <div className="simplified-step-card" key={index}>
                      {/* Step Card Header: Icon + Title + Action Buttons */}
                      <div className="simplified-step-header">
                        <div className="simplified-step-title">
                          <UserOutlined className="step-user-icon" />
                          <span>Bước {index + 1}</span>
                        </div>

                        <div className="simplified-step-actions">
                          {/* Light red button for deleting step if steps > 1 */}
                          {steps.length > 1 && (
                            <Popconfirm onConfirm={() => handleRemoveStep(index)} title="Xóa bước này?">
                              <Button
                                className="icon-btn-action btn-delete-step"
                                icon={<MinusOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
                                size="small"
                                title="Xóa bước"
                                type="text"
                              />
                            </Popconfirm>
                          )}

                          {/* Light green button for adding position to step */}
                          <Button
                            className="icon-btn-action btn-add-user"
                            icon={<UserAddOutlined style={{ color: '#10b981', fontSize: 13 }} />}
                            onClick={() => handleOpenEditStepModal(index)}
                            size="small"
                            title="Thêm nhân sự / đơn vị"
                            type="text"
                          />
                        </div>
                      </div>

                      {/* Gray Pill Boxes representing assigned positions */}
                      <div className="simplified-pills-list">
                        {assigneesList.map((item) => (
                          <div className="simplified-gray-pill" key={item.id}>
                            <span>{item.positionName} - {item.departmentName}</span>
                            <Popconfirm
                              onConfirm={() => handleRemoveAssigneeItem(index, item.id)}
                              title="Xóa đơn vị/chức danh này khỏi bước?"
                            >
                              <CloseCircleOutlined
                                className="pill-remove-icon"
                                title="Xóa item này"
                              />
                            </Popconfirm>
                          </div>
                        ))}
                      </div>

                      {/* Checkbox for Step 2+ */}
                      {!isFirst && (
                        <div className="simplified-checkbox-row">
                          <Checkbox
                            checked={!!step.continueOnReject}
                            onChange={(e) => {
                              const updated = [...steps];
                              updated[index].continueOnReject = e.target.checked;
                              setSteps(updated);
                            }}
                          >
                            <span style={{ fontSize: 12.5, color: '#374151' }}>Tiếp tục quy trình khi từ chối</span>
                          </Checkbox>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Nút THÊM BƯỚC ĐẶT NẰM Ở DƯỚI CÂY QUY TRÌNH */}
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleOpenAddStepModal}
                  style={{ background: '#039855', borderColor: '#039855', color: '#ffffff', fontWeight: 600, width: '100%', borderRadius: 6, height: 38 }}
                  type="primary"
                >
                  Thêm bước
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Form>

      {/* Modal Thêm / Sửa bước phê duyệt */}
      <Modal
        cancelText="Hủy"
        okText={editingStepIndex !== null ? 'Thêm đơn vị vào bước' : 'Thêm bước mới'}
        onCancel={() => setStepModalOpen(false)}
        onOk={handleSaveStepModal}
        open={stepModalOpen}
        title={
          editingStepIndex !== null
            ? `Thêm chức danh / đơn vị vào Bước ${editingStepIndex + 1}`
            : `Thêm bước phê duyệt mới (Bước ${steps.length + 1})`
        }
        width={540}
      >
        <Form form={stepForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Chức danh / Chức vụ"
            name="positionName"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
          >
            <Select placeholder="Chọn chức vụ">
              {(posState.data ?? []).map((p) => (
                <Option key={p.id} value={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phòng / Ban"
            name="departmentName"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select placeholder="Chọn phòng ban">
              {(unitsState.data ?? []).map((u) => (
                <Option key={u.id} value={u.name}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="roleName"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              {roleOptions.map((r) => (
                <Option key={r} value={r}>{r}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Lựa chọn thêm cho bước 2 trở đi */}
          {(editingStepIndex === null ? steps.length > 0 : editingStepIndex > 0) && (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 6, padding: 12, marginTop: 12 }}>
              <Form.Item name="continueOnReject" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>
                  <strong style={{ color: '#344054', fontSize: 13 }}>Tiếp tục quy trình khi từ chối</strong>
                  <span style={{ display: 'block', fontSize: 12, color: '#667085' }}>
                    (Quy trình sẽ tiếp tục chuyển sang bước tiếp theo ngay cả khi bị từ chối ở bước này)
                  </span>
                </Checkbox>
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
