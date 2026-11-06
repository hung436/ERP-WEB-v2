import type { User, DirectoryContact } from '@/types/domain';

export interface ExtendedDemoUser extends User {
  phone: string;
  extension: string;
  aliases?: string[];
}

export const demoUsers: ExtendedDemoUser[] = [
  // 1. BAN BIÊN TẬP (LÃNH ĐẠO CAO NHẤT)
  {
    id: 'user-thechu',
    username: 'thechu',
    fullName: 'Lê Thế Chữ',
    penName: 'Thế Chữ',
    email: 'thechu@tuoitre.com.vn',
    department: 'Ban Biên tập',
    position: 'Tổng Biên tập',
    role: 'leadership',
    phone: '0903 800 001',
    extension: '1001',
    birthDate: '1968-06-15',
    aliases: ['tongbientap', 'lethechu'],
  },
  {
    id: 'user-xuantrung',
    username: 'xuantrung',
    fullName: 'Lê Xuân Trung',
    penName: 'Xuân Trung',
    email: 'xuantrung@tuoitre.com.vn',
    department: 'Ban Biên tập',
    position: 'Phó Tổng Biên tập (Nội dung & Báo in)',
    role: 'leadership',
    phone: '0903 811 002',
    extension: '1002',
    birthDate: '1974-04-22',
    aliases: ['trung.lx', 'lexuantrung', 'lanhdao'],
  },
  {
    id: 'user-xuantoan',
    username: 'xuantoan',
    fullName: 'Trần Xuân Toàn',
    penName: 'Xuân Toàn',
    email: 'xuantoan@tuoitre.com.vn',
    department: 'Ban Biên tập',
    position: 'Phó Tổng Biên tập (Đa phương tiện & Tuổi Trẻ Online)',
    role: 'leadership',
    phone: '0903 822 003',
    extension: '1003',
    birthDate: '1976-11-10',
    aliases: ['toan.tx', 'tranxuantoan'],
  },
  {
    id: 'user-hoangnguyen',
    username: 'hoangnguyen',
    fullName: 'Nguyễn Hoàng Nguyên',
    penName: 'Hoàng Nguyên',
    email: 'hoangnguyen@tuoitre.com.vn',
    department: 'Ban Biên tập',
    position: 'Phó Tổng Biên tập (Đối ngoại & Kinh tế)',
    role: 'leadership',
    phone: '0903 833 004',
    extension: '1004',
    birthDate: '1975-08-30',
    aliases: ['nguyen.nh', 'nguyenhoangnguyen'],
  },

  // 2. BAN THƯ KÝ TÒA SOẠN (ĐIỀU PHỐI CA TRỰC & DUYỆT XUẤT BẢN)
  {
    id: 'user-dinhductho',
    username: 'dinhductho',
    fullName: 'Đinh Đức Thọ',
    penName: 'Đức Thọ',
    email: 'dinhductho@tuoitre.com.vn',
    department: 'Ban Thư ký Tòa soạn',
    position: 'Trưởng ban Thư ký Tòa soạn',
    role: 'manager',
    phone: '0913 744 005',
    extension: '2001',
    birthDate: '1978-02-18',
    aliases: ['tho.dd', 'tkts'],
  },
  {
    id: 'user-ngochien',
    username: 'ngochien',
    fullName: 'Lê Ngọc Hiển',
    penName: 'Ngọc Hiển',
    email: 'ngochien@tuoitre.com.vn',
    department: 'Ban Thư ký Tòa soạn',
    position: 'Phó Trưởng ban Thư ký Tòa soạn',
    role: 'manager',
    phone: '0913 755 006',
    extension: '2002',
    birthDate: '1982-09-14',
    aliases: ['hien.ln', 'lengochien'],
  },
  {
    id: 'user-datrang',
    username: 'datrang',
    fullName: 'Dương Đức Đà Trang',
    penName: 'Đà Trang',
    email: 'datrang@tuoitre.com.vn',
    department: 'Ban Thư ký Tòa soạn',
    position: 'Trưởng ca 0 / Biên tập viên chính',
    role: 'employee',
    phone: '0918 266 007',
    extension: '2003',
    birthDate: '1984-12-05',
    aliases: ['trang.dd', 'duongducdatrang'],
  },

  // 3. CÁC BAN CHUYÊN MÔN & NỘI DUNG
  {
    id: 'user-viensu',
    username: 'viensu',
    fullName: 'Nguyễn Viễn Sự',
    penName: 'Viễn Sự',
    email: 'viensu@tuoitre.com.vn',
    department: 'Ban Thời sự',
    position: 'Trưởng Ban Thời sự',
    role: 'manager',
    phone: '0908 377 008',
    extension: '2101',
    birthDate: '1980-05-20',
    aliases: ['su.nv', 'nguyenviensu'],
  },
  {
    id: 'user-001',
    username: 'minhanh',
    fullName: 'Nguyễn Minh Anh',
    penName: 'Minh Anh',
    email: 'minhanh@tuoitre.com.vn',
    department: 'Ban Thời sự',
    position: 'Phóng viên Điều tra & Đô thị',
    role: 'employee',
    phone: '0903 125 418',
    extension: '2102',
    birthDate: '1990-03-15',
    aliases: ['nhanvien', 'minhanh.nguyen'],
  },
  {
    id: 'user-anhtu',
    username: 'anhtu',
    fullName: 'Bùi Anh Tú',
    penName: 'Anh Tú',
    email: 'anhtu@tuoitre.com.vn',
    department: 'Ban Thời sự',
    position: 'Phóng viên Chính trị - Xã hội',
    role: 'employee',
    phone: '0905 228 619',
    extension: '2103',
    birthDate: '1992-07-08',
    aliases: ['tu.ba', 'buianhtu'],
  },
  {
    id: 'user-caocuong',
    username: 'caocuong',
    fullName: 'Lê Cao Cường',
    penName: 'Cao Cường',
    email: 'caocuong@tuoitre.com.vn',
    department: 'Ban Kinh tế',
    position: 'Trưởng Ban Kinh tế',
    role: 'manager',
    phone: '0919 488 011',
    extension: '2201',
    birthDate: '1979-10-12',
    aliases: ['cuong.lc', 'lecaocuong'],
  },
  {
    id: 'user-thuha',
    username: 'thuha',
    fullName: 'Trần Thu Hà',
    penName: 'Thu Hà',
    email: 'thuhatran@tuoitre.com.vn',
    department: 'Ban Nội dung',
    position: 'Phóng viên Kinh tế / Thị trường',
    role: 'employee',
    phone: '0918 340 226',
    extension: '2102',
    birthDate: '1988-06-25',
    aliases: ['ha.tt', 'tranthuha'],
  },
  {
    id: 'user-hoainam',
    username: 'hoainam',
    fullName: 'Nguyễn Hoài Nam',
    penName: 'Hoài Nam',
    email: 'hoainam@tuoitre.com.vn',
    department: 'Ban Quốc tế',
    position: 'Trưởng Ban Quốc tế',
    role: 'manager',
    phone: '0938 220 914',
    extension: '2103',
    birthDate: '1983-01-19',
    aliases: ['nam.nh', 'nguyenhoainam'],
  },
  {
    id: 'user-giahan',
    username: 'giahan',
    fullName: 'Đinh Gia Hân',
    penName: 'Gia Hân',
    email: 'giahan@tuoitre.com.vn',
    department: 'Ban Văn hóa - Giải trí',
    position: 'Trưởng Ban Văn hóa - Giải trí',
    role: 'manager',
    phone: '0935 841 206',
    extension: '2401',
    birthDate: '1986-08-14',
    aliases: ['han.dg', 'dinhgiahan'],
  },
  {
    id: 'user-haidang',
    username: 'haidang',
    fullName: 'Lương Hải Đăng',
    penName: 'Hải Đăng',
    email: 'haidang@tuoitre.com.vn',
    department: 'Ban Thể thao',
    position: 'Trưởng Ban Thể thao',
    role: 'manager',
    phone: '0912 590 774',
    extension: '2501',
    birthDate: '1981-03-03',
    aliases: ['dang.lh', 'luonghaidang'],
  },
  {
    id: 'user-hoangdiep',
    username: 'hoangdiep',
    fullName: 'Hoàng Điệp',
    penName: 'Hoàng Điệp',
    email: 'hoangdiep@tuoitre.com.vn',
    department: 'Ban Bạn đọc & Pháp luật',
    position: 'Trưởng Ban Bạn đọc & Pháp luật',
    role: 'manager',
    phone: '0909 611 016',
    extension: '2601',
    birthDate: '1982-11-28',
    aliases: ['diep.h'],
  },

  // 4. TRUNG TÂM MEDIA & CÔNG NGHỆ SỐ
  {
    id: 'user-hungthuat',
    username: 'hungthuat',
    fullName: 'Võ Hùng Thuật',
    penName: 'Hùng Thuật',
    email: 'hungthuat@tuoitre.com.vn',
    department: 'Trung tâm Media & Podcast',
    position: 'Giám đốc Trung tâm Media & Podcast',
    role: 'manager',
    phone: '0908 922 017',
    extension: '2701',
    birthDate: '1979-05-16',
    aliases: ['thuat.vh', 'vohungthuat'],
  },
  {
    id: 'user-quanghuy',
    username: 'quanghuy',
    fullName: 'Đỗ Quang Huy',
    penName: 'Quang Huy',
    email: 'quanghuy@tuoitre.com.vn',
    department: 'Phòng Công nghệ',
    position: 'Chuyên viên Dựng hình & Kỹ thuật số',
    role: 'employee',
    phone: '0914 733 280',
    extension: '2702',
    birthDate: '1991-09-09',
    aliases: ['huy.dq', 'doquanghuy'],
  },

  // 5. PHÒNG BAN CHỨC NĂNG (TỔ CHỨC, IT)
  {
    id: 'user-khanhvy',
    username: 'khanhvy',
    fullName: 'Trịnh Khánh Vy',
    penName: 'Khánh Vy',
    email: 'khanhvy@tuoitre.com.vn',
    department: 'Phòng Tổ chức - Cán bộ',
    position: 'Trưởng phòng Tổ chức - Cán bộ',
    role: 'manager',
    phone: '0977 635 410',
    extension: '3101',
    birthDate: '1985-04-18',
    aliases: ['vy.tk', 'trinhkhanhvy'],
  },
  {
    id: 'user-admin',
    username: 'admin',
    fullName: 'Phạm Đức Long (Admin)',
    penName: 'Đức Long',
    email: 'admin@tuoitre.com.vn',
    department: 'Ban Quản trị & Công nghệ',
    position: 'Quản trị viên Hệ thống IT',
    role: 'admin',
    phone: '0908 612 335',
    extension: '3201',
    birthDate: '1990-08-14',
    aliases: ['long.pd', 'phamduclong'],
  },
];

/**
 * Tài khoản mặc định người dùng (Nguyễn Minh Anh - username 'nhanvien' / 'minhanh')
 */
export const demoUser: User = demoUsers.find((u) => u.id === 'user-001')!;

/**
 * Tài khoản quản trị viên (Phạm Đức Long - username 'admin')
 */
export const adminUser: User = demoUsers.find((u) => u.id === 'user-admin')!;

/**
 * Tìm kiếm nhân sự theo username (hỗ trợ cả username chính thức và alias)
 */
export function findDemoUserByUsername(inputUsername: string): ExtendedDemoUser | undefined {
  const normalized = inputUsername.trim().toLowerCase();
  return demoUsers.find(
    (u) =>
      u.username.toLowerCase() === normalized ||
      (u.aliases && u.aliases.some((alias) => alias.toLowerCase() === normalized)),
  );
}

/**
 * Chuyển đổi danh sách demoUsers thành danh bạ liên hệ DirectoryContact
 */
export function getDirectoryContactsFromDemoUsers(): DirectoryContact[] {
  const extraContacts: DirectoryContact[] = [
    { id: 'contact-minhchau', fullName: 'Tạ Minh Châu', department: 'Phòng Công nghệ', phone: '0908 901 234', email: 'minhchau@tuoitre.com.vn', extension: '3002' },
    { id: 'contact-quocbao', fullName: 'Đặng Quốc Bảo', department: 'Ban Thư ký Tòa soạn', phone: '0918 012 345', email: 'quocbao@tuoitre.com.vn', extension: '1103' },
  ];
  return [...demoUsers.map((u) => ({
    id: `contact-${u.id}`,
    fullName: u.fullName,
    penName: u.penName,
    department: u.department,
    phone: u.phone,
    email: u.email,
    extension: u.extension,
  })), ...extraContacts];
}
