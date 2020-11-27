import React, { ReactNode } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.less';

export interface DatePickerProps {
  startDate?: Date;
  endDate?: Date;
  customComponent?: ReactNode;
  onChange: (data: Date | [Date, Date], event: React.SyntheticEvent<any, Event>) => void;
  selectsRange?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  startDate = new Date(),
  endDate = startDate,
  customComponent = <></>,
  onChange,
  selectsRange = false,
}) => {
  return (
    <ReactDatePicker
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      selectsRange={selectsRange}
      customInput={customComponent}
      calendarClassName="date-picker-component"
    />
  );
};

export default DatePicker;
