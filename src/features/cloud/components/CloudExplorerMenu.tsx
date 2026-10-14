import React, { useState } from 'react';
import {
  Star,
  Clock,
  HardDrive,
  Users,
  Share2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Pin,
  Folder,
  FolderOpen,
  PieChart,
} from 'lucide-react';
import { Progress } from 'antd';
import { CloudItem, CloudNavigationTab } from '../types';

interface CloudExplorerMenuProps {
  currentTab: CloudNavigationTab;
  currentFolderId: string | null;
  items: CloudItem[];
  onSelectTab: (tab: CloudNavigationTab) => void;
  onSelectFolder: (folderId: string | null) => void;
  onOpenNewModal?: () => void;
}

export const CloudExplorerMenu: React.FC<CloudExplorerMenuProps> = ({
  currentTab,
  currentFolderId,
  items,
  onSelectTab,
  onSelectFolder,
  onOpenNewModal,
}) => {
  // Trạng thái mở/đóng các nhánh thư mục trong My Cloud
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-work-docs': true,
  });

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Lấy tất cả các thư mục không bị xóa
  const allFolders = items.filter((item) => item.type === 'folder' && !item.isDeleted);

  // Đệ quy dựng cây thư mục
  const renderFolderTree = (parentId: string | null, level = 0) => {
    const subFolders = allFolders.filter((f) => f.parentId === parentId);
    if (subFolders.length === 0) return null;

    return (
      <div className="flex flex-col">
        {subFolders.map((folder) => {
          const hasChildren = allFolders.some((f) => f.parentId === folder.id);
          const isExpanded = expandedFolders[folder.id];
          const isSelected = currentTab === 'my-cloud' && currentFolderId === folder.id;

          return (
            <div key={folder.id} className="flex flex-col">
              <div
                onClick={() => {
                  onSelectTab('my-cloud');
                  onSelectFolder(folder.id);
                }}
                style={{ paddingLeft: `${14 + level * 16}px` }}
                className={`group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer text-[13px] transition-colors select-none ${
                  isSelected
                    ? 'font-semibold text-slate-900 bg-slate-100'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => toggleFolderExpand(folder.id, e)}
                      className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-transform"
                    >
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                  ) : (
                    <span className="w-4" />
                  )}

                  {isExpanded ? (
                    <FolderOpen size={16} className="text-amber-500 fill-amber-300/40 shrink-0" />
                  ) : (
                    <Folder size={16} className="text-amber-500 fill-amber-300/30 shrink-0" />
                  )}

                  <span className={`truncate ${isSelected ? 'font-semibold text-slate-900' : ''}`}>{folder.name}</span>
                </div>

                {folder.isStarred && (
                  <Star size={11} className="text-amber-500 fill-amber-400 shrink-0 ml-1" />
                )}
              </div>

              {hasChildren && isExpanded && renderFolderTree(folder.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // Tính số lượng rác
  const trashCount = items.filter((i) => i.isDeleted).length;
  const starredCount = items.filter((i) => i.isStarred && !i.isDeleted).length;

  return (
    <aside className="w-[260px] shrink-0 border-r border-slate-200/90 bg-white/95 flex flex-col h-full select-none text-[13px]">
      {/* Navigation Tree Pane */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-4">
        {/* Phân vùng 1: Quick Access (Truy cập nhanh) */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
            <span>Truy cập nhanh</span>
            <Pin size={11} className="text-slate-400" />
          </div>
          <div className="space-y-0.5">

            <button
              type="button"
              onClick={() => onSelectTab('recent')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentTab === 'recent'
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={15} className={currentTab === 'recent' ? 'text-[#d92d20]' : 'text-slate-500'} />
                <span className={currentTab === 'recent' ? 'font-semibold' : ''}>Tệp gần đây</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('starred')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentTab === 'starred'
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star size={15} className="text-amber-500 fill-amber-400/40" />
                <span className={currentTab === 'starred' ? 'font-semibold' : ''}>Có gắn dấu sao</span>
              </div>
              {starredCount > 0 && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 font-medium">
                  {starredCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Phân vùng 2: My Cloud (Cây thư mục cá nhân) */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
            <span>Không gian cá nhân</span>
            <HardDrive size={11} className="text-slate-400" />
          </div>
          <div>
            <div
              onClick={() => {
                onSelectTab('my-cloud');
                onSelectFolder(null); // Root folder
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                currentTab === 'my-cloud' && currentFolderId === null
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive size={15} className={currentTab === 'my-cloud' && currentFolderId === null ? 'text-[#d92d20]' : 'text-slate-600'} />
                <span className={currentTab === 'my-cloud' && currentFolderId === null ? 'font-semibold' : ''}>Cloud của tôi</span>
              </div>
            </div>

            {/* Cây thư mục con */}
            <div className="mt-0.5">{renderFolderTree(null, 0)}</div>
          </div>
        </div>

        {/* Phân vùng 3: Chia sẻ & Hợp tác (Google Drive features) */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
            <span>Chia sẻ & Cộng tác</span>
            <Users size={11} className="text-slate-400" />
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onSelectTab('shared-with-me')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentTab === 'shared-with-me'
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={15} className={currentTab === 'shared-with-me' ? 'text-[#d92d20]' : 'text-slate-600'} />
                <span className={currentTab === 'shared-with-me' ? 'font-semibold' : ''}>Được chia sẻ với tôi</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('shared-by-me')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentTab === 'shared-by-me'
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Share2 size={15} className={currentTab === 'shared-by-me' ? 'text-[#d92d20]' : 'text-slate-600'} />
                <span className={currentTab === 'shared-by-me' ? 'font-semibold' : ''}>Tôi đã chia sẻ</span>
              </div>
            </button>
          </div>
        </div>

        {/* Phân vùng 4: Thùng rác */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            <span>Hệ thống</span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onSelectTab('trash')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentTab === 'trash'
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 size={15} className="text-rose-500" />
                <span className={currentTab === 'trash' ? 'font-semibold' : ''}>Thùng rác</span>
              </div>
              {trashCount > 0 && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-100 text-[#b42318] font-medium">
                  {trashCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Thước đo dung lượng ở đáy menu - Tông màu Đỏ Tuổi Trẻ */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
        <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-600">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <PieChart size={13} className="text-[#d92d20]" /> Dung lượng
          </span>
          <span className="font-semibold text-slate-800">12.8 GB / 50 GB</span>
        </div>
        <Progress percent={25.6} strokeColor="#d92d20" size="small" showInfo={false} />
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Đã dùng 25%</span>
          <button
            type="button"
            className="text-[#d92d20] hover:text-[#b42318] hover:underline font-semibold"
          >
            Dọn dẹp
          </button>
        </div>
      </div>
    </aside>
  );
};
