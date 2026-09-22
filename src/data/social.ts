export interface SocialLink {
  id: 'instagram' | 'linkedin' | 'github' | 'whatsapp';
  href: string;
  label: string;
}

export const social: SocialLink[] = [
  { id: 'instagram', href: 'https://www.instagram.com/andre.freitaszz', label: 'Instagram' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/andré-freitas-462940200', label: 'LinkedIn' },
  { id: 'github', href: 'https://github.com/AndreFreitasz', label: 'GitHub' },
  { id: 'whatsapp', href: 'https://wa.me/5519999683757', label: 'WhatsApp' },
];
