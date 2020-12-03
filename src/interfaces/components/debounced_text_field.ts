type ChangeEventType = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type KeyboardEventType = React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface DebouncedTextFieldProps {
  type?: 'text' | 'number' | 'textarea';
  className?: string;
  delay?: number;
  placeholder?: string;
  value?: string | number;
  focus?: boolean;
  onKeyPress?: (event: KeyboardEventType) => void;
  onKeyUp?: (event: KeyboardEventType) => void;
  onKeyDown?: (event: KeyboardEventType) => void;
  onChange?: (event: ChangeEventType) => void;
  onPressEnter?: (content: string | number) => boolean;
}
