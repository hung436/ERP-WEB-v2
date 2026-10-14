import React, { useEffect, useRef } from 'react';
import {
  Eye,
  Share2,
  Download,
  Star,
  Edit3,
  Trash2,
  FolderPlus,
  Upload,
  RotateCw,
  Copy,
  Scissors,
  Info,
} from 'lucide-react';
import { CloudItem } from '../types';

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface CloudContextMenuProps {
  position: ContextMenuPosition | null;
  targetItem: CloudItem | null;
  onClose: () => void;
  onOpenItem: (item: CloudItem) => void;
  onShare: (item: CloudItem) => void;
  onDownload: (item: CloudItem) => void;
  onRename: (item: CloudItem) => void;
  onDelete: (item: CloudItem) => void;
  onToggleStar: (item: CloudItem) => void;
  onNewFolder: () => void;
  onUploadFile: () => void;
  onRefresh: () => void;
}

export const CloudContextMenu: React.FC<CloudContextMenuProps> = ({
  position,
  targetItem,
  onClose,
  onOpenItem,
  onShare,
  onDownload,
  onRename,
  onDelete,
  onToggleStar,
  onNewFolder,
  onUploadFile,
  onRefresh,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('contextmenu', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: Math.min(position.y, window.innerHeight - 260),
        left: Math.min(position.x, window.innerWidth - 220),
      }}
      className="fixed z-50 w-52 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-200 py-1.5 text-[13px] text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {targetItem ? (
        // Menu chuột phải khi click vào Item
        <>
          <button
            onClick={() => {
              onOpenItem(targetItem);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors"
          >
            <Eye size={15} />
            <span>{targetItem.type === 'folder' ? 'Mở thư mục' : 'Xem trước'}</span>
          </button>

          <button
            onClick={() => {
              onShare(targetItem);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors font-medium text-[#d92d20]"
          >
            <Share2 size={15} />
            <span>Chia sẻ...</span>
          </button>

          <button
            onClick={() => {
              onToggleStar(targetItem);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-amber-50 hover:text-amber-500 text-left transition-colors"
          >
            <Star
              size={15}
              className={targetItem.isStarred ? 'fill-amber-400 text-amber-500' : ''}
            />
            <span>{targetItem.isStarred ? 'Bỏ gắn sao' : 'Gắn dấu sao'}</span>
          </button>

          {targetItem.type !== 'folder' && (
            <button
              onClick={() => {
                onDownload(targetItem);
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors"
            >
              <Download size={15} />
              <span>Tải xuống</span>
            </button>
          )}

          <div className="h-[1px] bg-slate-100 my-1" />

          <button
            onClick={() => {
              onRename(targetItem);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors"
          >
            <Edit3 size={15} />
            <span>Đổi tên (F2)</span>
          </button>

          <div className="h-[1px] bg-slate-100 my-1" />

          <button
            onClick={() => {
              onDelete(targetItem);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 text-rose-600 text-left transition-colors"
          >
            <Trash2 size={15} />
            <span>Xóa</span>
          </button>
        </>
      ) : (
        // Menu chuột phải khi click vào Vùng trống (Background)
        <>
          <button
            onClick={() => {
              onNewFolder();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors"
          >
            <FolderPlus size={15} className="text-amber-500" />
            <span>Thư mục mới</span>
          </button>

          <button
            onClick={() => {
              onUploadFile();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors"
          >
            <Upload size={15} className="text-[#d92d20]" />
            <span>Tải tệp lên</span>
          </button>

          <div className="h-[1px] bg-slate-100 my-1" />

          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 hover:text-[#d92d20] text-left transition-colors"
          >
            <RotateCw size={15} />
            <span>Làm mới (Refresh)</span>
          </button>
        </>
      )}
    </div>
  );
};
