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
  placeholder = 'Nhập nội dung thư của bạn...',
  minHeight = 280,
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
        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('bold')}
            title="In đậm (Bold)"
            type="button"
          >
            <b>B</b>
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('italic')}
            title="In nghiêng (Italic)"
            type="button"
          >
            <i>I</i>
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('underline')}
            title="Gạch chân (Underline)"
            type="button"
          >
            <u>U</u>
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('strikeThrough')}
            title="Gạch ngang (Strikethrough)"
            type="button"
          >
            <s>S</s>
          </button>
        </div>

        <span className="rte-divider" />

        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyLeft')}
            title="Căn trái"
            type="button"
          >
            ⇐ Trái
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyCenter')}
            title="Căn giữa"
            type="button"
          >
            ≡ Giữa
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('justifyRight')}
            title="Căn phải"
            type="button"
          >
            ⇒ Phải
          </button>
        </div>

        <span className="rte-divider" />

        <div className="rte-btn-group">
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('insertUnorderedList')}
            title="Danh sách đầu dòng"
            type="button"
          >
            • Danh sách
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('insertOrderedList')}
            title="Danh sách số thứ tự"
            type="button"
          >
            1. Số thứ tự
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Trích dẫn"
            type="button"
          >
            “ Trích dẫn
          </button>
        </div>

        <span className="rte-divider" />

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
            🔗 Link
          </button>
          <button
            onMouseDown={preventFocusLoss}
            onClick={() => execCommand('removeFormat')}
            title="Xóa định dạng"
            type="button"
          >
            🧹 Xóa kiểu
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
