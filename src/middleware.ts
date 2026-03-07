import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith("/admindnarxx")) {
        return token?.role === "ADMIN"
      }
      return !!token
    },
  },
})

export const config = { matcher: ["/dashboard/:path*", "/admindnarxx/:path*"] }
