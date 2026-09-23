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
    heroSub: 'Desenvolvo sistemas e interfaces com foco em performance, escalabilidade e experiência do usuário.',
    ctaWork: 'Ver projetos',
    ctaCv: 'Currículo',
    visit: 'Acessar projeto',
    aboutTitle: 'Sobre',
    about1:
      'Sou <strong>André Freitas</strong>, engenheiro de software com foco em performance e escalabilidade de sistemas, principalmente na resolução de problemas reais.',
    about2:
      'Atualmente atuo como Software Engineer no <strong>KaBuM!</strong>, garantindo confiabilidade e performance em um ambiente de alto volume de operações. Ao longo da minha trajetória, também desenvolvi soluções para negócios de grande porte nos setores de e-commerce e mineração, atuando em sistemas críticos que exigem escalabilidade, resiliência e atenção constante à qualidade da entrega.',
    expTitle: 'Experiência',
    projTitle: 'Projetos',
    noPreview: 'Preview em breve',
    contactLabel: 'Contato',
    contactTitle: 'VAMOS CONSTRUIR ALGO JUNTOS',
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
      'I develop systems and interfaces focused on performance, scalability and user experience, from back-end to front-end.',
    ctaWork: 'See work',
    ctaCv: 'Resume',
    visit: 'Visit project',
    aboutTitle: 'About',
    about1:
      'I am <strong>André Freitas</strong>, a software engineer focused on performance and system scalability, mainly through solving real-world problems.',
    about2:
      'I currently work as a Software Engineer at <strong>KaBuM!</strong>, where I own the customer communication systems, ensuring reliability and performance in a high-volume operating environment. Throughout my career, I have also developed solutions for large-scale businesses in the e-commerce and mining sectors, working on critical systems that demand scalability, resilience and constant attention to delivery quality.',
    expTitle: 'Experience',
    projTitle: 'Work',
    noPreview: 'Preview coming soon',
    contactLabel: 'Contact',
    contactTitle: "LET'S BUILD SOMETHING",
    contactSub: 'Open to software engineering opportunities. Reach out on LinkedIn or take a look at my resume.',
    footer: 'Handmade',
  },
};
