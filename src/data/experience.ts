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
      pt: 'Atuo nos sistemas de comunicação com o cliente, incluindo WhatsApp e e-mail, além do fluxo de devoluções de pedidos e de outros projetos internos, sempre com atenção à confiabilidade da entrega em um ambiente de alto volume de operações.',
      en: 'I work on the customer communication systems, covering WhatsApp and email, as well as the order returns flow and other internal projects, always with close attention to delivery reliability in a high-volume operating environment.',
    },
  },
  {
    period: { pt: 'Anterior', en: 'Previous' },
    company: 'RC Soluções',
    role: { pt: 'Frontend Developer', en: 'Frontend Developer' },
    description: {
      pt: 'Responsável pelo front-end dos projetos da empresa, com entregas para companhias de grande porte do setor de mineração e para a Prefeitura de Piracicaba',
      en: 'Responsible for the front-end of the company projects, delivering for large mining companies and for the Piracicaba city government.',
    },
  },
];
