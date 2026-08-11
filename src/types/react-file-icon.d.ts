declare module 'react-file-icon' {
  import * as React from 'react';

  export interface FileIconProps {
    color?: string;
    extension?: string;
    fold?: boolean;
    glyphColor?: string;
    gradientColor?: string;
    gradientOpacity?: number;
    labelColor?: string;
    labelUppercase?: boolean;
    radius?: number;
    type?: string;
  }

  export const FileIcon: React.FC<FileIconProps>;
  export const defaultStyles: Record<string, Partial<FileIconProps>>;
}
