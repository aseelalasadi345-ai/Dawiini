import { z } from 'zod';

export const pharmacySchema = z
  .object({
    name: z.string().trim().min(1, 'Pharmacy name is required'),
    address: z.string().trim().min(1, 'Address is required'),
    phone: z.string().trim().min(1, 'Phone number is required'),
    is24Hours: z.boolean().default(false),
    opensAt: z.string().trim().optional(),
    openUntil: z.string().trim().optional(),
    mapUrl: z
      .string()
      .trim()
      .url('Enter a valid map link (must start with http:// or https://)')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.is24Hours || (data.opensAt && data.openUntil), {
    message: 'Enter opening and closing times, or mark the pharmacy as open 24 hours',
    path: ['opensAt'],
  });

export type PharmacyInput = z.infer<typeof pharmacySchema>;
