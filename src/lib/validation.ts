import { z } from "zod";

// Game creation validation
export const GameCreateSchema = z.object({
  region: z.enum([
    "North America",
    "South America",
    "Asia",
    "Europe",
    "Oceania",
    "Africa",
    "World",
  ]),
  questionTypes: z.array(z.enum(["countries", "capitals", "flags"])).min(1),
  mode: z.enum(["practice", "challenge"]),
});

// Answer submission validation
export const AnswerSubmissionSchema = z.object({
  countryId: z.string().length(2).toUpperCase(),
  questionType: z.enum(["countries", "capitals", "flags"]),
});

// Game completion validation
export const GameCompleteSchema = z.object({
  successful: z.boolean(),
  lives_remaining: z.number().min(0).max(3),
  incorrect_guesses: z.number().min(0),
  completed_at: z.string().datetime(),
});

export type GameCreate = z.infer<typeof GameCreateSchema>;
export type AnswerSubmission = z.infer<typeof AnswerSubmissionSchema>;
export type GameComplete = z.infer<typeof GameCompleteSchema>;
