import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // En producción: slug.vendly.app → /store/slug
  // En desarrollo: localhost:3000 → normal
  const isProduction = hostname.includes("vendly.app")

  if (isProduction) {
    const slug = hostname.split(".vendly.app")[0]

    // Si no es el dominio principal
    if (slug && slug !== "vendly" && slug !== "www" && !hostname.startsWith("vendly.app")) {
      url.pathname = `/store/${slug}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}