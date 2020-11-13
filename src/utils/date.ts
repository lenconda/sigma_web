export const compare = (firstTime: Date, lastTime: Date) => {
  return firstTime.getTime() - lastTime.getTime();
};

export const isLeapYear = (year: number) => {
  return year % 100 !== 0 && year % 4 === 0 || year % 400 === 0;
};

// lastTime = current time, new Date()
export const getDaysDifference = (firstTime: Date, lastTime: Date) => {
  const gapDays = Math.floor((firstTime.getTime() - lastTime.getTime()) / 86400000);
  return gapDays;
};
