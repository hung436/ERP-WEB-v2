import { Button, Card, Checkbox, Input, Modal, Popconfirm, Table, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { useAsyncData } from '@/hooks/useAsyncData';
import { customDocumentTemplateApi } from '@/services/api';
import type { CustomDocumentTemplateItem } from '@/types/domain';
import './document-templates.css';

export function DocumentTemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CustomDocumentTemplateItem | null>(null);

  const query = () => {
    const p = new URLSearchParams();
    if (search.trim()) p.set('search', search.trim());
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const state = useAsyncData(
    async () => (await customDocumentTemplateApi.list(query())).data,
    query()
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await customDocumentTemplateApi.delete(id);
      message.success(res.message);
      state.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const columns: ColumnsType<CustomDocumentTemplateItem> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span style={{ color: '#667085', fontWeight: 500 }}>{index + 1}</span>,
    },
    {
      title: 'Tên tài liệu',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Nhóm tài liệu',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (cat: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{cat}</Tag>,
    },
    {
      title: 'Số bước quy trình',
      key: 'stepCount',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: '#d92d20' }}>
          {(record.steps ?? []).length} bước phê duyệt
        </span>
      ),
    },
    {
      title: 'Tên file mẫu HTML',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 220,
      render: (fn: string) => <code style={{ color: '#1570ef', fontSize: 12.5 }}>{fn}</code>,
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (dateStr: string) => <span style={{ color: '#667085' }}>{dateStr}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setPreviewTemplate(record)}
            size="small"
            type="link"
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/documents/templates/edit/${record.id}`)}
            size="small"
            type="link"
          >
            Sửa
          </Button>
          <Popconfirm onConfirm={() => handleDelete(record.id)} title="Xóa tài liệu mẫu này?">
            <Button danger icon={<DeleteOutlined />} size="small" type="link">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="module-page document-templates-page">
      <header className="document-templates-header">
        <h1>Tài liệu mẫu</h1>
      </header>

      <div className="document-templates-toolbar">
        <Input.Search
          allowClear
          onSearch={(val) => setSearch(val)}
          placeholder="Tìm theo tên tài liệu, nhóm tài liệu..."
          style={{ maxWidth: 360 }}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate('/documents/templates/create')}
          style={{ background: '#d92d20', borderColor: '#d92d20', color: '#fff', fontWeight: 600 }}
          type="primary"
        >
          Tạo tài liệu mẫu
        </Button>
      </div>

      <Card className="document-templates-card">
        {state.loading ? (
          <ContentSkeleton rows={6} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : (state.data ?? []).length === 0 ? (
          <EmptyState description="Chưa có tài liệu mẫu nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={state.data ?? []}
            rowKey="id"
            size="small"
          />
        )}
      </Card>

      {/* Detail Modal — Identical Layout to Create Document Template Page */}
      <Modal
        centered
        footer={
          <Button onClick={() => setPreviewTemplate(null)} type="primary">
            Đóng
          </Button>
        }
        onCancel={() => setPreviewTemplate(null)}
        open={Boolean(previewTemplate)}
        title={
          <span className="preview-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700 }}>
            <span className="section-icon documents">
              <ModuleIcon module="documents" size={20} />
            </span>
            {previewTemplate?.name}
          </span>
        }
        width={1100}
      >
        {previewTemplate && (
          <div className="modern-template-grid-container" style={{ minHeight: 480 }}>
            {/* Cột Bên Trái: Xem trước Mẫu Đơn Paper Frame */}
            <div className="modern-template-left-column" style={{ maxHeight: 560, overflowY: 'auto' }}>
              <div className="modern-paper-frame">
                <div className="modern-paper-logo">
                  <img alt="Tuổi Trẻ" src={tuoiTreLogo} />
                </div>

                <h2 className="modern-paper-title">
                  {previewTemplate.name ? previewTemplate.name.toUpperCase() : 'MẪU TÀI LIỆU'}
                </h2>

                {previewTemplate.fileContent ? (
                  <div dangerouslySetInnerHTML={{ __html: previewTemplate.fileContent }} className="custom-html-preview-body" />
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
            </div>

            {/* Cột Bên Phải: Quy trình phê duyệt (Cấu trúc thẻ viền xanh giống trang Tạo) */}
            <div className="modern-template-right-column" style={{ width: 380, flex: '0 0 380px' }}>
              <Card
                className="modern-card-container workflow-card-right"
                title={
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', textAlign: 'center' }}>
                    Quy trình
                  </div>
                }
              >
                <div className="simplified-workflow-list">
                  {previewTemplate.steps.map((step, index) => {
                    const isFirst = index === 0;
                    const assigneesList = step.assignees && step.assignees.length > 0
                      ? step.assignees
                      : [{ id: `${index + 1}-1`, positionName: step.positionName, departmentName: step.departmentName }];

                    return (
                      <div className="simplified-step-card" key={index}>
                        <div className="simplified-step-header">
                          <div className="simplified-step-title">
                            <UserOutlined className="step-user-icon" />
                            <span>Bước {index + 1}</span>
                          </div>
                        </div>

                        <div className="simplified-pills-list">
                          {assigneesList.map((item) => (
                            <div className="simplified-gray-pill" key={item.id}>
                              <span>{item.positionName} - {item.departmentName}</span>
                            </div>
                          ))}
                        </div>

                        {!isFirst && step.continueOnReject && (
                          <div className="simplified-checkbox-row">
                            <Checkbox checked disabled>
                              <span style={{ fontSize: 12.5, color: '#374151' }}>Tiếp tục quy trình khi từ chối</span>
                            </Checkbox>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
