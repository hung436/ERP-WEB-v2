import React from 'react';
import {
  Plus,
  Scissors,
  Copy,
  Clipboard,
  Edit3,
  Share2,
  Trash2,
  Download,
  ArrowUpDown,
  LayoutGrid,
  List,
  Info,
  FolderPlus,
  Upload,
  FilePlus,
  Star,
  Check,
} from 'lucide-react';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import { CloudItem, CloudSortField, CloudSortOrder, CloudViewMode } from '../types';

interface CloudCommandBarProps {
  selectedItems: CloudItem[];
  viewMode: CloudViewMode;
  onChangeViewMode: (mode: CloudViewMode) => void;
  sortField: CloudSortField;
  sortOrder: CloudSortOrder;
  onChangeSort: (field: CloudSortField) => void;
  onNewFolder: () => void;
  onUploadFile: () => void;
  onShare: (item: CloudItem) => void;
  onRename: (item: CloudItem) => void;
  onDelete: (items: CloudItem[]) => void;
  onDownload: (item: CloudItem) => void;
  onToggleStar: (item: CloudItem) => void;
  showDetailsPane: boolean;
  onToggleDetailsPane: () => void;
}

export const CloudCommandBar: React.FC<CloudCommandBarProps> = ({
  selectedItems,
  viewMode,
  onChangeViewMode,
  sortField,
  sortOrder,
  onChangeSort,
  onNewFolder,
  onUploadFile,
  onShare,
  onRename,
  onDelete,
  onDownload,
  onToggleStar,
  showDetailsPane,
  onToggleDetailsPane,
}) => {
  const hasSelection = selectedItems.length > 0;
  const singleSelection = selectedItems.length === 1 ? selectedItems[0] : null;

  // Menu Dropdown cho nút "+ Mới"
  const newMenuItems: MenuProps['items'] = [
    {
      key: 'new-folder',
      label: (
        <div className="flex items-center gap-2 py-1">
          <FolderPlus size={16} className="text-amber-500" />
          <span>Thư mục mới</span>
          <span className="ml-auto text-xs text-slate-400">Ctrl+Shift+N</span>
        </div>
      ),
      onClick: onNewFolder,
    },
    { type: 'divider' },
    {
      key: 'upload-file',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Upload size={16} className="text-[#d92d20]" />
          <span>Tải tệp lên</span>
        </div>
      ),
      onClick: onUploadFile,
    },
    {
      key: 'upload-folder',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Upload size={16} className="text-indigo-500" />
          <span>Tải thư mục lên</span>
        </div>
      ),
      onClick: onUploadFile,
    },
    { type: 'divider' },
    {
      key: 'new-doc',
      label: (
        <div className="flex items-center gap-2 py-1">
          <FilePlus size={16} className="text-blue-600" />
          <span>Văn bản Word mới</span>
        </div>
      ),
      onClick: onNewFolder,
    },
    {
      key: 'new-sheet',
      label: (
        <div className="flex items-center gap-2 py-1">
          <FilePlus size={16} className="text-emerald-600" />
          <span>Bảng tính Excel mới</span>
        </div>
      ),
      onClick: onNewFolder,
    },
  ];

  // Menu Dropdown cho Sắp xếp
  const sortMenuItems: MenuProps['items'] = [
    {
      key: 'name',
      label: (
        <div className="flex items-center justify-between w-36 py-0.5">
          <span>Tên</span>
          {sortField === 'name' && <Check size={14} className="text-[#d92d20]" />}
        </div>
      ),
      onClick: () => onChangeSort('name'),
    },
    {
      key: 'updatedAt',
      label: (
        <div className="flex items-center justify-between w-36 py-0.5">
          <span>Ngày sửa đổi</span>
          {sortField === 'updatedAt' && <Check size={14} className="text-[#d92d20]" />}
        </div>
      ),
      onClick: () => onChangeSort('updatedAt'),
    },
    {
      key: 'type',
      label: (
        <div className="flex items-center justify-between w-36 py-0.5">
          <span>Loại tệp</span>
          {sortField === 'type' && <Check size={14} className="text-[#d92d20]" />}
        </div>
      ),
      onClick: () => onChangeSort('type'),
    },
    {
      key: 'size',
      label: (
        <div className="flex items-center justify-between w-36 py-0.5">
          <span>Kích thước</span>
          {sortField === 'size' && <Check size={14} className="text-[#d92d20]" />}
        </div>
      ),
      onClick: () => onChangeSort('size'),
    },
  ];

  return (
    <div className="h-12 border-b border-slate-200/90 bg-white/95 px-3 flex items-center justify-between select-none">
      {/* Cụm bên trái: Nút New và các thao tác tệp */}
      <div className="flex items-center gap-1">
        {/* Nút + Mới với màu đỏ Tuổi Trẻ */}
        <Dropdown menu={{ items: newMenuItems }} trigger={['click']} placement="bottomLeft">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#d92d20] hover:bg-[#b42318] text-white font-medium text-[13px] shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Mới</span>
          </button>
        </Dropdown>

        <div className="h-5 w-[1px] bg-slate-200 mx-1.5" />

        {/* Nút Cắt / Chép / Dán */}
        <div className="flex items-center gap-0.5">
          <Tooltip title="Cắt (Ctrl+X)">
            <button
              disabled={!hasSelection}
              className={`p-1.5 rounded-md transition-colors ${
                hasSelection
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Scissors size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Sao chép (Ctrl+C)">
            <button
              disabled={!hasSelection}
              className={`p-1.5 rounded-md transition-colors ${
                hasSelection
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Copy size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Dán (Ctrl+V)">
            <button
              disabled={true}
              className="p-1.5 rounded-md text-slate-300 cursor-not-allowed"
            >
              <Clipboard size={16} />
            </button>
          </Tooltip>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 mx-1.5" />

        {/* Nút Đổi tên, Chia sẻ, Tải xuống, Xóa */}
        <div className="flex items-center gap-0.5">
          <Tooltip title="Đổi tên (F2)">
            <button
              disabled={!singleSelection}
              onClick={() => singleSelection && onRename(singleSelection)}
              className={`p-1.5 rounded-md transition-colors ${
                singleSelection
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Edit3 size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Chia sẻ (Share)">
            <button
              disabled={!singleSelection}
              onClick={() => singleSelection && onShare(singleSelection)}
              className={`p-1.5 rounded-md transition-colors ${
                singleSelection
                  ? 'text-slate-700 hover:bg-rose-50 hover:text-[#d92d20]'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Share2 size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Tải xuống">
            <button
              disabled={!singleSelection || singleSelection.type === 'folder'}
              onClick={() => singleSelection && onDownload(singleSelection)}
              className={`p-1.5 rounded-md transition-colors ${
                singleSelection && singleSelection.type !== 'folder'
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Download size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Gắn dấu sao">
            <button
              disabled={!singleSelection}
              onClick={() => singleSelection && onToggleStar(singleSelection)}
              className={`p-1.5 rounded-md transition-colors ${
                singleSelection
                  ? singleSelection.isStarred
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-amber-500'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Star
                size={16}
                className={singleSelection?.isStarred ? 'fill-amber-400' : ''}
              />
            </button>
          </Tooltip>

          <Tooltip title="Xóa (Delete)">
            <button
              disabled={!hasSelection}
              onClick={() => onDelete(selectedItems)}
              className={`p-1.5 rounded-md transition-colors ${
                hasSelection
                  ? 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Cụm bên phải: Sắp xếp, Chế độ xem & Bảng chi tiết */}
      <div className="flex items-center gap-1.5">
        {/* Nút Sắp xếp */}
        <Dropdown menu={{ items: sortMenuItems }} trigger={['click']} placement="bottomRight">
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-700 hover:bg-slate-100 text-[13px] transition-colors"
          >
            <ArrowUpDown size={15} />
            <span>Sắp xếp</span>
          </button>
        </Dropdown>

        {/* Nút View Mode */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
          <Tooltip title="Xem dạng chi tiết (Details)">
            <button
              type="button"
              onClick={() => onChangeViewMode('details')}
              className={`p-1 rounded transition-all ${
                viewMode === 'details'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List size={15} />
            </button>
          </Tooltip>
          <Tooltip title="Xem dạng lưới (Icons / Grid)">
            <button
              type="button"
              onClick={() => onChangeViewMode('grid')}
              className={`p-1 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </Tooltip>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 mx-1" />

        {/* Bật/Tắt Ngăn chi tiết */}
        <Tooltip title={showDetailsPane ? 'Ẩn thông tin chi tiết' : 'Hiện thông tin chi tiết'}>
          <button
            type="button"
            onClick={onToggleDetailsPane}
            className={`p-1.5 rounded-md transition-colors ${
              showDetailsPane
                ? 'bg-rose-50 text-[#d92d20]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Info size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
