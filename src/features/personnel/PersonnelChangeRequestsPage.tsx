import { Avatar, Button, Checkbox, Input, Modal, Select, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import dayjs from 'dayjs';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { changeRequestsApi } from '@/services/api';
import type { PersonnelChangeRequest } from '@/types/personnel';
import './personnel-change-requests.css';

const { Option } = Select;

const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

export function PersonnelChangeRequestsPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Table multi-select
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Single detail modal state
  const [reviewModalItem, setReviewModalItem] = useState<PersonnelChangeRequest | null>(null);

  // Batch detail modal state
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // Return reason modal state (for single or batch return)
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnTargetId, setReturnTargetId] = useState<string | null>(null); // null means batch return
  const [returnReasonText, setReturnReasonText] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (selectedType) params.set('profileType', selectedType);
    if (selectedStatus) params.set('status', selectedStatus);
    const q = params.toString();
    return q ? `?${q}` : '';
  };

  const state = useAsyncData(
    async () => (await changeRequestsApi.list(buildQuery())).data,
    buildQuery()
  );

  const listData = state.data ?? [];
  const selectedItems = listData.filter((i) => selectedRowKeys.includes(i.id));

  const handleDownloadSnapshot = (fileName: string, personName: string) => {
    message.success(`Đang tải xuống file Lý lịch phiên bản lúc đó: ${fileName} (${personName})`);
  };

  // Direct approve single item (NO reason required)
  const handleApproveSingle = async (item: PersonnelChangeRequest) => {
    setSubmittingAction(true);
    try {
      const res = await changeRequestsApi.approve(item.id, 'Đã chấp nhận các nội dung thay đổi.');
      message.success(res.message || 'Đã chấp nhận yêu cầu thay đổi.');
      setReviewModalItem(null);
      state.reload();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Không thể chấp nhận yêu cầu.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open return reason modal for single item
  const handleOpenReturnSingle = (item: PersonnelChangeRequest) => {
    setReturnTargetId(item.id);
    setReturnReasonText('');
    setReturnModalOpen(true);
  };

  // Open return reason modal for batch
  const handleOpenReturnBatch = () => {
    if (selectedRowKeys.length === 0) return;
    setReturnTargetId(null);
    setReturnReasonText('');
    setReturnModalOpen(true);
  };

  // Confirm return with reason
  const handleConfirmReturn = async () => {
    if (!returnReasonText.trim()) {
      message.warning('Vui lòng nhập lý do khi thực hiện Trả về.');
      return;
    }
    setSubmittingAction(true);
    try {
      if (returnTargetId) {
        // Single return
        await changeRequestsApi.reject(returnTargetId, returnReasonText.trim());
        message.success('Đã trả về yêu cầu thay đổi thành công.');
      } else {
        // Batch return
        for (const item of selectedItems) {
          if (item.status === 'new' || item.status === 'in_progress') {
            await changeRequestsApi.reject(item.id, returnReasonText.trim());
          }
        }
        message.success(`Đã trả về ${selectedItems.length} yêu cầu được chọn.`);
        setSelectedRowKeys([]);
        setBatchModalOpen(false);
      }
      setReturnModalOpen(false);
      setReviewModalItem(null);
      setReturnReasonText('');
      state.reload();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Không thể thực hiện trả về.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Direct batch approve (NO reason required)
  const handleApproveBatch = async () => {
    if (selectedRowKeys.length === 0) return;
    setSubmittingAction(true);
    try {
      for (const item of selectedItems) {
        if (item.status === 'new' || item.status === 'in_progress') {
          await changeRequestsApi.approve(item.id, 'Đã chấp nhận phê duyệt hàng loạt.');
        }
      }
      message.success(`Đã chấp nhận ${selectedItems.length} yêu cầu được chọn.`);
      setSelectedRowKeys([]);
      setBatchModalOpen(false);
      state.reload();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Không thể chấp nhận hàng loạt.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const renderStatusTag = (st: PersonnelChangeRequest['status']) => {
    if (st === 'new') return <Tag color="blue" style={{ fontWeight: 600, fontSize: 12.5, padding: '2px 8px' }}>Mới</Tag>;
    if (st === 'in_progress') return <Tag color="warning" style={{ fontWeight: 600, fontSize: 12.5, padding: '2px 8px' }}>Đang xử lý</Tag>;
    if (st === 'approved') return <Tag color="success" style={{ fontWeight: 600, fontSize: 12.5, padding: '2px 8px' }}>Đã duyệt</Tag>;
    if (st === 'returned') return <Tag color="error" style={{ fontWeight: 600, fontSize: 12.5, padding: '2px 8px' }}>Đã trả về</Tag>;
    return <Tag color="default">Không xác định</Tag>;
  };

  const columns: ColumnsType<PersonnelChangeRequest> = [
    {
      title: 'Nhân sự gửi yêu cầu',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar shape="circle" size={38} style={{ backgroundColor: '#fee4e2', color: '#d92d20', fontWeight: 700 }}>
            {initials(record.fullName)}
          </Avatar>
          <div>
            <strong style={{ fontSize: 14, color: '#101828', display: 'block' }}>{record.fullName}</strong>
            <small style={{ fontSize: 12.5, color: '#667085' }}>{record.department}</small>
          </div>
        </div>
      ),
    },
    {
      title: 'Mẫu Lý lịch',
      dataIndex: 'profileType',
      key: 'profileType',
      width: 140,
      render: (type: string) => <Tag color="cyan" style={{ fontSize: 12.5, padding: '2px 10px' }}>Lý lịch {type}</Tag>,
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 180,
      render: (dateStr: string) => (
        <span style={{ fontSize: 13, color: '#475467' }}>
          {dayjs(dateStr).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (st: PersonnelChangeRequest['status']) => renderStatusTag(st),
    },
  ];

  return (
    <div className="module-page change-requests-page">
      {/* Page Header */}
      <header className="change-requests-header" style={{ marginBottom: 16 }}>
        <h1>Danh sách yêu cầu thay đổi / bổ sung lý lịch</h1>
      </header>

      {/* Filter Toolbar */}
      <div className="change-requests-toolbar">
        <Input.Search
          allowClear
          onSearch={(val) => setSearchText(val)}
          placeholder="Tìm theo Họ tên nhân sự, Đơn vị, Người gửi..."
          style={{ maxWidth: 360 }}
        />
        <Select
          allowClear
          onChange={(val) => setSelectedType(val || '')}
          placeholder="Tất cả Mẫu Lý lịch"
          style={{ width: 180 }}
          value={selectedType || undefined}
        >
          <Option value="2A">Lý lịch 2A</Option>
          <Option value="2B">Lý lịch 2B</Option>
          <Option value="2C">Lý lịch 2C</Option>
        </Select>
        <Select
          allowClear
          onChange={(val) => setSelectedStatus(val || '')}
          placeholder="Tất cả Trạng thái"
          style={{ width: 170 }}
          value={selectedStatus || undefined}
        >
          <Option value="new">Mới</Option>
          <Option value="in_progress">Đang xử lý</Option>
          <Option value="approved">Đã duyệt</Option>
          <Option value="returned">Đã trả về</Option>
        </Select>
      </div>

      {/* Multi-select Batch Action Bar */}
      {selectedRowKeys.length > 0 && (
        <div style={{ background: '#eff8ff', border: '1px solid #b2ddff', borderRadius: 8, padding: '12px 18px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#175cd3' }}>
            Đã chọn {selectedRowKeys.length} yêu cầu thay đổi
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button onClick={() => setBatchModalOpen(true)} style={{ height: 36, fontSize: 13.5 }}>
              👁 Xem thông tin các YC đã chọn ({selectedRowKeys.length})
            </Button>
            <Button loading={submittingAction} onClick={handleApproveBatch} style={{ background: '#039855', borderColor: '#039855', height: 36, fontSize: 13.5 }} type="primary">
              ✓ Chấp nhận ({selectedRowKeys.length})
            </Button>
            <Button loading={submittingAction} onClick={handleOpenReturnBatch} style={{ height: 36, fontSize: 13.5 }} danger>
              ↩ Trả về ({selectedRowKeys.length})
            </Button>
          </div>
        </div>
      )}

      {/* Main Table with Checkbox Multi-Select (ONLY allow selecting 'new' and 'in_progress' items) */}
      <div className="change-requests-card">
        {state.loading ? (
          <ContentSkeleton rows={8} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : listData.length === 0 ? (
          <EmptyState description="Không có yêu cầu thay đổi lý lịch nào" />
        ) : (
          <Table
            className="change-requests-table"
            columns={columns}
            dataSource={listData}
            onRow={(record) => ({
              onClick: () => {
                setReviewModalItem(record);
              },
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="id"
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              getCheckboxProps: (record) => ({
                disabled: record.status === 'approved' || record.status === 'returned',
              }),
            }}
          />
        )}
      </div>

      {/* Single Detail Modal */}
      <Modal
        footer={
          reviewModalItem?.status === 'new' || reviewModalItem?.status === 'in_progress' ? [
            <Button key="return" loading={submittingAction} onClick={() => handleOpenReturnSingle(reviewModalItem)} danger style={{ height: 40, fontSize: 14 }}>
              Trả về
            </Button>,
            <Button key="approve" loading={submittingAction} onClick={() => handleApproveSingle(reviewModalItem)} type="primary" style={{ background: '#039855', borderColor: '#039855', height: 40, fontSize: 14 }}>
              Chấp nhận
            </Button>,
          ] : [
            <Button key="close" onClick={() => setReviewModalItem(null)} style={{ height: 40, fontSize: 14 }}>
              Đóng
            </Button>,
          ]
        }
        onCancel={() => setReviewModalItem(null)}
        open={Boolean(reviewModalItem)}
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Chi tiết yêu cầu thay đổi thông tin lý lịch</span>}
        width={720}
      >
        {reviewModalItem && (
          <div style={{ padding: '8px 0', fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', padding: 14, borderRadius: 8, border: '1px solid #eaecf0' }}>
              <div>
                <strong style={{ fontSize: 15, color: '#101828', display: 'block' }}>{reviewModalItem.fullName} ({reviewModalItem.department})</strong>
                <small style={{ fontSize: 13, color: '#667085' }}>Mẫu Lý lịch {reviewModalItem.profileType} · Gửi lúc {dayjs(reviewModalItem.requestedAt).format('DD/MM/YYYY HH:mm')}</small>
              </div>
              {renderStatusTag(reviewModalItem.status)}
            </div>

            <div style={{ margin: '16px 0 8px', fontWeight: 700, fontSize: 14.5, color: '#344054' }}>
              Nội dung các trường đề xuất thay đổi / bổ sung:
            </div>
            <div className="change-requests-fields-list">
              {reviewModalItem.fields.map((f, idx) => (
                <div className="change-requests-field-item" key={idx} style={{ fontSize: 13.5, padding: '10px 14px' }}>
                  <span className="change-requests-field-label" style={{ fontSize: 14, fontWeight: 600 }}>{f.fieldLabel}</span>
                  <div className="change-requests-field-values" style={{ fontSize: 13.5 }}>
                    <span className="change-requests-old-val">{f.currentValue || '(Trống)'}</span>
                    <span>➔</span>
                    <span className="change-requests-new-val">{f.newValue}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ margin: '14px 0 4px', fontSize: 14, color: '#475467' }}>
              <strong>Lý do giải trình: </strong> {reviewModalItem.reason || 'Không có ghi chú'}
            </div>

            {reviewModalItem.attachmentName && (
              <div style={{ margin: '8px 0', fontSize: 14 }}>
                <strong>File đính kèm minh chứng: </strong>
                <Tag color="cyan" style={{ fontSize: 13 }}>📎 {reviewModalItem.attachmentName}</Tag>
              </div>
            )}

            <div style={{ margin: '12px 0 16px', background: '#eff8ff', padding: 12, borderRadius: 6, border: '1px solid #b2ddff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13.5, color: '#175cd3' }}>File Lý lịch phiên bản lúc gửi yêu cầu:</span>
              <button
                className="btn-download-pdf-snapshot"
                onClick={() => handleDownloadSnapshot(reviewModalItem.snapshotPdfName, reviewModalItem.fullName)}
                style={{ fontSize: 13 }}
                type="button"
              >
                📄 Tải file PDF
              </button>
            </div>

            {reviewModalItem.reviewComment && (
              <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, border: '1px solid #eaecf0', fontSize: 13.5 }}>
                <strong>Ý kiến xử lý / Lý do trả về: </strong> {reviewModalItem.reviewComment}
                {reviewModalItem.reviewedBy && <span style={{ display: 'block', color: '#667085', marginTop: 4 }}>Thực hiện bởi: {reviewModalItem.reviewedBy} lúc {dayjs(reviewModalItem.reviewedAt).format('DD/MM/YYYY HH:mm')}</span>}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Batch Multi-Select Detail View Modal */}
      <Modal
        footer={[
          <Button key="close" onClick={() => setBatchModalOpen(false)} style={{ height: 40, fontSize: 14 }}>
            Đóng
          </Button>,
          <Button key="return-batch" loading={submittingAction} onClick={handleOpenReturnBatch} danger style={{ height: 40, fontSize: 14 }}>
            Trả về ({selectedRowKeys.length})
          </Button>,
          <Button key="approve-batch" loading={submittingAction} onClick={handleApproveBatch} type="primary" style={{ background: '#039855', borderColor: '#039855', height: 40, fontSize: 14 }}>
            Chấp nhận tất cả ({selectedRowKeys.length})
          </Button>,
        ]}
        onCancel={() => setBatchModalOpen(false)}
        open={batchModalOpen}
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Xem thông tin {selectedRowKeys.length} yêu cầu thay đổi đã chọn</span>}
        width={860}
      >
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto' }}>
          {selectedItems.map((item, index) => (
            <div key={item.id} style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f2f4f7' }}>
                <div>
                  <strong style={{ fontSize: 15, color: '#101828' }}>{index + 1}. {item.fullName}</strong>
                  <span style={{ fontSize: 13, color: '#667085', marginLeft: 8 }}>({item.department}) · Lý lịch {item.profileType}</span>
                </div>
                {renderStatusTag(item.status)}
              </div>

              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#344054', marginBottom: 6 }}>
                Các trường đề xuất thay đổi / bổ sung:
              </div>
              <div className="change-requests-fields-list" style={{ marginBottom: 10 }}>
                {item.fields.map((f, idx) => (
                  <div className="change-requests-field-item" key={idx} style={{ fontSize: 13, padding: '6px 10px' }}>
                    <span className="change-requests-field-label">{f.fieldLabel}</span>
                    <div className="change-requests-field-values">
                      <span className="change-requests-old-val">{f.currentValue || '(Trống)'}</span>
                      <span>➔</span>
                      <span className="change-requests-new-val">{f.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>

              {item.reason && (
                <div style={{ fontSize: 13, color: '#475467', marginBottom: 8 }}>
                  <strong>Lý do: </strong> {item.reason}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
                <span style={{ fontSize: 12.5, color: '#667085' }}>Gửi lúc: {dayjs(item.requestedAt).format('DD/MM/YYYY HH:mm')}</span>
                <Button onClick={() => handleDownloadSnapshot(item.snapshotPdfName, item.fullName)} size="small" type="link">
                  📄 Tải file PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Return Reason Input Prompt Modal */}
      <Modal
        footer={[
          <Button key="cancel-ret" onClick={() => setReturnModalOpen(false)} style={{ height: 38, fontSize: 14 }}>
            Hủy bỏ
          </Button>,
          <Button key="confirm-ret" loading={submittingAction} onClick={handleConfirmReturn} style={{ height: 38, fontSize: 14 }} type="primary" danger>
            Xác nhận Trả về
          </Button>,
        ]}
        onCancel={() => setReturnModalOpen(false)}
        open={returnModalOpen}
        title={<span style={{ fontSize: 16, fontWeight: 700, color: '#d92d20' }}>Nhập lý do trả về yêu cầu</span>}
        width={520}
      >
        <div style={{ padding: '8px 0' }}>
          <Input.TextArea
            onChange={(e) => setReturnReasonText(e.target.value)}
            placeholder="Nhập lý do trả về..."
            rows={4}
            style={{ fontSize: 14 }}
            value={returnReasonText}
          />
        </div>
      </Modal>
    </div>
  );
}
