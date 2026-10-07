export type UserPlan = "demo" | "paid";
export type UserRole = "owner" | "tenant";

export type DummyBilling = {
  dummy: true;
  last4: string;
  brand: string;
  acceptedAt: string;
};

export type AppUser = {
  _id: string;
  email: string;
  name: string;
  passwordHash?: string | null;
  role: UserRole;
  plan: UserPlan;
  googleId?: string | null;
  billing?: DummyBilling | null;
  createdAt: Date;
  updatedAt: Date;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      plan: UserPlan;
      role: UserRole;
    };
  }

  interface User {
    plan?: UserPlan;
    role?: UserRole;
  }

  interface JWT {
    id?: string;
    plan?: UserPlan;
    role?: UserRole;
  }
}
