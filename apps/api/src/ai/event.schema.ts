import { z } from 'zod';

export const EventSchema = z.object({
  is_event: z.boolean(),
  title: z.string().nullable().optional(),
  event_type: z.string().nullable().optional(),
  speaker: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  organizer_email: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM').optional()
});