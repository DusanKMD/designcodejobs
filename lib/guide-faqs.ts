/** Answer-first paragraphs mirrored from the guide MDX. Keep these in sync with the H2 that precedes each paragraph. */
export const guideFaqs = {
  "what-is-a-design-engineer": [
    {
      q: "What do design engineers do?",
      a: "A design engineer turns an interface decision into code that ships. The day is a prototype, a reusable component, and the production UI: layout, states, motion, empty cases, and keyboard access. On a product team the same person often owns tokens and the design system other designers and engineers build on.",
    },
    {
      q: "How does the role show up on a team?",
      a: "Teams hire the same skills under three scopes: product UI, brand and web, and the design system. The scopes are not a ladder. A staff design engineer on a product can spend a quarter on the system, and a design systems engineer still ships interface code.",
    },
    {
      q: "Which titles do teams actually post?",
      a: "Teams post this work as design engineer, UX engineer, UI engineer, design technologist, or creative technologist. The head term is the noisiest, because mechanical search uses the same words. The cleaner titles are the ones a software-only board can file without a disclaimer.",
    },
    {
      q: "How does the work sit next to nearby roles?",
      a: "A design engineer owns the visual and interaction call and is expected to have taste about it. A frontend engineer owns more of the platform. A product designer owns the problem and the flows. The overlap is intentional, and the posting should say which seat it is.",
    },
    {
      q: "What does this board treat as the role?",
      a: "This board keeps a listing when the title and the description match software interface work, and drops it when they match hardware, mechanical, chip, or AV design. Pay is shown only when the employer published a yearly base range. Remote means fully remote, not a hybrid week.",
    },
  ],
  "design-engineer-salary": [
    {
      q: "What gets counted in a design engineer salary?",
      a: "A design engineer salary on this page is a yearly base range an employer wrote on a software posting. Hourly rates, OTE, equity, and hidden compensation are left out. Each currency stays in that currency. Nothing is converted, and nothing is filled in from a crowdsourced average.",
    },
    {
      q: "How does pay differ by role?",
      a: "Pay differs by the title family on the posting, and each family keeps its own currency. The head term mixes every software title on the board, so a UX engineer range is not averaged into a design systems range. A cell with no yearly range means the sample has no posted pay, not that the role is unpaid.",
    },
    {
      q: "What is a UX engineer salary on this board?",
      a: "UX engineer salary here is the yearly base on the open UX engineer listings, not a market survey. If the sample is one posting, the page says so. Advertisers bidding on the query is not evidence that the wage is higher.",
    },
    {
      q: "Which public postings show a range?",
      a: "A public posting shows a range here only when it is open on this board and the employer published a yearly base. Dated examples from other boards are labeled as examples. They enter the median only when the role is open here with a yearly figure.",
    },
    {
      q: "How do level, remote, and city change the number?",
      a: "Level is read from the title, and most design engineer postings do not name one, so this guide does not invent a level table. Fully remote pay is counted apart from hybrid and on-site. City premiums are not computed from one or two postings.",
    },
    {
      q: "How should you read a single range?",
      a: "An employer\u2019s band is the range they were willing to write on that requisition. It is not a percentile of design engineers in a city, and it is not a prediction of the offer. A staff req and a mid-level req can share the same title.",
    },
  ],
  "design-engineer-job-description": [
    {
      q: "What belongs in a software design engineer job description?",
      a: "A software design engineer job description names the surface, the stack, and a portfolio with something that runs. It says whether the seat implements an existing system or sets one. It publishes a yearly base range only when you have decided to publish it, in the currency you will actually pay.",
    },
    {
      q: "What belongs in a UX engineer job description?",
      a: "A UX engineer job description uses the same bones and a sharper emphasis. The role is the high-fidelity prototype and the design-system API: interactions that are real enough to test, and components other designers can use without a custom one-off. Accessibility is part of the job, not a paragraph at the end.",
    },
    {
      q: "How should a UI engineer posting differ?",
      a: "A UI engineer posting should emphasize implementation quality: responsive layout, states, motion, and a component API other people can predict. Design judgment stays in the description. A generic frontend ladder, with no sentence about the interface, will miss the people who want this seat.",
    },
    {
      q: "How should a design technologist posting differ?",
      a: "A design technologist posting is the bridge inside a design org: prototypes engineering can adopt, and the translation between a design file and a component. Say whether the person writes production code or stops at the prototype. A design systems engineer owns tokens and components across products. Those are different seats.",
    },
    {
      q: "Which lines attract the wrong applicants?",
      a: "The lines that attract the wrong applicants are a title with no software qualifier, a tool list of CAD or FPGA, a frontend ladder with no interface judgment, and a hidden salary on a role you want filled quickly. Mechanical and hardware candidates read the shared title and stop there unless the first paragraph names an interface.",
    },
    {
      q: "What should you check before you post?",
      a: "Before you post, read the description once as a mechanical engineer would. If it still sounds like their job, add the stack and the surface. The text you submit is the text candidates see, and it is the text on the job page. Match it to the apply page.",
    },
  ],
  "design-technologist": [
    {
      q: "What does a design technologist do?",
      a: "A design technologist builds working prototypes, design-system code, and internal tools so a team can test an idea before it is expensive to change. The prototypes use real interactions and often real data. They then help engineering carry the decision into production, or hand the validated version to the people who ship it.",
    },
    {
      q: "Is a design technologist the same as a design engineer?",
      a: "Often, yes. Atlassian names design engineer and creative technologist as other names for the role, and Indeed’s design technologists sit on a team called Design Engineering. Where the titles split, technologist postings lean toward prototypes and tooling inside a design org, and design engineer postings lean toward production UI the company ships.",
    },
    {
      q: "How does a design technologist compare with nearby titles?",
      a: "The titles overlap more than they differ. UX engineer is the title Google uses for designer-engineers who prototype and also write production UI code. Creative technologist often points to brand, campaign, or agency work. Prototyper names the output and nothing else. Read the responsibilities first, because the same seat is posted under all of these titles.",
    },
    {
      q: "What skills do design technologist postings ask for?",
      a: "Design technologist postings ask for front-end code, a design portfolio, and prototyping experience, usually all three. They want code samples next to the portfolio, years in front-end or UX prototyping work, and comfort inside a design system. Recent postings add AI: prototypes of AI-driven workflows, generative tooling, or AI in the design-to-code pipeline.",
    },
    {
      q: "How many design technologist jobs are open, and what do they pay?",
      a: "Few, on this board. On 20 October 2026, none of its 37 open software listings had design technologist in the title, so there is no posted pay to report for the title. The salary pages that rank for the query include hourly figures and a design technician page, which describe different jobs.",
    },
  ],
} as const;
