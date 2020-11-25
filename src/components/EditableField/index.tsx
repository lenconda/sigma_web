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
  const [controlledValue, setControlledValue] = useState<string>('');

  useEffect(() => {
    setControlledValue(content);
  }, [content]);

  return (
    <input
      type="text"
      className={`editable-field--input ${className}`}
      value={controlledValue || ''}
      onChange={event => {
        setControlledValue(event.target.value);
        onChange(event);
      }}
    />
  );
};

export default EditableField;
