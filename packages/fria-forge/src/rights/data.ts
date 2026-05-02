import type { FundamentalRight } from "../types.js";

export const FUNDAMENTAL_RIGHTS: FundamentalRight[] = [
  {
    id: "human-dignity",
    label: "Human dignity",
    charterRefs: ["Article 1"],
    relatedCategories: ["migration-border-control", "law-enforcement"],
    riskPrompts: [
      "Could the system objectify, humiliate, or dehumanise affected people?",
      "Could automation pressure operators to ignore individual circumstances?",
    ],
  },
  {
    id: "life-integrity",
    label: "Right to life and integrity of the person",
    charterRefs: ["Article 2", "Article 3"],
    relatedCategories: ["critical-infrastructure", "law-enforcement"],
    riskPrompts: [
      "Could failure, delay, or misuse create physical safety risks?",
      "Does the system influence access to emergency or protective services?",
    ],
  },
  {
    id: "liberty-security",
    label: "Liberty and security",
    charterRefs: ["Article 6"],
    relatedCategories: ["law-enforcement", "migration-border-control"],
    riskPrompts: [
      "Could outputs contribute to detention, surveillance, or restraint?",
      "Are safeguards in place before coercive action is taken?",
    ],
  },
  {
    id: "private-life-data-protection",
    label: "Respect for private life and protection of personal data",
    charterRefs: ["Article 7", "Article 8"],
    relatedCategories: [
      "biometrics",
      "employment",
      "essential-services",
      "law-enforcement",
    ],
    riskPrompts: [
      "Does the system process sensitive, biometric, or large-scale personal data?",
      "Can affected people understand, contest, or limit the use of their data?",
    ],
  },
  {
    id: "freedom-expression-information",
    label: "Freedom of expression and information",
    charterRefs: ["Article 11"],
    relatedCategories: ["justice-democracy", "education"],
    riskPrompts: [
      "Could the system chill lawful speech or access to information?",
      "Could ranking, moderation, or scoring distort civic participation?",
    ],
  },
  {
    id: "freedom-assembly-association",
    label: "Freedom of assembly and association",
    charterRefs: ["Article 12"],
    relatedCategories: ["law-enforcement", "justice-democracy"],
    riskPrompts: [
      "Could the system identify, monitor, or profile people in collective action?",
      "Could outputs affect lawful organising or political participation?",
    ],
  },
  {
    id: "non-discrimination",
    label: "Non-discrimination",
    charterRefs: ["Article 21"],
    relatedCategories: [
      "biometrics",
      "education",
      "employment",
      "essential-services",
      "law-enforcement",
      "migration-border-control",
    ],
    riskPrompts: [
      "Could proxies or training data produce unequal outcomes for protected groups?",
      "Are performance, error rates, and appeals tracked across affected groups?",
    ],
  },
  {
    id: "rights-child",
    label: "Rights of the child",
    charterRefs: ["Article 24"],
    relatedCategories: ["education", "essential-services", "migration-border-control"],
    riskPrompts: [
      "Could children be assessed, ranked, or denied opportunities by the system?",
      "Are age-appropriate notices, human review, and safeguards provided?",
    ],
  },
  {
    id: "education",
    label: "Right to education",
    charterRefs: ["Article 14"],
    relatedCategories: ["education"],
    riskPrompts: [
      "Could outputs determine admission, progression, assessment, or support?",
      "Can learners and guardians challenge material decisions?",
    ],
  },
  {
    id: "fair-working-conditions",
    label: "Fair and just working conditions",
    charterRefs: ["Article 30", "Article 31"],
    relatedCategories: ["employment"],
    riskPrompts: [
      "Could the system affect hiring, promotion, dismissal, scheduling, or pay?",
      "Are workers informed when AI materially influences workplace decisions?",
    ],
  },
  {
    id: "social-security-assistance",
    label: "Social security and social assistance",
    charterRefs: ["Article 34"],
    relatedCategories: ["essential-services"],
    riskPrompts: [
      "Could outputs affect eligibility, prioritisation, fraud flags, or benefit levels?",
      "Are denial, suspension, and recovery decisions subject to human review?",
    ],
  },
  {
    id: "health-care",
    label: "Health care",
    charterRefs: ["Article 35"],
    relatedCategories: ["essential-services", "critical-infrastructure"],
    riskPrompts: [
      "Could the system influence access, triage, diagnosis, or care allocation?",
      "Are clinical or service decisions auditable by qualified humans?",
    ],
  },
  {
    id: "effective-remedy-fair-trial",
    label: "Effective remedy and fair trial",
    charterRefs: ["Article 47", "Article 48"],
    relatedCategories: ["law-enforcement", "justice-democracy"],
    riskPrompts: [
      "Could outputs influence evidence, procedure, remedies, or legal outcomes?",
      "Can affected people obtain reasons, contest outputs, and seek review?",
    ],
  },
  {
    id: "good-administration-democracy",
    label: "Good administration and democratic participation",
    charterRefs: ["Article 41", "Article 39", "Article 40"],
    relatedCategories: ["justice-democracy", "migration-border-control"],
    riskPrompts: [
      "Could the system affect public decision-making, elections, or access to officials?",
      "Are transparency, accountability, and record-keeping duties supported?",
    ],
  },
];

