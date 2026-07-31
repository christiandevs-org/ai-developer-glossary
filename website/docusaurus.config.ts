import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AI Developer Glossary',
  tagline: 'A curated guide to modern AI developer slang, LLM jargon, and engineering terminology',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://jeremycastanza.github.io',
  baseUrl: '/ai-developer-glossary/',

  organizationName: 'jeremycastanza',
  projectName: 'ai-developer-glossary',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/jeremycastanza/ai-developer-glossary/edit/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AI Developer Glossary',
      items: [
        {
          href: 'https://github.com/jeremycastanza/ai-developer-glossary',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Sections',
          items: [
            { label: '🛠️ Building & Ops', to: '/building-ops' },
            { label: '📈 Business & Strategy', to: '/business-strategy' },
            { label: '🔥 Culture & Vibes', to: '/culture-vibes' },
          ],
        },
        {
          title: 'More Sections',
          items: [
            { label: '🤖 Model Behavior', to: '/model-behavior' },
            { label: '💬 Prompting & Context', to: '/prompting-context' },
            { label: '🔒 Security & Trust', to: '/security-trust' },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/jeremycastanza/ai-developer-glossary',
            },
            {
              label: 'Contribute',
              href: 'https://github.com/jeremycastanza/ai-developer-glossary/blob/main/CONTRIBUTING.md',
            },
          ],
        },
      ],
      copyright: `Built with Docusaurus. Content is community-driven.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
