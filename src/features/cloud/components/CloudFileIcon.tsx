import React from 'react';
import {
  Folder,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Video,
  Music,
  Code2,
  FileQuestion,
  Presentation,
} from 'lucide-react';
import { CloudItem } from '../types';

interface CloudFileIconProps {
  type: CloudItem['type'];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CloudFileIcon: React.FC<CloudFileIconProps> = ({ type, size = 'md', className = '' }) => {
  const pixelSizes = {
    sm: 18,
    md: 24,
    lg: 40,
    xl: 56,
  };

  const px = pixelSizes[size];

  switch (type) {
    case 'folder':
      return (
        <div className={`inline-flex items-center justify-center text-amber-500 ${className}`}>
          <Folder size={px} className="fill-amber-400/30 stroke-[1.8]" />
        </div>
      );
    case 'pdf':
      return (
        <div className={`inline-flex items-center justify-center text-rose-600 ${className}`}>
          <FileText size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'docx':
      return (
        <div className={`inline-flex items-center justify-center text-blue-600 ${className}`}>
          <FileText size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'xlsx':
      return (
        <div className={`inline-flex items-center justify-center text-emerald-600 ${className}`}>
          <FileSpreadsheet size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'pptx':
      return (
        <div className={`inline-flex items-center justify-center text-amber-600 ${className}`}>
          <Presentation size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'image':
      return (
        <div className={`inline-flex items-center justify-center text-purple-600 ${className}`}>
          <ImageIcon size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'archive':
      return (
        <div className={`inline-flex items-center justify-center text-amber-700 ${className}`}>
          <FileArchive size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'video':
      return (
        <div className={`inline-flex items-center justify-center text-indigo-600 ${className}`}>
          <Video size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'audio':
      return (
        <div className={`inline-flex items-center justify-center text-pink-600 ${className}`}>
          <Music size={px} className="stroke-[1.8]" />
        </div>
      );
    case 'code':
      return (
        <div className={`inline-flex items-center justify-center text-cyan-600 ${className}`}>
          <Code2 size={px} className="stroke-[1.8]" />
        </div>
      );
    default:
      return (
        <div className={`inline-flex items-center justify-center text-slate-500 ${className}`}>
          <FileQuestion size={px} className="stroke-[1.8]" />
        </div>
      );
  }
};
