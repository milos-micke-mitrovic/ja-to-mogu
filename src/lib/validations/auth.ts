import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Unesite ispravnu email adresu'),
  password: z.string().min(1, 'Lozinka je obavezna'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Ime mora imati najmanje 2 karaktera')
      .max(100, 'Ime može imati najviše 100 karaktera'),
    email: z.string().email('Unesite ispravnu email adresu'),
    password: z
      .string()
      .min(8, 'Lozinka mora imati najmanje 8 karaktera')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Lozinka mora sadržati najmanje jedno veliko slovo, jedno malo slovo i jedan broj'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Unesite ispravnu email adresu'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8, 'Lozinka mora imati najmanje 8 karaktera')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Lozinka mora sadržati najmanje jedno veliko slovo, jedno malo slovo i jedan broj'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordRequestFormData = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
