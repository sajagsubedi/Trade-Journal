import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(50, { message: "Full name cannot be longer than 50 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(50, { message: "Username cannot be longer than 50 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(1024, { message: "Password cannot be longer than 1024 characters" }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;