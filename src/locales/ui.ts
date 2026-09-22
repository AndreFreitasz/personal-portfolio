import type { Locale } from './locales';

export interface UiDictionary {
  langLabel: string;
  nav1: string;
  nav2: string;
  nav3: string;
  nav5: string;
  h1a: string;
  h1b: string;
  heroSub: string;
  ctaWork: string;
  ctaCv: string;
  visit: string;
  aboutTitle: string;
  about1: string;
  about2: string;
  expTitle: string;
  projTitle: string;
  noPreview: string;
  contactLabel: string;
  contactTitle: string;
  contactSub: string;
  footer: string;
}

export const ui: Record<Locale, UiDictionary> = {
  pt: {
    langLabel: 'EN',
    nav1: 'Sobre',
    nav2: 'Experiência',
    nav3: 'Projetos',
    nav5: 'Contato',
    h1a: 'ENGENHEIRO',
    h1b: 'DE SOFTWARE',
    heroSub:
      'Construo sistemas e interfaces de ponta a ponta — do banco ao pixel. Mão na massa, entrega constante, foco em produto.',
    ctaWork: 'Ver projetos',
    ctaCv: 'Currículo',
    visit: 'Acessar projeto',
    aboutTitle: 'Sobre',
    about1:
      'Sou desenvolvedor full-stack com foco em back-end e sistemas de comunicação. Hoje sou Software Engineer no KaBuM!, responsável pelos sistemas que falam com o cliente.',
    about2:
      'Gosto de problema real: fila, evento, integração, dashboard que alguém usa todo dia. Aprendo construindo — sempre tem algo rodando em paralelo.',
    expTitle: 'Experiência',
    projTitle: 'Projetos',
    noPreview: 'Preview em breve',
    contactLabel: 'Contato',
    contactTitle: 'VAMOS CONSTRUIR ALGO',
    contactSub: 'Aberto a oportunidades como engenheiro de software. Chama no LinkedIn ou dá uma olhada no currículo.',
    footer: 'Feito à mão',
  },
  en: {
    langLabel: 'PT',
    nav1: 'About',
    nav2: 'Experience',
    nav3: 'Work',
    nav5: 'Contact',
    h1a: 'SOFTWARE',
    h1b: 'ENGINEER',
    heroSub:
      'I build systems and interfaces end to end — from the database to the pixel. Hands-on, shipping constantly, product-focused.',
    ctaWork: 'See work',
    ctaCv: 'Resume',
    visit: 'Visit project',
    aboutTitle: 'About',
    about1:
      'Full-stack developer focused on back-end and customer communication systems. Currently a Software Engineer at KaBuM!, owning the systems that talk to the customer.',
    about2:
      'I like real problems: queues, events, integrations, dashboards someone opens every day. I learn by building — there is always something running on the side.',
    expTitle: 'Experience',
    projTitle: 'Work',
    noPreview: 'Preview coming soon',
    contactLabel: 'Contact',
    contactTitle: "LET'S BUILD SOMETHING",
    contactSub: 'Open to software engineering opportunities. Reach out on LinkedIn or take a look at my resume.',
    footer: 'Handmade',
  },
};
