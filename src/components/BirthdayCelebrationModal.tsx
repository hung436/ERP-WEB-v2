import { Button, Modal, message } from 'antd';
import { useState } from 'react';

import { BirthdayConfettiCanvas } from '@/components/BirthdayConfetti';
import type { User } from '@/types/domain';
import '@/styles/birthday-celebration.css';

interface BirthdayCelebrationModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export function BirthdayCelebrationModal({
  open,
  user,
  onClose,
}: BirthdayCelebrationModalProps) {
  const [candleBlown, setCandleBlown] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);

  if (!user) return null;

  const handleBlowCandle = () => {
    setCandleBlown(true);
    setConfettiActive(true);
    message.success('🎉 Chúc bạn một tuổi mới vạn sự như ý, luôn tràn đầy năng lượng & hạnh phúc!');
  };

  return (
    <>
      <BirthdayConfettiCanvas active={open && confettiActive} />

      <Modal
        centered
        className="birthday-celebration-modal"
        footer={null}
        onCancel={onClose}
        open={open}
        width={500}
      >
        {/* HERO SECTION */}
        <div className="birthday-modal-hero">
          <div className="balloon-group">
            <span className="balloon-item b1">🎈</span>
            <span className="balloon-item b2">🎈</span>
            <span className="balloon-item b3">🎈</span>
            <span className="balloon-item b4">🎈</span>
          </div>

          <div className="birthday-avatar-badge">
            {user.avatarUrl ? (
              <img alt={user.fullName} className="birthday-avatar-img" src={user.avatarUrl} />
            ) : (
              <div className="birthday-avatar-fallback">
                {user.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="avatar-crown">👑</span>
          </div>

          <div>
            <span className="birthday-hero-subtitle">✨ Happy Birthday</span>
            <h2 className="birthday-hero-name">
              Chúc mừng sinh nhật, <strong>{user.fullName}</strong>! 🎉
            </h2>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="birthday-modal-body">
          {/* WISH CARD */}
          <div className="birthday-letter-card">
            <p className="letter-quote-text" style={{ textAlign: 'center', margin: 0 }}>
              Kính chúc <strong>{user.fullName}</strong> một ngày sinh nhật ngập tràn niềm vui, bước sang tuổi mới luôn dồi dào sức khỏe, ngập tràn năng lượng tích cực, hạnh phúc và thành công trên mọi chặng đường!
            </p>
          </div>

          {/* CAKE & CANDLE INTERACTION */}
          <div className="birthday-interaction-section">
            <div className="cake-visual-wrapper">
              <div className="candles-row">
                {[1, 2, 3].map((i) => (
                  <div className="candle-unit" key={i}>
                    {!candleBlown ? (
                      <span className="flame-spark">🔥</span>
                    ) : (
                      <span className="smoke-puff">💨</span>
                    )}
                  </div>
                ))}
              </div>

              <span className="cake-icon-huge">🎂</span>

              {!candleBlown ? (
                <Button
                  className="btn-blow-candle"
                  onClick={handleBlowCandle}
                  style={{ marginTop: 14 }}
                  type="primary"
                >
                  Thổi nến & Nhận điều ước 🕯️💨
                </Button>
              ) : (
                <div className="lucky-wish-banner" style={{ marginTop: 14 }}>
                  <span>✨</span>
                  <span>Điều ước đã được gửi đi! Chúc bạn tuổi mới luôn tỏa sáng và hạnh phúc!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
