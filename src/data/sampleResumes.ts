import { ResumeData } from '../types/resume';

export const charlesBloombergResume: ResumeData = {
  id: 'resume-charles-bloomberg',
  title: 'Executive & Startup Consultant',
  updatedAt: new Date().toISOString(),
  contact: {
    fullName: 'Charles Bloomberg',
    jobTitle: 'Early-Stage Executive & Startup Consultant',
    email: 'charlesbloomberg@gmail.com',
    phone: '(621) 799-5548',
    location: 'Seoul, South Korea',
    linkedin: 'linkedin.com/in/cbloomberg',
    github: 'github.com/cbloomberg',
    website: 'charlesbloomberg.com',
    showPhoto: false,
  },
  summary:
    'Results-driven early-stage global executive with an Economics degree from the University of Wisconsin - Madison. Proven track record in scaling venture-backed tech startups from zero to $40M+ valuation, engineering user acquisition strategies, and leading cross-functional engineering and growth teams.',
  experiences: [
    {
      id: 'exp-1',
      company: 'CraftFlow SaaS',
      role: 'CEO & Founder',
      location: 'Seoul, South Korea',
      startDate: 'Aug 2015',
      endDate: 'Present',
      current: true,
      bullets: [
        'Built high-growth SaaS platform from ground up into an industry-leading career tool, scaling organic reach to over 2,227,254 active users worldwide.',
        'Secured over $650,000 in seed investment, competitive government grants, and innovation awards while maintaining lean operations.',
        'Engineered scalable redemption-code partnership model resulting in 50,000+ verified signups in 30 days with $0 paid ad spend.',
        'Spearheaded 3 new high-margin business lines including e-learning, AI resume tooling, and recruitment data solutions, driving enterprise ARR by 180%.',
        'Scaled high-performing cross-border team of 15 engineers, designers, and marketers across 2 international hubs.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Kaplan',
      role: 'Web Developer & SEO Specialist',
      location: 'La Crosse, WI',
      startDate: 'May 2015',
      endDate: 'Nov 2015',
      current: false,
      bullets: [
        'Executed complete CMS migration and responsive overhaul of kaplancleantech.com, accelerating page load speeds by 42%.',
        'Led multivariate A/B testing on 3 primary lead capture funnels, increasing conversion rate by 28% and boosting qualified MQLs.',
        'Managed SEO campaigns across $500K budget, growing organic search traffic 42% and ranking 15 key industry keywords on Google Page 1.',
        'Automated behavioral event tracking using Google Analytics and Salesforce SOQL, increasing email remarketing open rates by 35%.'
      ]
    },
    {
      id: 'exp-3',
      company: 'Kaplan',
      role: 'Marketing Data Analyst',
      location: 'La Crosse, WI',
      startDate: 'Nov 2014',
      endDate: 'May 2015',
      current: false,
      bullets: [
        'Developed interactive Tableau executive dashboards tracking 6 mission-critical marketing KPIs to guide quarterly resource allocation.',
        'Analyzed survey responses from 1,200+ customers using Python and R to assess user sentiment and NPS, identifying 4 major retention levers.',
        'Restructured mobile PPC campaigns via Google AdWords Editor, reducing customer acquisition cost (CAC) by 19%.'
      ]
    }
  ],
  educations: [
    {
      id: 'edu-1',
      school: 'University of Wisconsin - Madison',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Economics',
      location: 'Madison, WI',
      startDate: 'Sep 2010',
      endDate: 'May 2014',
      gpa: '3.82',
      honors: 'Powers-Knapp Scholar, Dean\'s Honor List'
    }
  ],
  skillCategories: [
    {
      id: 'skill-1',
      categoryName: 'Executive & Strategy',
      skills: ['Early-Stage Fundraising', 'P&L Management', 'Product Strategy', 'Cross-functional Leadership', 'Market Expansion']
    },
    {
      id: 'skill-2',
      categoryName: 'Product & Analytics',
      skills: ['Tableau', 'Google Analytics 4', 'SQL', 'Mixpanel', 'A/B Testing', 'Conversion Optimization']
    },
    {
      id: 'skill-3',
      categoryName: 'Technical & Tools',
      skills: ['HTML5 / CSS3', 'JavaScript', 'Python', 'REST APIs', 'Salesforce CRM', 'HubSpot']
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'ResumeCraft Engine V2',
      description: 'Proprietary ATS parsing and scoring engine assessing resumes against 23 job-match parameters.',
      link: 'https://resumecraft.ai',
      technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'OpenAI API'],
      bullets: [
        'Engineered real-time keyword matching algorithm achieving 99.4% parsing parity with Greenhouse and Workday ATS systems.',
        'Processed over 4.5M resumes with an average latency under 450ms.'
      ]
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Google Data Analytics Professional',
      issuer: 'Google',
      date: '2023'
    },
    {
      id: 'cert-2',
      name: 'Reforge Growth Series',
      issuer: 'Reforge',
      date: '2022'
    }
  ],
  design: {
    template: 'simple',
    fontFamily: 'Inter',
    fontSize: 'base',
    lineSpacing: 'normal',
    pageMargin: 'normal',
    sectionSpacing: 'normal',
    accentColor: '#1652f0',
    showDividers: true,
    dividerStyle: 'solid',
    uppercaseHeaders: true,
  }
};

export const sophiaChenTechResume: ResumeData = {
  id: 'resume-sophia-chen',
  title: 'Senior Full Stack Engineer',
  updatedAt: new Date().toISOString(),
  contact: {
    fullName: 'Sophia Chen',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'sophia.chen@devmail.io',
    phone: '(415) 890-3321',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sophiachen-dev',
    github: 'github.com/sophiachen',
    website: 'sophiachen.dev',
    showPhoto: false,
  },
  summary:
    'Senior Full Stack Engineer with 7+ years of expertise in architecting high-concurrency cloud services and resilient web applications. Specializes in TypeScript, React, Go, and Kubernetes. Led distributed teams delivering 99.99% SLA platforms processing 50M+ requests daily at Stripe-tier scale.',
  experiences: [
    {
      id: 'exp-101',
      company: 'Vercel',
      role: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected real-time edge runtime observability pipeline processing 12B monthly metrics, cutting telemetry p99 latency from 1.4s to 85ms.',
        'Mentored 8 core engineers across frontend and backend guilds; instituted automated RFC peer review and integration testing patterns.',
        'Pioneered zero-downtime database migration strategy from self-hosted Redis to distributed Upstash clusters, eliminating $140K/yr overhead.',
        'Authored and maintained internal TypeScript design system adopted by 24 engineering squads.'
      ]
    },
    {
      id: 'exp-102',
      company: 'Cloudflare',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      current: false,
      bullets: [
        'Spearheaded Workers KV distributed replication layer using Rust and WebAssembly, boosting read throughput by 340%.',
        'Implemented rigorous automated end-to-end integration test suites that increased deploy confidence and reduced regression rollback rate by 65%.',
        'Collaborated with security compliance auditors to achieve SOC2 Type II certification across all developer tooling APIs.'
      ]
    }
  ],
  educations: [
    {
      id: 'edu-101',
      school: 'University of California, Berkeley',
      degree: 'B.S. in Electrical Engineering & Computer Science',
      fieldOfStudy: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: 'Aug 2014',
      endDate: 'May 2018',
      gpa: '3.91',
      honors: 'Eta Kappa Nu (EECS Honor Society)'
    }
  ],
  skillCategories: [
    {
      id: 'skill-101',
      categoryName: 'Languages & Runtimes',
      skills: ['TypeScript', 'JavaScript (ESNext)', 'Go', 'Rust', 'Python', 'Node.js']
    },
    {
      id: 'skill-102',
      categoryName: 'Frontend & UI',
      skills: ['React 18/19', 'Next.js', 'Tailwind CSS', 'Vite', 'GraphQL', 'State Management (Zustand/Redux)']
    },
    {
      id: 'skill-103',
      categoryName: 'Cloud & Infrastructure',
      skills: ['AWS (Lambda, S3, ECS)', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'CI/CD (GitHub Actions)']
    }
  ],
  projects: [
    {
      id: 'proj-101',
      name: 'TurboRPC',
      description: 'High-speed typed RPC framework for edge functions with over 6,000 GitHub stars.',
      link: 'https://github.com/sophiachen/turborpc',
      technologies: ['TypeScript', 'WebSockets', 'Protobuf'],
      bullets: [
        'Benchmarked 4x faster throughput compared to traditional gRPC-web in serverless cold-start environments.',
        'Adopted by 80+ production companies in production workloads.'
      ]
    }
  ],
  certifications: [
    {
      id: 'cert-101',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023'
    }
  ],
  design: {
    template: 'modern',
    fontFamily: 'Inter',
    fontSize: 'base',
    lineSpacing: 'normal',
    pageMargin: 'normal',
    sectionSpacing: 'normal',
    accentColor: '#059669',
    showDividers: true,
    dividerStyle: 'solid',
    uppercaseHeaders: true,
  }
};
