import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tag,
  message,
} from 'antd';
import {
  FileExcelOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import { personnelManagementApi } from '@/services/api';
import { useAsyncData } from '@/hooks/useAsyncData';
import './document-templates.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock statistical items interface
export interface DocumentStatRecord {
  id: string;
  code: string;
  templateKind: 'leave_request' | 'overseas_request' | 'expense_proposal' | 'vehicle_request';
  templateName: string;
  applicantName: string;
  departmentName: string;
  daysCount?: number;
  usedLeaveDays?: number; // Số ngày phép đã nghỉ tích lũy trong năm (trên tổng số 12 ngày)
  startDate?: string;
  endDate?: string;
  reason?: string;
  location?: string;
  destinationCountry?: string;
  expenseAmount?: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

// Sample Vietnamese Mock Dataset for Document Statistics
const mockStatData: DocumentStatRecord[] = [
  {
    id: 'STAT-001',
    code: 'ĐNP-2026-0801',
    templateKind: 'leave_request',
    templateName: 'Đơn xin nghỉ phép',
    applicantName: 'Nguyễn Văn An',
    departmentName: 'Ban Tổ chức hành chính - bảo vệ',
    daysCount: 3,
    usedLeaveDays: 6,
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    reason: 'Giải quyết công việc gia đình ở quê',
    location: 'Bến Tre',
    status: 'approved',
    createdAt: '2026-08-05',
  },
  {
    id: 'STAT-002',
    code: 'ĐNP-2026-0802',
    templateKind: 'leave_request',
    templateName: 'Đơn xin nghỉ phép',
    applicantName: 'Trần Thị Bình',
    departmentName: 'Ban Biên tập',
    daysCount: 2,
    usedLeaveDays: 4,
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    reason: 'Nghỉ bù đợt công tác cuối tuần',
    location: 'TP. Hồ Chí Minh',
    status: 'approved',
    createdAt: '2026-08-08',
  },
  {
    id: 'STAT-003',
    code: 'ĐNP-2026-0803',
    templateKind: 'leave_request',
    templateName: 'Đơn xin nghỉ phép',
    applicantName: 'Lê Hoàng Cường',
    departmentName: 'Ban Thư ký toà soạn',
    daysCount: 5,
    usedLeaveDays: 9,
    startDate: '2026-08-20',
    endDate: '2026-08-24',
    reason: 'Khám sức khỏe định kỳ và nghỉ dưỡng gia đình',
    location: 'Đà Nẵng',
    status: 'pending',
    createdAt: '2026-08-11',
  },
  {
    id: 'STAT-004',
    code: 'NNG-2026-0701',
    templateKind: 'overseas_request',
    templateName: 'Đơn xin đi nước ngoài',
    applicantName: 'Phạm Minh Đức',
    departmentName: 'Công nghệ thông tin',
    daysCount: 7,
    startDate: '2026-09-01',
    endDate: '2026-09-07',
    reason: 'Tham dự hội thảo công nghệ báo chí Châu Á',
    destinationCountry: 'Nhật Bản (Tokyo)',
    expenseAmount: 45000000,
    status: 'approved',
    createdAt: '2026-07-28',
  },
  {
    id: 'STAT-005',
    code: 'NNG-2026-0702',
    templateKind: 'overseas_request',
    templateName: 'Đơn xin đi nước ngoài',
    applicantName: 'Vũ Thị Hoa',
    departmentName: 'Ban Biên tập',
    daysCount: 10,
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    reason: 'Thăm thân nhân và nghiên cứu thực địa truyền thông',
    destinationCountry: 'Hàn Quốc (Seoul)',
    expenseAmount: 0,
    status: 'pending',
    createdAt: '2026-08-01',
  },
  {
    id: 'STAT-006',
    code: 'TTR-2026-0801',
    templateKind: 'expense_proposal',
    templateName: 'Tờ trình kinh phí mua sắm',
    applicantName: 'Đặng Văn Giang',
    departmentName: 'Quản trị cơ sở vật chất',
    reason: 'Mua sắm bổ sung 5 máy vi tính cấu hình cao cho phòng dựng phim',
    expenseAmount: 125000000,
    status: 'approved',
    createdAt: '2026-08-02',
  },
  {
    id: 'STAT-007',
    code: 'TTR-2026-0802',
    templateKind: 'expense_proposal',
    templateName: 'Tờ trình kinh phí mua sắm',
    applicantName: 'Bùi Anh Tuấn',
    departmentName: 'Công nghệ thông tin',
    reason: 'Nâng cấp băng thông máy chủ và bản quyền phần mềm đồ họa',
    expenseAmount: 38000000,
    status: 'rejected',
    createdAt: '2026-08-06',
  },
  {
    id: 'STAT-008',
    code: 'ĐNP-2026-0804',
    templateKind: 'leave_request',
    templateName: 'Đơn xin nghỉ phép',
    applicantName: 'Đỗ Hải Nam',
    departmentName: 'Ban Tổ chức hành chính - quản trị',
    daysCount: 1,
    usedLeaveDays: 2,
    startDate: '2026-08-14',
    endDate: '2026-08-14',
    reason: 'Xử lý thủ tục cá nhân tại cơ quan công an',
    location: 'TP. Hồ Chí Minh',
    status: 'approved',
    createdAt: '2026-08-12',
  },
];

export function DocumentStatisticsPage() {
  const [selectedTemplateKind, setSelectedTemplateKind] = useState<string>('leave_request');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const unitsState = useAsyncData(async () => (await personnelManagementApi.units.list()).data);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return mockStatData.filter((item) => {
      // Template filter
      if (selectedTemplateKind !== 'all' && item.templateKind !== selectedTemplateKind) {
        return false;
      }
      // Department filter
      if (selectedDepartment !== 'all' && item.departmentName !== selectedDepartment) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchApplicant = item.applicantName.toLowerCase().includes(q);
        const matchReason = (item.reason || '').toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        if (!matchApplicant && !matchReason && !matchCode) return false;
      }
      return true;
    });
  }, [selectedTemplateKind, selectedDepartment, searchQuery]);

  // Export Excel CSV Mock
  const handleExportExcel = () => {
    const header = selectedTemplateKind === 'leave_request'
      ? 'Người làm đơn,Bộ phận công tác,Số ngày xin nghỉ,Đã nghỉ/12 ngày,Từ ngày,Đến ngày,Lý do,Địa điểm nghỉ\n'
      : 'Người làm đơn,Bộ phận công tác,Số ngày/Kinh phí,Lý do\n';

    const rows = filteredData.map((item) => {
      return `"${item.applicantName}","${item.departmentName}",${item.daysCount || item.expenseAmount || 0},"${item.usedLeaveDays || 0}/12","${item.startDate || ''}","${item.endDate || ''}","${item.reason || ''}","${item.location || item.destinationCountry || ''}"\n`;
    }).join('');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_Thong_Ke_${selectedTemplateKind}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('Đã xuất báo cáo thống kê thành công (File Excel)!');
  };

  // Dynamic Table Columns setup
  const columns: ColumnsType<DocumentStatRecord> = useMemo(() => {
    const baseColumns: ColumnsType<DocumentStatRecord> = [
      {
        title: selectedTemplateKind === 'expense_proposal' ? 'Người trình' : 'Người làm đơn',
        dataIndex: 'applicantName',
        key: 'applicantName',
        width: 190,
        render: (name: string) => (
          <strong style={{ fontSize: 13.5, color: '#101828' }}>
            <UserOutlined style={{ marginRight: 6, color: '#667085' }} />
            {name}
          </strong>
        ),
      },
      {
        title: selectedTemplateKind === 'expense_proposal' ? 'Đơn vị trình' : 'Bộ phận công tác',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: 220,
        render: (dept: string) => <span style={{ color: '#344054' }}>{dept}</span>,
      },
    ];

    if (selectedTemplateKind === 'leave_request') {
      baseColumns.push(
        {
          title: 'Số ngày nghỉ',
          key: 'daysCount',
          width: 160,
          align: 'center',
          render: (_, record) => {
            const used = record.usedLeaveDays || 0;
            const overQuota = used > 8;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Tag color="cyan" style={{ fontWeight: 700, fontSize: 12.5, margin: 0 }}>
                  {record.daysCount} ngày
                </Tag>
                <span style={{
                  fontSize: 11,
                  color: overQuota ? '#d92d20' : '#667085',
                  fontWeight: 500,
                }}>
                  Đã nghỉ: {used}/12 ngày
                </span>
              </div>
            );
          },
        },
        {
          title: 'Từ ngày',
          dataIndex: 'startDate',
          key: 'startDate',
          width: 110,
          render: (d: string) => <span style={{ color: '#475467' }}>{d}</span>,
        },
        {
          title: 'Đến hết ngày',
          dataIndex: 'endDate',
          key: 'endDate',
          width: 110,
          render: (d: string) => <span style={{ color: '#475467' }}>{d}</span>,
        },
        {
          title: 'Lý do nghỉ',
          dataIndex: 'reason',
          key: 'reason',
          render: (r: string) => <span style={{ color: '#101828' }}>{r}</span>,
        },
        {
          title: 'Địa điểm nghỉ',
          dataIndex: 'location',
          key: 'location',
          width: 160,
          render: (loc: string) => <Tag color="blue">{loc || 'N/A'}</Tag>,
        }
      );
    } else if (selectedTemplateKind === 'overseas_request') {
      baseColumns.push(
        {
          title: 'Quốc gia / Nơi đến',
          dataIndex: 'destinationCountry',
          key: 'destinationCountry',
          width: 180,
          render: (dest: string) => <Tag color="purple" style={{ fontWeight: 600 }}>{dest}</Tag>,
        },
        {
          title: 'Số ngày đi',
          dataIndex: 'daysCount',
          key: 'daysCount',
          width: 110,
          align: 'center',
          render: (days: number) => <Tag color="geekblue">{days} ngày</Tag>,
        },
        {
          title: 'Từ ngày',
          dataIndex: 'startDate',
          key: 'startDate',
          width: 120,
        },
        {
          title: 'Đến ngày',
          dataIndex: 'endDate',
          key: 'endDate',
          width: 120,
        },
        {
          title: 'Mục đích chuyến đi',
          dataIndex: 'reason',
          key: 'reason',
        }
      );
    } else if (selectedTemplateKind === 'expense_proposal') {
      baseColumns.push(
        {
          title: 'Nội dung tờ trình',
          dataIndex: 'reason',
          key: 'reason',
        },
        {
          title: 'Kinh phí đề xuất',
          dataIndex: 'expenseAmount',
          key: 'expenseAmount',
          width: 180,
          align: 'right',
          render: (amt?: number) => (
            <strong style={{ color: '#d92d20', fontSize: 14 }}>
              {amt ? `${amt.toLocaleString('vi-VN')} đ` : '0 đ'}
            </strong>
          ),
        }
      );
    }

    return baseColumns;
  }, [selectedTemplateKind]);

  return (
    <div className="module-page document-statistics-page">
      {/* Header Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#101828', margin: 0 }}>
          Thống kê tài liệu
        </h1>

        <Button
          icon={<FileExcelOutlined />}
          onClick={handleExportExcel}
          style={{ background: '#039855', borderColor: '#039855', color: '#ffffff', fontWeight: 600, borderRadius: 6 }}
          type="primary"
        >
          Xuất Báo Cáo Excel
        </Button>
      </header>

      {/* Redesigned Clean Vertical-Label Search & Filter Card */}
      <Card className="modern-card-container" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={[16, 12]}>
            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Mẫu tài liệu" style={{ marginBottom: 0 }}>
                <Select
                  value={selectedTemplateKind}
                  onChange={(val) => setSelectedTemplateKind(val)}
                  style={{ width: '100%' }}
                >
                  <Option value="leave_request">Đơn xin nghỉ phép</Option>
                  <Option value="overseas_request">Đơn xin đi nước ngoài</Option>
                  <Option value="expense_proposal">Tờ trình kinh phí mua sắm</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Phòng / Ban" style={{ marginBottom: 0 }}>
                <Select
                  value={selectedDepartment}
                  onChange={(val) => setSelectedDepartment(val)}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả phòng ban</Option>
                  {(unitsState.data ?? []).map((u) => (
                    <Option key={u.id} value={u.name}>{u.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Khoảng thời gian" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
              </Form.Item>
            </Col>

            <Col lg={6} md={12} sm={24} xs={24}>
              <Form.Item label="Tìm kiếm" style={{ marginBottom: 0 }}>
                <Input.Search
                  allowClear
                  onSearch={(val) => setSearchQuery(val)}
                  placeholder="Nhập tên nhân sự, lý do..."
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Data Table */}
      <Card className="modern-card-container">
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowKey="id"
          size="small"
        />
      </Card>
    </div>
  );
}
