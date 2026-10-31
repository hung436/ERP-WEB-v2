import React from 'react';

export interface TuoiTreCloudLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  message?: string;
  subtext?: string;
  subMessage?: string;
  fullscreen?: boolean;
  className?: string;
}

export const TuoiTreCloudLoading: React.FC<TuoiTreCloudLoadingProps> = ({
  size = 'md',
  text,
  message,
  subtext,
  subMessage,
  fullscreen = false,
  className = '',
}) => {
  const displayTitle = text || message;
  const displaySubtitle = subtext || subMessage;

  return (
    <div
      className={`tuoitre-cloud-loading-container size-${size} ${
        fullscreen ? 'is-fullscreen' : ''
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="tuoitre-cloud-loading-wrapper">
        <svg viewBox="0 0 100 70" className="tuoitre-cloud-svg" aria-hidden="true">
          <defs>
            <linearGradient id="ttCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D92D20" />
              <stop offset="40%" stopColor="#FF5C4D" />
              <stop offset="70%" stopColor="#D92D20" />
              <stop offset="100%" stopColor="#B42318" />
            </linearGradient>
            <filter id="cloudShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#D92D20" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Đám mây nền mềm (Base body) */}
          <path
            d="M 28,58 H 76 A 16,16 0 0,0 80,26.5 A 22,22 0 0,0 44,14 A 18,18 0 0,0 20,34 A 14,14 0 0,0 28,58 Z"
            className="cloud-track"
            filter="url(#cloudShadow)"
          />

          {/* Đường viền đỏ chạy liên tục quanh chu vi (Animated running stroke) */}
          <path
            d="M 28,58 H 76 A 16,16 0 0,0 80,26.5 A 22,22 0 0,0 44,14 A 18,18 0 0,0 20,34 A 14,14 0 0,0 28,58 Z"
            className="cloud-running-stroke"
          />

          {/* Tâm nhận diện: Chữ T đỏ Tuổi Trẻ nhịp thở phát sáng */}
          <g className="cloud-center-brand">
            <text
              x="50"
              y="45"
              textAnchor="middle"
              className="cloud-brand-text"
            >
              T
            </text>
          </g>
        </svg>
      </div>

      {displayTitle && <div className="tuoitre-cloud-loading-text">{displayTitle}</div>}
      {displaySubtitle && <div className="tuoitre-cloud-loading-subtext">{displaySubtitle}</div>}
    </div>
  );
};

export default TuoiTreCloudLoading;
