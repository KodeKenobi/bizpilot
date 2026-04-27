import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "user" | "admin" | "super_admin";
    is_active: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "user" | "admin" | "super_admin";
      is_active: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin" | "super_admin";
    is_active?: boolean;
  }
}
