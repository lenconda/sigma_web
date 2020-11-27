import React, {
  ReactNode,
  useState,
  useEffect,
} from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.less';

export interface DatePickerProps {
  startDate?: Date;
  endDate?: Date;
  inline?: boolean;
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
  inline = false,
}) => {
  const [controlledStartDate, setControlledStartDate] = useState<Date>(undefined);
  const [controlledEndDate, setControlledEndDate] = useState<Date>(undefined);
  const [controlledSelectedDate, setControlledSelectedDate] = useState<Date>(undefined);

  useEffect(() => {
    setDates(startDate, endDate, startDate);
  }, []);

  const setDates = (startDate: Date, endDate: Date, selectedDate: Date) => {
    setControlledStartDate(startDate);
    setControlledEndDate(endDate);
    setControlledSelectedDate(selectedDate);
  };

  const handleSelectionChange = (dates: Date | [Date, Date]) => {
    if (dates instanceof Date) {
      setDates(dates, dates, dates);
    } else if (Array.isArray(dates)) {
      const [startDate, endDate = startDate] = dates;
      setDates(startDate, endDate, startDate);
    }
  };

  return (
    <ReactDatePicker
      selected={controlledSelectedDate}
      startDate={controlledStartDate}
      endDate={controlledEndDate}
      onChange={handleSelectionChange}
      inline={inline}
      selectsRange={selectsRange}
      customInput={customComponent}
      calendarClassName="date-picker-component"
    />
  );
};

export default DatePicker;
