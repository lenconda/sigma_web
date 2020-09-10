import React from 'react';
import './index.less';

interface TaskItemProps {
  name: string;
  isDragging: boolean;
}

export default React.forwardRef(({ name, isDragging }: TaskItemProps, ref) => (
  <div ref={ref as any} className="list-item">
    <p>{name}</p>
    {
      !isDragging && <sub>caption</sub>
    }
  </div>
));
