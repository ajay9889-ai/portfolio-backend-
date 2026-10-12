/**
 * tools.ts
 * Gemini Function Call tool declarations for portfolio actions and contact intents.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export const PORTFOLIO_TOOLS: ToolDefinition[] = [
  {
    name: 'scroll_to',
    description: 'Scroll smoothly to a named section on the portfolio page.',
    parameters: {
      type: 'OBJECT',
      properties: {
        section: {
          type: 'STRING',
          description: 'The target section ID (hero, about, skills, work, experience, contact)',
          enum: ['hero', 'about', 'skills', 'work', 'experience', 'contact'],
        },
      },
      required: ['section'],
    },
  },
  {
    name: 'open_project',
    description: 'Scroll to and highlight a specific project on the portfolio.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The project title: ElderNest, WisdomPlay, or Smart Attendance',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'show_resume',
    description: 'Direct the visitor towards Ajay\'s resume or contact details.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'open_contact_form',
    description: 'Scroll down and highlight the contact section.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'change_theme',
    description: 'Switch the page color theme between dark and light mode.',
    parameters: {
      type: 'OBJECT',
      properties: {
        mode: {
          type: 'STRING',
          description: 'Target theme mode',
          enum: ['dark', 'light'],
        },
      },
      required: ['mode'],
    },
  },
  {
    name: 'show_skills',
    description: 'Scroll to the skills section.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filter: {
          type: 'STRING',
          description: 'Optional skill category like frontend, backend, databases, or devops',
        },
      },
    },
  },
  {
    name: 'get_availability',
    description: 'Retrieve Ajay\'s live availability status, preferred roles, working hours, and response time note.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'send_message_to_ajay',
    description: 'Prepare a message to Ajay once name, email, and message have been collected from the visitor.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Full name of the sender',
        },
        email: {
          type: 'STRING',
          description: 'Valid email address of the sender',
        },
        message: {
          type: 'STRING',
          description: 'The message body or inquiry for Ajay',
        },
        company: {
          type: 'STRING',
          description: 'Optional company or organization name',
        },
        purpose: {
          type: 'STRING',
          description: 'Purpose of contact',
          enum: ['hiring', 'freelance', 'collaboration', 'other'],
        },
      },
      required: ['name', 'email', 'message'],
    },
  },
];
