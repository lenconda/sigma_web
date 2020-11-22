import React, { ReactNode } from 'react';
import ReactDatePicker from 'react-datepicker';

export interface DatePickerProps {
  startDate?: Date;
  customComponent?: ReactNode;
}

const DatePicker: React.FC<DatePickerProps> = ({
  startDate = new Date(),
  customComponent = <input />,
}) => {
  return (
    <ReactDatePicker
      startDate={startDate}
      onChange={date => console.log(date)}
      customInput={customComponent}
    />
  );
};

export default DatePicker;
