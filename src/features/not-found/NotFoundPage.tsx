import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

export function NotFoundPage() { return <Result status="404" title="Không tìm thấy trang" subTitle="Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi." extra={<Link to="/"><Button type="primary">Về trang chủ</Button></Link>} />; }
