export interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
}
