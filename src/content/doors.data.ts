import type { Door } from '@/domain/door';

export const doors: readonly Door[] = [
  {
    id: 'leadership',
    name: 'LEADERSHIP',
    tagline: 'team-lead since 2024',
    slots: 2,
    artifact: [
      { kind: 'paragraph', text:
        'Team lead at Prolan since 2024 — a cross-functional Scrum team of 4 engineers across 4 products in a safety-critical environment. Still hands-on with code review and shipping.' },
      { kind: 'paragraph', text:
        'What I care about beyond the delivery: an atmosphere the team wants to show up to. High trust, disagreements aired out loud, ownership on the person closest to the problem. Room for creativity, for new ideas, and for trying a technique that hasn\'t proved itself yet — that\'s the space where the best work comes from, and where new tools like AI-assisted development get an honest shot at production.' },
      { kind: 'metric', value: '60+',   label: 'features shipped in 2025 across 4 products' },
      { kind: 'metric', value: '<24h',  label: 'median PR → merge cycle' },
      { kind: 'metric', value: '+30%',  label: 'feature delivery from AI tooling' },
      { kind: 'metric', value: '4',     label: 'products owned end-to-end' },
      { kind: 'metric', value: '0',     label: 'voluntary attrition since 2024' },
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
        '4 active products across rail and manufacturing. Backend-heavy Java, React on top.' },
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
          name: 'DisCom', type: 'Desktop + Web',
          summary: 'Cross-border railway communication with real-time translation between operational languages.',
          stack: ['Java','Swing','Node.js','Express.js','React','Postgres','Maven','Docker'],
        },
        {
          name: 'ProrisCAD', type: 'Desktop',
          summary: 'Model-driven CAD for designing and parameterising railway safety systems: safety engineers describe signalling logic in custom DSLs, and the tool generates deployable parameterisation. Built on Eclipse Modeling Framework — Xtext for the DSLs, Graphiti for the graphical editor.',
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
        'Side projects and writing — where I try new tools and ideas before deciding whether they belong in production.' },
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
          'Paired AI agents for GitLab and GitHub CI pipelines: one reviews PRs/MRs with inline comments and merge gating, the other applies safe auto-fixes back to the branch. Per-language rule configs and a telemetry dashboard.',
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
        '10 years writing code — 5 in industry, and 2+ leading an engineering team. The move from engineering into leadership happened in 2024; I brought both technical grounding and a clear focus on people. Three things drive how I work: creating real teams where people are partners, not just coworkers; learning new tools by building something with them; and finding where AI-assisted development actually earns its place in production code.' },
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
