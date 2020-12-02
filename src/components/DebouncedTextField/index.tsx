import React, {
  useState,
  useEffect,
} from 'react';
import {
  useDebouncedValue,
  useUpdateEffect,
} from '../../core/hooks';
import Textarea from 'react-textarea-autosize';
import './index.less';

type ChangeEventType = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type KeyboardEventType = React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;

const AutoResizeTextarea = Textarea as any;

export interface DebouncedTextFieldProps {
  type?: 'text' | 'number' | 'textarea';
  className?: string;
  delay?: number;
  placeholder?: string;
  value?: string | number;
  onKeyPress?: (event: KeyboardEventType) => void;
  onKeyUp?: (event: KeyboardEventType) => void;
  onKeyDown?: (event: KeyboardEventType) => void;
  onChange?: (event: ChangeEventType) => void;
  onPressEnter?: (content: string | number) => boolean;
}

const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({
  type = 'text',
  className = '',
  delay = 500,
  placeholder = '',
  value = '',
  onChange,
  onKeyPress,
  onKeyDown,
  onKeyUp,
  onPressEnter,
}) => {
  const [event, setEvent] = useState<ChangeEventType | undefined>(undefined);
  const [controlledValue, setControlledValue] = useState<string | number>('');
  const debouncedEvent = useDebouncedValue(event, delay);

  const generateClassName = (type: 'input' | 'textarea') => {
    return `app-debounced-textfield ${type} ${className && ` ${className}` || ''}`;
  };

  const handleInputChange = (event: ChangeEventType) => {
    event.persist();
    setControlledValue(event.target.value);
    setEvent(event);
  };

  const handleInputKeyPress = (keyboardEvent: React.KeyboardEvent<HTMLElement>) => {
    if (
      (keyboardEvent.keyCode === 13 || keyboardEvent.key.toLowerCase() === 'enter')
      && onPressEnter
      && onPressEnter((event && event.target && event.target.value) || (type === 'number' ? 0 : ''))
    ) {
      setControlledValue('');
    }
  };

  useUpdateEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(debouncedEvent);
    }
  }, [debouncedEvent]);

  useEffect(() => {
    setControlledValue(value);
  }, [value]);

  return (
    type === 'textarea'
      ? <AutoResizeTextarea
          className={generateClassName('textarea')}
          placeholder={placeholder}
          value={controlledValue}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
      />
      : <input
          type={type}
          className={generateClassName('input')}
          placeholder={placeholder}
          value={controlledValue}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onKeyUp={handleInputKeyPress}
      />
  );
};

export default DebouncedTextField;
