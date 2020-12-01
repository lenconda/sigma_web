export const mergeClasses = <T>(defaultClasses: T, customClasses: T): T => {
  return Object.keys(defaultClasses).reduce<T>((result, key) => {
    const defaultValue = defaultClasses[key];
    const customValue = customClasses[key] || '';
    result[key] = `${defaultValue}${(customValue && defaultValue !== customValue) ? ` ${customValue}` : ''}`;
    return result;
  }, {} as T);
};
