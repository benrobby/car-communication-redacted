import { getExploreName } from '../utils/platform';

export const devConfig = {
  sdkKey: 'REDACTED',
  sdkSecret: 'REDACTED',
  topic: 'gti',
  name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  password: '',
  signature: '',
};

export const CAR_NAME = 'gti'
export const PERSON_TO_CALL = 'DEMO_USER'
