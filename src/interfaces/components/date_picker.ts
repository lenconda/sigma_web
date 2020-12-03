export interface DatePickerProps {
  startDate?: Date;
  endDate?: Date;
  customComponent?: JSX.Element;
  onConfirm: (data: Date | [Date, Date], event: React.SyntheticEvent<any, Event>) => void;
  selectsRange?: boolean;
  showTimeSelect?: boolean;
  zIndex?: number;
}
