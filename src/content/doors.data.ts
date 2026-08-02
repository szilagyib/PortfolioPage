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
      { kind: 'metric', value: '~380',  label: 'tickets resolved in 2025' },
      { kind: 'metric', value: '<24h',  label: 'PR → merge cycle' },
      { kind: 'metric', value: '+30%',  label: 'delivery uplift from AI' },
      { kind: 'metric', value: '4',     label: 'products end-to-end' },
      { kind: 'metric', value: '0',     label: 'attrition since 2024' },
      { kind: 'bullet', items: [
        'Owns the architectural calls across 4 products in active development — tech stack, integration boundaries, rewrite-vs-refactor decisions.',
        'Rolled out AI tooling (Claude Code, ChatGPT/Codex) on the team in 2025.',
        'Strengthening cross-team collaboration through recurring meetings with adjacent teams, shared working norms, and broader internal-tool adoption.',
        'Supervised a Master\'s thesis. Mentoring interns.',
      ]},
      /* Third-party proof lives here rather than in its own content module:
       * the `quote` block already exists in the artifact schema and both
       * renderers handle it, so the canvas card and the linear page pick
       * these up with no extra wiring and no second source to keep in sync.
       *
       * Sitting at the end of Leadership puts them after the claims they
       * back and ahead of the project detail. Attribution is by relationship,
       * never by inflated title — the manager said two of these, so both
       * carry the same label rather than one being promoted. */
      { kind: 'sectionLabel', text: 'What people say' },
      { kind: 'quote',
        text: 'Proactive, takes ownership, and can be counted on.',
        attribution: 'Direct manager' },
      { kind: 'quote',
        text: 'Handles engineering and leadership work with responsibility and care.',
        attribution: 'Direct manager' },
      { kind: 'quote',
        text: 'Always finds a good solution; nothing gets bounced back.',
        attribution: 'Senior stakeholder' },
      { kind: 'quote',
        text: 'Thanks for your help and for the advice on my merge requests.',
        attribution: 'Junior engineer' },
    ],
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    tagline: 'full stack · jvm + web',
    slots: 2,
    artifact: [
      { kind: 'paragraph', text:
        '4 active products across rail and manufacturing, desktop and web. Java on every backend. On top of that: Vaadin and React front ends, a Swing desktop client, and model-driven tooling — EMF, Xtext, Graphiti — for ProrisCAD.' },
      /* One product opened up before the list. The four cards below say what
       * exists; none of them show the judgment involved, which is the part
       * that actually reads as senior. Titanium is the right one to open:
       * inherited rather than greenfield, real users, real release risk. */
      { kind: 'sectionLabel', text: 'A closer look: Titanium' },
      { kind: 'paragraph', text:
        'Titanium tracks components and inventory for manufacturing, and the production floor uses it daily. I inherited a modernisation that was already half-built — the new stack running in parallel with the system it was meant to replace, and neither one finished.' },
      { kind: 'paragraph', text:
        'Running both was the real problem: every change had to land twice, and the longer it lasted the more the two drifted apart. Getting onto one stack meant migrating persistence off an in-house database layer onto Hibernate, fixing thread-pool limits that only showed up under production load, and replacing scattered admin rights with one scoped super-user role. The legacy path is retired now, with no pause in daily use.' },
      { kind: 'sectionLabel', text: 'Products' },
      { kind: 'productList', products: [
        {
          name: 'Titanium', type: 'Web',
          summary: 'End-to-end component and inventory management for manufacturing and production environments. Took over a half-finished modernization, retired the legacy alongside it, and reworked the permission model.',
          stack: ['Java','Spring','Postgres','Vaadin','Maven','Docker'],
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
        'Side projects and recent writings — where I experiment with new tools and ideas on my own time. This site is one of them: Astro with React islands, a constellation puzzle, and a server-side AI chat, written end to end with Claude Code and Codex.' },
      { kind: 'sectionLabel', text: 'Projects' },
      /* Order is deliberate: the two strongest lead — the CI agents, then
       * the shipped product with a public URL — followed by the RAG lab.
       * The site itself is mentioned in the paragraph above rather than
       * carded: it's evidence by existing, and listing the page you're
       * reading as a peer project weakened the set. AgentsSquad takes the
       * top slot once it demos. */
      { kind: 'projectCard',
        name: 'GitAgents',
        summary:
          'Paired AI agents for GitLab and GitHub CI: one reviews PRs/MRs inline and gates merges, verifying its own findings against the repo before posting; the other proposes one-click fixes. Runs on OpenAI or Anthropic behind one adapter. Per-language rule configs and a live cost dashboard.',
        href: 'https://github.com/szilagyib/GitAgents',
        /* Four chips, not five: this row wrapped to a second line on the
           canvas and left the card taller than RAMSey's beside it. Node.js
           goes (TypeScript already implies the runtime) and the CI chip
           loses its product names, which were the longest string here. */
        stack: ['TypeScript', 'OpenAI / Anthropic API', 'GitLab / GitHub CI', 'Postgres'],
        preview: {
          src: '/previews/gitagents.webp',
          alt: 'GitAgents review bot posting an inline pull-request comment flagging a possible null dereference',
        },
      },
      { kind: 'projectCard',
        name: 'RAMSey',
        summary:
          'Real-time collaborative web editor for RAMS diagrams — Markov chains, fault trees, FMEA, and more. Multi-user editing via Yjs CRDTs, AI-assisted diagram generation, and LaTeX/TikZ export. Solvers run in a Web Worker: steady-state availability, MTTF, minimal cut sets, and importance measures.',
        href: 'https://github.com/szilagyib/RAMSey',
        liveHref: 'https://ramseytools.com',
        stack: ['TypeScript', 'React', 'Fastify', 'Postgres', 'Redis', 'Yjs', 'AWS'],
        preview: {
          src: '/previews/ramsey.webp',
          alt: 'RAMSey editor showing a Markov chain diagram alongside a steady-state availability analysis panel',
        },
      },
      { kind: 'projectCard',
        name: 'GlassBox RAG',
        summary:
          'Document Q&A with full pipeline transparency — every chunk, similarity score, rerank, and citation exposed alongside the answer. Built-in evaluation lab with LLM-judged quality metrics, and multi-provider model support via litellm.',
        href: 'https://github.com/szilagyib/GlassBoxRAG',
        stack: ['Python', 'Streamlit', 'LanceDB', 'DuckDB', 'SQLite', 'litellm'],
        preview: {
          src: '/previews/rag.webp',
          alt: 'GlassBox RAG interface showing retrieval chunks, scores, and citations',
        },
      },

      { kind: 'sectionLabel', text: 'Writings' },
      { kind: 'postCard',
        title: 'Building a Transparent RAG, Transparently',
        date: 'July 2026',
        publication: 'Medium',
        quote:
          'The dangerous part is that nothing looks broken. The numbers look scientific.',
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
        /* City only, matching the written profile's hero. Working
           arrangements are on the CV; repeating them here made the line a
           pitch rather than a fact. */
        location: 'Budapest, Hungary',
        contacts: [
          { icon: 'github',   label: 'GitHub',   href: 'https://github.com/szilagyib' },
          { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/szilagyiborbala8' },
          { icon: 'mail',     label: 'Email',    href: 'mailto:szilagyiborbala8@gmail.com' },
        ],
      },
      { kind: 'paragraph', text:
        'I moved from engineering into leadership in 2024 without stepping away from the code — I still ship features on the products my team owns, which is the only way I know to stay useful in a technical argument. Three things shape how I work: building real teams where people are partners, not just coworkers; picking up new tools by making something with them; and figuring out where AI-assisted development actually earns its place in production code.' },
      { kind: 'paragraph', text:
        'Most of my curiosity goes into that last one at the moment: building the harness that lets an agent do a whole piece of work, then checking whether it actually did.' },
      { kind: 'paragraph', text:
        'I studied Computer Science and Engineering at BME, BSc through MSc, specialising in critical systems — the kind where you design for the failure case before the happy path. I taught Formal Methods there as a teaching assistant in 2022, then took an MBA at ELTE in Finance and Management, largely to understand the business decisions the software ends up serving. All three with highest honours.' },
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
