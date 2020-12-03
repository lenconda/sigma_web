import React, {
  useState,
  useEffect,
} from 'react';
import { CheckboxProps } from '../../interfaces';
import './index.less';

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
