import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
};

export default function middleware() {
  return next();
}
