export const TOOLS = [
  {
    href: "/tools/design-engineer-salary-calculator",
    title: "Design engineer salary calculator",
    summary: "p25, median, and p75 from yearly ranges employers posted on open listings. Nothing is converted or estimated.",
    audience: "Candidates",
  },
  {
    href: "/tools/design-engineer-resume-checker",
    title: "Design engineer resume checker",
    summary: "A 0–100 score for shipped UI, stack, impact, links, length, verbs, and ATS safety, plus keywords from live listings.",
    audience: "Candidates",
  },
  {
    href: "/tools/design-engineer-portfolio-checklist",
    title: "Design engineer portfolio checklist",
    summary: "A checklist of what open listings ask a portfolio to prove, saved in this browser and shareable as a link.",
    audience: "Candidates",
  },
  {
    href: "/tools/job-description-generator",
    title: "Design engineer job description generator",
    summary: "A software job description you can edit and copy, then post on this board for $129.",
    audience: "Employers",
  },
] as const;

export const RESUME_HOW = {
  q: "How do you check a design engineer resume?",
  a: "Paste the resume, or choose a PDF or DOCX. The page reads the file in your browser and scores the text with the seven-part rubric on this screen. It then marks which high-frequency words from open listings are missing. You get a number, the points behind it, and a fix for each short row.",
};

export const PORTFOLIO_HOW = {
  q: "How do you use the portfolio checklist?",
  a: "Work down the list and check an item when a reviewer can see that proof in your portfolio. The bar shows how many are done. Progress stays in this browser. Copy the share link to send the same checks, or print the page. Counts beside each item come from the wording of open listings.",
};

export const JD_HOW = {
  q: "How does the job description generator work?",
  a: "Pick the role, level, stack, workplace, and salary range you will publish. The draft follows the structure in the design engineer job description guide: the work, the background, the level, the pay, and the location. It says the seat is a software interface role. Edit the text, copy it, or continue to the posting form.",
};

export const INDEX_HOW = {
  q: "How should you use these tools?",
  a: "Candidates start with the salary calculator or the resume checker, then use the portfolio checklist before they apply. Employers use the generator when the posting must read as a software design role, then post it on this board. Each tool explains its inputs on its own page. None of them submits an application.",
};

export const RESUME_FAQS = [
  {
    q: "How does the design engineer resume checker score a resume?",
    a: "The checker scores the text you paste from 0 to 100. Seven rows add up to that total: shipped interface work, front-end stack words, quantified impact, a portfolio or GitHub link, length, action verbs, and ATS safety. Each row shows its points and the gap. The same text always scores the same way. No model is called.",
  },
  {
    q: "Does Design Code Jobs store my resume?",
    a: "No. The resume stays in this browser. Pasting text, or reading a PDF or DOCX, happens on your device. The file is not uploaded, and the text is not sent to a server or kept in an account. Closing the page drops it. Only the keyword list, counted from public job posts, comes from the site.",
  },
  {
    q: "Where do the resume keywords come from?",
    a: "Keywords are terms counted in the descriptions of open listings on this board, such as React, TypeScript, Figma, and design systems. A term rises when more current posts use it. The list changes when the board syncs. It is not a generic skill cloud, and it is not a guess about what every team wants.",
  },
  {
    q: "Will a high score get me an interview?",
    a: "No. The score is a reading of this rubric against your text. It can show a missing GitHub link or a bullet with no number. It cannot see your work, your seniority, or whether a team is hiring. Use the fixes, then read a live role and apply on the employer’s original posting.",
  },
];

export const PORTFOLIO_FAQS = [
  {
    q: "What should a design engineer portfolio include?",
    a: "A design engineer portfolio should show an interface that runs. Open listings ask for shipped UI, a prototype, design-system work, and the stack you used, often React, TypeScript, and Figma. Screenshots can support that. They should not be the only thing a reviewer can look at. This checklist marks the pieces those posts name.",
  },
  {
    q: "How is this checklist tied to live listings?",
    a: "Each item has a count of open descriptions that match its wording, such as design system, accessibility, or prototype. The count is from the jobs on this board today, not from a survey. A zero means the current posts do not use that phrase. The item stays because the surrounding posts still describe the same work.",
  },
  {
    q: "Where is my checklist progress saved?",
    a: "Checked items are saved in this browser on this device. They are not sent to Design Code Jobs. Copy the share link if you want the same checks on another browser. That link puts the checked ids in the query string. Printing uses the checks you see on the page.",
  },
  {
    q: "Is a Dribbble page enough for these roles?",
    a: "A gallery can show taste. The listings counted here also ask for something that runs: a prototype, a shipped flow, or a design-system contribution in code. Keep the shots if they explain a decision. Pair them with a live URL or a repository a hiring manager can open.",
  },
];

export const JD_FAQS = [
  {
    q: "What belongs in a design engineer job description?",
    a: "A design engineer job description should read as a software role. Name the surface, the stack, and a portfolio with something that runs. Say whether the person implements a system or sets one. Publish a yearly base range only when you have decided to. Leave mechanical, hardware, and chip language out, or those applicants will apply.",
  },
  {
    q: "Does the generator invent a salary?",
    a: "No. If you type a minimum and a maximum, those figures are copied into the Pay section with the currency you picked. If you leave them blank, the draft tells you to add a range you will actually publish. It does not fill a market rate, and it does not convert one currency into another.",
  },
  {
    q: "How do I post the generated description?",
    a: "Use Post this job for $129. The button opens the posting form with the title, workplace, location, salary fields, and description filled in. You still add a work email, company, and apply URL. The role goes live after payment is confirmed, for 30 days. The generator does not publish it by itself.",
  },
  {
    q: "Can I edit the draft before I pay?",
    a: "Yes. The text is a starting structure from the job-description guide, with your role, level, stack, and location written in. Change any line before you copy it or continue to the form. The form checks length and the apply URL. A hardware-sounding title can still be held back after payment.",
  },
];

export const INDEX_FAQS = [
  {
    q: "What are these design engineer tools?",
    a: "These are free utilities for design engineers who code, and for the teams hiring them. The salary calculator reads posted ranges. The resume checker and portfolio checklist score the work candidates already have. The job description generator writes a software posting an employer can edit. None of them is a job application.",
  },
  {
    q: "Do the tools use the jobs on this board?",
    a: "Yes, where a number is shown. Keyword counts and checklist counts come from the text of open listings. The salary calculator, on its own page, uses yearly ranges employers published. The resume checker does not upload your file. The generator does not look up a salary to invent a band.",
  },
  {
    q: "Who are the tools for?",
    a: "Candidates use the checker, the checklist, and the salary calculator while they look at software design roles: UX engineer, UI engineer, design technologist, and design systems work. Employers use the generator when they need a posting that will not be read as mechanical engineering. Both groups can use the tools without an account.",
  },
  {
    q: "Are the tools free?",
    a: "Yes. There is no login and no fee to run them. Posting the job you generate is separate: a listing on this board is $129 for 30 days, and a featured placement is $99 more. That charge is checkout, not a charge for the generator. Closing a tool page does not create an account.",
  },
];
