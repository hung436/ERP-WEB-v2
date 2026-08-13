import { Button, Card, Col, Form, Input, Row, Select, Table, Tag, message } from 'antd';
import {
  DownOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { personnelApi } from '@/services/api';
import type { PersonnelRecordItem } from '@/types/personnel';
import './personnel-extraction.css';

const { Option } = Select;

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
  'Phóng viên',
  'Phóng viên cao cấp',
  'Biên tập viên',
  'Biên tập viên chính',
  'Kế toán viên',
  'Chuyên viên Nhân sự',
  'Bí thư Đoàn Thanh niên',
  'Chủ tịch Công đoàn',
  'Bí thư Đảng ủy',
];

const employmentTypeOptions = [
  'Hợp đồng lao động không xác định thời hạn',
  'Hợp đồng lao động xác định thời hạn',
  'Biên chế công chức/viên chức',
  'Hợp đồng thử việc',
  'Cộng tác viên',
];

const ethnicityOptions = ['Kinh', 'Tày', 'Thái', 'Mường', 'Khơ me', 'H\'Mông', 'Nùng', 'Hoa'];
const religionOptions = ['Không', 'Phật giáo', 'Công giáo', 'Tin lành', 'Hòa Hảo', 'Cao Đài'];

export function PersonnelDataExtractionPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const state = useAsyncData(
    async () => (await personnelApi.extraction(activeFilters)).data,
    JSON.stringify(activeFilters)
  );

  const listData = state.data ?? [];

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      setActiveFilters(values);
    } catch {
      // Validation handled by form
    }
  };

  const handleReset = () => {
    form.resetFields();
    setActiveFilters({});
  };

  const handleExportExcel = () => {
    if (listData.length === 0) {
      message.warning('Không có dữ liệu trích xuất để xuất file Excel.');
      return;
    }

    const headers = [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Bút danh',
      'Ngày sinh',
      'Giới tính',
      'Chức vụ',
      'Đơn vị công tác',
      'Đối tượng lao động',
      'Đã vào Đảng',
      'Đã là Đoàn viên',
      'Số điện thoại',
      'Email',
    ];

    const rows = listData.map((item, index) => [
      index + 1,
      item.employeeCode,
      `"${item.fullName.replace(/"/g, '""')}"`,
      `"${(item.penName || '').replace(/"/g, '""')}"`,
      item.birthDate || '01/01/1990',
      item.gender || 'Nam',
      `"${item.position.replace(/"/g, '""')}"`,
      `"${item.department.replace(/"/g, '""')}"`,
      `"${item.employmentType.replace(/"/g, '""')}"`,
      item.isPartyMember ? 'Đã vào Đảng' : 'Chưa vào Đảng',
      item.isYouthUnionMember ? 'Đã là Đoàn viên' : 'Chưa là Đoàn viên',
      item.phone,
      item.email,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const todayStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Trich_Xuat_Du_Lieu_Nhan_Su_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success(`Đã xuất file Excel dữ liệu trích xuất (${listData.length} nhân sự) thành công!`);
  };

  const columns: ColumnsType<PersonnelRecordItem> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => <span style={{ color: '#667085', fontWeight: 500 }}>{index + 1}</span>,
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 210,
      render: (_, record) => (
        <div>
          <strong style={{ fontSize: 13.5, color: '#101828', display: 'block' }}>{record.fullName}</strong>
          {record.penName && <small style={{ fontSize: 11.5, color: '#667085' }}>Bút danh: « {record.penName} »</small>}
        </div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 110,
      render: (val?: string) => <span style={{ color: '#344054', fontSize: 13 }}>{val || '01/01/1990'}</span>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 90,
      align: 'center',
      render: (val?: string) => (
        <span style={{ fontWeight: 500, fontSize: 13, color: val === 'Nữ' ? '#c01048' : '#026aa2' }}>
          {val || 'Nam'}
        </span>
      ),
    },
    {
      title: 'Chức vụ & Đơn vị công tác',
      key: 'positionAndDept',
      width: 280,
      render: (_, record) => (
        <div>
          <strong style={{ fontSize: 13, color: '#101828', display: 'block' }}>{record.position}</strong>
          <span style={{ fontSize: 12, color: '#475467' }}>{record.department}</span>
        </div>
      ),
    },
    {
      title: 'Đối tượng lao động',
      dataIndex: 'employmentType',
      key: 'employmentType',
      width: 200,
      render: (val: string) => <span style={{ fontSize: 12.5, color: '#344054' }}>{val}</span>,
    },
    {
      title: 'Đoàn / Đảng',
      key: 'unionParty',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {record.isPartyMember && <Tag color="red" style={{ margin: 0, fontSize: 11 }}>Đảng viên</Tag>}
          {record.isYouthUnionMember && <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>Đoàn viên</Tag>}
          {!record.isPartyMember && !record.isYouthUnionMember && <span style={{ color: '#98a2b3', fontSize: 12 }}>--</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="module-page personnel-extraction-page">
      <header className="personnel-extraction-header">
        <h1>Trích xuất dữ liệu</h1>
      </header>

      {/* Filter Panel Card — Compact Design */}
      <Card
        className="extraction-filter-card"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <FilterOutlined style={{ marginRight: 8, color: '#d92d20' }} />
              Điều kiện trích xuất dữ liệu
            </span>
            <Button
              icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              type="link"
            >
              {isExpanded ? 'Thu gọn bộ lọc nâng cao' : 'Mở rộng bộ lọc (15 điều kiện)'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" size="small">
          {/* Row 1 — Core Always Visible Fields */}
          <Row gutter={[12, 0]}>
            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Họ và tên" name="fullName">
                <Input allowClear placeholder="Nhập họ và tên..." />
              </Form.Item>
            </Col>
            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Phòng ban / Đơn vị" name="department">
                <Select allowClear placeholder="Tất cả phòng ban">
                  {departmentOptions.map((d) => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Chức vụ / Chức danh" name="position">
                <Select allowClear placeholder="Tất cả chức vụ">
                  {positionOptions.map((p) => (
                    <Option key={p} value={p}>{p}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Giới tính" name="gender">
                <Select allowClear placeholder="Tất cả giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Expanded Advanced Filter Fields */}
          {isExpanded && (
            <div className="advanced-filters-panel" style={{ marginTop: 4, paddingTop: 10, borderTop: '1px dashed #eaecf0' }}>
              <Row gutter={[12, 0]}>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Bút danh" name="penName">
                    <Input allowClear placeholder="Nhập bút danh..." />
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Đối tượng lao động" name="employmentType">
                    <Select allowClear placeholder="Tất cả đối tượng lao động">
                      {employmentTypeOptions.map((t) => (
                        <Option key={t} value={t}>{t}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Đã vào Đảng" name="isPartyMember">
                    <Select allowClear placeholder="Tất cả">
                      <Option value="yes">Đã vào Đảng</Option>
                      <Option value="no">Chưa vào Đảng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Đã là Đoàn viên" name="isYouthUnionMember">
                    <Select allowClear placeholder="Tất cả">
                      <Option value="yes">Đã là Đoàn viên</Option>
                      <Option value="no">Chưa là Đoàn viên</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Nơi ở hiện nay" name="currentAddress">
                    <Input allowClear placeholder="Tỉnh/Thành, Quận/Huyện..." />
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Hộ khẩu thường trú" name="permanentAddress">
                    <Input allowClear placeholder="Hộ khẩu thường trú..." />
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Quê quán" name="hometown">
                    <Input allowClear placeholder="Nhập quê quán..." />
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Nơi sinh" name="birthPlace">
                    <Input allowClear placeholder="Nhập nơi sinh..." />
                  </Form.Item>
                </Col>

                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Dân tộc" name="ethnicity">
                    <Select allowClear placeholder="Chọn dân tộc">
                      {ethnicityOptions.map((e) => (
                        <Option key={e} value={e}>{e}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Tôn giáo" name="religion">
                    <Select allowClear placeholder="Chọn tôn giáo">
                      {religionOptions.map((r) => (
                        <Option key={r} value={r}>{r}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={6} md={12} sm={24} xs={24}>
                  <Form.Item label="Ngày tuyển dụng" name="recruitmentDate">
                    <Input allowClear placeholder="Ví dụ: 2018, 2021..." />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <Button icon={<ReloadOutlined />} onClick={handleReset} size="small">
              Đặt lại bộ lọc
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={handleSearch}
              size="small"
              style={{ background: '#d92d20', borderColor: '#d92d20', color: '#fff', fontWeight: 600 }}
              type="primary"
            >
              Trích xuất dữ liệu
            </Button>
          </div>
        </Form>
      </Card>

      {/* Result Card — Compact Table */}
      <Card
        className="extraction-results-card"
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            size="small"
            style={{
              background: '#027a48',
              borderColor: '#027a48',
              color: '#ffffff',
              fontWeight: 600,
              height: 32,
              padding: '0 14px',
            }}
            type="primary"
          >
            Xuất Excel
          </Button>
        }
        style={{ marginTop: 12 }}
        title={
          <div>
            <strong style={{ fontSize: 15, color: '#101828' }}>Danh sách nhân viên thỏa mãn điều kiện</strong>
            <span style={{ fontSize: 12.5, color: '#667085', fontWeight: 400, marginLeft: 8 }}>
              ({listData.length} kết quả)
            </span>
          </div>
        }
      >
        {state.loading ? (
          <ContentSkeleton rows={6} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : listData.length === 0 ? (
          <EmptyState description="Không tìm thấy nhân viên nào phù hợp với các điều kiện trích xuất đã chọn" />
        ) : (
          <Table
            columns={columns}
            dataSource={listData}
            onRow={(record) => ({
              onClick: () => navigate(`/personnel/edit/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showSizeChanger: true, size: 'small' }}
            rowKey="id"
            size="small"
          />
        )}
      </Card>
    </div>
  );
}
