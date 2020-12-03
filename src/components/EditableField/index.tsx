import React, {
  useState,
  useEffect,
} from 'react';
import { EditableFieldProps } from '../../interfaces';
import './index.less';

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
