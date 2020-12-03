import React, {
  useState,
  useEffect,
} from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PopupProvider from '../PopupProvider';
import Button from '@material-ui/core/Button';
import { DatePickerProps } from '../../interfaces';
import './index.less';

const DatePicker: React.FC<DatePickerProps> = ({
  startDate = new Date(),
  endDate = startDate,
  customComponent = <></>,
  onConfirm,
  selectsRange = false,
  zIndex = 9999,
  showTimeSelect = false,
}) => {
  const [datepickerVisible, setDatepickerVisible] = useState<boolean>(false);
  const [controlledStartDate, setControlledStartDate] = useState<Date>(undefined);
  const [controlledEndDate, setControlledEndDate] = useState<Date>(undefined);
  const [controlledSelectedDate, setControlledSelectedDate] = useState<Date>(undefined);

  useEffect(() => {
    setDates(startDate, endDate, startDate);
  }, [startDate, endDate]);

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

  const handleConfirmDateSelection = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const result: Date | [Date, Date] = !selectsRange
      ? controlledSelectedDate
      : [controlledStartDate, controlledEndDate || controlledStartDate];
    onConfirm(result, event);
    setDatepickerVisible(false);
  };

  return (
    <PopupProvider
      trigger={customComponent}
      open={datepickerVisible}
      onOpen={() => setDatepickerVisible(true)}
      disablePortal={true}
      zIndex={zIndex}
      className="date-picker__popup"
    >
      <div className="app-date-picker">
        <ReactDatePicker
          selected={controlledSelectedDate}
          startDate={controlledStartDate}
          endDate={controlledEndDate}
          onChange={handleSelectionChange}
          inline={true}
          selectsRange={selectsRange}
          customInput={customComponent}
          calendarClassName="date-picker-component"
          showTimeSelect={showTimeSelect}
        />
        <div className="app-date-picker__controls">
          <Button
            variant="outlined"
            style={{ width: '100%' }}
            color="default"
            onClick={handleConfirmDateSelection}
            className="app-button"
          >
            好
          </Button>
        </div>
      </div>
    </PopupProvider>
  );
};

export default DatePicker;
