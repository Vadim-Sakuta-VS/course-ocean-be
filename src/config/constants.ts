import { loadDotenv } from '../common/utils/dotenv';

loadDotenv();

export const __IS_PROD__ = process.env.NODE_ENV === 'production';
