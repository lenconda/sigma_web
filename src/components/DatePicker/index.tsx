import React, { ReactNode } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.less';

export interface DatePickerProps {
  startDate?: Date;
  customComponent?: ReactNode;
  onChange: (data: Date | [Date, Date], event: React.SyntheticEvent<any, Event>) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  startDate = new Date(),
  customComponent = <></>,
  onChange,
}) => {
  return (
    <ReactDatePicker
      selected={startDate}
      onChange={onChange}
      customInput={customComponent}
      calendarClassName="date-picker-component"
    />
  );
};

export default DatePicker;
