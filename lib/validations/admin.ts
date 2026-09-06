import { z } from 'zod';
import { DAY_NAMES } from '@/lib/pharmacyHours';

// One entry per day of the week (see lib/pharmacyHours.ts). `opensAt`/
// `closesAt` are "HH:MM" 24-hour strings straight from a native
// <input type="time">, not display strings — route.ts formats those into
// the "8:00 AM – 11:00 PM" style PharmacyHours.hours actually stores.
//
// This shape is deliberately agnostic to whether a given day's values came
// from the form's "default schedule" or a per-day "exception" — that
// distinction only exists client-side (PharmacyForm.tsx resolves it before
// submitting). By the time it reaches here, every day already has its own
// final closed/is24h/opensAt/closesAt, independent of every other day, so
// the resolved array can be any mix (all identical, all different, or
// anywhere in between) without this schema caring which.
//
// `is24h` is a per-day flag distinct from the top-level `is24Hours` below —
// it's what makes a single day able to be a 24-hour exception while the
// rest of the week is a specific time range (e.g. the real seeded "New
// Lebanon Pharmacy": Monday is 24 hours, the rest of the week isn't).
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const dayHoursSchema = z
  .object({
    day: z.enum(DAY_NAMES),
    closed: z.boolean().default(false),
    is24h: z.boolean().default(false),
    opensAt: z.string().regex(TIME_REGEX, 'Enter a valid time').optional().or(z.literal('')),
    closesAt: z.string().regex(TIME_REGEX, 'Enter a valid time').optional().or(z.literal('')),
  })
  .refine((day) => day.closed || day.is24h || (day.opensAt && day.closesAt), {
    message: 'Enter opening and closing times, mark this day as 24 hours, or mark it as closed',
    path: ['opensAt'],
  });

export const pharmacySchema = z
  .object({
    name: z.string().trim().min(1, 'Pharmacy name is required'),
    address: z.string().trim().min(1, 'Address is required'),
    phone: z.string().trim().min(1, 'Phone number is required'),
    // When true, route.ts writes all 7 days as "Open 24 hours" itself and
    // ignores `hours` entirely — the client doesn't need to (and shouldn't
    // have to) send 7 redundant identical rows for the common case. The
    // client only sets this when the *entire resolved week* ends up 24
    // hours (default 24h, no day-exceptions) — a single 24-hour exception
    // day alongside a timed default still goes through `hours` below (with
    // that one day's own `is24h: true`), not this shortcut.
    is24Hours: z.boolean().default(false),
    // Required (exactly the 7 real day names, each once) only when
    // is24Hours is false — see the top-level refine below.
    hours: z.array(dayHoursSchema).optional(),
    mapUrl: z
      .string()
      .trim()
      .url('Enter a valid map link (must start with http:// or https://)')
      .optional()
      .or(z.literal('')),
    // Optional — most admins won't have exact coordinates on hand yet, and
    // nothing downstream depends on them being present (no distance
    // calculation/display is built yet, just capturing the data going
    // forward). Range-validated rather than just typed as `number` so a
    // typo (e.g. a longitude with too many digits) fails loudly instead of
    // silently storing a bogus point.
    latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional(),
    longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional(),
  })
  .refine(
    (data) =>
      data.is24Hours ||
      (data.hours &&
        data.hours.length === DAY_NAMES.length &&
        DAY_NAMES.every((day) => data.hours!.some((h) => h.day === day))),
    {
      message: 'Enter hours for every day of the week, or mark the pharmacy as open 24 hours',
      path: ['hours'],
    },
  )
  .refine((data) => (data.latitude === undefined) === (data.longitude === undefined), {
    message: 'Enter both latitude and longitude, or leave both blank',
    path: ['longitude'],
  });

export type PharmacyInput = z.infer<typeof pharmacySchema>;
