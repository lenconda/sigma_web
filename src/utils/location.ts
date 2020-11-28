import {
  Location,
} from 'history';

export interface ParsableLocation {
  pathname: string;
  search: Record<string, any>;
  hash: string;
  state: Record<string, any> | {};
}

export const stringify = (location: ParsableLocation): string => {
  const {
    pathname = '',
    search = {},
    hash = '',
  } = location;
  const searchString = Object.keys(search).reduce((result, key, index) => {
    if (key && search[key]) {
      const newString = `${result}${index === 0 ? '' : '&'}${key}=${search[key]}`;
      return newString;
    }
    return result;
  }, '');
  return `${pathname}${searchString ? `?${searchString}` : ''}${hash}`;
};

export const parse = (location: Location): ParsableLocation => {
  const {
    pathname = '',
    search = '?',
    hash = '',
    state = {},
  } = location;
  const searchObject = search.slice(1).split('&').reduce((result, currentPair) => {
    const [key, value] = currentPair.split('=');
    if (key && value) {
      result[key] = value;
    }
    return result;
  }, {});
  return {
    pathname,
    search: searchObject,
    hash,
    state,
  };
};
