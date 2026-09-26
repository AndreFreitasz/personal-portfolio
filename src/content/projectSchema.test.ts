import { describe, expect, it } from 'vitest';
import { projectSchema } from './projectSchema';

const valid = {
  order: 1,
  title: { pt: 'MiranteFinanceiro', en: 'MiranteFinanceiro' },
  description: {
    pt: 'Gestão de finanças pessoais.',
    en: 'Personal finance manager.',
  },
  stack: ['React', 'NestJS'],
  link: 'https://personal-management-jade.vercel.app',
};

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts the optional year and repo fields', () => {
    const withOptionals = { ...valid, year: '2024', repo: 'https://github.com/example/repo' };
    expect(projectSchema.parse(withOptionals)).toMatchObject(withOptionals);
  });

  it('rejects a project missing the link', () => {
    const { link: _link, ...withoutLink } = valid;
    expect(() => projectSchema.parse(withoutLink)).toThrow();
  });

  it('rejects a link that is not a URL', () => {
    expect(() => projectSchema.parse({ ...valid, link: 'not-a-url' })).toThrow();
  });

  it('rejects a non-array stack', () => {
    expect(() => projectSchema.parse({ ...valid, stack: 'React' })).toThrow();
  });

  it('rejects a title missing one of the two locales', () => {
    expect(() => projectSchema.parse({ ...valid, title: { pt: 'MiranteFinanceiro' } })).toThrow();
  });
});
