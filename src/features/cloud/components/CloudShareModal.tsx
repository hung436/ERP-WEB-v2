import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  message,
  Checkbox,
  DatePicker,
  Radio,
  Tooltip,
  QRCode,
} from 'antd';
import {
  Link2,
  Settings,
  Trash2,
  Copy,
  Info,
  Calendar,
  X,
  Share2,
  QrCode,
  Folder,
  FileText,
  Star,
  Check,
  Globe,
  UploadCloud,
  FileUp,
  Download,
  Eye,
  Plus,
  Pencil,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  CloudItem,
  CloudSharedUser,
  CloudPublicLink,
  CloudPublicLinkPermission,
} from '../types';

interface CloudShareModalProps {
  item: CloudItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateShare: (item: CloudItem) => void;
}

export const CloudShareModal: React.FC<CloudShareModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdateShare,
}) => {
  if (!item) return null;

  // Tabs cấp cao: Hoạt động, Bình luận, Chia sẻ, Thẻ nhãn
  const [topTab, setTopTab] = useState<'activities' | 'comments' | 'sharing' | 'tags'>('sharing');

  // Phân vùng con trong Chia sẻ: 'users' (Người dùng và Nhóm) | 'public' (Liên kết công khai)
  const [sharingSubTab, setSharingSubTab] = useState<'users' | 'public'>('users');

  // Danh sách người được chia sẻ
  const [sharedUsers, setSharedUsers] = useState<CloudSharedUser[]>(
    item.sharedWith && item.sharedWith.length > 0
      ? item.sharedWith
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
          {
            id: 'u-tlc',
            name: 'Tiến LC',
            email: 'tienlc@tuoitre.com.vn',
            role: 'editor',
            permissions: { canShare: true, canEdit: true, create: true, change: true, delete: false },
          },
        ]
  );

  // ID của user đang mở bảng quyền chi tiết (mặc định mở user Nhật Minh giống hình ảnh mẫu)
  const [expandedUserId, setExpandedUserId] = useState<string | null>('u-nm');

  // Input tìm kiếm / thêm người & nhóm
  const [newShareInput, setNewShareInput] = useState('');

  // Danh sách Public Links
  const [publicLinks, setPublicLinks] = useState<CloudPublicLink[]>(
    item.publicLinks || [
      {
        id: 'pl-default-1',
        name: 'Liên kết công khai',
        url: `https://cloud.tuoitre.vn/s/${item.id}`,
        permission: 'download_view',
        createdAt: '2026-10-10',
      },
    ]
  );

  // Trạng thái modal tạo / chỉnh sửa Public Link
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('Liên kết công khai');
  const [newLinkPermission, setNewLinkPermission] = useState<CloudPublicLinkPermission>('download_view');
  const [newLinkPassword, setNewLinkPassword] = useState('');
  const [newLinkExpiration, setNewLinkExpiration] = useState<string | null>(null);

  // Trạng thái hiển thị popup QR Code
  const [activeQrLink, setActiveQrLink] = useState<CloudPublicLink | null>(null);

  // Copy link nhanh vào clipboard
  const handleCopyLink = (urlToCopy?: string) => {
    const url = urlToCopy || `https://cloud.tuoitre.vn/s/${item.id}`;
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

    setSharedUsers((prev) => [newUser, ...prev]);
    setExpandedUserId(newUser.id);
    setNewShareInput('');
    message.success(`Đã thêm quyền chia sẻ cho ${email}`);
  };

  // Xóa người dùng khỏi danh sách chia sẻ
  const handleRemoveUser = (userId: string) => {
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
    if (expandedUserId === userId) setExpandedUserId(null);
    message.info('Đã xóa quyền truy cập');
  };

  // Cập nhật quyền cụ thể cho từng người dùng
  const handleToggleUserPermission = (
    userId: string,
    key: 'canShare' | 'canEdit' | 'create' | 'change' | 'delete'
  ) => {
    setSharedUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        const currentPerms = user.permissions || {};
        return {
          ...user,
          permissions: {
            ...currentPerms,
            [key]: !currentPerms[key],
          },
        };
      })
    );
  };

  // Cập nhật ngày hết hạn cho người dùng
  const handleChangeUserExpiration = (userId: string, dateStr: string | null) => {
    setSharedUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        return {
          ...user,
          permissions: {
            ...user.permissions,
            expirationDate: dateStr,
          },
        };
      })
    );
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

  // Tạo mới hoặc cập nhật Public Link
  const handleCreatePublicLink = () => {
    if (editingLinkId) {
      setPublicLinks((prev) =>
        prev.map((link) => {
          if (link.id !== editingLinkId) return link;
          return {
            ...link,
            name: newLinkName.trim() || 'Liên kết công khai',
            permission: newLinkPermission,
            password: newLinkPassword.trim() || undefined,
            expirationDate: newLinkExpiration,
          };
        })
      );
      message.success('Đã cập nhật liên kết chia sẻ');
    } else {
      const newLink: CloudPublicLink = {
        id: `pl-${Date.now()}`,
        name: newLinkName.trim() || 'Liên kết công khai',
        url: `https://cloud.tuoitre.vn/s/${Date.now().toString(36)}`,
        permission: newLinkPermission,
        password: newLinkPassword.trim() || undefined,
        expirationDate: newLinkExpiration,
        createdAt: dayjs().format('YYYY-MM-DD'),
      };
      setPublicLinks((prev) => [...prev, newLink]);
      message.success('Đã tạo liên kết chia sẻ công khai');
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
    setPublicLinks((prev) => prev.filter((l) => l.id !== linkId));
    message.info('Đã xóa liên kết chia sẻ');
  };

  // Tải mã QR Code về máy dạng hình ảnh PNG
  const handleDownloadQrCode = (linkName: string) => {
    const canvas = document.getElementById('cloud-share-qr-canvas')?.querySelector<HTMLCanvasElement>('canvas');
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

  // Lưu toàn bộ trạng thái chia sẻ vào tệp/thư mục
  const handleSaveAndClose = () => {
    const updated: CloudItem = {
      ...item,
      isShared: sharedUsers.length > 0 || publicLinks.length > 0,
      sharedWith: sharedUsers,
      publicLinks,
    };
    onUpdateShare(updated);
    onClose();
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={handleSaveAndClose}
        footer={null}
        width={580}
        centered
        destroyOnClose
        closeIcon={<X size={18} className="text-slate-500 hover:text-slate-800" />}
        className="cloud-sharing-dialog"
        styles={{
          content: { padding: 0, borderRadius: 12, overflow: 'hidden' },
        }}
      >
        {/* 1. Header phong cách Nextcloud / OwnCloud chuẩn hình mẫu */}
        <div className="p-4 border-b border-slate-200/90 flex items-start gap-3 bg-white">
          <div className="w-12 h-12 rounded-lg bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-sm relative">
            {item.type === 'folder' ? (
              <Folder size={26} className="fill-white/20" />
            ) : (
              <FileText size={26} />
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#d92d20] text-white flex items-center justify-center border-2 border-white">
              <Share2 size={10} />
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-slate-900 truncate m-0 leading-snug">
                {item.name}
              </h2>
              <Tooltip title="Sao chép đường dẫn chia sẻ">
                <button
                  type="button"
                  onClick={() => handleCopyLink()}
                  className="text-slate-400 hover:text-[#d92d20] p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <Link2 size={15} />
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={12} className="fill-amber-400" />
              </span>
              <span>{item.sizeFormatted || '43.5 MB'}</span>
              <span>•</span>
              <span>Cập nhật 7 tháng trước</span>
            </div>
          </div>
        </div>

        {/* 2. Top Tabs: Hoạt động, Bình luận, Chia sẻ, Thẻ nhãn */}
        <div className="flex items-center border-b border-slate-200 px-4 bg-white text-[13px] select-none">
          <button
            type="button"
            onClick={() => setTopTab('activities')}
            className={`py-2.5 px-4 font-medium transition-colors border-b-2 -mb-[1px] ${
              topTab === 'activities'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hoạt động
          </button>
          <button
            type="button"
            onClick={() => setTopTab('comments')}
            className={`py-2.5 px-4 font-medium transition-colors border-b-2 -mb-[1px] ${
              topTab === 'comments'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Bình luận
          </button>
          <button
            type="button"
            onClick={() => setTopTab('sharing')}
            className={`py-2.5 px-4 font-medium transition-colors border-b-2 -mb-[1px] ${
              topTab === 'sharing'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chia sẻ
          </button>
          <button
            type="button"
            onClick={() => setTopTab('tags')}
            className={`py-2.5 px-4 font-medium transition-colors border-b-2 -mb-[1px] ${
              topTab === 'tags'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thẻ nhãn
          </button>
        </div>

        {/* 3. Nội dung Tab Chia sẻ */}
        {topTab === 'sharing' ? (
          <div className="p-4 bg-white min-h-[380px]">
            {/* Sub-tabs: Người dùng và Nhóm | Liên kết công khai */}
            <div className="flex items-center gap-1 mb-4 text-[13px] border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setSharingSubTab('users')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  sharingSubTab === 'users'
                    ? 'bg-slate-100 text-slate-900 font-semibold underline underline-offset-4 decoration-2 decoration-slate-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Người dùng và Nhóm
              </button>
              <button
                type="button"
                onClick={() => setSharingSubTab('public')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  sharingSubTab === 'public'
                    ? 'bg-slate-100 text-slate-900 font-semibold underline underline-offset-4 decoration-2 decoration-slate-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Liên kết công khai
              </button>
            </div>

            {/* Sub-Tab 1: Người dùng và Nhóm */}
            {sharingSubTab === 'users' && (
              <div className="space-y-3">
                {/* Search / Share Input */}
                <div className="relative flex items-center">
                  <Input
                    value={newShareInput}
                    onChange={(e) => setNewShareInput(e.target.value)}
                    onPressEnter={handleAddUser}
                    placeholder="Chia sẻ với người dùng, nhóm hoặc email cơ quan..."
                    className="pr-16 text-[13px] py-1.5 rounded-md border-slate-300"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {newShareInput.trim() && (
                      <button
                        type="button"
                        onClick={handleAddUser}
                        className="text-xs px-2 py-0.5 rounded bg-[#d92d20] text-white font-medium hover:bg-[#b42318]"
                      >
                        Thêm
                      </button>
                    )}
                    <Tooltip title="Nhập email nhân viên @tuoitre.com.vn hoặc tên phòng ban">
                      <span className="text-slate-400 cursor-help px-1">
                        <Info size={15} />
                      </span>
                    </Tooltip>
                  </div>
                </div>

                {/* Danh sách người được chia sẻ với các quyền chi tiết */}
                <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
                  {sharedUsers.map((user) => {
                    const isExpanded = expandedUserId === user.id;
                    const perms = user.permissions || {};

                    return (
                      <div key={user.id} className="py-2.5 transition-colors">
                        {/* Hàng thông tin cơ bản của User */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar */}
                            {user.avatar ? (
                              <img
                                alt={user.name}
                                src={user.avatar}
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${
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

                            {/* Email */}
                            <span className="text-[13px] font-medium text-slate-800 truncate">
                              {user.email}
                            </span>
                          </div>

                          {/* Action icons: Bánh răng & Thùng rác */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Tooltip title={isExpanded ? 'Thu gọn quyền' : 'Thiết lập quyền chi tiết'}>
                              <button
                                type="button"
                                onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  isExpanded
                                    ? 'bg-slate-200 text-slate-900'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <Settings size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Bảng phân quyền chi tiết khi bấm vào icon Bánh răng Settings (⚙️) */}
                        {isExpanded && (
                          <div className="mt-2 ml-10 space-y-2.5 text-[12px]">
                            {/* Hàng ngày hết hạn: Expiration */}
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-medium text-[11px] shrink-0">Thời hạn:</span>
                              <div className="flex items-center gap-1">
                                <DatePicker
                                  size="small"
                                  placeholder="Chọn ngày hết hạn"
                                  value={perms.expirationDate ? dayjs(perms.expirationDate) : null}
                                  onChange={(d) =>
                                    handleChangeUserExpiration(user.id, d ? d.format('YYYY-MM-DD') : null)
                                  }
                                  className="text-[11px] [&_input]:!text-[11px] [&_input]:!placeholder:text-[11px] h-6 rounded"
                                  allowClear
                                />
                              </div>
                            </div>

                            {/* Hàng các Checkboxes: can share, can edit, create, change, delete */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-700">
                              <Checkbox
                                checked={Boolean(perms.canShare)}
                                onChange={() => handleToggleUserPermission(user.id, 'canShare')}
                              >
                                <span className="text-[12px]">Chia sẻ lại</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.canEdit)}
                                onChange={() => handleToggleUserPermission(user.id, 'canEdit')}
                              >
                                <span className="text-[12px]">Chỉnh sửa</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.create)}
                                onChange={() => handleToggleUserPermission(user.id, 'create')}
                              >
                                <span className="text-[12px]">Tạo mới</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.change)}
                                onChange={() => handleToggleUserPermission(user.id, 'change')}
                              >
                                <span className="text-[12px]">Thay đổi</span>
                              </Checkbox>

                              <Checkbox
                                checked={Boolean(perms.delete)}
                                onChange={() => handleToggleUserPermission(user.id, 'delete')}
                              >
                                <span className="text-[12px]">Xóa</span>
                              </Checkbox>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Liên kết công khai */}
            {sharingSubTab === 'public' && (
              <div className="space-y-4">
                {/* Khi chưa có link nào */}
                {publicLinks.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 space-y-3">
                    <p className="text-[13px] text-slate-600 m-0">
                      Hiện chưa có liên kết chia sẻ nào, bạn có thể tạo mới
                    </p>
                    <Button
                      type="default"
                      onClick={handleOpenCreateLinkModal}
                      className="border-slate-300 font-medium hover:border-slate-800 text-slate-800"
                    >
                      Tạo liên kết công khai
                    </Button>
                    <p className="text-xs text-slate-400 m-0">
                      Bất kỳ ai có liên kết đều có thể truy cập tệp/thư mục này
                    </p>
                  </div>
                ) : (
                  /* Khi đã có link công khai */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Button
                        type="default"
                        size="small"
                        onClick={handleOpenCreateLinkModal}
                        className="border-slate-300 font-medium hover:border-slate-800 text-slate-800"
                      >
                        Tạo liên kết công khai
                      </Button>
                      <span className="text-xs text-slate-400">
                        Bất kỳ ai có liên kết đều có thể truy cập tệp/thư mục này
                      </span>
                    </div>

                    <div className="space-y-2">
                      {publicLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/90 text-[13px]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                              <Link2 size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 block truncate">
                                {link.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {link.permission === 'download_view' && 'Tải về / Xem'}
                                {link.permission === 'download_view_upload' && 'Tải về / Xem / Tải lên'}
                                {link.permission === 'download_view_upload_edit' && 'Tải về / Xem / Tải lên / Chỉnh sửa'}
                                {link.permission === 'upload_only' && 'Chỉ tải lên (Thả tệp)'}
                                {link.password && ' • Có mật khẩu'}
                                {link.expirationDate && ` • Hạn: ${link.expirationDate}`}
                              </span>
                            </div>
                          </div>

                          {/* Action icons: Copy, Settings, Share, Delete, QR Code */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Tooltip title="Sao chép đường dẫn">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(link.url)}
                                className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                              >
                                <Copy size={15} />
                              </button>
                            </Tooltip>

                            <Tooltip title="Chỉnh sửa quyền liên kết">
                              <button
                                type="button"
                                onClick={() => handleOpenEditLinkModal(link)}
                                className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                              >
                                <Settings size={15} />
                              </button>
                            </Tooltip>

                            <Tooltip title="Chia sẻ liên kết">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(link.url)}
                                className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                              >
                                <Share2 size={15} />
                              </button>
                            </Tooltip>

                            <Tooltip title="Xóa liên kết">
                              <button
                                type="button"
                                onClick={() => handleDeletePublicLink(link.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </Tooltip>

                            {/* Nút hiển thị mã QR Code */}
                            <Tooltip title="Hiển thị mã QR">
                              <button
                                type="button"
                                onClick={() => setActiveQrLink(link)}
                                className="px-2 py-1 rounded bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:text-[#d92d20] hover:border-rose-300 transition-colors shadow-2xs"
                              >
                                QR
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Placeholder cho các tab Hoạt động, Bình luận, Thẻ nhãn */
          <div className="p-8 text-center text-slate-400 min-h-[380px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              {topTab === 'activities' && <Calendar size={22} />}
              {topTab === 'comments' && <FileText size={22} />}
              {topTab === 'tags' && <Star size={22} />}
            </div>
            <div className="font-medium text-slate-700 capitalize">
              {topTab === 'activities' ? 'Hoạt động' : topTab === 'comments' ? 'Bình luận' : 'Thẻ nhãn'}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Chưa có dữ liệu nào cho mục này. Mọi thao tác chỉnh sửa sẽ được ghi nhận tự động.
            </p>
          </div>
        )}
      </Modal>

      {/* 4. Modal tạo Public Link với đầy đủ các quyền bằng tiếng Việt */}
      <Modal
        open={isCreateLinkModalOpen}
        onCancel={() => setIsCreateLinkModalOpen(false)}
        footer={null}
        width={480}
        centered
        destroyOnClose
        closeIcon={<X size={16} className="text-slate-500 hover:text-slate-800" />}
        title={
          <div className="text-[15px] font-semibold text-slate-900 pb-1">
            {editingLinkId ? `Chỉnh sửa liên kết: /${item.name}` : `Tạo liên kết chia sẻ: /${item.name}`}
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
          {/* Tên liên kết */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tên liên kết</label>
            <Input
              name="cloud_modal_link_name"
              autoComplete="off"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="Liên kết công khai"
              className="text-[13px]"
            />
          </div>

          {/* Radio Options các quyền bằng tiếng Việt */}
          <div className="space-y-2.5">
            <Radio.Group
              value={newLinkPermission}
              onChange={(e) => setNewLinkPermission(e.target.value)}
              className="w-full space-y-3"
            >
              {/* Option 1: Tải về / Xem */}
              <div
                onClick={() => setNewLinkPermission('download_view')}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'download_view' ? 'bg-slate-50 border border-slate-200' : ''
                }`}
              >
                <Radio value="download_view" className="font-semibold text-slate-800 text-[13px]">
                  Tải về / Xem
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Người nhận có thể xem hoặc tải về nội dung.
                </div>
              </div>

              {/* Option 2: Tải về / Xem / Tải lên */}
              <div
                onClick={() => setNewLinkPermission('download_view_upload')}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'download_view_upload' ? 'bg-slate-50 border border-slate-200' : ''
                }`}
              >
                <Radio value="download_view_upload" className="font-semibold text-slate-800 text-[13px]">
                  Tải về / Xem / Tải lên
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Người nhận có thể xem, tải về và tải tệp lên.
                </div>
              </div>

              {/* Option 3: Tải về / Xem / Tải lên / Chỉnh sửa */}
              <div
                onClick={() => setNewLinkPermission('download_view_upload_edit')}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'download_view_upload_edit' ? 'bg-slate-50 border border-slate-200' : ''
                }`}
              >
                <Radio value="download_view_upload_edit" className="font-semibold text-slate-800 text-[13px]">
                  Tải về / Xem / Tải lên / Chỉnh sửa
                </Radio>
                <div className="text-xs text-slate-500 pl-6">
                  Người nhận có thể xem, tải về, chỉnh sửa, xóa và tải tệp lên.
                </div>
              </div>

              {/* Option 4: Chỉ tải lên (Thả tệp) */}
              <div
                onClick={() => setNewLinkPermission('upload_only')}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  newLinkPermission === 'upload_only' ? 'bg-slate-50 border border-slate-200' : ''
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

          {/* Mật khẩu bảo vệ */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu bảo vệ</label>
            <Input.Password
              name="cloud_modal_link_password"
              autoComplete="new-password"
              data-lpignore="true"
              value={newLinkPassword}
              onChange={(e) => setNewLinkPassword(e.target.value)}
              placeholder="Đặt mật khẩu truy cập (tùy chọn)"
              className="text-[13px]"
            />
          </div>

          {/* Ngày hết hạn */}
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

          {/* Bottom Buttons: Hủy & Chia sẻ */}
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

      {/* 5. Modal / Popover hiển thị QR Code bằng tiếng Việt */}
      <Modal
        open={Boolean(activeQrLink)}
        onCancel={() => setActiveQrLink(null)}
        footer={null}
        width={350}
        centered
        destroyOnClose
        closeIcon={<X size={16} className="text-slate-500 hover:text-slate-800" />}
        styles={{
          content: { padding: '24px 20px', borderRadius: 12, textAlign: 'center' },
        }}
      >
        {activeQrLink && (
          <div className="flex flex-col items-center">
            {/* Vùng render QR Code canvas */}
            <div
              id="cloud-share-qr-canvas"
              className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 mb-3"
            >
              <QRCode value={activeQrLink.url} size={190} bordered={false} />
            </div>

            {/* Chú thích hướng dẫn quét bằng tiếng Việt */}
            <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mb-4">
              Quét mã QR để mở liên kết chia sẻ này. Nếu liên kết được đặt mật khẩu, người nhận cần nhập mật khẩu để truy cập.
            </p>

            {/* Các nút thao tác ở đáy: Tải mã QR về máy | Đóng */}
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
