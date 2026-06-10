'use client'

import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnBulletList,
  BtnNumberedList,
  BtnLink
} from 'react-simple-wysiwyg'

interface BasicEditorProps {
  value: string

  onChange: (value: string) => void

  placeholder: string

  className: string

  disabled?: boolean

  rows?: number

  style?: React.CSSProperties

  onKeyDown?: (
    e: React.KeyboardEvent
  ) => void
}

export default function BasicEditor({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  rows,
  style,
  onKeyDown,
}: BasicEditorProps) {
  return (
    <EditorProvider>
      <div
        className={className}
        style={style}
      >
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnBulletList />
          <BtnNumberedList />
          <BtnLink />
        </Toolbar>

        <Editor
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          onChange={(e) =>
            onChange(e.target.value)
          }
          style={{
            minHeight: rows
              ? `${rows * 24}px`
              : '120px',
          }}
        />
      </div>
    </EditorProvider>
  )
}