import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: [
    "/",
    "/journal/:path*",
    "/analytics/:path*",
    "/calendar/:path*",
    "/settings/:path*",
    "/api/trades/:path*",
    "/api/settings/:path*",
  ],
};
