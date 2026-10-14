import React, { useState, useMemo, useRef, useEffect } from 'react';
import { message } from 'antd';
import { CloudItem, CloudNavigationTab, CloudSortField, CloudSortOrder, CloudViewMode } from './types';
import { INITIAL_CLOUD_ITEMS } from './mockData';
import { CloudExplorerMenu } from './components/CloudExplorerMenu';
import { CloudCommandBar } from './components/CloudCommandBar';
import { CloudAddressBar } from './components/CloudAddressBar';
import { CloudFileList } from './components/CloudFileList';
import { CloudDetailsPane } from './components/CloudDetailsPane';
import { CloudContextMenu } from './components/CloudContextMenu';
import { CloudShareModal } from './components/CloudShareModal';
import { NewFolderModal, RenameModal, PreviewModal } from './components/CloudModals';

export const CloudPage: React.FC = () => {
  // 1. Data State
  const [items, setItems] = useState<CloudItem[]>(INITIAL_CLOUD_ITEMS);

  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState<CloudNavigationTab>('my-cloud');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // History stack for Back/Forward navigation
  const [history, setHistory] = useState<Array<{ tab: CloudNavigationTab; folderId: string | null }>>([
    { tab: 'my-cloud', folderId: null },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // 3. Selection State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showDetailsPane, setShowDetailsPane] = useState<boolean>(false);
  const [detailsPaneTab, setDetailsPaneTab] = useState<'details' | 'sharing' | 'activities'>('details');

  // 4. View & Sort State
  const [viewMode, setViewMode] = useState<CloudViewMode>('details');
  const [sortField, setSortField] = useState<CloudSortField>('name');
  const [sortOrder, setSortOrder] = useState<CloudSortOrder>('asc');

  // 5. Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // 6. Modals State
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<CloudItem | null>(null);
  const [sharingItem, setSharingItem] = useState<CloudItem | null>(null);
  const [previewingItem, setPreviewingItem] = useState<CloudItem | null>(null);

  // 7. Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<CloudItem | null>(null);

  // Hidden File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khóa viewport và loại bỏ scroll bên ngoài khi ở trang Cloud
  useEffect(() => {
    document.body.classList.add('cloud-page-open');
    return () => {
      document.body.classList.remove('cloud-page-open');
    };
  }, []);

  // Điều hướng có lưu lịch sử
  const navigateTo = (tab: CloudNavigationTab, folderId: string | null) => {
    setCurrentTab(tab);
    setCurrentFolderId(folderId);
    setSelectedItemIds([]);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ tab, folderId });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentTab(prev.tab);
      setCurrentFolderId(prev.folderId);
      setSelectedItemIds([]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentTab(next.tab);
      setCurrentFolderId(next.folderId);
      setSelectedItemIds([]);
    }
  };

  const handleGoUp = () => {
    if (currentTab === 'my-cloud' && currentFolderId) {
      const currentFolder = items.find((i) => i.id === currentFolderId);
      navigateTo('my-cloud', currentFolder?.parentId || null);
    }
  };

  // Tính toán Breadcrumbs Path
  const currentFolder = useMemo(() => {
    return items.find((i) => i.id === currentFolderId) || null;
  }, [items, currentFolderId]);

  const folderPath = useMemo(() => {
    const path: CloudItem[] = [];
    let curId = currentFolderId;
    while (curId) {
      const f = items.find((i) => i.id === curId);
      if (f) {
        path.unshift(f);
        curId = f.parentId;
      } else {
        break;
      }
    }
    return path;
  }, [items, currentFolderId]);

  // Lọc danh sách items theo tab và filter hiện tại
  const visibleItems = useMemo(() => {
    let filtered = [...items];

    // 1. Phân loại theo Tab
    if (currentTab === 'trash') {
      filtered = filtered.filter((i) => i.isDeleted);
    } else {
      // Các tab khác không hiển thị mục đã xóa
      filtered = filtered.filter((i) => !i.isDeleted);

      if (currentTab === 'quick-access') {
        filtered = filtered.filter((i) => i.isStarred || (i.sharedWith && i.sharedWith.length > 0));
      } else if (currentTab === 'starred') {
        filtered = filtered.filter((i) => i.isStarred);
      } else if (currentTab === 'recent') {
        // Tệp gần đây sắp theo thời gian
        filtered = filtered.filter((i) => i.type !== 'folder');
      } else if (currentTab === 'shared-with-me') {
        filtered = filtered.filter((i) => i.owner.id !== 'u1' && i.isShared);
      } else if (currentTab === 'shared-by-me') {
        filtered = filtered.filter((i) => i.owner.id === 'u1' && i.isShared);
      } else if (currentTab === 'shared-drives') {
        filtered = filtered.filter((i) => i.generalAccess === 'domain');
      } else if (currentTab === 'my-cloud') {
        // Trong My Cloud: chỉ hiển thị mục có parentId khớp
        filtered = filtered.filter((i) => i.parentId === currentFolderId);
      }
    }

    // 2. Tìm kiếm (Search Query)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.updatedBy.toLowerCase().includes(q)
      );
    }

    // 3. Lọc định dạng (Type Filter)
    if (typeFilter !== 'all') {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    // 4. Sắp xếp (Sorting)
    filtered.sort((a, b) => {
      // Ưu tiên Thư mục lên trước nếu sắp xếp theo tên
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let compare = 0;
      if (sortField === 'name') {
        compare = a.name.localeCompare(b.name, 'vi');
      } else if (sortField === 'updatedAt') {
        compare = a.updatedAt.localeCompare(b.updatedAt);
      } else if (sortField === 'owner') {
        compare = (a.owner?.name || '').localeCompare(b.owner?.name || '', 'vi');
      } else if (sortField === 'size') {
        compare = (a.size || 0) - (b.size || 0);
      } else if (sortField === 'type') {
        compare = a.type.localeCompare(b.type);
      }
      return sortOrder === 'asc' ? compare : -compare;
    });

    return filtered;
  }, [items, currentTab, currentFolderId, searchQuery, typeFilter, sortField, sortOrder]);

  // Các mục đang được chọn
  const selectedItems = useMemo(() => {
    return items.filter((i) => selectedItemIds.includes(i.id));
  }, [items, selectedItemIds]);

  const singleSelectedItem = selectedItems.length === 1 ? selectedItems[0] : null;

  // Actions
  const handleSelectItem = (item: CloudItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select với Ctrl
      setSelectedItemIds((prev) => {
        const next = prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id];
        if (next.length > 0) {
          setShowDetailsPane(true);
        }
        return next;
      });
    } else {
      // Single select thông thường: Chọn và tự động mở ngăn thông tin chi tiết
      setSelectedItemIds([item.id]);
      setShowDetailsPane(true);
    }
  };

  const handleOpenFolder = (folderId: string) => {
    navigateTo('my-cloud', folderId);
  };

  const handleToggleStar = (item: CloudItem) => {
    const updated = items.map((i) => (i.id === item.id ? { ...i, isStarred: !i.isStarred } : i));
    setItems(updated);
    message.success(
      item.isStarred
        ? `Đã bỏ gắn sao "${item.name}"`
        : `Đã gắn dấu sao "${item.name}"`
    );
  };

  const handleDeleteItems = (targets: CloudItem[]) => {
    const ids = targets.map((t) => t.id);
    if (currentTab === 'trash') {
      // Xóa vĩnh viễn
      setItems(items.filter((i) => !ids.includes(i.id)));
      setSelectedItemIds([]);
      message.success(`Đã xóa vĩnh viễn ${targets.length} mục`);
    } else {
      // Chuyển vào thùng rác
      const updated = items.map((i) =>
        ids.includes(i.id)
          ? { ...i, isDeleted: true, deletedAt: new Date().toISOString() }
          : i
      );
      setItems(updated);
      setSelectedItemIds([]);
      message.success(`Đã xóa ${targets.length} mục`);
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: CloudItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      parentId: currentTab === 'my-cloud' ? currentFolderId : null,
      updatedAt: new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
      updatedBy: 'Nguyễn Minh Anh',
      owner: { id: 'u1', name: 'Nguyễn Minh Anh', email: 'minhanh.nguyen@tuoitre.com.vn' },
    };
    setItems([newFolder, ...items]);
    message.success(`Đã tạo thư mục "${name}"`);
  };

  const handleRenameItem = (newName: string) => {
    if (!renamingItem) return;
    const updated = items.map((i) =>
      i.id === renamingItem.id ? { ...i, name: newName } : i
    );
    setItems(updated);
    setRenamingItem(null);
    message.success(`Đã đổi tên thành "${newName}"`);
  };

  const handleUpdateShare = (updatedItem: CloudItem) => {
    setItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    message.success(`Đã cập nhật quyền chia sẻ cho "${updatedItem.name}"`);
  };

  const handleOpenShare = (item: CloudItem) => {
    setSelectedItemIds([item.id]);
    setDetailsPaneTab('sharing');
    setShowDetailsPane(true);
  };

  const handleDownload = (item: CloudItem) => {
    message.loading({ content: `Đang tải xuống "${item.name}"...`, key: 'download' });
    setTimeout(() => {
      message.success({ content: `Tải xuống hoàn tất!`, key: 'download' });
    }, 1000);
  };

  // Upload tệp
  const handleUploadFiles = (fileList: FileList) => {
    const newUploads: CloudItem[] = Array.from(fileList).map((f, idx) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      let type: CloudItem['type'] = 'other';
      if (['pdf'].includes(ext || '')) type = 'pdf';
      else if (['doc', 'docx'].includes(ext || '')) type = 'docx';
      else if (['xls', 'xlsx'].includes(ext || '')) type = 'xlsx';
      else if (['ppt', 'pptx'].includes(ext || '')) type = 'pptx';
      else if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext || '')) type = 'image';
      else if (['zip', 'rar', '7z'].includes(ext || '')) type = 'archive';

      return {
        id: `upload-${Date.now()}-${idx}`,
        name: f.name,
        type,
        parentId: currentTab === 'my-cloud' ? currentFolderId : null,
        size: f.size,
        sizeFormatted: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        updatedAt: 'Vừa xong',
        updatedBy: 'Nguyễn Minh Anh',
        owner: { id: 'u1', name: 'Nguyễn Minh Anh', email: 'minhanh.nguyen@tuoitre.com.vn' },
        version: 1,
      };
    });

    setItems([...newUploads, ...items]);
    message.success(`Đã tải lên ${newUploads.length} tệp thành công!`);
  };

  // Trigger file upload dialog
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Context Menu handlers
  const handleItemContextMenu = (e: React.MouseEvent, item: CloudItem) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuItem(item);
    setSelectedItemIds([item.id]);
  };

  const handleEmptyContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuItem(null);
  };

  const handleToggleSort = (field: CloudSortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="cloud-module-page h-full min-h-0 flex flex-col overflow-hidden font-sans">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Main Window Container - Cố định hoàn toàn trong màn hình */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden min-h-0">
        {/* 1. Command Bar (Ribbon Windows 11 Explorer) */}
        <CloudCommandBar
        selectedItems={selectedItems}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        sortField={sortField}
        sortOrder={sortOrder}
        onChangeSort={handleToggleSort}
        onNewFolder={() => setIsNewFolderOpen(true)}
        onUploadFile={triggerFileInput}
        onShare={(item) => handleOpenShare(item)}
        onRename={(item) => setRenamingItem(item)}
        onDelete={handleDeleteItems}
        onDownload={handleDownload}
        onToggleStar={handleToggleStar}
        showDetailsPane={showDetailsPane}
        onToggleDetailsPane={() => setShowDetailsPane(!showDetailsPane)}
      />

      {/* 2. Address Bar (Breadcrumbs & Search) */}
      <CloudAddressBar
        currentTab={currentTab}
        currentFolder={currentFolder}
        folderPath={folderPath}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        canGoUp={Boolean(currentTab === 'my-cloud' && currentFolderId)}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoUp={handleGoUp}
        onRefresh={() => message.info('Đã làm mới danh mục')}
        onNavigateToFolder={(folderId) => navigateTo('my-cloud', folderId)}
        onNavigateToTab={(tab) => navigateTo(tab, null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onChangeTypeFilter={setTypeFilter}
      />

      {/* 3. Main Explorer Workspace (Menu Left + Content Center + Details Right) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Menu bên trái phong cách Windows Explorer */}
        <CloudExplorerMenu
          currentTab={currentTab}
          currentFolderId={currentFolderId}
          items={items}
          onSelectTab={(tab) => navigateTo(tab, null)}
          onSelectFolder={(folderId) => navigateTo('my-cloud', folderId)}
          onOpenNewModal={() => setIsNewFolderOpen(true)}
        />

        {/* Khu vực danh sách tệp & thư mục ở giữa */}
        <CloudFileList
          items={visibleItems}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onOpenFolder={handleOpenFolder}
          onPreviewFile={(item) => setPreviewingItem(item)}
          onShare={(item) => handleOpenShare(item)}
          onRename={(item) => setRenamingItem(item)}
          onDelete={handleDeleteItems}
          onDownload={handleDownload}
          onToggleStar={handleToggleStar}
          viewMode={viewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onChangeSort={handleToggleSort}
          onContextMenu={handleItemContextMenu}
          onEmptyAreaContextMenu={handleEmptyContextMenu}
          onDropFiles={handleUploadFiles}
        />

        {/* Ngăn thông tin chi tiết & Xem trước bên phải */}
        {showDetailsPane && (
          <CloudDetailsPane
            selectedItem={singleSelectedItem}
            initialTab={detailsPaneTab}
            onClose={() => setShowDetailsPane(false)}
            onPreview={(item) => setPreviewingItem(item)}
            onDownload={handleDownload}
            onToggleStar={handleToggleStar}
            onUpdateItem={handleUpdateShare}
          />
        )}
      </div>
      </div>

      {/* Context Menu (Chuột phải) */}
      <CloudContextMenu
        position={contextMenuPos}
        targetItem={contextMenuItem}
        onClose={() => setContextMenuPos(null)}
        onOpenItem={(item) => {
          if (item.type === 'folder') handleOpenFolder(item.id);
          else setPreviewingItem(item);
        }}
        onShare={(item) => handleOpenShare(item)}
        onDownload={handleDownload}
        onRename={(item) => setRenamingItem(item)}
        onDelete={(item) => handleDeleteItems([item])}
        onToggleStar={handleToggleStar}
        onNewFolder={() => setIsNewFolderOpen(true)}
        onUploadFile={triggerFileInput}
        onRefresh={() => message.info('Đã làm mới danh mục')}
      />

      {/* Modal Chia sẻ Google Drive */}
      <CloudShareModal
        item={sharingItem}
        isOpen={Boolean(sharingItem)}
        onClose={() => setSharingItem(null)}
        onUpdateShare={handleUpdateShare}
      />

      {/* Modal Tạo thư mục mới */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      {/* Modal Đổi tên */}
      <RenameModal
        item={renamingItem}
        isOpen={Boolean(renamingItem)}
        onClose={() => setRenamingItem(null)}
        onRename={handleRenameItem}
      />

      {/* Modal Xem trước tệp */}
      <PreviewModal
        item={previewingItem}
        isOpen={Boolean(previewingItem)}
        onClose={() => setPreviewingItem(null)}
        onShare={(item) => setSharingItem(item)}
        onDownload={handleDownload}
      />
    </div>
  );
};
