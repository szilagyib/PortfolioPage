import type { Door } from '@/domain/door';

export const doors: readonly Door[] = [
  {
    id: 'leadership',
    name: 'LEADERSHIP',
    tagline: 'team-lead since 2024',
    slots: 2,
    artifact: [
      { kind: 'paragraph', text:
        'Team lead at Prolan since 2024 — a cross-functional Scrum team of four engineers across four products in a safety-critical environment. Still hands-on with code review and shipping.' },
      { kind: 'metric', value: '379',  label: 'tickets resolved in 2025 (+7% YoY, +33% demand)' },
      { kind: 'metric', value: '+30%', label: 'feature delivery from AI tooling' },
      { kind: 'metric', value: '4',    label: 'products owned end-to-end' },
      { kind: 'metric', value: '0',    label: 'voluntary attrition since 2024' },
      { kind: 'sectionLabel', text: 'How I lead' },
      { kind: 'bullet', items: [
        'Architectural direction — stack, boundaries, rewrite-vs-refactor — is mine to own. Everything below that belongs to the engineer writing the code.',
        'Weekly 1:1s with each engineer, plus a debrief after every project.',
        'AI tools land through real work: engineers try them on tickets, keep the ones that help.',
        'Cross-team collaboration through shared PR reviews and shared runbooks with adjacent teams.',
        'Supervising a Master\'s thesis. Mentoring interns.',
      ]},
    ],
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    tagline: 'full stack · jvm + web',
    slots: 2,
    artifact: [
      { kind: 'paragraph', text:
        'Industrial products across railway and manufacturing, all in active development.' },
      { kind: 'productList', products: [
        {
          name: 'Titanium', type: 'Web',
          summary: 'End-to-end component and inventory management for manufacturing and production environments.',
          stack: ['Java','Spring','Postgres','Vaadin','Maven','Docker','React','TypeScript'],
        },
        {
          name: 'WebDiag', type: 'Web',
          summary: 'Real-time diagnostics, data collection, fault analysis, and reporting for safety-critical railway signalling stations.',
          stack: ['Java','Spring','Postgres','Maven','Docker','React','TypeScript'],
        },
        {
          name: 'ProrisCAD', type: 'Desktop',
          summary: 'Model-driven railway safety systems designer and parameterisation software. Built on Eclipse Modeling Framework with custom DSLs and a graphical editor.',
          stack: ['Java','Eclipse Modeling Framework','Maven','Ecore/Xcore','Xtext/Xtend','Graphiti'],
        },
        {
          name: 'DisCom', type: 'Desktop + Web',
          summary: 'Cross-border railway communication software providing translation between languages.',
          stack: ['Java','Swing','Node.js','Express.js','React','Postgres','Maven','Docker'],
        },
      ]},
    ],
  },
  {
    id: 'elsewhere',
    name: 'ELSEWHERE',
    tagline: 'projects · writings',
    slots: 2,
    artifact: [
      { kind: 'paragraph', text:
        'Side projects and writing. Each link opens in a new tab.' },
      { kind: 'sectionLabel', text: 'Projects' },
      { kind: 'projectCard',
        name: 'This portfolio',
        summary:
          'The site you\'re on. A cosmic single-page canvas with a constellation-drawing puzzle and a server-side Claude Haiku chat. Astro static build with React islands; deployed on Cloudflare Pages, written end-to-end with Claude Code.',
        href: 'https://github.com/szilagyib/PortfolioPage',
        stack: ['Astro', 'React', 'TypeScript', 'Cloudflare Pages', 'Claude API'],
        preview: {
          src: '/previews/portfolio.png',
          alt: 'Cosmic portfolio canvas with the pentagon of destinations around a central YOU star',
        },
      },
      { kind: 'projectCard',
        name: 'GlassBox RAG',
        summary:
          'Document Q&A with full pipeline transparency — every chunk, similarity score, rerank, and citation exposed alongside the answer. Built-in evaluation lab with LLM-judged quality metrics, and multi-provider model support via litellm.',
        href: 'https://github.com/szilagyib/GlassBoxRAG',
        stack: ['Python', 'Streamlit', 'LanceDB', 'DuckDB', 'SQLite', 'litellm'],
        preview: {
          src: '/previews/placeholder.svg',
          alt: 'GlassBox RAG interface showing retrieval chunks, scores, and citations',
        },
      },
      { kind: 'projectCard',
        name: 'GitHubAgents',
        summary:
          'Two AI agents for GitLab and GitHub CI pipelines: one reviews PRs/MRs with inline comments and merge gating, the other applies safe auto-fixes back to the branch. Per-language rule configs and a telemetry dashboard.',
        href: 'https://github.com/szilagyib/GitHubAgents',
        stack: ['TypeScript', 'Node.js', 'Claude API', 'GitLab CI / GitHub Actions', 'Postgres'],
        preview: {
          src: '/previews/placeholder.svg',
          alt: 'AI code-review agent dashboard with pull-request feedback',
        },
      },
      { kind: 'projectCard',
        name: 'RAMSey',
        summary:
          'Real-time collaborative web editor for RAMS diagrams — Markov chains, fault trees, FMEA, and more. Multi-user editing via Yjs CRDTs, AI-assisted diagram generation, an integrated analysis engine, and LaTeX/TikZ export.',
        href: 'https://github.com/szilagyib/RAMSey',
        stack: ['TypeScript', 'React', 'Fastify', 'Postgres', 'Yjs', 'Vercel AI SDK'],
        preview: {
          src: '/previews/placeholder.svg',
          alt: 'RAMSey collaborative diagram editor preview',
        },
      },

      { kind: 'sectionLabel', text: 'Writings' },
      { kind: 'postCard',
        title: 'Building a Transparent RAG, Transparently',
        date: 'Forthcoming',
        publication: 'Medium',
        quote:
          'The spec is the artifact. The code is the consequence.',
        href: 'https://medium.com/@szilagyiborbala8/building-a-transparent-rag-transparently-5beb62db9e2d',
      },
      { kind: 'postCard',
        title: 'The AI Era Needs Smarter Failure',
        date: 'May 2026',
        publication: 'Medium',
        quote:
          'AI makes both learning and failure faster. Leadership decides which one scales.',
        href: 'https://medium.com/@szilagyiborbala8/02f0535be754',
      },
    ],
  },
  {
    id: 'ai',
    name: 'ASK ME',
    tagline: 'AI assistant',
    slots: 2,
    artifact: [
      { kind: 'aiChat' },
    ],
  },
  {
    id: 'about',
    name: 'ABOUT',
    tagline: 'personal · contact',
    slots: 1,
    artifact: [
      {
        kind: 'profileHeader',
        photo: { src: '/profile.jpg', alt: 'Portrait of Borbála Szilágyi' },
        name: 'Borbála Szilágyi',
        location: 'Budapest, Hungary',
        contacts: [
          { icon: 'github',   label: 'GitHub',   href: 'https://github.com/szilagyib' },
          { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/szilagyiborbala8' },
          { icon: 'mail',     label: 'Email',    href: 'mailto:szilagyiborbala8@gmail.com' },
        ],
      },
      { kind: 'paragraph', text:
        '10 years writing code, 5 in industry, 2+ leading an engineering team. The shift from engineering into leadership happened in 2024 — I bring both technical understanding and a clear focus on people. Three things drive how I work: creating real teams where people are partners, not just coworkers; learning new tools by building something with them; and finding where AI-assisted development actually earns its place in production code.' },
      { kind: 'paragraph', text:
        'BSc + MSc Computer Science and Engineering at BME (2017–2023). MBA in Finance and Management at ELTE (2023–2025). Teaching Assistant for Formal Methods at BME, Spring 2022.' },
    ],
  },
  {
    id: 'fortune',
    name: 'FORTUNE',
    tagline: 'a little wisdom',
    slots: 0,
    artifact: [],
  },
];
