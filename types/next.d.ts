import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      username?: string;
      email?: string;
      fullName: string;
    } & DefaultSession["user"];
  }

  interface User {
    _id?: string;
    username?: string;
    fullName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    username?: string;
    fullName: string;
  }
}
