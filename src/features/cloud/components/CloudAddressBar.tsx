import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Search,
  HardDrive,
  Folder,
  ChevronRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import { CloudItem, CloudNavigationTab } from '../types';

interface CloudAddressBarProps {
  currentTab: CloudNavigationTab;
  currentFolder: CloudItem | null;
  folderPath: CloudItem[];
  canGoBack: boolean;
  canGoForward: boolean;
  canGoUp: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoUp: () => void;
  onRefresh: () => void;
  onNavigateToFolder: (folderId: string | null) => void;
  onNavigateToTab: (tab: CloudNavigationTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onChangeTypeFilter: (type: string) => void;
}

export const CloudAddressBar: React.FC<CloudAddressBarProps> = ({
  currentTab,
  currentFolder,
  folderPath,
  canGoBack,
  canGoForward,
  canGoUp,
  onGoBack,
  onGoForward,
  onGoUp,
  onRefresh,
  onNavigateToFolder,
  onNavigateToTab,
  searchQuery,
  onSearchChange,
  typeFilter,
  onChangeTypeFilter,
}) => {
  // Tiêu đề tương ứng với currentTab
  const getTabLabel = () => {
    switch (currentTab) {
      case 'quick-access':
        return 'Đã ghim';
      case 'recent':
        return 'Tệp gần đây';
      case 'starred':
        return 'Có gắn dấu sao';
      case 'shared-with-me':
        return 'Được chia sẻ với tôi';
      case 'shared-by-me':
        return 'Tôi đã chia sẻ';
      case 'shared-drives':
        return 'Ổ đĩa dùng chung';
      case 'trash':
        return 'Thùng rác';
      case 'my-cloud':
      default:
        return 'Cloud của tôi';
    }
  };

  const filterMenuItems: MenuProps['items'] = [
    { key: 'all', label: 'Tất cả loại tệp', onClick: () => onChangeTypeFilter('all') },
    { type: 'divider' },
    { key: 'pdf', label: 'Tệp PDF (.pdf)', onClick: () => onChangeTypeFilter('pdf') },
    { key: 'docx', label: 'Văn bản Word (.docx)', onClick: () => onChangeTypeFilter('docx') },
    { key: 'xlsx', label: 'Bảng tính Excel (.xlsx)', onClick: () => onChangeTypeFilter('xlsx') },
    { key: 'pptx', label: 'Bài thuyết trình (.pptx)', onClick: () => onChangeTypeFilter('pptx') },
    { key: 'image', label: 'Hình ảnh', onClick: () => onChangeTypeFilter('image') },
    { key: 'archive', label: 'Tệp nén (.zip, .rar)', onClick: () => onChangeTypeFilter('archive') },
  ];

  return (
    <div className="h-11 border-b border-slate-200/90 bg-[#f8fafc]/80 px-3 flex items-center gap-2 select-none">
      {/* Nút điều hướng Navigation Buttons */}
      <div className="flex items-center gap-0.5">
        <Tooltip title="Quay lại (Alt+Left)">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onGoBack}
            className={`p-1.5 rounded-md transition-colors ${
              canGoBack
                ? 'text-slate-700 hover:bg-slate-200/80 active:bg-slate-300'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ArrowLeft size={16} />
          </button>
        </Tooltip>

        <Tooltip title="Tiến tới (Alt+Right)">
          <button
            type="button"
            disabled={!canGoForward}
            onClick={onGoForward}
            className={`p-1.5 rounded-md transition-colors ${
              canGoForward
                ? 'text-slate-700 hover:bg-slate-200/80 active:bg-slate-300'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ArrowRight size={16} />
          </button>
        </Tooltip>

        <Tooltip title="Lên thư mục cha (Alt+Up)">
          <button
            type="button"
            disabled={!canGoUp}
            onClick={onGoUp}
            className={`p-1.5 rounded-md transition-colors ${
              canGoUp
                ? 'text-slate-700 hover:bg-slate-200/80 active:bg-slate-300'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ArrowUp size={16} />
          </button>
        </Tooltip>

        <Tooltip title="Làm mới (F5)">
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-md text-slate-700 hover:bg-slate-200/80 active:bg-slate-300 transition-colors"
          >
            <RotateCw size={15} />
          </button>
        </Tooltip>
      </div>

      {/* Thanh địa chỉ Breadcrumb Address Bar */}
      <div className="flex-1 h-8 bg-white border border-slate-200 rounded-md px-2 flex items-center gap-1.5 shadow-sm overflow-hidden text-[13px]">
        {currentTab === 'my-cloud' ? (
          <>
            <button
              type="button"
              onClick={() => onNavigateToFolder(null)}
              className="flex items-center gap-1 text-slate-700 hover:text-[#d92d20] hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors shrink-0"
            >
              <HardDrive size={15} className="text-[#d92d20]" />
              <span className="font-medium">Cloud của tôi</span>
            </button>

            {folderPath.map((f, idx) => (
              <React.Fragment key={f.id}>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => onNavigateToFolder(f.id)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors truncate max-w-[200px] ${
                    idx === folderPath.length - 1
                      ? 'font-semibold text-slate-900 bg-slate-50'
                      : 'text-slate-700 hover:text-[#d92d20] hover:bg-slate-100'
                  }`}
                >
                  <Folder size={14} className="text-amber-500 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </button>
              </React.Fragment>
            ))}
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold px-1">
            <span>{getTabLabel()}</span>
          </div>
        )}
      </div>

      {/* Thanh tìm kiếm Search Bar */}
      <div className="w-72 h-8 bg-white border border-slate-200 rounded-md px-2.5 flex items-center gap-2 shadow-sm focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-200 transition-all">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Tìm trong ${currentFolder ? currentFolder.name : getTabLabel()}...`}
          className="w-full bg-transparent border-0 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}

        <Dropdown menu={{ items: filterMenuItems }} trigger={['click']} placement="bottomRight">
          <button
            type="button"
            className={`p-1 rounded hover:bg-slate-100 transition-colors ${
              typeFilter !== 'all' ? 'text-[#d92d20] bg-rose-50' : 'text-slate-400'
            }`}
            title="Lọc loại tệp"
          >
            <SlidersHorizontal size={14} />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};
