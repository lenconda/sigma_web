import React, { useState, useRef, useEffect } from 'react';
import './index.less';

export interface EditableFieldProps {
  content: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  content,
  onChange,
  className = '',
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(undefined);

  useEffect(() => {
    if (editing && ref) {
      ref.current.focus();
    }
  }, [ref, editing]);

  return (
    editing
      ? <input
          ref={ref}
          className={`editable-field--input ${className}`}
          onChange={onChange}
          onBlur={() => setEditing(false)}
          defaultValue={content}
      />
      : <div
          className={`editable-field--div ${className}`}
          onClick={() => setEditing(true)}
      >{content}</div>
  );
};

export default EditableField;
