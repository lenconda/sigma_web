import { v3 as uuid, v4 as random } from 'uuid';

const generateUuid = (email: string = 'example@example.com') => {
  const namespace = random();
  return uuid(`${email}${Date.now().toString}${namespace}`, namespace);
};

export default generateUuid;
