import { Button, Modal } from 'antd';

import { ModuleIcon, type ModuleName } from '@/components/ModuleIcon';
import type { WorkspaceRecord } from '@/types/extended';

export function WorkspaceDetailModal({ item, module, moduleLabel, primaryLabel = 'Đã nắm thông tin', onClose, onPrimary }: { item: WorkspaceRecord | null; module: ModuleName; moduleLabel: string; primaryLabel?: string; onClose: () => void; onPrimary?: (item: WorkspaceRecord) => Promise<void> }) {
  return <Modal className="workspace-record-modal" footer={item ? <div className="workspace-record-actions"><Button onClick={onClose}>Đóng</Button>{onPrimary && <Button onClick={() => void onPrimary(item)} type="primary">{primaryLabel}</Button>}</div> : null} onCancel={onClose} open={Boolean(item)} title={<span className="preview-title"><span className={`section-icon ${module}`}><ModuleIcon module={module} /></span>{moduleLabel}</span>} width={680}>
    {item && <article className="workspace-record-detail"><header><span className="workspace-record-category">{item.category ?? moduleLabel}</span>{item.status && <span className="workspace-record-status">{item.status}</span>}</header><h2>{item.title}</h2><p>{item.description}</p><dl>{item.meta.map((entry) => <div key={entry.label}><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></article>}
  </Modal>;
}
