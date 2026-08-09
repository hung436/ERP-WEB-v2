import { Button, Empty, Result, Skeleton, Spin } from 'antd';

export function ContentSkeleton({ rows = 5 }: { rows?: number }) {
  return <div aria-label="Đang tải dữ liệu" className="surface-panel"><Skeleton active paragraph={{ rows }} title /></div>;
}

export function EmptyState({ description = 'Chưa có dữ liệu phù hợp' }: { description?: string }) {
  return <div className="surface-panel py-12"><Empty description={description} image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="surface-panel"><Result status="error" title="Không thể tải dữ liệu" subTitle={message} extra={onRetry ? <Button onClick={onRetry}>Thử lại</Button> : undefined} /></div>;
}

export function FullPageLoading({ label }: { label: string }) {
  return <div className="grid min-h-screen place-items-center bg-page"><Spin size="large" tip={label}><div className="h-16 w-48" /></Spin></div>;
}
