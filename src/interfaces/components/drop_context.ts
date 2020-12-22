export interface DropContextProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  onDrop?: <T>() => T;
}
