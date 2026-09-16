export { proxy as middleware, config } from './proxy';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!accessToken) {
    if (refreshToken) {
      try {
        const response = await checkSession();
        const setCookie = response.headers['set-cookie'];

        if (setCookie) {
          const cookieArray = Array.isArray(setCookie)
            ? setCookie
            : [setCookie];

          for (const cookieStr of cookieArray) {
            const parsed = parse(cookieStr);
            const options = {
              path: parsed.Path,
              maxAge: Number(parsed['Max-Age']),
              expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
            };

            if (parsed.accessToken) {
              cookieStore.set('accessToken', parsed.accessToken, options);
            }
            if (parsed.refreshToken) {
              cookieStore.set('refreshToken', parsed.refreshToken, options);
            }
          }

          if (isPublicRoute) {
            return NextResponse.redirect(new URL('/profile', request.url));
          }

          return NextResponse.next();
        }
      } catch {
        // session invalid
      }
    }

    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};