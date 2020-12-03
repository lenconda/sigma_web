import { UrlParser } from 'url-params-parser';
import _merge from 'lodash/merge';

export const parseSearch = (search: string): Record<string, any> => {
  const rawSearchString = search.startsWith('?') ? search.slice(1) : search;
  const result = rawSearchString.split('&').reduce((currentResult, pair) => {
    const [key, value] = pair.split('=');
    if (key && value) {
      currentResult[key] = value;
    }
    return currentResult;
  }, {} as Record<string, any>);
  return result;
};

export const stringifySearch = (parsedSearch: Record<string, any>): string => {
  const result = Object.keys(parsedSearch).reduce<string>((currentResultString, key) => {
    const currentValue = parsedSearch[key];

    if (currentValue === null || typeof currentValue === 'undefined') {
      return currentResultString;
    }

    return `${currentResultString}${currentResultString === '' ? '' : '&'}${key}=${currentValue}`;
  }, '');

  return `?${result}`;
};

export const parseParams = (pathname: string, schema: string): Record<string, any> => {
  const parser = UrlParser(pathname, schema);
  return parser.namedParams;
};

export const updateSearch = (searchString: string, updateItems: Record<string, any>): string => {
  const originalSearchObject = parseSearch(searchString);
  const newSearchObject = _merge(originalSearchObject, updateItems);
  return stringifySearch(newSearchObject);
};

export const deleteSearch = (searchString: string, keys: string[]): string => {
  const originalSearchObject = parseSearch(searchString);
  const newSearchObject = Object
    .keys(originalSearchObject)
    .reduce<Record<string, any>>((currentResult, key) => {
      if (keys.indexOf(key) === -1) {
        currentResult[key] = originalSearchObject[key];
      }
      return currentResult;
    }, {} as Record<string, any>);
  return stringifySearch(newSearchObject);
};
