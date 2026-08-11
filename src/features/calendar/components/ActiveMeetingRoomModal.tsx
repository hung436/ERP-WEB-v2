import { Button, Input, Modal, Tabs, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import type { CalendarEvent } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

interface ChatMessage {
  id: string;
  sender: string;
  time: string;
  text: string;
}

export function ActiveMeetingRoomModal({
  event,
  onClose,
}: {
  event: CalendarEvent;
  onClose: () => void;
}) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'people' | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: event.organizer, time: '08:31', text: 'Chào mọi người, chúng ta bắt đầu buổi họp nhé.' },
    { id: '2', sender: 'Lê Thanh Vân', time: '08:32', text: 'Đã chuẩn bị xong tài liệu rồi ạ.' },
  ]);

  const participants = event.participants ?? [event.organizer, 'Nguyễn Minh Anh (Bạn)', 'Lê Thanh Vân', 'Nguyễn Hoài Nam'];

  const toggleMic = () => {
    setMicOn(!micOn);
    message.info(!micOn ? 'Đã bật micro' : 'Đã tắt micro');
  };

  const toggleCamera = () => {
    setCameraOn(!cameraOn);
    message.info(!cameraOn ? 'Đã bật camera' : 'Đã tắt camera');
  };

  const toggleScreenShare = () => {
    setScreenSharing(!screenSharing);
    message.success(!screenSharing ? 'Đang chia sẻ màn hình của bạn' : 'Đã dừng chia sẻ màn hình');
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    message.info(!handRaised ? 'Bạn đã giơ tay phát biểu ✋' : 'Đã hạ tay xuống');
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'Nguyễn Minh Anh (Bạn)', time: timeStr, text: chatInput.trim() },
    ]);
    setChatInput('');
  };

  return (
    <Modal
      centered
      className="in-app-meeting-modal"
      footer={null}
      keyboard={false}
      maskClosable={false}
      onCancel={onClose}
      open
      title={null}
      width="96vw"
    >
      <div className="in-app-meeting-container">
        {/* TOP MEETING HEADER */}
        <header className="meeting-room-header">
          <div className="meeting-room-info">
            <span className="live-rec-badge">
              <i className="rec-dot" />
              <span>REC</span>
            </span>
            <div className="meeting-room-title">
              <h2>{event.title}</h2>
              <small>Mã phòng họp nội bộ: <strong>{event.meetingId ?? 'TT-482-193'}</strong> · Chủ trì: {event.organizer}</small>
            </div>
          </div>

          <div className="meeting-room-header-actions">
            <Button
              className={activeSideTab === 'people' ? 'active-tab-btn' : ''}
              icon={<ModuleIcon module="meetings" size={16} />}
              onClick={() => setActiveSideTab(activeSideTab === 'people' ? null : 'people')}
            >
              Thành viên ({participants.length})
            </Button>
            <Button
              className={activeSideTab === 'chat' ? 'active-tab-btn' : ''}
              icon={<ModuleIcon module="announcements" size={16} />}
              onClick={() => setActiveSideTab(activeSideTab === 'chat' ? null : 'chat')}
            >
              Trò chuyện ({messages.length})
            </Button>
          </div>
        </header>

        {/* MAIN MEETING BODY GRID */}
        <div className="meeting-room-body">
          {/* VIDEO STAGE */}
          <div className="meeting-video-stage">
            {screenSharing ? (
              <div className="screenshare-tile">
                <div className="screenshare-preview">
                  <span className="screenshare-icon">🖥️</span>
                  <h3>Bạn đang chia sẻ màn hình</h3>
                  <p>Mọi người trong cuộc họp đang nhìn thấy màn hình làm việc của bạn</p>
                </div>
                <div className="presenter-tag">Nguyễn Minh Anh (Bạn) · Đang trình chiếu</div>
              </div>
            ) : (
              <div className="video-grid">
                {/* Participant Tiles */}
                <div className="video-tile speaker-tile">
                  <div className="avatar-placeholder">
                    <span className={`avatar-circle ${avatarTone(event.organizer)}`}>
                      {event.organizer.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="tile-overlay">
                    <span className="mic-badge active">🎙️</span>
                    <span className="name-tag">{event.organizer} (Chủ trì · Đang nói)</span>
                  </div>
                </div>

                <div className={`video-tile ${!cameraOn ? 'camera-off' : ''}`}>
                  <div className="avatar-placeholder">
                    {cameraOn ? (
                      <div className="simulated-webcam">
                        <span className="webcam-live-indicator">LIVE WEBCAM</span>
                      </div>
                    ) : (
                      <span className="avatar-circle tone-red">NMA</span>
                    )}
                  </div>
                  <div className="tile-overlay">
                    <span className={`mic-badge ${micOn ? 'active' : 'muted'}`}>{micOn ? '🎙️' : '🔇'}</span>
                    <span className="name-tag">Nguyễn Minh Anh (Bạn) {handRaised ? '✋' : ''}</span>
                  </div>
                </div>

                {participants.slice(2, 6).map((person) => (
                  <div className="video-tile" key={person}>
                    <div className="avatar-placeholder">
                      <span className={`avatar-circle ${avatarTone(person)}`}>
                        {person.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="tile-overlay">
                      <span className="mic-badge muted">🔇</span>
                      <span className="name-tag">{person}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDE DRAWER (Chat or Participants) */}
          {activeSideTab && (
            <aside className="meeting-side-drawer">
              {activeSideTab === 'chat' && (
                <div className="drawer-panel chat-panel">
                  <div className="drawer-header">
                    <h3>Tin nhắn cuộc họp</h3>
                    <Button onClick={() => setActiveSideTab(null)} type="text">✕</Button>
                  </div>
                  <div className="chat-messages-list">
                    {messages.map((msg) => (
                      <div className={`chat-bubble ${msg.sender.includes('Bạn') ? 'mine' : ''}`} key={msg.id}>
                        <div className="msg-info">
                          <strong>{msg.sender}</strong>
                          <time>{msg.time}</time>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-row">
                    <Input
                      onChange={(e) => setChatInput(e.target.value)}
                      onPressEnter={sendMessage}
                      placeholder="Gửi tin nhắn vào cuộc họp..."
                      value={chatInput}
                    />
                    <Button onClick={sendMessage} type="primary">Gửi</Button>
                  </div>
                </div>
              )}

              {activeSideTab === 'people' && (
                <div className="drawer-panel people-panel">
                  <div className="drawer-header">
                    <h3>Thành viên ({participants.length})</h3>
                    <Button onClick={() => setActiveSideTab(null)} type="text">✕</Button>
                  </div>
                  <ul className="people-list">
                    {participants.map((person, idx) => (
                      <li key={person}>
                        <span className="person-name">
                          <i className={`avatar-mini ${avatarTone(person)}`}>
                            {person.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase()}
                          </i>
                          <strong>{person}</strong>
                        </span>
                        <span className="person-status">
                          {idx === 0 ? '🎙️ Host' : idx === 1 ? (micOn ? '🎙️' : '🔇') : '🔇'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* BOTTOM GOOGLE MEET CONTROL BAR */}
        <footer className="meeting-room-controls">
          <div className="controls-left">
            <span className="room-code-tag">ID: {event.meetingId ?? 'TT-482-193'}</span>
          </div>

          <div className="controls-center">
            <Tooltip title={micOn ? 'Tắt micro' : 'Bật micro'}>
              <button className={`control-btn ${!micOn ? 'off' : ''}`} onClick={toggleMic} type="button">
                {micOn ? '🎙️' : '🔇'}
              </button>
            </Tooltip>

            <Tooltip title={cameraOn ? 'Tắt camera' : 'Bật camera'}>
              <button className={`control-btn ${!cameraOn ? 'off' : ''}`} onClick={toggleCamera} type="button">
                {cameraOn ? '📹' : '🚫'}
              </button>
            </Tooltip>

            <Tooltip title={screenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}>
              <button className={`control-btn ${screenSharing ? 'active' : ''}`} onClick={toggleScreenShare} type="button">
                🖥️
              </button>
            </Tooltip>

            <Tooltip title={handRaised ? 'Hạ tay xuống' : 'Giơ tay phát biểu'}>
              <button className={`control-btn ${handRaised ? 'active' : ''}`} onClick={toggleHandRaise} type="button">
                ✋
              </button>
            </Tooltip>

            <Tooltip title="Thành viên">
              <button className="control-btn" onClick={() => setActiveSideTab(activeSideTab === 'people' ? null : 'people')} type="button">
                👥
              </button>
            </Tooltip>

            <Tooltip title="Trò chuyện">
              <button className="control-btn" onClick={() => setActiveSideTab(activeSideTab === 'chat' ? null : 'chat')} type="button">
                💬
              </button>
            </Tooltip>

            <Tooltip title="Rời khỏi cuộc họp">
              <button className="control-btn end-call-btn" onClick={onClose} type="button">
                📞 Rời họp
              </button>
            </Tooltip>
          </div>

          <div className="controls-right">
            <small>Tuổi Trẻ In-App Video Engine</small>
          </div>
        </footer>
      </div>
    </Modal>
  );
}
