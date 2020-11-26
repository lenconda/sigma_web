import React, {
  useState,
  useEffect,
} from 'react';
import './index.less';

export interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  className = '',
  onClick,
}) => {
  const [
    controlledCheckState,
    setControlledCheckState,
  ] = useState<boolean>(false);

  useEffect(() => {
    setControlledCheckState(checked);
  }, [checked]);

  return <input
    type="checkbox"
    checked={controlledCheckState || false}
    onChange={onChange}
    onClick={onClick}
    className={`app-checkbox${className && ` ${className} || ''`}`}
  />;
};

export default Checkbox;
