import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung thông báo...',
  minHeight = 220,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const execCommand = (command: string, valueArg: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, valueArg);
    handleInput();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    onChange?.(editorRef.current.innerHTML);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="rich-text-editor-container">
      <div className="rte-toolbar">
        {/* Nhóm B, I, U, S */}
        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('bold')}
            title="In đậm"
            type="button"
          >
            <strong style={{ fontFamily: 'serif', fontSize: '15px' }}>B</strong>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('italic')}
            title="In nghiêng"
            type="button"
          >
            <em style={{ fontFamily: 'serif', fontSize: '15px' }}>I</em>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('underline')}
            title="Gạch chân"
            type="button"
          >
            <u style={{ fontFamily: 'serif', fontSize: '15px' }}>U</u>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('strikeThrough')}
            title="Gạch ngang"
            type="button"
          >
            <s style={{ fontFamily: 'serif', fontSize: '15px' }}>S</s>
          </button>
        </div>

        <span className="rte-divider" />

        {/* Căn lề ICON ONLY */}
        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyLeft')}
            title="Căn trái"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyCenter')}
            title="Căn giữa"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="10" x2="6" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="18" y1="18" x2="6" y2="18" />
            </svg>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyRight')}
            title="Căn phải"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="7" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyFull')}
            title="Căn đều"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </button>
        </div>

        <span className="rte-divider" />

        {/* Danh sách & Trích dẫn ICON ONLY */}
        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('insertUnorderedList')}
            title="Danh sách gạch đầu dòng"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('insertOrderedList')}
            title="Danh sách số"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" />
              <path d="M4 10h2" />
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Trích dẫn"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c0 4-2 6-4 6z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c0 4-2 6-4 6z" />
            </svg>
          </button>
        </div>

        <span className="rte-divider" />

        {/* Link & Clear format ICON ONLY */}
        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => {
              const url = prompt('Nhập đường dẫn URL (vd: https://tuoitre.vn):', 'https://');
              if (url) execCommand('createLink', url);
            }}
            title="Chèn liên kết"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('removeFormat')}
            title="Xóa định dạng"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rte-content-editable"
        contentEditable
        data-placeholder={placeholder}
        onBlur={handleInput}
        onInput={handleInput}
        style={{ minHeight }}
      />
    </div>
  );
}
