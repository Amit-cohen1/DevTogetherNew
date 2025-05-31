export const TECHNOLOGY_STACK_OPTIONS = [
    // Frontend
    'React',
    'Vue.js',
    'Angular',
    'Next.js',
    'Nuxt.js',
    'Svelte',
    'TypeScript',
    'JavaScript',
    'HTML/CSS',
    'Tailwind CSS',
    'Bootstrap',
    'Material-UI',
    'Sass/SCSS',

    // Backend
    'Node.js',
    'Express.js',
    'NestJS',
    'Python',
    'Django',
    'Flask',
    'FastAPI',
    'Java',
    'Spring Boot',
    'C#',
    '.NET',
    'PHP',
    'Laravel',
    'Ruby',
    'Ruby on Rails',
    'Go',
    'Rust',

    // Databases
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'SQLite',
    'Redis',
    'Firebase',
    'Supabase',

    // Cloud & DevOps
    'AWS',
    'Google Cloud',
    'Azure',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'GitHub Actions',
    'Vercel',
    'Netlify',
    'Heroku',

    // Mobile
    'React Native',
    'Flutter',
    'iOS',
    'Android',
    'Ionic',

    // Other
    'GraphQL',
    'REST API',
    'WebSockets',
    'Microservices',
    'Machine Learning',
    'AI',
    'Blockchain',
    'Three.js',
    'D3.js',
    'Testing',
    'Jest',
    'Cypress'
]

export const DIFFICULTY_LEVELS = [
    {
        value: 'beginner' as const,
        label: 'Beginner',
        description: 'Perfect for new developers or those learning new technologies'
    },
    {
        value: 'intermediate' as const,
        label: 'Intermediate',
        description: 'Suitable for developers with some experience'
    },
    {
        value: 'advanced' as const,
        label: 'Advanced',
        description: 'Challenging projects for experienced developers'
    }
]

export const APPLICATION_TYPES = [
    {
        value: 'individual' as const,
        label: 'Individual',
        description: 'Single developer projects'
    },
    {
        value: 'team' as const,
        label: 'Team',
        description: 'Multiple developers working together'
    },
    {
        value: 'both' as const,
        label: 'Individual or Team',
        description: 'Open to both individual and team applications'
    }
]

export const PROJECT_STATUSES = [
    {
        value: 'open' as const,
        label: 'Open',
        description: 'Accepting applications'
    },
    {
        value: 'in_progress' as const,
        label: 'In Progress',
        description: 'Project is currently being worked on'
    },
    {
        value: 'completed' as const,
        label: 'Completed',
        description: 'Project has been finished'
    },
    {
        value: 'cancelled' as const,
        label: 'Cancelled',
        description: 'Project has been cancelled'
    }
]

export const ESTIMATED_DURATIONS = [
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3-6 months',
    '6+ months'
] 