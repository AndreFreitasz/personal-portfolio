import type { LocalizedText } from '../lib/types';

export interface ExperienceEntry {
  period: LocalizedText;
  company: string;
  role: LocalizedText;
  description: LocalizedText;
}

export const experience: ExperienceEntry[] = [
  {
    period: { pt: 'Atual', en: 'Current' },
    company: 'KaBuM!',
    role: { pt: 'Software Engineer', en: 'Software Engineer' },
    description: {
      pt: 'Responsável pelos sistemas de comunicação com o cliente — mensageria, integrações e confiabilidade da entrega.',
      en: 'Owner of customer communication systems — messaging, integrations and delivery reliability.',
    },
  },
  {
    period: { pt: 'Anterior', en: 'Previous' },
    company: 'RC Soluções',
    role: { pt: 'Estágio · Software Developer', en: 'Intern · Software Developer' },
    description: {
      pt: 'Desenvolvimento front-end em React nos projetos da empresa, da interface à integração com API.',
      en: 'Front-end development in React across company projects, from UI to API integration.',
    },
  },
];
