import React, {
  useState,
  useEffect,
} from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PopupProvider from '../PopupProvider';
import Button from '@material-ui/core/Button';
import IconButton from '../IconButton';
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
  const [yearSelectorVisible, setYearSelectorVisible] = useState<boolean>(false);
  const [monthSelectorVisible, setMonthSelectorVisible] = useState<boolean>(false);
  const [selectorWidth, setSelectorWidth] = useState<number>(0);

  const years = new Array(20).fill(null).map((year, index) => {
    return new Date().getFullYear() - 10 + index;
  });
  const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

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

  useEffect(() => {
    setDates(startDate, endDate, startDate);
  }, [startDate, endDate]);

  return (
    <PopupProvider
      trigger={customComponent}
      open={datepickerVisible}
      onOpen={() => setDatepickerVisible(true)}
      disablePortal={true}
      closeOnClick={true}
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
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div
              ref={el => {
                if (el) {
                  const rect = el.getBoundingClientRect();
                  setSelectorWidth(parseFloat(rect.width.toFixed(2)));
                }
              }}
            >
              <div className="date-header">
                <IconButton
                  type="arrow-left"
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                />
                <div className="selector-control-wrapper">
                  <Button
                    onClick={() => {
                      setYearSelectorVisible(!yearSelectorVisible);
                      setMonthSelectorVisible(false);
                    }}
                    className={yearSelectorVisible ? 'active' : ''}
                  >
                    {date.getFullYear()}
                  </Button>
                  <Button
                    onClick={() => {
                      setYearSelectorVisible(false);
                      setMonthSelectorVisible(!monthSelectorVisible);
                    }}
                    className={monthSelectorVisible ? 'active' : ''}
                  >
                    {date.getMonth() + 1}
                  </Button>
                </div>
                <IconButton
                  type="arrow-right"
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                />
              </div>
              {
                (yearSelectorVisible || monthSelectorVisible)
                && <div className="selector-wrapper" style={{ width: selectorWidth }}>
                  <div className="items">
                    {
                      yearSelectorVisible && years.map((year, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            changeYear(year);
                            setYearSelectorVisible(false);
                            setMonthSelectorVisible(false);
                          }}
                          className={`item${date.getFullYear() === year ? ' current' : ''}`}
                        >
                          {year}
                        </button>
                      ))
                    }
                    {
                      monthSelectorVisible && months.map((month, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            changeMonth(parseInt(month, 10) - 1);
                            setYearSelectorVisible(false);
                            setMonthSelectorVisible(false);
                          }}
                          className={`item${months[date.getMonth()] === month ? ' current' : ''}`}
                        >
                          {month}
                        </button>
                      ))
                    }
                  </div>
                </div>
              }
            </div>
          )}
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
