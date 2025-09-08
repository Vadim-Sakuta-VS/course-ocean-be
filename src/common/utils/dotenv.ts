import dotenv from 'dotenv';

export const loadDotenv = () => {
  dotenv.config({ path: ['.env', '.env.local'], override: true });
};
