import React, { useState } from 'react';
import {
  Star,
  Users,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit3,
  Eye,
  Folder,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import { CloudItem, CloudViewMode } from '../types';
import { CloudFileIcon } from './CloudFileIcon';

interface CloudFileListProps {
  items: CloudItem[];
  selectedItems: CloudItem[];
  onSelectItem: (item: CloudItem, e: React.MouseEvent) => void;
  onOpenFolder: (folderId: string) => void;
  onPreviewFile: (item: CloudItem) => void;
  onShare: (item: CloudItem) => void;
  onRename: (item: CloudItem) => void;
  onDelete: (items: CloudItem[]) => void;
  onDownload: (item: CloudItem) => void;
  onToggleStar: (item: CloudItem) => void;
  viewMode: CloudViewMode;
  onContextMenu: (e: React.MouseEvent, item: CloudItem) => void;
  onEmptyAreaContextMenu: (e: React.MouseEvent) => void;
  onDropFiles: (files: FileList) => void;
}

export const CloudFileList: React.FC<CloudFileListProps> = ({
  items,
  selectedItems,
  onSelectItem,
  onOpenFolder,
  onPreviewFile,
  onShare,
  onRename,
  onDelete,
  onDownload,
  onToggleStar,
  viewMode,
  onContextMenu,
  onEmptyAreaContextMenu,
  onDropFiles,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const isSelected = (item: CloudItem) => selectedItems.some((s) => s.id === item.id);

  const handleItemDoubleClick = (item: CloudItem) => {
    if (item.type === 'folder') {
      onOpenFolder(item.id);
    } else {
      onPreviewFile(item);
    }
  };

  const getItemActions = (item: CloudItem): MenuProps['items'] => [
    {
      key: 'open',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Eye size={15} />
          <span>{item.type === 'folder' ? 'Mở thư mục' : 'Xem trước'}</span>
        </div>
      ),
      onClick: () => handleItemDoubleClick(item),
    },
    {
      key: 'share',
      label: (
        <div className="flex items-center gap-2 py-1 text-[#d92d20]">
          <Share2 size={15} />
          <span>Chia sẻ...</span>
        </div>
      ),
      onClick: () => onShare(item),
    },
    {
      key: 'star',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Star size={15} className={item.isStarred ? 'fill-amber-400 text-amber-500' : ''} />
          <span>{item.isStarred ? 'Bỏ gắn sao' : 'Gắn dấu sao'}</span>
        </div>
      ),
      onClick: () => onToggleStar(item),
    },
    {
      key: 'rename',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Edit3 size={15} />
          <span>Đổi tên (F2)</span>
        </div>
      ),
      onClick: () => onRename(item),
    },
    ...(item.type !== 'folder'
      ? [
          {
            key: 'download',
            label: (
              <div className="flex items-center gap-2 py-1">
                <Download size={15} />
                <span>Tải xuống</span>
              </div>
            ),
            onClick: () => onDownload(item),
          },
        ]
      : []),
    { type: 'divider' },
    {
      key: 'delete',
      danger: true,
      label: (
        <div className="flex items-center gap-2 py-1 text-rose-600">
          <Trash2 size={15} />
          <span>Xóa</span>
        </div>
      ),
      onClick: () => onDelete([item]),
    },
  ];

  // Drag and drop upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  // Chia tách folders và files để nhóm hiển thị chuyên nghiệp
  const folders = items.filter((i) => i.type === 'folder');
  const files = items.filter((i) => i.type !== 'folder');

  if (items.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={onEmptyAreaContextMenu}
        className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none"
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <UploadCloud size={32} />
        </div>
        <div className="text-base font-semibold text-slate-700">Thư mục trống</div>
        <p className="text-[13px] text-slate-500 max-w-sm mt-1">
          Kéo thả tệp vào đây hoặc nhấn nút <b className="text-[#d92d20]">Mới</b> để tạo thư mục, tải tệp lên.
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={onEmptyAreaContextMenu}
      className={`flex-1 overflow-y-auto p-4 select-none relative bg-white ${
        isDragOver ? 'bg-rose-50/50 ring-2 ring-[#d92d20] ring-inset' : ''
      }`}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-[#d92d20]/10 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-rose-200 flex items-center gap-3 text-[#d92d20] font-semibold text-base">
            <UploadCloud size={24} className="animate-bounce" />
            <span>Thả tệp vào đây để tải lên Cloud</span>
          </div>
        </div>
      )}

      {viewMode === 'details' ? (
        /* ================= DETAILS VIEW (BẢNG WINDOWS EXPLORER) ================= */
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium text-[12px]">
                <th className="py-2.5 px-3 w-10"></th>
                <th className="py-2.5 px-3 font-semibold">Tên</th>
                <th className="py-2.5 px-3 font-semibold w-40">Ngày sửa đổi</th>
                <th className="py-2.5 px-3 font-semibold w-40">Người sở hữu</th>
                <th className="py-2.5 px-3 font-semibold w-28">Kích thước</th>
                <th className="py-2.5 px-3 font-semibold w-32">Chia sẻ</th>
                <th className="py-2.5 px-3 w-16 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const selected = isSelected(item);

                return (
                  <tr
                    key={item.id}
                    onClick={(e) => onSelectItem(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                      onContextMenu(e, item);
                    }}
                    className={`group cursor-pointer transition-colors ${
                      selected
                        ? 'bg-slate-50/90 text-slate-900'
                        : 'hover:bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    {/* Cột 1: Star & Icon */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(item);
                        }}
                        className={`text-slate-300 hover:text-amber-500 transition-colors ${
                          item.isStarred ? 'text-amber-500' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star size={14} className={item.isStarred ? 'fill-amber-400' : ''} />
                      </button>
                    </td>

                    {/* Cột 2: Tên & Icon File - in đậm vừa phải khi focus */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CloudFileIcon type={item.type} size="sm" />
                        <span className={`truncate ${selected ? 'font-semibold text-slate-900' : 'font-normal text-slate-700'}`}>
                          {item.name}
                        </span>
                        {item.version && item.version > 1 && (
                          <span className="text-[11px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            v{item.version}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột 3: Ngày sửa đổi */}
                    <td className="py-2.5 px-3 text-slate-500 text-[12px]">{item.updatedAt}</td>

                    {/* Cột 4: Chủ sở hữu */}
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {item.owner.name.charAt(0)}
                        </div>
                        <span className={`truncate text-[12px] ${selected ? 'font-semibold text-slate-800' : ''}`}>
                          {item.owner.name}
                        </span>
                      </div>
                    </td>

                    {/* Cột 5: Kích thước */}
                    <td className="py-2.5 px-3 text-slate-500 text-[12px]">
                      {item.type === 'folder' ? '—' : item.sizeFormatted || '—'}
                    </td>

                    {/* Cột 6: Quyền chia sẻ */}
                    <td className="py-2.5 px-3">
                      {item.isShared ? (
                        <div className="flex items-center gap-1 text-[11px] text-[#b42318] bg-[#fef3f2] px-2 py-0.5 rounded-full w-fit font-medium">
                          <Users size={12} />
                          <span>Đã chia sẻ</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chỉ mình tôi</span>
                      )}
                    </td>

                    {/* Cột 7: Thao tác nhanh */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip title="Chia sẻ">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onShare(item);
                            }}
                            className="p-1 text-slate-500 hover:text-[#d92d20] hover:bg-rose-50 rounded transition-colors"
                          >
                            <Share2 size={13} />
                          </button>
                        </Tooltip>

                        <Dropdown menu={{ items: getItemActions(item) }} trigger={['click']}>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                          >
                            <MoreVertical size={13} />
                          </button>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ================= GRID / ICONS VIEW (LƯỚI BIỂU TƯỢNG) ================= */
        <div className="space-y-6">
          {/* Thư mục */}
          {folders.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Thư mục ({folders.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {folders.map((folder) => {
                  const selected = isSelected(folder);

                  return (
                    <div
                      key={folder.id}
                      onClick={(e) => onSelectItem(folder, e)}
                      onDoubleClick={() => handleItemDoubleClick(folder)}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        onContextMenu(e, folder);
                      }}
                      className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-2.5 ${
                        selected
                          ? 'bg-white border-slate-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/70'
                      }`}
                    >
                      <CloudFileIcon type="folder" size="md" />
                      <div className="min-w-0 flex-1">
                        <div className={`text-[13px] truncate ${selected ? 'font-semibold text-slate-900' : 'font-normal text-slate-700'}`}>
                          {folder.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {folder.updatedAt.split(' ')[0]}
                        </div>
                      </div>

                      {folder.isStarred && (
                        <Star size={12} className="text-amber-500 fill-amber-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tệp tin */}
          {files.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Tệp tin ({files.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {files.map((file) => {
                  const selected = isSelected(file);

                  return (
                    <div
                      key={file.id}
                      onClick={(e) => onSelectItem(file, e)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        onContextMenu(e, file);
                      }}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-40 ${
                        selected
                          ? 'bg-white border-slate-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Top icon and star */}
                      <div className="flex items-start justify-between">
                        <CloudFileIcon type={file.type} size="lg" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(file);
                          }}
                          className={`text-slate-300 hover:text-amber-500 transition-colors ${
                            file.isStarred ? 'text-amber-500' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Star size={15} className={file.isStarred ? 'fill-amber-400' : ''} />
                        </button>
                      </div>

                      {/* File name and info - in đậm nhẹ khi focus */}
                      <div className="min-w-0 mt-2">
                        <div
                          className={`text-[13px] line-clamp-2 leading-tight ${
                            selected ? 'font-semibold text-slate-900' : 'font-normal text-slate-700'
                          }`}
                          title={file.name}
                        >
                          {file.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{file.sizeFormatted}</span>
                          <span>{file.updatedAt.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
