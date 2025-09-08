import { z } from "zod/v4";

const MIN_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

export const userSignupSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH),
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});
export type UserSignup = z.infer<typeof userSignupSchema>;

export const userSigninSchema = userSignupSchema.pick({
  email: true,
  password: true,
});
export type UserSignin = z.infer<typeof userSigninSchema>;
