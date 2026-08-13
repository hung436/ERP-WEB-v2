import { Button, Form, Input, Modal, Popconfirm, Select, Table, Tabs, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import dayjs from 'dayjs';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { personnelManagementApi } from '@/services/api';
import type { PositionTitleItem, ResignedEmployeeItem, SpecialtyItem, UnitPositionMapping, UnitTypeCategory, WorkUnitItem } from '@/types/personnel';
import './personnel-management.css';

const { Option } = Select;

export function PersonnelManagementPage() {
  const [activeTab, setActiveTab] = useState<string>('units');

  // --- Tab 1: Đơn vị công tác ---
  const [unitSearch, setUnitSearch] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>('');
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<WorkUnitItem | null>(null);
  const [unitForm] = Form.useForm();

  const unitQuery = () => {
    const p = new URLSearchParams();
    if (unitSearch.trim()) p.set('search', unitSearch.trim());
    if (unitTypeFilter) p.set('type', unitTypeFilter);
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const unitsState = useAsyncData(
    async () => (await personnelManagementApi.units.list(unitQuery())).data,
    unitQuery()
  );

  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    unitForm.resetFields();
    setUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: WorkUnitItem) => {
    setEditingUnit(unit);
    unitForm.setFieldsValue(unit);
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    try {
      const values = await unitForm.validateFields();
      const payload = editingUnit ? { ...values, id: editingUnit.id } : values;
      const res = await personnelManagementApi.units.save(payload);
      message.success(res.message);
      setUnitModalOpen(false);
      unitsState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      const res = await personnelManagementApi.units.delete(id);
      message.success(res.message);
      unitsState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // --- Tab 2: Chức danh ---
  const [posSearch, setPosSearch] = useState('');
  const [posUnitTypeFilter, setPosUnitTypeFilter] = useState<string>('');
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PositionTitleItem | null>(null);
  const [posForm] = Form.useForm();

  const posQuery = () => {
    const p = new URLSearchParams();
    if (posSearch.trim()) p.set('search', posSearch.trim());
    if (posUnitTypeFilter) p.set('unitType', posUnitTypeFilter);
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const posState = useAsyncData(
    async () => (await personnelManagementApi.positions.list(posQuery())).data,
    posQuery()
  );

  const handleOpenAddPos = () => {
    setEditingPos(null);
    posForm.resetFields();
    setPosModalOpen(true);
  };

  const handleOpenEditPos = (pos: PositionTitleItem) => {
    setEditingPos(pos);
    posForm.setFieldsValue(pos);
    setPosModalOpen(true);
  };

  const handleSavePos = async () => {
    try {
      const values = await posForm.validateFields();
      const payload = editingPos ? { ...values, id: editingPos.id } : values;
      const res = await personnelManagementApi.positions.save(payload);
      message.success(res.message);
      setPosModalOpen(false);
      posState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeletePos = async (id: string) => {
    try {
      const res = await personnelManagementApi.positions.delete(id);
      message.success(res.message);
      posState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // --- Tab 3: Chuyên môn ---
  const [specSearch, setSpecSearch] = useState('');
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<SpecialtyItem | null>(null);
  const [specForm] = Form.useForm();

  const specQuery = () => {
    const p = new URLSearchParams();
    if (specSearch.trim()) p.set('search', specSearch.trim());
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const specState = useAsyncData(
    async () => (await personnelManagementApi.specialties.list(specQuery())).data,
    specQuery()
  );

  const handleOpenAddSpec = () => {
    setEditingSpec(null);
    specForm.resetFields();
    setSpecModalOpen(true);
  };

  const handleOpenEditSpec = (spec: SpecialtyItem) => {
    setEditingSpec(spec);
    specForm.setFieldsValue(spec);
    setSpecModalOpen(true);
  };

  const handleSaveSpec = async () => {
    try {
      const values = await specForm.validateFields();
      const payload = editingSpec ? { ...values, id: editingSpec.id } : values;
      const res = await personnelManagementApi.specialties.save(payload);
      message.success(res.message);
      setSpecModalOpen(false);
      specState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteSpec = async (id: string) => {
    try {
      const res = await personnelManagementApi.specialties.delete(id);
      message.success(res.message);
      specState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // --- Tab 4: Đơn vị - Chức danh ---
  const [mapSearch, setMapSearch] = useState('');
  const [mapUnitFilter, setMapUnitFilter] = useState<string>('');
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<UnitPositionMapping | null>(null);
  const [mapForm] = Form.useForm();

  const mapQuery = () => {
    const p = new URLSearchParams();
    if (mapSearch.trim()) p.set('search', mapSearch.trim());
    if (mapUnitFilter) p.set('unitId', mapUnitFilter);
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const mapState = useAsyncData(
    async () => (await personnelManagementApi.mappings.list(mapQuery())).data,
    mapQuery()
  );

  const handleOpenAddMap = () => {
    setEditingMap(null);
    mapForm.resetFields();
    setMapModalOpen(true);
  };

  const handleOpenEditMap = (map: UnitPositionMapping) => {
    setEditingMap(map);
    mapForm.setFieldsValue({ unitId: map.unitId, positionId: map.positionId });
    setMapModalOpen(true);
  };

  const handleSaveMap = async () => {
    try {
      const values = await mapForm.validateFields();
      const payload = editingMap ? { ...values, id: editingMap.id } : values;
      const res = await personnelManagementApi.mappings.save(payload);
      message.success(res.message);
      setMapModalOpen(false);
      mapState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteMap = async (id: string) => {
    try {
      const res = await personnelManagementApi.mappings.delete(id);
      message.success(res.message);
      mapState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // --- Tab 5: Nhân viên nghỉ việc ---
  const [resignedSearch, setResignedSearch] = useState('');
  const [resignedModalOpen, setResignedModalOpen] = useState(false);
  const [editingResigned, setEditingResigned] = useState<ResignedEmployeeItem | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [resignedForm] = Form.useForm();

  const resignedQuery = () => {
    const p = new URLSearchParams();
    if (resignedSearch.trim()) p.set('search', resignedSearch.trim());
    const q = p.toString();
    return q ? `?${q}` : '';
  };

  const resignedState = useAsyncData(
    async () => (await personnelManagementApi.resigned.list(resignedQuery())).data,
    resignedQuery()
  );

  const handleOpenAddResigned = () => {
    setEditingResigned(null);
    resignedForm.resetFields();
    setAttachedFileName('');
    resignedForm.setFieldsValue({ resignationDate: dayjs().format('DD/MM/YYYY') });
    setResignedModalOpen(true);
  };

  const handleOpenEditResigned = (record: ResignedEmployeeItem) => {
    setEditingResigned(record);
    setAttachedFileName(record.attachmentName || '');
    resignedForm.setFieldsValue(record);
    setResignedModalOpen(true);
  };

  const handleSaveResigned = async () => {
    try {
      const values = await resignedForm.validateFields();
      const payload = {
        ...values,
        ...(editingResigned ? { id: editingResigned.id } : {}),
        attachmentName: attachedFileName || 'Quyet_Dinh_Nghi_Viec.pdf',
      };
      const res = await personnelManagementApi.resigned.save(payload);
      message.success(res.message);
      setResignedModalOpen(false);
      resignedState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDeleteResigned = async (id: string) => {
    try {
      const res = await personnelManagementApi.resigned.delete(id);
      message.success(res.message);
      resignedState.reload();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDownloadAttachment = (fileName: string) => {
    message.success(`Đang tải xuống tài liệu đính kèm: ${fileName}`);
  };

  // Columns for Tab 1: Đơn vị công tác
  const unitColumns: ColumnsType<WorkUnitItem> = [
    {
      title: 'Tên đơn vị công tác',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Loại đơn vị',
      dataIndex: 'type',
      key: 'type',
      width: 170,
      render: (type: UnitTypeCategory) => (
        <span style={{ fontWeight: 500, color: '#344054' }}>{type}</span>
      ),
    },
    {
      title: 'Số lượng nhân sự',
      dataIndex: 'personnelCount',
      key: 'personnelCount',
      width: 160,
      align: 'center',
      render: (count: number) => (
        <span className={`personnel-count-badge${count === 0 ? ' zero' : ''}`}>
          {count} nhân sự
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditUnit(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteUnit(record.id)} title="Bạn có chắc chắn muốn xóa đơn vị này?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for Tab 2: Chức danh
  const posColumns: ColumnsType<PositionTitleItem> = [
    {
      title: 'Tên chức danh',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Loại đơn vị công tác',
      dataIndex: 'unitType',
      key: 'unitType',
      width: 200,
      render: (type: string) => (
        <span style={{ fontWeight: 500, color: '#344054' }}>{type === 'Tất cả' ? 'Tất cả đơn vị' : type}</span>
      ),
    },
    {
      title: 'Số lượng nhân sự theo chức danh',
      dataIndex: 'personnelCount',
      key: 'personnelCount',
      width: 240,
      align: 'center',
      render: (count: number) => (
        <span className={`personnel-count-badge${count === 0 ? ' zero' : ''}`}>
          {count} nhân sự
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditPos(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeletePos(record.id)} title="Bạn có chắc muốn xóa chức danh này?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for Tab 3: Chuyên môn
  const specColumns: ColumnsType<SpecialtyItem> = [
    {
      title: 'Tên chuyên môn',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Mô tả chuyên môn / Nhiệm vụ phụ trách',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số lượng nhân sự',
      dataIndex: 'personnelCount',
      key: 'personnelCount',
      width: 160,
      align: 'center',
      render: (count: number) => (
        <span className={`personnel-count-badge${count === 0 ? ' zero' : ''}`}>
          {count} nhân sự
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditSpec(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteSpec(record.id)} title="Bạn có chắc muốn xóa chuyên môn này?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for Tab 4: Đơn vị - Chức danh
  const mapColumns: ColumnsType<UnitPositionMapping> = [
    {
      title: 'Tên đơn vị công tác',
      dataIndex: 'unitName',
      key: 'unitName',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Tên chức danh',
      dataIndex: 'positionName',
      key: 'positionName',
      render: (text: string) => <span style={{ fontWeight: 500, color: '#344054' }}>{text}</span>,
    },
    {
      title: 'Ngày tạo liên kết',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (dateStr: string) => <span style={{ color: '#475467' }}>{dateStr}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditMap(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteMap(record.id)} title="Xóa liên kết Đơn vị - Chức danh này?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for Tab 5: Nhân viên nghỉ việc
  const resignedColumns: ColumnsType<ResignedEmployeeItem> = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <strong style={{ fontSize: 14, color: '#101828' }}>{text}</strong>,
    },
    {
      title: 'Đơn vị công tác',
      dataIndex: 'department',
      key: 'department',
      width: 220,
    },
    {
      title: 'Lý do nghỉ việc',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Ngày nghỉ việc',
      dataIndex: 'resignationDate',
      key: 'resignationDate',
      width: 140,
      render: (dateStr: string) => <span style={{ color: '#d92d20', fontWeight: 600 }}>{dateStr}</span>,
    },
    {
      title: 'Tài liệu đính kèm',
      dataIndex: 'attachmentName',
      key: 'attachmentName',
      width: 220,
      render: (fileName: string) => (
        <Button
          icon={<span>📎</span>}
          onClick={() => handleDownloadAttachment(fileName)}
          size="small"
          type="link"
        >
          {fileName}
        </Button>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button onClick={() => handleOpenEditResigned(record)} size="small" type="link">Sửa</Button>
          <Popconfirm onConfirm={() => handleDeleteResigned(record.id)} title="Xóa bản ghi nhân viên nghỉ việc?">
            <Button danger size="small" type="link">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="module-page personnel-management-page">
      <header className="personnel-management-header">
        <h1>Quản lý</h1>
      </header>

      <Tabs
        activeKey={activeTab}
        className="personnel-management-tabs"
        onChange={(k) => setActiveTab(k)}
        items={[
          {
            key: 'units',
            label: 'Đơn vị công tác',
            children: (
              <div>
                <div className="management-toolbar">
                  <div className="management-toolbar-filters">
                    <Input.Search
                      allowClear
                      onSearch={(v) => setUnitSearch(v)}
                      placeholder="Tìm theo Tên đơn vị, Địa chỉ, SĐT..."
                      style={{ width: 320 }}
                    />
                    <Select
                      allowClear
                      onChange={(v) => setUnitTypeFilter(v || '')}
                      placeholder="Tất cả Loại đơn vị"
                      style={{ width: 180 }}
                      value={unitTypeFilter || undefined}
                    >
                      <Option value="Chính quyền">Chính quyền</Option>
                      <Option value="Đoàn, công đoàn">Đoàn, công đoàn</Option>
                      <Option value="Đảng">Đảng</Option>
                    </Select>
                  </div>
                  <Button onClick={handleOpenAddUnit} type="primary" danger style={{ height: 38, fontSize: 13.5 }}>
                    + Thêm đơn vị công tác
                  </Button>
                </div>

                <div className="management-table-card">
                  {unitsState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : unitsState.error ? (
                    <ErrorState message={unitsState.error} onRetry={unitsState.reload} />
                  ) : (unitsState.data ?? []).length === 0 ? (
                    <EmptyState description="Không tìm thấy đơn vị công tác nào" />
                  ) : (
                    <Table
                      className="management-table"
                      columns={unitColumns}
                      dataSource={unitsState.data ?? undefined}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      rowKey="id"
                    />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'positions',
            label: 'Chức danh',
            children: (
              <div>
                <div className="management-toolbar">
                  <div className="management-toolbar-filters">
                    <Input.Search
                      allowClear
                      onSearch={(v) => setPosSearch(v)}
                      placeholder="Tìm theo Tên chức danh..."
                      style={{ width: 320 }}
                    />
                    <Select
                      allowClear
                      onChange={(v) => setPosUnitTypeFilter(v || '')}
                      placeholder="Tất cả Loại đơn vị"
                      style={{ width: 180 }}
                      value={posUnitTypeFilter || undefined}
                    >
                      <Option value="Chính quyền">Chính quyền</Option>
                      <Option value="Đoàn, công đoàn">Đoàn, công đoàn</Option>
                      <Option value="Đảng">Đảng</Option>
                    </Select>
                  </div>
                  <Button onClick={handleOpenAddPos} type="primary" danger style={{ height: 38, fontSize: 13.5 }}>
                    + Thêm chức danh
                  </Button>
                </div>

                <div className="management-table-card">
                  {posState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : posState.error ? (
                    <ErrorState message={posState.error} onRetry={posState.reload} />
                  ) : (posState.data ?? []).length === 0 ? (
                    <EmptyState description="Không tìm thấy chức danh nào" />
                  ) : (
                    <Table
                      className="management-table"
                      columns={posColumns}
                      dataSource={posState.data ?? undefined}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      rowKey="id"
                    />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'specialties',
            label: 'Chuyên môn',
            children: (
              <div>
                <div className="management-toolbar">
                  <div className="management-toolbar-filters">
                    <Input.Search
                      allowClear
                      onSearch={(v) => setSpecSearch(v)}
                      placeholder="Tìm theo Tên chuyên môn, mô tả..."
                      style={{ width: 340 }}
                    />
                  </div>
                  <Button onClick={handleOpenAddSpec} type="primary" danger style={{ height: 38, fontSize: 13.5 }}>
                    + Thêm chuyên môn
                  </Button>
                </div>

                <div className="management-table-card">
                  {specState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : specState.error ? (
                    <ErrorState message={specState.error} onRetry={specState.reload} />
                  ) : (specState.data ?? []).length === 0 ? (
                    <EmptyState description="Không tìm thấy chuyên môn nào" />
                  ) : (
                    <Table
                      className="management-table"
                      columns={specColumns}
                      dataSource={specState.data ?? undefined}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      rowKey="id"
                    />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'mappings',
            label: 'Đơn vị - Chức danh',
            children: (
              <div>
                <div className="management-toolbar">
                  <div className="management-toolbar-filters">
                    <Input.Search
                      allowClear
                      onSearch={(v) => setMapSearch(v)}
                      placeholder="Tìm theo Tên đơn vị, Chức danh..."
                      style={{ width: 320 }}
                    />
                    <Select
                      allowClear
                      onChange={(v) => setMapUnitFilter(v || '')}
                      placeholder="Lọc theo Đơn vị"
                      style={{ width: 220 }}
                      value={mapUnitFilter || undefined}
                    >
                      {(unitsState.data ?? []).map((u) => (
                        <Option key={u.id} value={u.id}>{u.name}</Option>
                      ))}
                    </Select>
                  </div>
                  <Button onClick={handleOpenAddMap} type="primary" danger style={{ height: 38, fontSize: 13.5 }}>
                    + Thêm liên kết Đơn vị - Chức danh
                  </Button>
                </div>

                <div className="management-table-card">
                  {mapState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : mapState.error ? (
                    <ErrorState message={mapState.error} onRetry={mapState.reload} />
                  ) : (mapState.data ?? []).length === 0 ? (
                    <EmptyState description="Chưa có liên kết Đơn vị - Chức danh nào" />
                  ) : (
                    <Table
                      className="management-table"
                      columns={mapColumns}
                      dataSource={mapState.data ?? undefined}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      rowKey="id"
                    />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'resigned',
            label: 'Nhân viên nghỉ việc',
            children: (
              <div>
                <div className="management-toolbar">
                  <div className="management-toolbar-filters">
                    <Input.Search
                      allowClear
                      onSearch={(v) => setResignedSearch(v)}
                      placeholder="Tìm theo Tên nhân viên, Mã NV, Lý do..."
                      style={{ width: 340 }}
                    />
                  </div>
                  <Button onClick={handleOpenAddResigned} type="primary" danger style={{ height: 38, fontSize: 13.5 }}>
                    + Ghi nhận nhân viên nghỉ việc
                  </Button>
                </div>

                <div className="management-table-card">
                  {resignedState.loading ? (
                    <ContentSkeleton rows={6} />
                  ) : resignedState.error ? (
                    <ErrorState message={resignedState.error} onRetry={resignedState.reload} />
                  ) : (resignedState.data ?? []).length === 0 ? (
                    <EmptyState description="Chưa có thông tin nhân viên nghỉ việc" />
                  ) : (
                    <Table
                      className="management-table"
                      columns={resignedColumns}
                      dataSource={resignedState.data ?? undefined}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      rowKey="id"
                    />
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />


      {/* Modal Tab 1: Đơn vị công tác */}
      <Modal
        onCancel={() => setUnitModalOpen(false)}
        onOk={handleSaveUnit}
        open={unitModalOpen}
        title={editingUnit ? 'Sửa Đơn vị công tác' : 'Thêm Đơn vị công tác mới'}
        okText="Lưu đơn vị"
        cancelText="Hủy"
        width={540}
      >
        <Form form={unitForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên đơn vị công tác" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị công tác' }]}>
            <Input placeholder="Ví dụ: Ban Nội dung & Xuất bản" />
          </Form.Item>
          <Form.Item label="Địa chỉ đơn vị" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input placeholder="Ví dụ: 60A Hoàng Văn Thụ, P.9, Q. Phú Nhuận, TP.HCM" />
          </Form.Item>
          <Form.Item label="Số điện thoại liên hệ" name="phone" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
            <Input placeholder="Ví dụ: 028 3997 3839" />
          </Form.Item>
          <Form.Item label="Loại đơn vị công tác" name="type" rules={[{ required: true, message: 'Vui lòng chọn loại đơn vị' }]}>
            <Select placeholder="Chọn loại đơn vị">
              <Option value="Chính quyền">Chính quyền</Option>
              <Option value="Đoàn, công đoàn">Đoàn, công đoàn</Option>
              <Option value="Đảng">Đảng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tab 2: Chức danh */}
      <Modal
        onCancel={() => setPosModalOpen(false)}
        onOk={handleSavePos}
        open={posModalOpen}
        title={editingPos ? 'Sửa Chức danh' : 'Thêm Chức danh mới'}
        okText="Lưu chức danh"
        cancelText="Hủy"
        width={500}
      >
        <Form form={posForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên chức danh" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên chức danh' }]}>
            <Input placeholder="Ví dụ: Trưởng ban, Phóng viên cao cấp..." />
          </Form.Item>
          <Form.Item label="Loại đơn vị công tác áp dụng" name="unitType" rules={[{ required: true, message: 'Vui lòng chọn loại đơn vị' }]}>
            <Select placeholder="Chọn loại đơn vị công tác">
              <Option value="Chính quyền">Chính quyền</Option>
              <Option value="Đoàn, công đoàn">Đoàn, công đoàn</Option>
              <Option value="Đảng">Đảng</Option>
              <Option value="Tất cả">Tất cả đơn vị</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tab 3: Chuyên môn */}
      <Modal
        onCancel={() => setSpecModalOpen(false)}
        onOk={handleSaveSpec}
        open={specModalOpen}
        title={editingSpec ? 'Sửa Chuyên môn' : 'Thêm Chuyên môn mới'}
        okText="Lưu chuyên môn"
        cancelText="Hủy"
        width={540}
      >
        <Form form={specForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên chuyên môn" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên chuyên môn' }]}>
            <Input placeholder="Ví dụ: Y tế & An toàn sức khỏe, Kế toán phát hành..." />
          </Form.Item>
          <Form.Item label="Mô tả chuyên môn / Nhiệm vụ phụ trách" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết nhiệm vụ của nhóm chuyên môn..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tab 4: Đơn vị - Chức danh */}
      <Modal
        onCancel={() => setMapModalOpen(false)}
        onOk={handleSaveMap}
        open={mapModalOpen}
        title={editingMap ? 'Sửa liên kết Đơn vị - Chức danh' : 'Thêm liên kết Đơn vị - Chức danh mới'}
        okText={editingMap ? 'Lưu thay đổi' : 'Tạo liên kết'}
        cancelText="Hủy"
        width={520}
      >
        <Form form={mapForm} layout="vertical" style={{ marginTop: 16 }}>
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
        </Form>
      </Modal>

      {/* Modal Tab 5: Ghi nhận Nhân viên nghỉ việc */}
      <Modal
        onCancel={() => setResignedModalOpen(false)}
        onOk={handleSaveResigned}
        open={resignedModalOpen}
        title={editingResigned ? 'Sửa thông tin nhân viên nghỉ việc' : 'Ghi nhận nhân viên nghỉ việc'}
        okText={editingResigned ? 'Lưu thay đổi' : 'Ghi nhận'}
        cancelText="Hủy"
        width={560}
      >
        <Form form={resignedForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Họ và tên nhân viên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}>
            <Input placeholder="Nhập họ và tên nhân viên nghỉ việc" />
          </Form.Item>
          <Form.Item label="Đơn vị công tác" name="department" rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}>
            <Select placeholder="Chọn đơn vị công tác">
              {(unitsState.data ?? []).map((u) => (
                <Option key={u.id} value={u.name}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Lý do nghỉ việc" name="reason" rules={[{ required: true, message: 'Vui lòng nhập lý do nghỉ việc' }]}>
            <Input.TextArea rows={2} placeholder="Nhập lý do thôi việc, chuyển công tác, hưu trí..." />
          </Form.Item>
          <Form.Item label="Ngày nghỉ việc" name="resignationDate" rules={[{ required: true, message: 'Vui lòng nhập ngày nghỉ việc' }]}>
            <Input placeholder="Ví dụ: 15/12/2025" />
          </Form.Item>
          <Form.Item label="Tài liệu đính kèm (Quyết định / Đơn xin nghỉ việc)">
            <Upload
              beforeUpload={(file) => {
                setAttachedFileName(file.name);
                return false;
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} style={{ height: 38, fontSize: 13.5 }}>
                {attachedFileName ? 'Thay đổi file đính kèm' : 'Chọn file tài liệu đính kèm (PDF, Word...)'}
              </Button>
            </Upload>
            {attachedFileName && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#027a48', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📎 File đính kèm đã chọn:</span>
                <span style={{ color: '#1570ef', textDecoration: 'underline' }}>{attachedFileName}</span>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
