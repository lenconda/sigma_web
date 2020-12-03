import {
  useState,
  useEffect,
} from 'react';
import {
  Location,
} from 'history';
import {
  parseSearch,
} from '../../utils/url';

export const useId = (location: Location) => {
  const [currentId, setCurrentId] = useState<string>('');

  useEffect(() => {
    const {
      id = '',
    } = parseSearch(location.search);
    setCurrentId(id);
  }, [location.search]);

  return currentId;
};
