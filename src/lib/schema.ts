// Template types for government documents
export const TEMPLATE_TYPES = {
  ARIZA: 'ariza',
  SHARTNOMA: 'shartnoma',
  BAYONNOMA: 'bayonnoma',
  TAKLIFNOMA: 'taklifnoma',
  MALUMOTNOMA: 'malumotnoma',
} as const;

export type TemplateType = typeof TEMPLATE_TYPES[keyof typeof TEMPLATE_TYPES];

// Template metadata for UI
export interface Template {
  id: TemplateType;
  name: string;
  nameUz: string;
  description: string;
  icon: string;
}

export const templates: Template[] = [
  {
    id: TEMPLATE_TYPES.ARIZA,
    nameUz: 'Ariza',
    name: 'Application',
    description: 'Official application or request letter',
    icon: 'FileText',
  },
  {
    id: TEMPLATE_TYPES.SHARTNOMA,
    nameUz: 'Shartnoma',
    name: 'Contract',
    description: 'Contractual agreement or terms',
    icon: 'FileSignature',
  },
  {
    id: TEMPLATE_TYPES.BAYONNOMA,
    nameUz: 'Bayonnoma',
    name: 'Meeting Note',
    description: 'Minutes of meeting or protocol',
    icon: 'Users',
  },
  {
    id: TEMPLATE_TYPES.TAKLIFNOMA,
    nameUz: 'Taklifnoma',
    name: 'Proposal',
    description: 'Project or initiative proposal',
    icon: 'Lightbulb',
  },
  {
    id: TEMPLATE_TYPES.MALUMOTNOMA,
    nameUz: "Ma'lumotnoma",
    name: 'Info Note',
    description: 'Informational memo or notice',
    icon: 'Info',
  },
];
