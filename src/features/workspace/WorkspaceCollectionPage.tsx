import { Button, Input, Select, message } from 'antd';
import { useMemo, useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon, type ModuleName } from '@/components/ModuleIcon';
import { WorkspaceActionModal } from '@/features/workspace/components/WorkspaceActionModal';
import { WorkspaceDetailModal } from '@/features/workspace/components/WorkspaceDetailModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { extendedWorkspaceApi } from '@/services/api';
import type { ExpertRecord, WorkspaceRecord } from '@/types/extended';

type ActionKind = 'request' | 'upload' | 'meeting' | 'library';
interface CollectionConfig {
  module: ModuleName;
  apiKey: 'requests' | 'cloud' | 'meetings' | 'evaluations' | 'library' | 'experts';
  label: string;
  eyebrow: string;
  description: string;
  searchPlaceholder: string;
  primary?: { label: string; action: string; kind: ActionKind };
  secondary?: { label: string; action: string; kind: ActionKind };
  filters?: string[];
  stats?: Array<{ label: string; value: string }>;
  view?: 'list' | 'tiles' | 'experts';
}

const isExpert = (item: WorkspaceRecord): item is ExpertRecord => 'field' in item && 'organization' in item;

export function WorkspaceCollectionPage({ config }: { config: CollectionConfig }) {
  const state = useAsyncData(async () => (await extendedWorkspaceApi[config.apiKey]()).data as WorkspaceRecord[]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const [evaluationTab, setEvaluationTab] = useState<'self' | 'score' | 'council'>('self');
  const [selected, setSelected] = useState<WorkspaceRecord | null>(null);
  const [action, setAction] = useState<CollectionConfig['primary']>();
  const visible = useMemo(() => (state.data ?? [])
    .filter((item) => `${item.title} ${item.subtitle} ${item.category ?? ''}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
    .filter((item) => filter === 'Tất cả' || item.status === filter || item.category === filter || (isExpert(item) && item.field === filter)), [state.data, query, filter]);
  const runDetailAction = async (item: WorkspaceRecord) => {
    await extendedWorkspaceApi.action(config.apiKey, 'detail-primary', { id: item.id });
    message.success('Đã cập nhật thao tác');
    setSelected(null);
  };
  const openAction = (next: CollectionConfig['primary']) => next && setAction(next);

  if (state.loading) return <div className="module-page"><ContentSkeleton rows={9} /></div>;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;

  const renderRecords = (items: WorkspaceRecord[], view = config.view ?? 'list') => <section className={`extended-records surface-panel view-${view}`}>
    {items.length ? items.map((item) => <button className="extended-record" key={item.id} onClick={() => setSelected(item)} type="button">
      <span className={`extended-record-icon ${config.module}`}>{isExpert(item) ? item.initials : <ModuleIcon module={config.module} />}</span>
      <span className="extended-record-main"><strong>{item.title}</strong><small>{isExpert(item) ? `${item.subtitle} · ${item.organization}` : item.subtitle}</small>{isExpert(item) && <span>{item.collaborations} bài cộng tác · Đánh giá {item.rating}</span>}</span>
      <span className="extended-record-meta">{item.category && <em>{item.category}</em>}{item.status && <b>{item.status}</b>}</span><span aria-hidden className="extended-record-arrow">›</span>
    </button>) : <EmptyState description="Không tìm thấy nội dung phù hợp" />}
  </section>;

  const records = config.module === 'evaluations'
    ? evaluationTab === 'self' ? visible.slice(0, 1) : evaluationTab === 'score' ? visible.slice(1) : visible
    : visible;

  return <div className={`module-page extended-module ${config.module}-module`}>
    <header className="v7-module-header">
      <div className="v7-module-heading"><span className={`v7-page-icon ${config.module}`}><ModuleIcon module={config.module} size={24} /></span><div><p>{config.eyebrow}</p><h1>{config.label}</h1><span>{config.description}</span></div></div>
      <div className="v7-module-actions">{config.secondary && <Button onClick={() => openAction(config.secondary)}>{config.secondary.label}</Button>}{config.primary && <Button icon={<ModuleIcon module={config.module} size={17} />} onClick={() => openAction(config.primary)} type="primary">{config.primary.label}</Button>}</div>
    </header>

    {config.module === 'meetings' && <section className="v7-meeting-hero"><div><small><i /> Sẵn sàng bắt đầu</small><h2>Bắt đầu cuộc họp ngay</h2><p>Tạo phòng họp và chia sẻ liên kết với đồng nghiệp.</p><Button onClick={() => openAction(config.primary)} type="primary">Bắt đầu họp</Button></div><span><ModuleIcon module="meetings" size={38} /></span></section>}

    <section className="extended-module-toolbar surface-panel" aria-label={`Công cụ ${config.label}`}>
      {config.module === 'evaluations' ? <div className="v7-segmented" role="tablist" aria-label="Chế độ đánh giá"><button aria-selected={evaluationTab === 'self'} className={evaluationTab === 'self' ? 'active' : ''} onClick={() => setEvaluationTab('self')} role="tab">Tự đánh giá</button><button aria-selected={evaluationTab === 'score'} className={evaluationTab === 'score' ? 'active' : ''} onClick={() => setEvaluationTab('score')} role="tab">Chấm điểm</button><button aria-selected={evaluationTab === 'council'} className={evaluationTab === 'council' ? 'active' : ''} onClick={() => setEvaluationTab('council')} role="tab">Hội đồng</button></div> : <Input aria-label={`Tìm trong ${config.label}`} allowClear onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} prefix={<ModuleIcon module={config.module} size={17} />} value={query} />}
      {config.module !== 'evaluations' && config.filters && <Select aria-label={`Lọc ${config.label}`} onChange={setFilter} options={['Tất cả', ...config.filters].map((value) => ({ label: value, value }))} value={filter} />}
      {config.module === 'evaluations' && <Select aria-label="Kỳ đánh giá" defaultValue="Quý III/2026" options={[{ value: 'Quý III/2026', label: 'Quý III/2026' }, { value: 'Quý II/2026', label: 'Quý II/2026' }]} />}
      <span className="v7-result-count">{records.length} kết quả</span>
    </section>

    <section aria-label={`Danh sách ${config.label}`} className="v7-module-content">
      {config.module === 'requests' ? <div className="v7-work-layout"><div className="v7-module-card"><header><div><h2>Đơn đã gửi</h2><p>Theo dõi trạng thái phê duyệt</p></div></header>{renderRecords(records)}</div><aside className="v7-module-card v7-summary-panel"><header><div><h2>Tổng quan</h2><p>Tiến độ xử lý cá nhân</p></div></header><div className="v7-progress-ring"><span>68%</span></div><div className="v7-summary-stats"><div><strong>8</strong><span>Đã duyệt</span></div><div><strong>4</strong><span>Đang chờ</span></div><div><strong>1</strong><span>Từ chối</span></div></div></aside></div>
        : config.module === 'meetings' ? <div className="v7-meeting-grid"><article className="v7-module-card"><header><div><h2>Sắp diễn ra</h2><p>Lịch họp trong ngày</p></div></header>{renderRecords(records.filter((item) => item.status === 'Sắp diễn ra'))}</article><article className="v7-module-card"><header><div><h2>Gần đây</h2><p>Xem lại cuộc họp đã kết thúc</p></div></header>{renderRecords(records.filter((item) => item.status === 'Đã kết thúc'))}</article></div>
        : config.module === 'evaluations' ? <>{evaluationTab === 'self' && <section className="v7-evaluation-overview"><div><span>Tiến độ</span><strong>8/10 tiêu chí</strong></div><div><span>Điểm hiện tại</span><strong>86,5</strong></div><div><span>Hạn hoàn thành</span><strong>15/08/2026</strong></div><Button onClick={() => records[0] && setSelected(records[0])} type="primary">Tiếp tục đánh giá</Button></section>}{renderRecords(records)}</>
        : renderRecords(records)}
    </section>

    <WorkspaceDetailModal item={selected} module={config.module} moduleLabel={config.label} onClose={() => setSelected(null)} onPrimary={runDetailAction} primaryLabel={config.module === 'meetings' ? 'Tham gia / mở lịch' : config.module === 'experts' ? 'Liên hệ chuyên gia' : 'Thực hiện thao tác'} />
    <WorkspaceActionModal config={action ? { module: config.apiKey, title: action.label, action: action.action, kind: action.kind } : null} onClose={() => setAction(undefined)} />
  </div>;
}

export type { CollectionConfig };
