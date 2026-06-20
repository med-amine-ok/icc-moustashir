// Data types for Moustachir Decision Intelligence Platform
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Director' | 'Marketing' | 'Commercial' | 'Finance' | 'Admin';
  avatar: string;
  performance: {
    revenueWon: number;
    conversionRate: number;
    meetingsCount: number;
    avgFollowUpTimeHours: number;
    opportunitiesWon: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  segment: 'Startup' | 'PME' | 'Clinique' | 'Éducation' | 'Marketplace' | 'Grande Entreprise';
  wilaya: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  healthScore: number; // 0-100
  cac: number; // in DA
  ltv: number; // in DA
  commercialId: string;
  dateAcquired: string; // ISO date
  source: 'Site Web' | 'Publicités' | 'Événements' | 'Ateliers' | 'Prospection Classique' | 'Recommandation';
}

export interface Opportunity {
  id: string;
  title: string;
  customerId: string;
  value: number; // in DA
  stage: 'Lead' | 'Qualifié' | 'Réunion' | 'Proposition' | 'Gagné' | 'Perdu';
  dateCreated: string;
  dateClosed?: string;
  commercialId: string;
}

export interface RawLead {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  status: 'raw_lead' | 'potential_client' | 'handed_over' | 'claimed';
  requestedServices: string[];
  value: number;
  commercialId: string | null;
  dateCreated: string;
}

export const INITIAL_RAW_LEADS: RawLead[] = [
  {
    id: 'lead-1',
    name: 'Ahmed Benyahia',
    companyName: 'Spa El-Djazair Logistics',
    email: 'a.benyahia@djazair-log.dz',
    phone: '+213 555 12 34 56',
    status: 'raw_lead',
    requestedServices: ['E-Commerce Website'],
    value: 160000,
    commercialId: null,
    dateCreated: '2026-06-18T10:00:00.000Z'
  },
  {
    id: 'lead-2',
    name: 'Dr. Meriem Ould',
    companyName: 'Clinique El-Nadjah',
    email: 'contact@clinique-elnadjah.dz',
    phone: '+213 661 98 76 54',
    status: 'raw_lead',
    requestedServices: ['Medical Center Management', 'Hébergement'],
    value: 545000,
    commercialId: null,
    dateCreated: '2026-06-19T09:30:00.000Z'
  },
  {
    id: 'lead-3',
    name: 'Sofiane Mansouri',
    companyName: 'EURL Mansouri Tech',
    email: 's.mansouri@mansouri-tech.dz',
    phone: '+213 770 45 67 89',
    status: 'potential_client',
    requestedServices: ['Branding Pro', 'Site Vitrine'],
    value: 169000,
    commercialId: null,
    dateCreated: '2026-06-17T14:15:00.000Z'
  },
  {
    id: 'lead-4',
    name: 'Amine Bouazza',
    companyName: 'EURL Bouazza Agri',
    email: 'a.bouazza@bouazza-agri.dz',
    phone: '+213 550 11 22 33',
    status: 'handed_over',
    requestedServices: ['E-Commerce Website'],
    value: 160000,
    commercialId: null,
    dateCreated: '2026-06-16T11:00:00.000Z'
  }
];

export interface Interaction {
  id: string;
  customerId: string;
  type: 'E-mail' | 'Téléphone' | 'Réunion' | 'Proposition';
  notes: string;
  date: string;
  employeeId: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  amount: number; // in DA
  status: 'Payé' | 'En attente' | 'En retard';
  dateIssued: string;
  datePaid?: string;
  service: string;
}

export interface Project {
  id: string;
  name: string;
  customerId: string;
  service: string;
  status: 'En cours' | 'En retard' | 'Terminé' | 'Maintenance';
  startDate: string;
  endDate?: string;
}

// Seeded Pseudo-Random Number Generator (LCG)
class SeededRandom {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  choice<T>(arr: T[]): T {
    const idx = this.nextInt(0, arr.length - 1);
    return arr[idx];
  }
}

// Algerian Data Constants
const ALGERIAN_NAMES = [
  'Mustapha', 'Amine', 'Karim', 'Yacine', 'Sofiane', 'Rachid', 'Farid', 'Mohamed', 'Ryad', 'Fouad',
  'Yasmine', 'Meriem', 'Selma', 'Nour', 'Ines', 'Lydia', 'Amel', 'Sarah', 'Khadidja', 'Ania',
  'Tarek', 'Redouane', 'Walid', 'Hichem', 'Zaki', 'Bilal', 'Omar', 'Kamel', 'Samir', 'Adel'
];

const ALGERIAN_SURNAMES = [
  'Belkacem', 'Mekhloufi', 'Zidane', 'Bouazza', 'Boudiaf', 'Bouteflika', 'Benali', 'Khelifi', 'Dahmani',
  'Saidi', 'Haddad', 'Hamdi', 'Mansouri', 'Cherif', 'Meddah', 'Guendouz', 'Rahmani', 'Ould', 'Laichi',
  'Slimani', 'Ghezzal', 'Feghouli', 'Brahimi', 'Bentaleb', 'Mandi', 'Halliche', 'Djabou', 'Belaili'
];

const WILAYAS = [
  'Alger (16)', 'Oran (31)', 'Constantine (25)', 'Annaba (23)', 'Sétif (19)', 
  'Blida (09)', 'Tlemcen (13)', 'Béjaïa (06)', 'Ghardaïa (47)', 'Ouargla (30)'
];

export const SEGMENTS: Customer['segment'][] = [
  'Startup', 'PME', 'Clinique', 'Éducation', 'Marketplace', 'Grande Entreprise'
];

const SOURCES: Customer['source'][] = [
  'Site Web', 'Publicités', 'Événements', 'Ateliers', 'Prospection Classique', 'Recommandation'
];

const SERVICES = [
  'Branding', 'Stratégie Marketing', 'Landing Page', 'Site Vitrine', 
  'Site Institutionnel', 'E-commerce', 'Système Médical', 'Marketplace', 
  'Application Mobile', 'Hébergement', 'Maintenance', 'Conseil'
];

const SERVICE_VALUES: Record<string, { min: number, max: number, margin: number }> = {
  'Branding': { min: 300000, max: 800000, margin: 0.80 },
  'Stratégie Marketing': { min: 500000, max: 1500000, margin: 0.75 },
  'Landing Page': { min: 100000, max: 300000, margin: 0.85 },
  'Site Vitrine': { min: 200000, max: 600000, margin: 0.70 },
  'Site Institutionnel': { min: 600000, max: 1800000, margin: 0.65 },
  'E-commerce': { min: 800000, max: 2500000, margin: 0.60 },
  'Système Médical': { min: 1500000, max: 4500000, margin: 0.55 },
  'Marketplace': { min: 2000000, max: 6000000, margin: 0.50 },
  'Application Mobile': { min: 1200000, max: 3500000, margin: 0.55 },
  'Hébergement': { min: 50000, max: 250000, margin: 0.90 },
  'Maintenance': { min: 150000, max: 500000, margin: 0.80 },
  'Conseil': { min: 400000, max: 1200000, margin: 0.85 }
};

const COMPANY_PREFIXES = ['SARL', 'EURL', 'SPA', 'Group', 'Clinique', 'Etablissement', 'Cabinet', 'Coopérative'];
const COMPANY_SUFFIXES = ['Solutions', 'Technologies', 'Algérie', 'Services', 'Nord', 'Sud', 'Est', 'Ouest', 'Logistics', 'Santé', 'Education', 'Immobilier'];

// Generate Employees (20)
const generateEmployees = (rng: SeededRandom): Employee[] => {
  const employees: Employee[] = [];
  const roles: Employee['role'][] = ['Director', 'Marketing', 'Commercial', 'Finance', 'Admin'];
  
  // Assign at least one of each role, then fill the rest as Commercial and Marketing
  for (let i = 0; i < 20; i++) {
    let role: Employee['role'] = 'Commercial';
    if (i < 5) {
      role = roles[i];
    } else if (i < 7) {
      role = 'Marketing';
    } else if (i === 19) {
      role = 'Admin';
    } else if (i === 18) {
      role = 'Finance';
    }
    
    const firstName = rng.choice(ALGERIAN_NAMES);
    const lastName = rng.choice(ALGERIAN_SURNAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@moustachir.dz`;
    
    employees.push({
      id: `emp-${i + 1}`,
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      performance: {
        revenueWon: 0, // calculated later
        conversionRate: 0, // calculated later
        meetingsCount: rng.nextInt(15, 60),
        avgFollowUpTimeHours: Math.round((rng.next() * 12 + 2) * 10) / 10,
        opportunitiesWon: 0
      }
    });
  }
  return employees;
};

// Generate Customers (500)
const generateCustomers = (rng: SeededRandom, employees: Employee[]): Customer[] => {
  const customers: Customer[] = [];
  const commercials = employees.filter(e => e.role === 'Commercial');
  
  // Seed dates over the past 12 months
  const today = new Date(2026, 5, 19); // June 19, 2026

  for (let i = 0; i < 500; i++) {
    const prefix = rng.choice(COMPANY_PREFIXES);
    const middleName = rng.choice(ALGERIAN_SURNAMES);
    const suffix = rng.choice(COMPANY_SUFFIXES);
    const name = prefix === 'Clinique' || prefix === 'Cabinet' 
      ? `${prefix} Dr. ${middleName}` 
      : `${prefix} ${middleName} ${suffix}`;
    
    const segment = rng.choice(SEGMENTS);
    const wilaya = rng.choice(WILAYAS);
    const contactFirstName = rng.choice(ALGERIAN_NAMES);
    const contactLastName = rng.choice(ALGERIAN_SURNAMES);
    const contactName = `${contactFirstName} ${contactLastName}`;
    const contactEmail = `contact@${middleName.toLowerCase()}${suffix.toLowerCase().substring(0, 4)}.dz`;
    
    // Generate Algerian format phone number (+213 5xx xx xx xx / +213 6xx xx xx xx / +213 7xx xx xx xx)
    const mobilePrefix = rng.choice(['5', '6', '7']);
    const phoneNum = Array.from({ length: 8 }, () => rng.nextInt(0, 9)).join('');
    const contactPhone = `+213 ${mobilePrefix}${phoneNum.substring(0,2)} ${phoneNum.substring(2,4)} ${phoneNum.substring(4,6)} ${phoneNum.substring(6,8)}`;

    const healthScore = rng.nextInt(segment === 'Startup' ? 40 : 60, 98);
    const cac = rng.nextInt(15000, 75000); // 15k to 75k DA
    
    // Select assigned commercial
    const commercial = rng.choice(commercials);
    
    // Acquire date (over past 12 months)
    const monthsAgo = rng.nextInt(0, 11);
    const daysAgo = rng.nextInt(1, 28);
    const dateAcquired = new Date(today);
    dateAcquired.setMonth(today.getMonth() - monthsAgo);
    dateAcquired.setDate(today.getDate() - daysAgo);

    customers.push({
      id: `cust-${i + 1}`,
      name,
      segment,
      wilaya,
      contactName,
      contactEmail,
      contactPhone,
      healthScore,
      cac,
      ltv: 0, // calculated from invoices/transactions later
      commercialId: commercial.id,
      dateAcquired: dateAcquired.toISOString(),
      source: rng.choice(SOURCES)
    });
  }
  return customers;
};

// Generate Opportunities (800)
const generateOpportunities = (rng: SeededRandom, customers: Customer[], employees: Employee[]): Opportunity[] => {
  const opportunities: Opportunity[] = [];
  const commercials = employees.filter(e => e.role === 'Commercial');
  const stages: Opportunity['stage'][] = ['Lead', 'Qualifié', 'Réunion', 'Proposition', 'Gagné', 'Perdu'];
  
  const today = new Date(2026, 5, 19);

  for (let i = 0; i < 800; i++) {
    // Link to random customer
    const customer = rng.choice(customers);
    const service = rng.choice(SERVICES);
    const title = `${service} - ${customer.name}`;
    
    // Determine Stage with weighted distribution (more Leads, fewer Won/Lost)
    const stageVal = rng.next();
    let stage: Opportunity['stage'] = 'Lead';
    if (stageVal < 0.25) stage = 'Lead';
    else if (stageVal < 0.45) stage = 'Qualifié';
    else if (stageVal < 0.60) stage = 'Réunion';
    else if (stageVal < 0.75) stage = 'Proposition';
    else if (stageVal < 0.92) stage = 'Gagné';
    else stage = 'Perdu';

    const vals = SERVICE_VALUES[service];
    const value = rng.nextInt(vals.min, vals.max);

    // Dates
    const monthsAgo = rng.nextInt(0, 11);
    const daysAgo = rng.nextInt(1, 28);
    const dateCreated = new Date(today);
    dateCreated.setMonth(today.getMonth() - monthsAgo);
    dateCreated.setDate(today.getDate() - daysAgo);

    let dateClosed: string | undefined;
    if (stage === 'Gagné' || stage === 'Perdu') {
      const closeDate = new Date(dateCreated);
      closeDate.setDate(closeDate.getDate() + rng.nextInt(5, 40));
      if (closeDate > today) {
        closeDate.setTime(today.getTime());
      }
      dateClosed = closeDate.toISOString();
    }

    opportunities.push({
      id: `opp-${i + 1}`,
      title,
      customerId: customer.id,
      value,
      stage,
      dateCreated: dateCreated.toISOString(),
      dateClosed,
      commercialId: customer.commercialId
    });
  }
  return opportunities;
};

// Generate Interactions (1000)
const generateInteractions = (rng: SeededRandom, customers: Customer[], employees: Employee[]): Interaction[] => {
  const interactions: Interaction[] = [];
  const types: Interaction['type'][] = ['E-mail', 'Téléphone', 'Réunion', 'Proposition'];
  const notesTemplates = {
    'E-mail': [
      "Envoi de la brochure commerciale suite à la prise de contact.",
      "Prise de contact pour planifier une réunion de cadrage.",
      "Relance concernant la proposition budgétaire envoyée la semaine passée.",
      "Demande d'informations complémentaires sur le cahier des charges.",
      "Confirmation du rendez-vous technique de présentation."
    ],
    'Téléphone': [
      "Appel de courtoisie. Le client est très intéressé par nos solutions e-commerce.",
      "Appel de qualification. Budget estimé validé, Wilaya d'activité confirmée.",
      "Relance téléphonique. Le client doit valider le budget avec son conseil d'administration.",
      "Discussion technique sur les options d'hébergement en Algérie.",
      "Appel entrant. Demande urgente de devis de maintenance."
    ],
    'Réunion': [
      "Réunion de cadrage physique dans leurs locaux. Présentation de la méthodologie Moustachir.",
      "Démonstration de la plateforme système médical. Retour très positif de l'équipe clinique.",
      "Négociation tarifaire. Discussion sur l'échelonnement des paiements sur 3 tranches.",
      "Réunion technique avec le DSI pour valider les prérequis de sécurité.",
      "Présentation de la proposition finale. Signature attendue sous peu."
    ],
    'Proposition': [
      "Génération et envoi du devis détaillé pour le développement applicatif mobile.",
      "Envoi de la charte de cadrage technique pour le projet de branding global.",
      "Mise à jour de la proposition financière avec réduction de 10% sur l'hébergement.",
      "Envoi du contrat annuel de maintenance et de support technique.",
      "Soumission de l'offre technique et financière pour l'appel d'offres privé."
    ]
  };

  const today = new Date(2026, 5, 19);

  for (let i = 0; i < 1000; i++) {
    const customer = rng.choice(customers);
    const type = rng.choice(types);
    const templates = notesTemplates[type];
    const notes = rng.choice(templates);
    
    const monthsAgo = rng.nextInt(0, 11);
    const daysAgo = rng.nextInt(1, 28);
    const date = new Date(today);
    date.setMonth(today.getMonth() - monthsAgo);
    date.setDate(today.getDate() - daysAgo);

    interactions.push({
      id: `int-${i + 1}`,
      customerId: customer.id,
      type,
      notes,
      date: date.toISOString(),
      employeeId: customer.commercialId
    });
  }
  return interactions;
};

// Generate Transactions (300) and link to Projects (200)
// Also calculates LTV on Customers and updates Employee performance metrics.
const generateTransactionsAndProjects = (
  rng: SeededRandom, 
  customers: Customer[], 
  opportunities: Opportunity[], 
  employees: Employee[]
) => {
  const transactions: Transaction[] = [];
  const projects: Project[] = [];
  
  // Find all won opportunities
  const wonOpps = opportunities.filter(o => o.stage === 'Gagné');
  const today = new Date(2026, 5, 19);

  // We need to generate exactly 300 transactions/invoices
  // We distribute them among the won opportunities. Some won opportunities will have 1 invoice, some 2 or 3 (milestones).
  let transactionCounter = 1;
  let projectCounter = 1;

  wonOpps.forEach((opp, index) => {
    const customer = customers.find(c => c.id === opp.customerId);
    if (!customer) return;

    const serviceName = opp.title.split(' - ')[0];
    
    // Every won opportunity gets a project (up to 200 projects)
    if (projectCounter <= 200) {
      const projectStatus = rng.choice(['Terminé', 'En cours', 'En retard', 'Maintenance'] as Project['status'][]);
      const startDate = new Date(opp.dateClosed || opp.dateCreated);
      let endDate: string | undefined;
      if (projectStatus === 'Terminé' || projectStatus === 'Maintenance') {
        const end = new Date(startDate);
        end.setDate(end.getDate() + rng.nextInt(15, 90));
        if (end > today) end.setTime(today.getTime());
        endDate = end.toISOString();
      }
      
      projects.push({
        id: `proj-${projectCounter}`,
        name: `Projet ${serviceName} - ${customer.name}`,
        customerId: customer.id,
        service: serviceName,
        status: projectStatus,
        startDate: startDate.toISOString(),
        endDate
      });
      projectCounter++;
    }

    // Now issue invoices (transactions) for this won opportunity
    // We split the opp value into 1 to 3 invoices (e.g. 50% advance, 50% delivery)
    const numInvoices = rng.nextInt(1, 2);
    const invoiceAmounts: number[] = [];
    if (numInvoices === 1) {
      invoiceAmounts.push(opp.value);
    } else {
      const split = rng.nextInt(30, 50); // percentage
      invoiceAmounts.push(Math.round((opp.value * split) / 100));
      invoiceAmounts.push(opp.value - invoiceAmounts[0]);
    }

    invoiceAmounts.forEach((amt, invIdx) => {
      if (transactionCounter > 300) return;

      const dateIssued = new Date(opp.dateClosed || opp.dateCreated);
      // stagger subsequent invoices
      if (invIdx > 0) {
        dateIssued.setDate(dateIssued.getDate() + 30);
      }
      
      let status: Transaction['status'] = 'Payé';
      if (dateIssued > today) {
        dateIssued.setTime(today.getTime());
        status = 'En attente';
      } else {
        const statusVal = rng.next();
        if (statusVal < 0.85) status = 'Payé';
        else if (statusVal < 0.95) status = 'En retard';
        else status = 'En attente';
      }

      let datePaid: string | undefined;
      if (status === 'Payé') {
        const paidDate = new Date(dateIssued);
        paidDate.setDate(paidDate.getDate() + rng.nextInt(1, 20));
        if (paidDate > today) paidDate.setTime(today.getTime());
        datePaid = paidDate.toISOString();

        // Accumulate LTV for the customer
        customer.ltv += amt;
      }

      transactions.push({
        id: `inv-${transactionCounter}`,
        customerId: customer.id,
        amount: amt,
        status,
        dateIssued: dateIssued.toISOString(),
        datePaid,
        service: serviceName
      });
      transactionCounter++;
    });
  });

  // If we have fewer than 300 transactions (e.g. not enough Won opportunities), generate top-up invoices for random customers
  while (transactionCounter <= 300) {
    const customer = rng.choice(customers);
    const service = rng.choice(SERVICES);
    const valInfo = SERVICE_VALUES[service];
    const amount = rng.nextInt(valInfo.min, valInfo.max);
    const monthsAgo = rng.nextInt(0, 11);
    const dateIssued = new Date(today);
    dateIssued.setMonth(today.getMonth() - monthsAgo);
    
    const status = rng.choice(['Payé', 'En attente', 'En retard'] as Transaction['status'][]);
    let datePaid: string | undefined;
    if (status === 'Payé') {
      const paidDate = new Date(dateIssued);
      paidDate.setDate(paidDate.getDate() + rng.nextInt(1, 15));
      datePaid = paidDate.toISOString();
      customer.ltv += amount;
    }

    transactions.push({
      id: `inv-${transactionCounter}`,
      customerId: customer.id,
      amount,
      status,
      dateIssued: dateIssued.toISOString(),
      datePaid,
      service
    });
    transactionCounter++;
  }

  // Calculate Employee (Commercial) Performance Metrics
  employees.forEach(emp => {
    if (emp.role === 'Commercial') {
      const empOpps = opportunities.filter(o => o.commercialId === emp.id);
      const won = empOpps.filter(o => o.stage === 'Gagné');
      const lost = empOpps.filter(o => o.stage === 'Perdu');
      const totalDecided = won.length + lost.length;

      emp.performance.opportunitiesWon = won.length;
      emp.performance.revenueWon = won.reduce((acc, o) => acc + o.value, 0);
      emp.performance.conversionRate = totalDecided > 0 
        ? Math.round((won.length / totalDecided) * 100) 
        : rng.nextInt(20, 45);
    }
  });

  return { transactions, projects };
};

// Generate everything using seed 42 to make it completely deterministic
const rng = new SeededRandom(2026);
export const employees = generateEmployees(rng);
export const customers = generateCustomers(rng, employees);
export const opportunities = generateOpportunities(rng, customers, employees);
export const interactions = generateInteractions(rng, customers, employees);

const { transactions: genTransactions, projects: genProjects } = generateTransactionsAndProjects(
  rng, 
  customers, 
  opportunities, 
  employees
);

export const transactions = genTransactions;
export const projects = genProjects;
export const servicesList = SERVICES;
export const wilayasList = WILAYAS;

// Precompute 12 months history relative to today (June 19, 2026)
export const getMonthlyFinancialHistory = () => {
  const history = [];
  const today = new Date(2026, 5, 19);
  
  for (let i = 11; i >= 0; i--) {
    const targetMonth = new Date(today);
    targetMonth.setMonth(today.getMonth() - i);
    const m = targetMonth.getMonth();
    const y = targetMonth.getFullYear();
    const monthName = targetMonth.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    
    // Filter paid invoices in this month
    const monthPaid = transactions.filter(t => {
      if (!t.datePaid) return false;
      const d = new Date(t.datePaid);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    // Filter created opportunities in this month
    const monthOppsCreated = opportunities.filter(o => {
      const d = new Date(o.dateCreated);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const revenue = monthPaid.reduce((acc, t) => acc + t.amount, 0);
    // Cost: CAC + Simulated operational costs (approx. 40% of revenue)
    const cacCost = customers.filter(c => {
      const d = new Date(c.dateAcquired);
      return d.getMonth() === m && d.getFullYear() === y;
    }).reduce((acc, c) => acc + c.cac, 0);

    const operationalCost = Math.round(revenue * 0.35);
    const totalCost = cacCost + operationalCost;
    const margin = Math.max(0, revenue - totalCost);

    history.push({
      monthName,
      month: m + 1,
      year: y,
      revenue,
      cost: totalCost,
      margin,
      opportunitiesCount: monthOppsCreated.length
    });
  }
  return history;
};
