import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  message,
  Checkbox,
  DatePicker,
  Radio,
  Tooltip,
  QRCode,
  Modal,
  Segmented,
  Tag as AntTag,
} from 'antd';
import {
  X,
  Share2,
  Download,
  Eye,
  Star,
  Users,
  Clock,
  HardDrive,
  FileText,
  ShieldCheck,
  Calendar,
  User,
  Link2,
  Settings,
  Trash2,
  Copy,
  Info,
  QrCode,
  Folder,
  Tag,
  MessageSquare,
  Activity,
  Plus,
  Globe,
  Lock,
  Pencil,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  CloudItem,
  CloudSharedUser,
  CloudPublicLink,
  CloudPublicLinkPermission,
} from '../types';
import { CloudFileIcon } from './CloudFileIcon';

interface CloudDetailsPaneProps {
  selectedItem: CloudItem | null;
  onClose: () => void;
  onPreview: (item: CloudItem) => void;
  onShare?: (item: CloudItem) => void;
  onDownload: (item: CloudItem) => void;
  onToggleStar: (item: CloudItem) => void;
  onUpdateItem?: (item: CloudItem) => void;
  initialTab?: 'details' | 'sharing' | 'activities';
}

export const CloudDetailsPane: React.FC<CloudDetailsPaneProps> = ({
  selectedItem,
  onClose,
  onPreview,
  onDownload,
  onToggleStar,
  onUpdateItem,
  initialTab = 'details',
}) => {
  // 3 Tab tinh gọn, chuẩn UX: Chi tiết (Details), Chia sẻ (Sharing), Hoạt động (Activities)
  const [activeTab, setActiveTab] = useState<'details' | 'sharing' | 'activities'>(initialTab);

  // Đồng bộ tab khi prop initialTab thay đổi
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Input tìm kiếm / thêm người & nhóm
  const [newShareInput, setNewShareInput] = useState('');

  // ID của user đang mở bảng quyền chi tiết
  const [expandedUserId, setExpandedUserId] = useState<string | null>('u-nm');

  // Input bình luận nhanh
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: 'c-1',
      author: 'Nguyễn Minh Anh',
      text: 'Tài liệu chuẩn đã được Ban Biên tập phê duyệt, sẵn sàng chia sẻ cho các ban chuyên môn.',
      time: 'Hôm qua lúc 15:30',
    },
  ]);

  // Modal tạo / chỉnh sửa liên kết công khai
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('Liên kết công khai');
  const [newLinkPermission, setNewLinkPermission] = useState<CloudPublicLinkPermission>('download_view');
  const [newLinkPassword, setNewLinkPassword] = useState('');
  const [newLinkExpiration, setNewLinkExpiration] = useState<string | null>(null);

  // Popup QR Code
  const [activeQrLink, setActiveQrLink] = useState<CloudPublicLink | null>(null);

  if (!selectedItem) {
    return (
      <aside className="w-[360px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full p-6 text-center select-none text-[13px] text-slate-500">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-[14px]">Thông tin chi tiết</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="my-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
            <FileText size={26} />
          </div>
          <div className="font-medium text-slate-700 text-sm">Chưa chọn tệp nào</div>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
            Chọn một tệp hoặc thư mục để xem trước, quản lý chia sẻ và kiểm tra thông tin chi tiết
          </p>
        </div>
      </aside>
    );
  }

  // Danh sách người được chia sẻ
  const sharedUsers: CloudSharedUser[] =
    selectedItem.sharedWith && selectedItem.sharedWith.length > 0
      ? selectedItem.sharedWith
      : [
          {
            id: 'u-vc',
            name: 'Văn Chương',
            email: 'vanchuong@tuoitre.com.vn',
            role: 'editor',
            permissions: { canShare: true, canEdit: true, create: true, change: true, delete: false },
          },
          {
            id: 'u-td',
            name: 'Thành Danh',
            email: 'thanhdanh@tuoitre.com.vn',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
            role: 'editor',
            permissions: { canShare: false, canEdit: true, create: true, change: true, delete: false },
          },
          {
            id: 'u-nm',
            name: 'Nhật Minh',
            email: 'nhatminh@tuoitre.com.vn',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            role: 'editor',
            permissions: { canShare: true, canEdit: true, create: true, change: true, delete: true },
          },
          {
            id: 'u-hn',
            name: 'Hoài Nam',
            email: 'hoainam@tuoitre.com.vn',
            role: 'viewer',
            permissions: { canShare: false, canEdit: false, create: false, change: false, delete: false },
          },
        ];

  // Danh sách Public Links
  const publicLinks: CloudPublicLink[] =
    selectedItem.publicLinks && selectedItem.publicLinks.length > 0
      ? selectedItem.publicLinks
      : [
          {
            id: 'pl-default-1',
            name: 'Liên kết công khai',
            url: `https://cloud.tuoitre.vn/s/${selectedItem.id}`,
            permission: 'download_view',
            createdAt: '2026-10-10',
          },
        ];

  // Sao chép link nhanh
  const handleCopyLink = (urlToCopy?: string) => {
    const url = urlToCopy || `https://cloud.tuoitre.vn/s/${selectedItem.id}`;
    navigator.clipboard.writeText(url);
    message.success('Đã sao chép đường liên kết vào bộ nhớ tạm');
  };

  // Thêm người / nhóm mới
  const handleAddUser = () => {
    if (!newShareInput.trim()) return;
    const email = newShareInput.includes('@')
      ? newShareInput.trim()
      : `${newShareInput.trim()}@tuoitre.com.vn`;
    const name = email.split('@')[0];

    const newUser: CloudSharedUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: 'editor',
      permissions: {
        canShare: true,
        canEdit: true,
        create: true,
        change: true,
        delete: false,
      },
    };

    const updatedUsers = [newUser, ...sharedUsers];
    if (onUpdateItem) {
      onUpdateItem({
        ...selectedItem,
        isShared: true,
        sharedWith: updatedUsers,
      });
    }
    setExpandedUserId(newUser.id);
    setNewShareInput('');
    message.success(`Đã thêm quyền chia sẻ cho ${email}`);
  };

  // Xóa người dùng khỏi danh sách chia sẻ
  const handleRemoveUser = (userId: string) => {
    const updatedUsers = sharedUsers.filter((u) => u.id !== userId);
    if (onUpdateItem) {
      onUpdateItem({
        ...selectedItem,
        sharedWith: updatedUsers,
      });
    }
    if (expandedUserId === userId) setExpandedUserId(null);
    message.info('Đã xóa quyền truy cập');
  };

  // Cập nhật quyền cụ thể cho từng người dùng
  const handleToggleUserPermission = (
    userId: string,
    key: 'canShare' | 'canEdit' | 'create' | 'change' | 'delete'
  ) => {
    const updatedUsers = sharedUsers.map((user) => {
      if (user.id !== userId) return user;
      const currentPerms = user.permissions || {};
      return {
        ...user,
        permissions: {
          ...currentPerms,
          [key]: !currentPerms[key],
        },
      };
    });

    if (onUpdateItem) {
      onUpdateItem({
        ...selectedItem,
        sharedWith: updatedUsers,
      });
    }
  };

  // Cập nhật ngày hết hạn cho người dùng
  const handleChangeUserExpiration = (userId: string, dateStr: string | null) => {
    const updatedUsers = sharedUsers.map((user) => {
      if (user.id !== userId) return user;
      return {
        ...user,
        permissions: {
          ...user.permissions,
          expirationDate: dateStr,
        },
      };
    });

    if (onUpdateItem) {
      onUpdateItem({
        ...selectedItem,
        sharedWith: updatedUsers,
      });
    }
  };

  // Mở modal tạo link mới và làm sạch form tránh trình duyệt autofill
  const handleOpenCreateLinkModal = () => {
    setEditingLinkId(null);
    setNewLinkName('Liên kết công khai');
    setNewLinkPassword('');
    setNewLinkExpiration(null);
    setNewLinkPermission('download_view');
    setIsCreateLinkModalOpen(true);
  };

  // Mở modal chỉnh sửa link công khai đã có
  const handleOpenEditLinkModal = (link: CloudPublicLink) => {
    setEditingLinkId(link.id);
    setNewLinkName(link.name);
    setNewLinkPassword(link.password || '');
    setNewLinkExpiration(link.expirationDate || null);
    setNewLinkPermission(link.permission);
    setIsCreateLinkModalOpen(true);
  };

  // Lưu (Tạo mới hoặc Cập nhật) Public Link
  const handleCreatePublicLink = () => {
    let updatedLinks: CloudPublicLink[];

    if (editingLinkId) {
      // Chỉnh sửa link hiện tại
      updatedLinks = publicLinks.map((link) => {
        if (link.id !== editingLinkId) return link;
        return {
          ...link,
          name: newLinkName.trim() || 'Liên kết công khai',
          permission: newLinkPermission,
          password: newLinkPassword.trim() || undefined,
          expirationDate: newLinkExpiration,
        };
      });
      message.success('Đã cập nhật liên kết chia sẻ');
    } else {
      // Tạo link mới
      const newLink: CloudPublicLink = {
        id: `pl-${Date.now()}`,
        name: newLinkName.trim() || 'Liên kết công khai',
        url: `https://cloud.tuoitre.vn/s/${Date.now().toString(36)}`,
        permission: newLinkPermission,
        password: newLinkPassword.trim() || undefined,
        expirationDate: newLinkExpiration,
        createdAt: dayjs().format('YYYY-MM-DD'),
      };
      updatedLinks = [...publicLinks, newLink];
      message.success('Đã tạo liên kết chia sẻ công khai');
    }

    if (onUpdateItem) {
      onUpdateItem({
        ...selectedItem,
        isShared: true,
        publicLinks: updatedLinks,
      });
    }

    setIsCreateLinkModalOpen(false);
    setEditingLinkId(null);
    setNewLinkName('Liên kết công khai');
    setNewLinkPassword('');
    setNewLinkExpiration(null);
    setNewLinkPermission('download_view');
  };

  // Xóa Public Link
  const handleDeletePublicLink = (linkId: string) => {
    const updatedLinks = publicLinks.filter((l) => l.id !== linkId);
    if (onUpdateItem) {
      onUpdateItem({
        ...selectedItem,
        publicLinks: updatedLinks,
      });
    }
    message.info('Đã xóa liên kết chia sẻ');
  };

  // Thêm bình luận
  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      author: 'Nguyễn Minh Anh',
      text: commentInput.trim(),
      time: 'Vừa xong',
    };
    setCommentsList([newComment, ...commentsList]);
    setCommentInput('');
    message.success('Đã gửi bình luận');
  };

  // Tải mã QR Code về máy
  const handleDownloadQrCode = (linkName: string) => {
    const canvas = document.getElementById('details-share-qr-canvas')?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `QRCode_${linkName.replace(/\s+/g, '_')}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success('Đã tải hình ảnh mã QR về máy');
    }
  };

  return (
    <>
      <aside className="w-[360px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full select-none text-[13px] overflow-hidden">
        {/* 1. Header tinh tế, gọn gàng, đậm chất ERP Tuổi Trẻ */}
        <div className="p-3.5 border-b border-slate-100 flex items-start gap-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <CloudFileIcon type={selectedItem.type} size="md" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <Tooltip title={selectedItem.name}>
                <h2 className="text-[14px] font-semibold text-slate-900 truncate m-0 leading-tight">
                  {selectedItem.name}
                </h2>
              </Tooltip>
              <Tooltip title="Sao chép đường dẫn">
                <button
                  type="button"
                  onClick={() => handleCopyLink()}
                  className="text-slate-400 hover:text-[#d92d20] p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <Link2 size={13} />
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span
                onClick={() => onToggleStar(selectedItem)}
                className="cursor-pointer text-amber-500 hover:scale-110 transition-transform"
                title={selectedItem.isStarred ? 'Bỏ gắn dấu sao' : 'Gắn dấu sao'}
              >
                <Star
                  size={12}
                  className={selectedItem.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}
                />
              </span>
              <span>
                {selectedItem.sizeFormatted || (selectedItem.type === 'folder' ? 'Thư mục' : '—')}
              </span>
              <span>•</span>
              <span className="truncate">{selectedItem.updatedAt || 'Hôm nay'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0 transition-colors"
            title="Đóng ngăn chi tiết"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Tabs Switcher: Tối giản, font size 11px nhỏ gọn thanh lịch */}
        <div className="px-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-2 text-[11px] font-medium flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-[#d92d20] text-[#d92d20]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={12} />
              <span>Chi tiết</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sharing')}
              className={`py-2 text-[11px] font-medium flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'sharing'
                  ? 'border-[#d92d20] text-[#d92d20]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Share2 size={12} />
              <span>Chia sẻ</span>
              {sharedUsers.length > 0 && (
                <span
                  className={`px-1.5 py-0 rounded-full text-[9px] font-semibold ${
                    activeTab === 'sharing'
                      ? 'bg-rose-50 text-[#d92d20]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {sharedUsers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`py-2 text-[11px] font-medium flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'activities'
                  ? 'border-[#d92d20] text-[#d92d20]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock size={12} />
              <span>Hoạt động</span>
            </button>
          </div>
        </div>

        {/* 3. Vùng nội dung theo Tab: Thiết kế phẳng, thoáng đãng, hạn chế tối đa khung viền */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white text-[12px]">
          {/* ========================================================= */}
          {/* TAB 1: CHI TIẾT TỆP (DETAILS) */}
          {/* ========================================================= */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Thẻ xem trước & Thao tác nhanh - Phẳng, tối giản */}
              <div className="pt-2 pb-1 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-2.5">
                  <CloudFileIcon type={selectedItem.type} size="xl" />
                </div>
                <div className="font-medium text-slate-800 text-[13px] max-w-[260px] truncate">
                  {selectedItem.name}
                </div>
                <div className="text-[11.5px] text-slate-400 mt-0.5">
                  {selectedItem.sizeFormatted ? `${selectedItem.sizeFormatted} • ` : ''}
                  <span className="capitalize">{selectedItem.type}</span>
                </div>

                {/* Các nút hành động nhanh */}
                <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
                  {selectedItem.type !== 'folder' && (
                    <button
                      type="button"
                      onClick={() => onPreview(selectedItem)}
                      className="flex-1 max-w-[120px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#d92d20] hover:bg-[#b42318] text-white font-medium text-xs transition-colors"
                    >
                      <Eye size={13} />
                      <span>Xem trước</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDownload(selectedItem)}
                    className="flex-1 max-w-[120px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs transition-colors"
                  >
                    <Download size={13} />
                    <span>Tải về</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Thông số kỹ thuật của tệp - Không dùng khung viền hộp */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Thông số tài liệu</span>
                  <Info size={13} className="text-slate-400" />
                </div>

                <div className="divide-y divide-slate-100 text-[12px] text-slate-600">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-normal">Định dạng</span>
                    <span className="font-medium text-slate-800 uppercase">{selectedItem.type}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-normal">Dung lượng</span>
                    <span className="font-medium text-slate-800">{selectedItem.sizeFormatted || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-normal">Chủ sở hữu</span>
                    <span className="font-medium text-slate-800">{selectedItem.owner.name}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-normal">Sửa đổi lần cuối</span>
                    <span className="font-medium text-slate-800">{selectedItem.updatedAt}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-normal">Người sửa đổi</span>
                    <span className="font-medium text-slate-800">{selectedItem.updatedBy}</span>
                  </div>
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-slate-400 font-normal">Quyền truy cập</span>
                    {selectedItem.isShared ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#d92d20] font-medium text-[11px] flex items-center gap-1">
                        <Users size={11} /> Đã chia sẻ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal text-[11px]">
                        Chỉ mình tôi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Thẻ nhãn phân loại */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag size={13} className="text-slate-400" />
                  <span>Thẻ phân loại</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <AntTag color="red">#TòaSoạn2026</AntTag>
                  <AntTag color="default">#QuyChuẩn</AntTag>
                  <AntTag color="blue">#TàiLiệuMẫu</AntTag>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CHIA SẺ (SHARING) - TỐI GIẢN, PHẲNG, TINH TẾ */}
          {/* ========================================================= */}
          {activeTab === 'sharing' && (
            <div className="space-y-5">
              {/* PHÂN VÙNG A: LIÊN KẾT CÔNG KHAI (PUBLIC LINKS) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} className="text-slate-400" />
                    <span>Liên kết công khai</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenCreateLinkModal}
                    className="text-[11.5px] font-medium text-[#d92d20] hover:text-[#b42318] flex items-center gap-1"
                  >
                    <Plus size={12} /> Tạo mới
                  </button>
                </div>

                {publicLinks.length === 0 ? (
                  <div className="py-3 px-3 bg-slate-50 rounded-lg text-center text-xs text-slate-400">
                    Chưa có liên kết công khai nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {publicLinks.map((link) => (
                      <div
                        key={link.id}
                        className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-slate-100/70 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-white text-[#d92d20] flex items-center justify-center shrink-0 shadow-2xs">
                              <Link2 size={13} />
                            </div>
                            <span className="font-medium text-slate-800 truncate text-[12px]">
                              {link.name}
                            </span>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Tooltip title="Chỉnh sửa liên kết">
                              <button
                                type="button"
                                onClick={() => handleOpenEditLinkModal(link)}
                                className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-white transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Sao chép link">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(link.url)}
                                className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-white transition-colors"
                              >
                                <Copy size={13} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Mã QR">
                              <button
                                type="button"
                                onClick={() => setActiveQrLink(link)}
                                className="px-1.5 py-0.5 rounded hover:bg-white text-[10.5px] font-semibold text-slate-600 hover:text-[#d92d20] transition-colors"
                              >
                                QR
                              </button>
                            </Tooltip>
                            <Tooltip title="Xóa liên kết">
                              <button
                                type="button"
                                onClick={() => handleDeletePublicLink(link.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-[11px] font-normal shadow-2xs">
                            {link.permission === 'download_view' && 'Tải về / Xem'}
                            {link.permission === 'download_view_upload' && 'Tải về / Xem / Tải lên'}
                            {link.permission === 'download_view_upload_edit' && 'Tải về / Sửa / Xóa'}
                            {link.permission === 'upload_only' && 'Chỉ tải lên'}
                          </span>
                          {link.password && <span className="text-amber-600 font-medium">🔒 Có mật khẩu</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* PHÂN VÙNG B: NGƯỜI DÙNG & NHÓM NỘI BỘ */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400" />
                    <span>Thành viên được chia sẻ ({sharedUsers.length})</span>
                  </span>
                </div>

                {/* Ô tìm kiếm / Thêm thành viên */}
                <div className="relative flex items-center mb-3">
                  <Input
                    value={newShareInput}
                    onChange={(e) => setNewShareInput(e.target.value)}
                    onPressEnter={handleAddUser}
                    placeholder="Nhập email hoặc tên..."
                    className="pr-14 text-[12px] py-1 rounded-lg border-slate-200 placeholder:text-slate-400"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {newShareInput.trim() && (
                      <button
                        type="button"
                        onClick={handleAddUser}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#d92d20] text-white font-medium hover:bg-[#b42318]"
                      >
                        Thêm
                      </button>
                    )}
                    <Tooltip title="Nhập email @tuoitre.com.vn hoặc phòng ban">
                      <span className="text-slate-400 cursor-help px-0.5">
                        <Info size={14} />
                      </span>
                    </Tooltip>
                  </div>
                </div>

                {/* Danh sách người dùng với phân quyền chi tiết */}
                <div className="divide-y divide-slate-100">
                  {sharedUsers.map((user) => {
                    const isExpanded = expandedUserId === user.id;
                    const perms = user.permissions || {};

                    return (
                      <div key={user.id} className="py-2.5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {user.avatar ? (
                              <img
                                alt={user.name}
                                src={user.avatar}
                                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                              />
                            ) : (
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-medium text-xs shrink-0 ${
                                  user.name.startsWith('V')
                                    ? 'bg-indigo-500'
                                    : user.name.startsWith('H')
                                    ? 'bg-purple-500'
                                    : user.name.startsWith('T')
                                    ? 'bg-pink-500'
                                    : 'bg-slate-600'
                                }`}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="text-[12px] font-medium text-slate-800 truncate leading-snug">
                                {user.name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate leading-snug mt-0.5">
                                {user.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <Tooltip title={isExpanded ? 'Thu gọn quyền' : 'Phân quyền chi tiết'}>
                              <button
                                type="button"
                                onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  isExpanded
                                    ? 'bg-slate-100 text-[#d92d20]'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <Settings size={14} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Bảng phân quyền chi tiết khi mở Settings (⚙️) */}
                        {isExpanded && (
                          <div className="mt-2 ml-8 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-medium text-[11px] shrink-0">Thời hạn:</span>
                              <DatePicker
                                size="small"
                                placeholder="Chọn ngày hết hạn"
                                value={perms.expirationDate ? dayjs(perms.expirationDate) : null}
                                onChange={(d) =>
                                  handleChangeUserExpiration(user.id, d ? d.format('YYYY-MM-DD') : null)
                                }
                                className="text-[11px] [&_input]:!text-[11px] [&_input]:!placeholder:text-slate-400 [&_input]:!placeholder:text-[11px] h-6 flex-1 rounded"
                                allowClear
                              />
                            </div>

                            {/* 5 Checkbox quyền hạn */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-slate-700">
                              <Checkbox
                                checked={Boolean(perms.canShare)}
                                onChange={() => handleToggleUserPermission(user.id, 'canShare')}
                              >
                                <span className="text-[12px] text-slate-700 font-normal">Chia sẻ lại</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.canEdit)}
                                onChange={() => handleToggleUserPermission(user.id, 'canEdit')}
                              >
                                <span className="text-[12px] text-slate-700 font-normal">Chỉnh sửa</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.create)}
                                onChange={() => handleToggleUserPermission(user.id, 'create')}
                              >
                                <span className="text-[12px] text-slate-700 font-normal">Tạo mới</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.change)}
                                onChange={() => handleToggleUserPermission(user.id, 'change')}
                              >
                                <span className="text-[12px] text-slate-700 font-normal">Thay đổi</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.delete)}
                                onChange={() => handleToggleUserPermission(user.id, 'delete')}
                              >
                                <span className="text-[12px] text-slate-700 font-normal">Xóa</span>
                              </Checkbox>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: HOẠT ĐỘNG & BÌNH LUẬN (ACTIVITIES & COMMENTS) */}
          {/* ========================================================= */}
          {activeTab === 'activities' && (
            <div className="space-y-5">
              {/* Lịch sử hoạt động */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Activity size={13} className="text-slate-400" />
                  <span>Dòng thời gian hoạt động</span>
                </div>
                <div className="border-l-2 border-slate-100 pl-3.5 space-y-3.5 text-[12px] text-slate-600 ml-1">
                  <div>
                    <div className="font-medium text-slate-800">Cập nhật quyền chia sẻ</div>
                    <div className="text-[11px] text-slate-400">Hôm nay lúc 09:15 • {selectedItem.updatedBy}</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Chỉnh sửa nội dung tài liệu</div>
                    <div className="text-[11px] text-slate-400">{selectedItem.updatedAt}</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Tải tệp lên Cloud</div>
                    <div className="text-[11px] text-slate-400">7 tháng trước • {selectedItem.owner.name}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Bình luận */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <MessageSquare size={13} className="text-slate-400" />
                  <span>Bình luận ({commentsList.length})</span>
                </div>

                <div className="space-y-2 mb-3">
                  {commentsList.map((comm) => (
                    <div key={comm.id} className="p-2.5 rounded-lg bg-slate-50/80 text-[12px]">
                      <div className="flex items-center justify-between font-medium text-slate-800">
                        <span>{comm.author}</span>
                        <span className="text-[10.5px] text-slate-400 font-normal">{comm.time}</span>
                      </div>
                      <p className="mt-1 m-0 text-slate-600 text-[12px] leading-relaxed font-normal">{comm.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 pt-1">
                  <Input
                    size="small"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onPressEnter={handleAddComment}
                    placeholder="Viết bình luận..."
                    className="text-[12px] rounded-lg"
                  />
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleAddComment}
                    className="bg-[#d92d20] hover:bg-[#b42318] text-xs px-3"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modal Tạo Public Link */}
      <Modal
        open={isCreateLinkModalOpen}
        onCancel={() => setIsCreateLinkModalOpen(false)}
        footer={null}
        width={460}
        centered
        destroyOnClose
        closeIcon={<X size={16} className="text-slate-500 hover:text-slate-800" />}
        title={
          <div className="text-[14px] font-semibold text-slate-900 pb-1">
            {editingLinkId
              ? `Chỉnh sửa liên kết: /${selectedItem.name}`
              : `Tạo liên kết chia sẻ: /${selectedItem.name}`}
          </div>
        }
      >
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreatePublicLink();
          }}
          className="py-2 space-y-4 text-[13px]"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tên liên kết</label>
            <Input
              name="public_link_title_input"
              autoComplete="off"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="Liên kết công khai"
              className="text-[13px]"
            />
          </div>

          <div className="space-y-2.5">
            <Radio.Group
              value={newLinkPermission}
              onChange={(e) => setNewLinkPermission(e.target.value)}
              className="w-full space-y-2.5"
            >
              <div
                onClick={() => setNewLinkPermission('download_view')}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'download_view' ? 'bg-slate-50 border border-slate-200' : 'border border-transparent'
                }`}
              >
                <Radio value="download_view" className="font-semibold text-slate-800 text-[13px]">
                  Tải về / Xem
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Người nhận có thể xem hoặc tải về nội dung.
                </div>
              </div>

              <div
                onClick={() => setNewLinkPermission('download_view_upload')}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'download_view_upload' ? 'bg-slate-50 border border-slate-200' : 'border border-transparent'
                }`}
              >
                <Radio value="download_view_upload" className="font-semibold text-slate-800 text-[13px]">
                  Tải về / Xem / Tải lên
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Người nhận có thể xem, tải về và tải tệp lên.
                </div>
              </div>

              <div
                onClick={() => setNewLinkPermission('download_view_upload_edit')}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'download_view_upload_edit' ? 'bg-slate-50 border border-slate-200' : 'border border-transparent'
                }`}
              >
                <Radio value="download_view_upload_edit" className="font-semibold text-slate-800 text-[13px]">
                  Tải về / Xem / Tải lên / Chỉnh sửa
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Người nhận có thể xem, tải về, chỉnh sửa, xóa và tải tệp lên.
                </div>
              </div>

              <div
                onClick={() => setNewLinkPermission('upload_only')}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'upload_only' ? 'bg-slate-50 border border-slate-200' : 'border border-transparent'
                }`}
              >
                <Radio value="upload_only" className="font-semibold text-slate-800 text-[13px]">
                  Chỉ tải lên (Thả tệp)
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Nhận tệp từ nhiều người gửi mà không làm lộ nội dung bên trong thư mục.
                </div>
              </div>
            </Radio.Group>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu bảo vệ</label>
            <Input.Password
              name="public_link_protect_password"
              autoComplete="new-password"
              data-lpignore="true"
              value={newLinkPassword}
              onChange={(e) => setNewLinkPassword(e.target.value)}
              placeholder="Đặt mật khẩu truy cập (tùy chọn)"
              className="text-[13px]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Thời hạn</label>
            <DatePicker
              placeholder="Chọn ngày hết hạn"
              value={newLinkExpiration ? dayjs(newLinkExpiration) : null}
              onChange={(d) => setNewLinkExpiration(d ? d.format('YYYY-MM-DD') : null)}
              className="w-full text-xs [&_input]:!text-xs [&_input]:!placeholder:text-xs"
              allowClear
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button onClick={() => setIsCreateLinkModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-5"
            >
              {editingLinkId ? 'Lưu thay đổi' : 'Chia sẻ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal QR Code */}
      <Modal
        open={Boolean(activeQrLink)}
        onCancel={() => setActiveQrLink(null)}
        footer={null}
        width={340}
        centered
        destroyOnClose
        closeIcon={<X size={16} className="text-slate-500 hover:text-slate-800" />}
        styles={{
          content: { padding: '24px 20px', borderRadius: 12, textAlign: 'center' },
        }}
      >
        {activeQrLink && (
          <div className="flex flex-col items-center">
            <div
              id="details-share-qr-canvas"
              className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 mb-3"
            >
              <QRCode value={activeQrLink.url} size={180} bordered={false} />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-[260px] mb-4">
              Quét mã QR để mở liên kết chia sẻ này. Nếu liên kết được đặt mật khẩu, người nhận cần nhập mật khẩu để truy cập.
            </p>

            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleDownloadQrCode(activeQrLink.name)}
                className="text-slate-800 hover:text-[#d92d20] hover:underline transition-colors"
              >
                Tải mã QR về máy
              </button>
              <button
                type="button"
                onClick={() => setActiveQrLink(null)}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
