import React, { useState } from 'react';
import { Modal, Input, Button, Progress, message } from 'antd';
import {
  FolderPlus,
  Edit3,
  UploadCloud,
  FileCheck,
  Eye,
  Download,
  Share2,
} from 'lucide-react';
import { CloudItem } from '../types';
import { CloudFileIcon } from './CloudFileIcon';

// 1. MODAL TẠO THƯ MỤC MỚI
interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('Thư mục không tên');

  const handleOk = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('Thư mục không tên');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleOk}
      title={
        <div className="flex items-center gap-2">
          <FolderPlus size={18} className="text-amber-500" />
          <span>Thư mục mới</span>
        </div>
      }
      okText="Tạo"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#d92d20] hover:bg-[#b42318]' }}
    >
      <div className="py-3">
        <label className="text-xs text-slate-500 block mb-1.5 font-medium">Tên thư mục:</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên thư mục..."
          onPressEnter={handleOk}
          autoFocus
        />
      </div>
    </Modal>
  );
};

// 2. MODAL ĐỔI TÊN
interface RenameModalProps {
  item: CloudItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ item, isOpen, onClose, onRename }) => {
  const [name, setName] = useState(item?.name || '');

  React.useEffect(() => {
    if (item) setName(item.name);
  }, [item]);

  const handleOk = () => {
    if (!name.trim()) return;
    onRename(name.trim());
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleOk}
      title={
        <div className="flex items-center gap-2">
          <Edit3 size={18} className="text-[#d92d20]" />
          <span>Đổi tên</span>
        </div>
      }
      okText="Lưu thay đổi"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#d92d20] hover:bg-[#b42318]' }}
    >
      <div className="py-3">
        <label className="text-xs text-slate-500 block mb-1.5 font-medium">Tên mới:</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên mới..."
          onPressEnter={handleOk}
          autoFocus
        />
      </div>
    </Modal>
  );
};

// 3. MODAL XEM TRƯỚC TỆP (FILE PREVIEW MODAL)
interface PreviewModalProps {
  item: CloudItem | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (item: CloudItem) => void;
  onDownload: (item: CloudItem) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  isOpen,
  onClose,
  onShare,
  onDownload,
}) => {
  if (!item) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      title={
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2 truncate">
            <CloudFileIcon type={item.type} size="sm" />
            <span className="truncate text-slate-800 font-semibold">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<Share2 size={13} />}
              onClick={() => onShare(item)}
            >
              Chia sẻ
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<Download size={13} />}
              onClick={() => onDownload(item)}
              className="bg-[#d92d20] hover:bg-[#b42318]"
            >
              Tải xuống
            </Button>
          </div>
        </div>
      }
    >
      <div className="py-4 flex flex-col items-center justify-center min-h-[380px] bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4">
          <CloudFileIcon type={item.type} size="xl" />
        </div>

        <div className="font-semibold text-base text-slate-800 mb-1">{item.name}</div>
        <div className="text-xs text-slate-500 mb-4">
          {item.sizeFormatted} · Cập nhật lần cuối {item.updatedAt} bởi {item.updatedBy}
        </div>

        <div className="max-w-md p-4 bg-white rounded-lg border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 shadow-sm">
          <div className="font-medium text-slate-700">Thông tin nội dung:</div>
          <p>{item.description || 'Tài liệu nghiệp vụ lưu trữ trên không gian Cloud Báo Tuổi Trẻ.'}</p>
          <div className="pt-2 text-[11px] text-slate-400">
            * Tính năng xem trước trực tiếp tài liệu Microsoft Office & PDF tích hợp thông qua Office Online Server nội bộ.
          </div>
        </div>
      </div>
    </Modal>
  );
};
