import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EventSchema } from './event.schema';
import { z } from 'zod';

type ExtractedEvent = z.infer<typeof EventSchema>;

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly OLLAMA_URL = 'http://localhost:11434/api/generate';
  private readonly MODEL = 'qwen2.5:7b';

  /**
   * Extracts structured event data from raw email text using Ollama (Qwen2.5).
   * @param emailContent Raw text of the email
   * @returns Parsed and validated event object, or null if it fails
   */
  async extractEvent(emailContent: string): Promise<ExtractedEvent | null> {
    const prompt = `
You are an expert AI system analyzing campus emails and extracting structured event data.
First, logically analyze the email content and determine its intent:
- Set "is_event" to true if the email is announcing or inviting people to a specific structured academic/campus event that people can attend at a scheduled time and place (e.g. Pre-Ph.D. defenses, Ph.D. talks, guest lectures, seminars, webinars, workshops, symposiums, club activities, sports matches).
- Set "is_event" to false if the email is NOT an event invitation or announcement (e.g. conversational inquiries, fee notices, syllabus updates, exam date circulars, newsletters, spam, general administrative announcements, standard reminders).

Follow these rules strictly:
- Return ONLY valid JSON, no markdown formatting like \`\`\`json, no conversational text.
- Normalize dates to standard format (e.g. YYYY-MM-DD or readable format).
- Create a concise, elegant, short event "title" (e.g., "Pre-Ph.D. Talk: Mr. D. Saravanan" or "Deep Learning Symposium") suitable for a calendar view.
  - **CRITICAL**: Do NOT use extremely long, wordy research paper titles or talk topics as the main event title. If the email contains a long research paper title (e.g. "EXPERIMENTAL AND NUMERICAL INVESTIGATION OF NEEM-BASED GREEN SILVER NANOFLUIDS..."), place that long text in the "topic" field, and make the main event "title" concise (e.g. "Pre-Ph.D. Talk: Mr. D. Saravanan").
- Calculate a confidence score between 0 and 1 based on how sure you are about the extraction.
- For missing/non-event fields, use null.
- Required JSON structure:
{
  "is_event": true, // Boolean: true if it is a structured campus event, false otherwise
  "title": "Event title (short, descriptive, e.g. Pre-Ph.D. Talk: Mr. D. Saravanan) or null",
  "event_type": "Type of event (e.g. Pre-Ph.D. Talk, Seminar, Workshop) or null",
  "speaker": "Name of the speaker or null",
  "department": "Department organizing the event or null",
  "date": "Date of the event or null (standardized to YYYY-MM-DD, e.g., 2026-06-27)",
  "time": "Time of the event or null",
  "venue": "Location of the event or null",
  "topic": "Topic of the event (put long research paper titles here) or null",
  "organizer_email": "Organizer email or null",
  "confidence": 0.95, // Float between 0 and 1
  "tags": ["AI", "Research"],
  "priority": "HIGH" // Choose from LOW, MEDIUM, HIGH, CRITICAL
}

Email Content:
${emailContent}
    `;

    try {
      this.logger.debug('Sending prompt to local Ollama (qwen2.5:7b)...');
      
      const response = await axios.post(this.OLLAMA_URL, {
        model: this.MODEL,
        prompt: prompt,
        stream: false,
        format: 'json', // Ollama supports structured JSON output
      });

      const rawText = response.data.response;
      
      // Safety: Extract first valid JSON block
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error('No JSON structure found in model response.');
        return null;
      }

      const jsonStr = jsonMatch[0];
      const parsedJson = JSON.parse(jsonStr);

      // Validate with Zod
      const validatedData = EventSchema.parse(parsedJson);
      
      this.logger.debug('Successfully extracted and validated event data.');
      return validatedData;

    } catch (error: any) {
      this.logger.error(`Failed to extract event data: ${error.message}`);
      if (error instanceof z.ZodError) {
        this.logger.error('Zod Validation Errors:', error.errors);
      }
      return null;
    }
  }
}