import { Button, Form, Input, Modal, Popconfirm, Select, Table, Tag, Tabs, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { personnelManagementApi, personnelPermissionsApi } from '@/services/api';
import type {
  HttpMethodCategory,
  PermissionAssignmentItem,
  PermissionGroupItem,
  PermissionItem,
} from '@/types/personnel';
import './personnel-permissions.css';

const { Option } = Select;

const httpMethodColors: Record<HttpMethodCategory, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'purple',
  DELETE: 'red',
};

const serviceOptions = [
  'personnel-service',
  'booking-service',
  'workflow-service',
  'document-service',
  'auth-service',
  'evaluation-service',
  'mail-service',
];

export function PersonnelPermissionsPage() {
  const [activeTab, setActiveTab] = useState<string>('items');

  // --- Tab 1: Quản lý quyền ---
  const [itemSearch, setItemSearch] = useState('');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PermissionItem | null>(null);
  const [itemForm] = Form.useForm();

  const itemQuery = () => {
    const p = new URLSearchParams();
    if (itemSearch.trim()) p.set('search', itemSearch.trim());
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const itemState = useAsyncData(
    async () => (await personnelPermissionsApi.items.list(itemQuery())).data,
    itemQuery()
  );

  const handleOpenAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({ method: 'GET', serviceName: 'personnel-service' });
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item: PermissionItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      const payload = editingItem ? { ...values, id: editingItem.id } : values;
      const res = await personnelPermissionsApi.items.save(payload);
      message.success(res.message);
      setItemModalOpen(false);
      itemState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await personnelPermissionsApi.items.delete(id);
      message.success(res.message);
      itemState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // --- Tab 2: Nhóm quyền ---
  const [groupSearch, setGroupSearch] = useState('');
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionGroupItem | null>(null);
  const [groupForm] = Form.useForm();

  const groupQuery = () => {
    const p = new URLSearchParams();
    if (groupSearch.trim()) p.set('search', groupSearch.trim());
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const groupState = useAsyncData(
    async () => (await personnelPermissionsApi.groups.list(groupQuery())).data,
    groupQuery()
  );

  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: PermissionGroupItem) => {
    setEditingGroup(group);
    groupForm.setFieldsValue(group);
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      const payload = editingGroup ? { ...values, id: editingGroup.id } : values;
      const res = await personnelPermissionsApi.groups.save(payload);
      message.success(res.message);
      setGroupModalOpen(false);
      groupState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      const res = await personnelPermissionsApi.groups.delete(id);
      message.success(res.message);
      groupState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // --- Tab 3: Phân quyền ---
  const [assignSearch, setAssignSearch] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState<PermissionAssignmentItem | null>(null);
  const [assignForm] = Form.useForm();

  const assignQuery = () => {
    const p = new URLSearchParams();
    if (assignSearch.trim()) p.set('search', assignSearch.trim());
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const assignState = useAsyncData(
    async () => (await personnelPermissionsApi.assignments.list(assignQuery())).data,
    assignQuery()
  );

  const unitsState = useAsyncData(async () => (await personnelManagementApi.units.list()).data);
  const posState = useAsyncData(async () => (await personnelManagementApi.positions.list()).data);
  const specState = useAsyncData(async () => (await personnelManagementApi.specialties.list()).data);

  const handleOpenAddAssign = () => {
    setEditingAssign(null);
    assignForm.resetFields();
    setAssignModalOpen(true);
  };

  const handleOpenEditAssign = (assign: PermissionAssignmentItem) => {
    setEditingAssign(assign);
    assignForm.setFieldsValue(assign);
    setAssignModalOpen(true);
  };

  const handleSaveAssign = async () => {
    try {
      const values = await assignForm.validateFields();
      const payload = editingAssign ? { ...values, id: editingAssign.id } : values;
      const res = await personnelPermissionsApi.assignments.save(payload);
      message.success(res.message);
      setAssignModalOpen(false);
      assignState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteAssign = async (id: string) => {
    try {
      const res = await personnelPermissionsApi.assignments.delete(id);
      message.success(res.message);
      assignState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // Columns for Tab 1: Quản lý quyền
  const itemColumns: ColumnsType<PermissionItem> = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Đường dẫn URI',
      dataIndex: 'uri',
      key: 'uri',
      render: (uri: string) => <code style={{ color: '#1570ef', fontSize: 13 }}>{uri}</code>,
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      align: 'center',
      render: (method: HttpMethodCategory) => (
        <Tag color={httpMethodColors[method]} style={{ fontWeight: 700, fontSize: 12, padding: '2px 8px' }}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'Bảng quản lý (Service)',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 200,
      render: (svc: string) => <span style={{ color: '#344054', fontWeight: 500 }}>{svc}</span>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (dateStr: string) => <span style={{ color: '#667085' }}>{dateStr}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditItem(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteItem(record.id)} title="Xóa quyền này khỏi hệ thống?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for Tab 2: Nhóm quyền (Chỉ hiển thị duy nhất Tên nhóm quyền & Thao tác)
  const groupColumns: ColumnsType<PermissionGroupItem> = [
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditGroup(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteGroup(record.id)} title="Xóa nhóm quyền này?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for Tab 3: Phân quyền
  const assignColumns: ColumnsType<PermissionAssignmentItem> = [
    {
      title: 'Tên đơn vị công tác',
      dataIndex: 'unitName',
      key: 'unitName',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Chức danh',
      dataIndex: 'positionName',
      key: 'positionName',
      render: (text: string) => <span style={{ fontWeight: 500, color: '#344054' }}>{text}</span>,
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialtyName',
      key: 'specialtyName',
      render: (text?: string) => <span style={{ color: '#475467' }}>{text || 'Tất cả chuyên môn'}</span>,
    },
    {
      title: 'Nhóm quyền',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (groupName: string) => (
        <span style={{ fontWeight: 600, color: '#d92d20' }}>{groupName}</span>
      ),
    },
    {
      title: 'Ngày phân quyền',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (dateStr: string) => <span style={{ color: '#667085' }}>{dateStr}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditAssign(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteAssign(record.id)} title="Xóa phân quyền này?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="module-page personnel-permissions-page">
      <header className="personnel-permissions-header">
        <h1>Quyền</h1>
      </header>

      <Tabs
        activeKey={activeTab}
        className="personnel-permissions-tabs"
        onChange={(k) => setActiveTab(k)}
        items={[
          {
            key: 'items',
            label: 'Quản lý quyền',
            children: (
              <div>
                <div className="permissions-toolbar">
                  <Input.Search
                    allowClear
                    onSearch={(val) => setItemSearch(val)}
                    placeholder="Tìm theo tên quyền, đường dẫn URI, service..."
                    style={{ maxWidth: 360 }}
                  />
                  <Button
                    onClick={handleOpenAddItem}
                    style={{ background: '#d92d20', borderColor: '#d92d20', color: '#fff', fontWeight: 600 }}
                    type="primary"
                  >
                    + Thêm quyền mới
                  </Button>
                </div>
                <div className="permissions-table-card">
                  {itemState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : itemState.error ? (
                    <ErrorState message={itemState.error} onRetry={itemState.reload} />
                  ) : (itemState.data ?? []).length === 0 ? (
                    <EmptyState description="Chưa có dữ liệu quyền" />
                  ) : (
                    <Table columns={itemColumns} dataSource={itemState.data ?? []} rowKey="id" size="small" />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'groups',
            label: 'Nhóm quyền',
            children: (
              <div>
                <div className="permissions-toolbar">
                  <Input.Search
                    allowClear
                    onSearch={(val) => setGroupSearch(val)}
                    placeholder="Tìm theo tên nhóm quyền..."
                    style={{ maxWidth: 360 }}
                  />
                  <Button
                    onClick={handleOpenAddGroup}
                    style={{ background: '#d92d20', borderColor: '#d92d20', color: '#fff', fontWeight: 600 }}
                    type="primary"
                  >
                    + Thêm nhóm quyền mới
                  </Button>
                </div>
                <div className="permissions-table-card">
                  {groupState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : groupState.error ? (
                    <ErrorState message={groupState.error} onRetry={groupState.reload} />
                  ) : (groupState.data ?? []).length === 0 ? (
                    <EmptyState description="Chưa có dữ liệu nhóm quyền" />
                  ) : (
                    <Table columns={groupColumns} dataSource={groupState.data ?? []} rowKey="id" size="small" />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'assignments',
            label: 'Phân quyền',
            children: (
              <div>
                <div className="permissions-toolbar">
                  <Input.Search
                    allowClear
                    onSearch={(val) => setAssignSearch(val)}
                    placeholder="Tìm theo đơn vị, chức danh, nhóm quyền..."
                    style={{ maxWidth: 360 }}
                  />
                  <Button
                    onClick={handleOpenAddAssign}
                    style={{ background: '#d92d20', borderColor: '#d92d20', color: '#fff', fontWeight: 600 }}
                    type="primary"
                  >
                    + Thêm phân quyền
                  </Button>
                </div>
                <div className="permissions-table-card">
                  {assignState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : assignState.error ? (
                    <ErrorState message={assignState.error} onRetry={assignState.reload} />
                  ) : (assignState.data ?? []).length === 0 ? (
                    <EmptyState description="Chưa có dữ liệu phân quyền" />
                  ) : (
                    <Table columns={assignColumns} dataSource={assignState.data ?? []} rowKey="id" size="small" />
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* Modal Tab 1: Thêm/Sửa Quản lý quyền */}
      <Modal
        onCancel={() => setItemModalOpen(false)}
        onOk={handleSaveItem}
        open={itemModalOpen}
        title={editingItem ? 'Sửa thông tin quyền' : 'Thêm quyền mới'}
        okText={editingItem ? 'Lưu thay đổi' : 'Tạo quyền'}
        cancelText="Hủy"
        width={540}
      >
        <Form form={itemForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên quyền" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên quyền' }]}>
            <Input placeholder="Ví dụ: Xem danh sách hồ sơ nhân sự, Duyệt đặt xe..." />
          </Form.Item>
          <Form.Item label="Đường dẫn URI" name="uri" rules={[{ required: true, message: 'Vui lòng nhập đường dẫn URI' }]}>
            <Input placeholder="Ví dụ: /api/personnel/list, /api/booking/create..." />
          </Form.Item>
          <Form.Item label="Phương thức HTTP" name="method" rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}>
            <Select placeholder="Chọn phương thức HTTP">
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="PATCH">PATCH</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Bảng quản lý (Service)" name="serviceName" rules={[{ required: true, message: 'Vui lòng chọn bảng quản lý' }]}>
            <Select placeholder="Chọn bảng quản lý (Service)">
              {serviceOptions.map((svc) => (
                <Option key={svc} value={svc}>{svc}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tab 2: Thêm/Sửa Nhóm quyền — Chỉ duy nhất nhập tên nhóm quyền */}
      <Modal
        onCancel={() => setGroupModalOpen(false)}
        onOk={handleSaveGroup}
        open={groupModalOpen}
        title={editingGroup ? 'Sửa nhóm quyền' : 'Thêm nhóm quyền mới'}
        okText={editingGroup ? 'Lưu thay đổi' : 'Tạo nhóm quyền'}
        cancelText="Hủy"
        width={480}
      >
        <Form form={groupForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên nhóm quyền" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm quyền' }]}>
            <Input placeholder="Ví dụ: [BOOKING] quyền tổ trưởng công đoàn, [PROFILE] quyền nhân sự..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tab 3: Thêm/Sửa Phân quyền */}
      <Modal
        onCancel={() => setAssignModalOpen(false)}
        onOk={handleSaveAssign}
        open={assignModalOpen}
        title={editingAssign ? 'Sửa phân quyền' : 'Thêm phân quyền mới'}
        okText={editingAssign ? 'Lưu thay đổi' : 'Gán phân quyền'}
        cancelText="Hủy"
        width={540}
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Đơn vị công tác" name="unitId" rules={[{ required: true, message: 'Vui lòng chọn đơn vị công tác' }]}>
            <Select placeholder="Chọn đơn vị công tác">
              {(unitsState.data ?? []).map((u) => (
                <Option key={u.id} value={u.id}>{u.name} ({u.type})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Chức danh" name="positionId" rules={[{ required: true, message: 'Vui lòng chọn chức danh' }]}>
            <Select placeholder="Chọn chức danh">
              {(posState.data ?? []).map((p) => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Chuyên môn (Tùy chọn)" name="specialtyId">
            <Select allowClear placeholder="Chọn chuyên môn (Bỏ trống = Tất cả chuyên môn)">
              {(specState.data ?? []).map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Nhóm quyền" name="groupId" rules={[{ required: true, message: 'Vui lòng chọn nhóm quyền' }]}>
            <Select placeholder="Chọn nhóm quyền">
              {(groupState.data ?? []).map((g) => (
                <Option key={g.id} value={g.id}>{g.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
