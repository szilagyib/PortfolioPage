import type { Door } from '@/domain/door';

export const doors: readonly Door[] = [
  {
    id: 'leadership',
    name: 'LEADERSHIP',
    tagline: 'team-lead since 2024',
    slots: 2,
    artifact: [
      { kind: 'paragraph', text:
        'Team lead at Prolan since 2024, running a cross-functional Scrum team of 4 engineers across 4 products in a safety-critical environment. Still hands-on with code review and shipping.' },
      { kind: 'paragraph', text:
        'Beyond the delivery, what I care about is the atmosphere — a team people actually want to show up to. High trust, disagreements aired out loud, ownership on whoever is closest to the problem. Room for creativity, for new ideas, and for trying a technique that hasn\'t proved itself yet — that\'s where the best work comes from, and where new tools like AI-assisted development get an honest shot at production.' },
      { kind: 'metric', value: '380+',  label: 'tickets resolved in 2025' },
      { kind: 'metric', value: '<24h',  label: 'PR → merge cycle' },
      { kind: 'metric', value: '+30%',  label: 'delivery uplift from AI' },
      { kind: 'metric', value: '4',     label: 'products end-to-end' },
      { kind: 'metric', value: '0',     label: 'attrition since 2024' },
      { kind: 'bullet', items: [
        'Owns the architectural calls across 4 products in active development — tech stack, integration boundaries, rewrite-vs-refactor decisions.',
        'Rolled out AI tooling (Claude Code, ChatGPT/Codex) on the team in 2025.',
        'Strengthening cross-team collaboration through recurring meetings with adjacent teams, shared working norms, and broader internal-tool adoption.',
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
        '4 active products across rail and manufacturing. Java on the backend, React on the frontend.' },
      { kind: 'productList', products: [
        {
          name: 'Titanium', type: 'Web',
          summary: 'End-to-end component and inventory management for manufacturing and production environments. Took over a half-finished modernization, retired the legacy alongside it, and reworked the permission model.',
          stack: ['Java','Spring','Postgres','Vaadin','Maven','Docker','React','TypeScript'],
        },
        {
          name: 'WebDiag', type: 'Web',
          summary: 'Real-time diagnostics, data collection, fault analysis, and reporting for safety-critical railway signalling stations. Runs in production.',
          stack: ['Java','Spring','Postgres','Maven','Docker','React','TypeScript'],
        },
        {
          name: 'DisCom', type: 'Desktop + Web',
          summary: 'Cross-border railway communication that translates a fixed operational phrasebook between languages. Deployed as a desktop client; a web variant is in the works.',
          stack: ['Java','Swing','Node.js','Express.js','React','Postgres','Maven','Docker'],
        },
        {
          name: 'ProrisCAD', type: 'Desktop',
          summary: 'Model-driven designer for railway signalling systems. Engineers model the signalling logic graphically; the tool generates the deployable parameterisation. Main architect for years — feature direction, framework calls, and the day-to-day shape of the tool.',
          stack: ['Java','Eclipse Modeling Framework','Maven','Ecore/Xcore','Xtext/Xtend','Graphiti'],
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
        'Side projects and recent writings — where I experiment with new tools and ideas on my own time.' },
      { kind: 'sectionLabel', text: 'Projects' },
      { kind: 'projectCard',
        name: 'This portfolio',
        summary:
          'The site you\'re on. A cosmic single-page canvas with a constellation-drawing puzzle and a server-side AI chat. Astro static build with React islands; deployed on Cloudflare Pages, written end-to-end with Claude Code.',
        href: 'https://github.com/szilagyib/PortfolioPage',
        stack: ['Astro', 'React', 'TypeScript', 'Cloudflare Pages'],
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
          src: '/previews/rag.png',
          alt: 'GlassBox RAG interface showing retrieval chunks, scores, and citations',
        },
      },
      { kind: 'projectCard',
        name: 'GitAgents',
        summary:
          'Paired AI agents for GitLab and GitHub CI pipelines: one reviews PRs/MRs with inline comments and merge gating, the other applies safe auto-fixes back to the branch. Per-language rule configs and a telemetry dashboard.',
        href: 'https://github.com/szilagyib/GitAgents',
        stack: ['TypeScript', 'Node.js', 'Claude API', 'GitLab CI / GitHub Actions', 'Postgres'],
        preview: {
          src: '/previews/gitagents.png',
          alt: 'GitAgents cost dashboard: per-run token spend, slowest actions, and agent telemetry',
        },
      },
      { kind: 'projectCard',
        name: 'RAMSey',
        summary:
          'Real-time collaborative web editor for RAMS diagrams — Markov chains, fault trees, FMEA, and more. Multi-user editing via Yjs CRDTs, AI-assisted diagram generation, an integrated analysis engine, and LaTeX/TikZ export.',
        href: 'https://github.com/szilagyib/RAMSey',
        stack: ['TypeScript', 'React', 'Fastify', 'Postgres', 'Yjs', 'Vercel AI SDK'],
        preview: {
          src: '/previews/ramsey.png',
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
        '10 years writing code, 4+ in industry, and 2+ leading an engineering team. I moved from engineering into leadership in 2024, bringing the technical grounding with me and the same focus on people. Three things shape how I work: building real teams where people are partners, not just coworkers; picking up new tools by making something with them; and figuring out where AI-assisted development actually earns its place in production code.' },
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
