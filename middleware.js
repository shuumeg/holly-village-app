import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
};

export default function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  const authHeader = request.headers.get('authorization');

  if (password && authHeader && authHeader.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice('Basic '.length));
    const enteredPassword = decoded.split(':').slice(1).join(':');
    if (enteredPassword === password) {
      return next();
    }
  }

  return new Response('認証が必要です', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Holly Village"',
    },
  });
}
