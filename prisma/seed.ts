import 'dotenv/config';
import { PrismaClient, ProposalType, ProposalStatus, TonePreference, UserRole } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import * as bcrypt from 'bcryptjs';

// Initialize Prisma Client with Neon adapter
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeonHttp(connectionString, {}) as any;
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const userEmail = 'uange209@gmail.com';
  const userPassword = 'Ange@123';
  
  console.log('🌱 Starting seed...');

  // Create or find the user
  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Ange Umubyeyi',
        password: hashedPassword,
        role: UserRole.ORG_ADMIN,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ange',
      },
    });
    console.log('✅ Created user:', user.email);
  } else {
    console.log('✅ User already exists:', user.email);
  }

  // Sample proposals data
  const proposals = [
    {
      title: 'Website Redesign for TechStart Solutions',
      clientName: 'TechStart Solutions Inc.',
      clientIndustry: 'Technology',
      proposalType: ProposalType.IT_SOFTWARE,
      status: ProposalStatus.SENT,
      tonePreference: TonePreference.PROFESSIONAL,
      description: 'Complete website redesign with modern UI/UX, improved performance, and mobile responsiveness',
      budget: '$25,000 - $35,000',
      timeline: '3 months',
      isAIGenerated: true,
      sections: [
        {
          key: 'executive_summary',
          title: 'Executive Summary',
          content: 'We propose a comprehensive website redesign for TechStart Solutions that will modernize your online presence and significantly improve user engagement. Our approach combines cutting-edge design principles with robust technical implementation to deliver a website that not only looks great but performs exceptionally.',
          order: 1,
        },
        {
          key: 'objectives',
          title: 'Project Objectives',
          content: 'The primary objectives of this project are:\n\n1. Modernize the visual design to reflect current web standards\n2. Improve website performance and loading times by 60%\n3. Enhance mobile responsiveness across all devices\n4. Implement intuitive navigation and improved user experience\n5. Integrate analytics and tracking for better insights',
          order: 2,
        },
        {
          key: 'scope',
          title: 'Scope of Work',
          content: 'Our comprehensive redesign includes:\n\n- Discovery and research phase\n- Information architecture planning\n- UI/UX design for all pages\n- Front-end development with React\n- Back-end integration\n- Quality assurance testing\n- Launch and post-launch support',
          order: 3,
        },
        {
          key: 'deliverables',
          title: 'Deliverables',
          content: '1. Complete website redesign (20+ pages)\n2. Mobile-responsive implementation\n3. Content management system integration\n4. SEO optimization\n5. Performance optimization\n6. Documentation and training materials\n7. 30 days of post-launch support',
          order: 4,
        },
      ],
    },
    {
      title: 'Digital Marketing Campaign for GreenLeaf Organics',
      clientName: 'GreenLeaf Organics',
      clientIndustry: 'Retail & E-commerce',
      proposalType: ProposalType.CREATIVE,
      status: ProposalStatus.DRAFT,
      tonePreference: TonePreference.CONVERSATIONAL,
      description: '6-month comprehensive digital marketing campaign including social media, content marketing, and paid advertising',
      budget: '$15,000/month',
      timeline: '6 months',
      isAIGenerated: true,
      sections: [
        {
          key: 'executive_summary',
          title: 'Executive Summary',
          content: "Let's grow your organic brand together! We're excited to present a tailored digital marketing strategy that will boost GreenLeaf Organics' online visibility, engage your target audience, and drive measurable sales growth.",
          order: 1,
        },
        {
          key: 'strategy',
          title: 'Marketing Strategy',
          content: 'Our multi-channel approach includes:\n\n**Social Media Marketing**\n- Daily content creation for Instagram, Facebook, and TikTok\n- Influencer partnerships with eco-conscious creators\n- Community engagement and management\n\n**Content Marketing**\n- Weekly blog posts on sustainable living\n- Recipe videos featuring your products\n- Email newsletters to subscribers\n\n**Paid Advertising**\n- Google Ads campaigns\n- Social media advertising\n- Retargeting campaigns',
          order: 2,
        },
        {
          key: 'timeline',
          title: 'Campaign Timeline',
          content: 'Month 1-2: Setup, research, and content creation\nMonth 3-4: Campaign launch and optimization\nMonth 5-6: Scale successful channels and maximize ROI',
          order: 3,
        },
      ],
    },
    {
      title: 'Office Building Construction Proposal',
      clientName: 'MetroCity Development Corp',
      clientIndustry: 'Real Estate',
      proposalType: ProposalType.CONSTRUCTION,
      status: ProposalStatus.REVIEW,
      tonePreference: TonePreference.EXECUTIVE,
      description: 'Construction of a 5-story modern office building with sustainable features',
      budget: '$2,500,000 - $3,000,000',
      timeline: '18 months',
      isAIGenerated: false,
      sections: [
        {
          key: 'executive_summary',
          title: 'Executive Summary',
          content: 'This proposal outlines the construction of a state-of-the-art, 5-story office building designed to meet the highest standards of modern workplace design and sustainability.',
          order: 1,
        },
        {
          key: 'project_overview',
          title: 'Project Overview',
          content: 'Building Specifications:\n- Total area: 75,000 square feet\n- 5 floors with ground-level retail space\n- LEED Gold certification target\n- Energy-efficient systems\n- Modern amenities including fitness center and café',
          order: 2,
        },
        {
          key: 'construction_plan',
          title: 'Construction Plan',
          content: 'Phase 1: Site preparation and foundation (3 months)\nPhase 2: Structural construction (8 months)\nPhase 3: MEP installation (4 months)\nPhase 4: Interior finishing (3 months)',
          order: 3,
        },
      ],
    },
    {
      title: 'Mobile App Development for FitTrack Pro',
      clientName: 'FitTrack Pro',
      clientIndustry: 'Health & Fitness',
      proposalType: ProposalType.IT_SOFTWARE,
      status: ProposalStatus.ACCEPTED,
      tonePreference: TonePreference.PROFESSIONAL,
      description: 'Native iOS and Android fitness tracking application with AI-powered workout recommendations',
      budget: '$85,000 - $100,000',
      timeline: '6 months',
      isAIGenerated: true,
      isFavorite: true,
      sections: [
        {
          key: 'executive_summary',
          title: 'Executive Summary',
          content: 'We propose developing a comprehensive fitness tracking mobile application that leverages AI to provide personalized workout recommendations and nutrition guidance.',
          order: 1,
        },
        {
          key: 'features',
          title: 'Key Features',
          content: '1. User authentication and profile management\n2. Workout tracking with GPS integration\n3. AI-powered personalized workout plans\n4. Nutrition tracking and meal planning\n5. Progress analytics and visualization\n6. Social features and challenges\n7. Integration with wearable devices\n8. Push notifications and reminders',
          order: 2,
        },
        {
          key: 'technology',
          title: 'Technology Stack',
          content: 'Frontend: React Native for iOS and Android\nBackend: Node.js with Express\nDatabase: PostgreSQL\nAI/ML: TensorFlow for recommendation engine\nCloud: AWS infrastructure\nPayments: Stripe integration',
          order: 3,
        },
        {
          key: 'timeline',
          title: 'Development Timeline',
          content: 'Month 1: Design and architecture\nMonth 2-3: Core feature development\nMonth 4: AI integration\nMonth 5: Testing and refinement\nMonth 6: Launch preparation and deployment',
          order: 4,
        },
      ],
    },
    {
      title: 'Brand Identity Package for StartupHub',
      clientName: 'StartupHub Co.',
      clientIndustry: 'Business Services',
      proposalType: ProposalType.CREATIVE,
      status: ProposalStatus.DRAFT,
      tonePreference: TonePreference.CONVERSATIONAL,
      description: 'Complete brand identity design including logo, color palette, typography, and brand guidelines',
      budget: '$8,000 - $12,000',
      timeline: '6 weeks',
      isAIGenerated: true,
      sections: [
        {
          key: 'introduction',
          title: 'Introduction',
          content: "Your brand is your story, and we're here to help you tell it beautifully. This proposal outlines our approach to creating a memorable brand identity for StartupHub.",
          order: 1,
        },
        {
          key: 'deliverables',
          title: 'Deliverables',
          content: '✓ Logo design (3 concepts, unlimited revisions)\n✓ Color palette selection\n✓ Typography system\n✓ Brand guidelines document (40+ pages)\n✓ Business card design\n✓ Letterhead and envelope design\n✓ Social media templates\n✓ Email signature template',
          order: 2,
        },
        {
          key: 'process',
          title: 'Our Process',
          content: 'Week 1: Discovery and research\nWeek 2-3: Logo concepts and design\nWeek 4: Brand system development\nWeek 5: Applications and templates\nWeek 6: Final delivery and handoff',
          order: 3,
        },
      ],
    },
    {
      title: 'Business Consulting Services for RetailMax',
      clientName: 'RetailMax Corporation',
      clientIndustry: 'Retail',
      proposalType: ProposalType.CONSULTING,
      status: ProposalStatus.SENT,
      tonePreference: TonePreference.EXECUTIVE,
      description: 'Strategic business consulting to optimize operations and increase profitability',
      budget: '$50,000',
      timeline: '4 months',
      isAIGenerated: false,
      sections: [
        {
          key: 'executive_summary',
          title: 'Executive Summary',
          content: 'RetailMax faces operational challenges that impact profitability. Our consulting engagement will identify inefficiencies, optimize processes, and develop a roadmap for sustainable growth.',
          order: 1,
        },
        {
          key: 'approach',
          title: 'Consulting Approach',
          content: '1. Comprehensive operational audit\n2. Financial analysis and modeling\n3. Supply chain optimization review\n4. Staff productivity assessment\n5. Technology infrastructure evaluation\n6. Competitive market analysis',
          order: 2,
        },
        {
          key: 'deliverables',
          title: 'Deliverables',
          content: '- Current state assessment report\n- Strategic recommendations document\n- Implementation roadmap\n- ROI projections\n- Quarterly review meetings\n- Executive presentations',
          order: 3,
        },
      ],
    },
    {
      title: 'E-commerce Platform Development',
      clientName: 'Artisan Marketplace',
      clientIndustry: 'E-commerce',
      proposalType: ProposalType.IT_SOFTWARE,
      status: ProposalStatus.DRAFT,
      tonePreference: TonePreference.PROFESSIONAL,
      description: 'Custom e-commerce platform for handmade goods marketplace',
      budget: '$120,000',
      timeline: '8 months',
      isAIGenerated: true,
      sections: [
        {
          key: 'overview',
          title: 'Project Overview',
          content: 'Artisan Marketplace needs a robust e-commerce platform that connects artisan sellers with buyers, featuring vendor management, secure payments, and advanced search capabilities.',
          order: 1,
        },
        {
          key: 'features',
          title: 'Platform Features',
          content: '- Multi-vendor marketplace functionality\n- Vendor dashboard and analytics\n- Product catalog management\n- Advanced search and filtering\n- Shopping cart and checkout\n- Payment processing (multiple gateways)\n- Order management system\n- Review and rating system\n- Mobile-responsive design',
          order: 2,
        },
      ],
    },
    {
      title: 'Social Media Content Creation Package',
      clientName: 'Urban Eats Restaurant',
      clientIndustry: 'Food & Beverage',
      proposalType: ProposalType.FREELANCE,
      status: ProposalStatus.ACCEPTED,
      tonePreference: TonePreference.CONVERSATIONAL,
      description: '3-month social media content creation and management',
      budget: '$3,000/month',
      timeline: '3 months',
      isAIGenerated: true,
      isFavorite: true,
      sections: [
        {
          key: 'intro',
          title: 'Let\'s Make Your Food Look Irresistible',
          content: "Food should look as good as it tastes! We'll create mouth-watering content that makes your followers hungry and drives traffic to your restaurant.",
          order: 1,
        },
        {
          key: 'content',
          title: 'Content Plan',
          content: 'Weekly content includes:\n- 15 Instagram posts\n- 10 Instagram Stories\n- 8 TikTok videos\n- 4 Facebook posts\n- Professional food photography\n- Behind-the-scenes content\n- User-generated content curation',
          order: 2,
        },
      ],
    },
  ];

  // Create proposals with sections
  for (const proposalData of proposals) {
    const { sections, ...proposalInfo } = proposalData;
    
    // Create proposal first
    const proposal = await prisma.proposal.create({
      data: {
        ...proposalInfo,
        authorId: user.id,
      },
    });

    // Create sections separately
    for (const section of sections) {
      await prisma.proposalSection.create({
        data: {
          ...section,
          proposalId: proposal.id,
        },
      });
    }

    // Create activity for each proposal
    await prisma.activity.create({
      data: {
        proposalId: proposal.id,
        userId: user.id,
        action: 'CREATED',
        description: `${proposal.isAIGenerated ? 'AI generated' : 'Created'} proposal: ${proposal.title}`,
      },
    });

    console.log(`✅ Created proposal: ${proposal.title}`);
  }

  console.log('🎉 Seed completed successfully!');
  console.log(`\n📧 Login with: uange209@gmail.com`);
  console.log(`🔑 Password: Ange@123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
