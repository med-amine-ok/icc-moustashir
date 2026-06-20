import { 
  dimChannels, 
  dimCustomers, 
  dimDates, 
  dimSalesReps, 
  factOpportunities, 
  reportingCustomer360, 
  reportingProductKpis, 
  reportingSalesmanPerformance, 
  serviceCatalog, 
  simMarketingSpends, 
  simProjects, 
  simTransactions,
  DimChannel,
  DimCustomer,
  DimDate,
  DimSalesRep,
  FactOpportunity,
  ReportingCustomer360,
  ReportingProductKPI,
  ReportingSalesmanPerformance,
  ServiceCatalog,
  SimMarketingSpend,
  SimProject,
  SimTransaction
} from '@/lib/data/data-loader';
import { Opportunity, Customer, Transaction, Project, interactions as mockInteractions, RawLead, INITIAL_RAW_LEADS } from '@/mock/data';

export interface GlobalFilters {
  dateRange: 'all' | '1m' | '3m' | '6m' | '12m' | 'custom' | string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  channel: string; // 'All' or channel_name
  salesRep: string; // 'All' or sales_rep_name
  service: string; // 'All' or service_name
  status: string; // 'All' or stage
  wilaya: string; // 'All' or wilaya name
  segment: string; // 'All' or segment name
}

// Stage Probability Mapper for Weighted Pipeline Value
export const STAGE_PROBABILITIES: Record<string, number> = {
  'Lead': 0.10,
  'Qualifié': 0.30,
  'Réunion': 0.50,
  'Proposition': 0.70,
  'Gagné': 1.00,
  'Perdu': 0.00,
  'Lost': 0.00,
  'Contacted': 0.10,
  'Meeting': 0.50,
  'Proposal': 0.70,
  'Won': 1.00
};

// Segment display name dictionary
const SEGMENT_MAPPING: Record<string, 'Startup' | 'PME' | 'Clinique' | 'Éducation' | 'Marketplace' | 'Grande Entreprise'> = {
  'startup': 'Startup',
  'sme': 'PME',
  'healthcare': 'Clinique',
  'education': 'Éducation',
  'marketplace': 'Marketplace',
  'enterprise': 'Grande Entreprise'
};

// Date helper
const dateKeyToString = (key: number): string => {
  const str = String(key);
  if (str.length !== 8) return '';
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
};

const isWithinDateRange = (dateStr: string, filters: GlobalFilters): boolean => {
  if (filters.dateRange === 'all') return true;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return true;

  if (filters.dateRange === 'custom') {
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (!isNaN(start.getTime()) && date < start) return false;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (!isNaN(end.getTime()) && date > end) return false;
    }
    return true;
  }

  // Anchor date is the end of the simulation dataset (~ May/June 2026)
  const anchorDate = new Date(2026, 5, 20); // June 20, 2026
  const compareDate = new Date(anchorDate);

  if (filters.dateRange === '1m') compareDate.setMonth(anchorDate.getMonth() - 1);
  else if (filters.dateRange === '3m') compareDate.setMonth(anchorDate.getMonth() - 3);
  else if (filters.dateRange === '6m') compareDate.setMonth(anchorDate.getMonth() - 6);
  else if (filters.dateRange === '12m') compareDate.setFullYear(anchorDate.getFullYear() - 1);

  return date >= compareDate;
};

// Helper to resolve customer source based on channel
const getCustomerSource = (customerId: string): Customer['source'] => {
  const opps = factOpportunities.filter(o => o.customer_key === customerId);
  if (opps.length > 0) {
    const firstOpp = opps[0];
    const chan = dimChannels.find(c => c.channel_key === firstOpp.channel_key);
    if (chan) {
      const name = chan.channel_name.toLowerCase();
      if (name === 'website') return 'Site Web';
      if (name === 'marketing') return 'Publicités';
      if (name === 'event') return 'Événements';
      if (name === 'outbound') return 'Prospection Classique';
    }
  }
  return 'Site Web';
};

// Helper to compute a dynamic health score based on relational metrics
const getCustomerHealthScore = (customerId: string, workshops: number): number => {
  let score = 75;
  score += workshops * 5; // Up to 15 points
  
  const projects = simProjects.filter(p => p.customer_id === customerId);
  const delayed = projects.filter(p => p.status === 'delayed' || p.status === 'En retard').length;
  score -= delayed * 15;
  
  const txs = simTransactions.filter(t => t.customer_id === customerId);
  const overdue = txs.filter(t => t.payment_status === 'overdue' || t.payment_status === 'En retard').length;
  score -= overdue * 10;
  
  return Math.max(35, Math.min(98, score));
};

// Raw internal database query filters
const getRawFilteredOpportunities = (filters: GlobalFilters): FactOpportunity[] => {
  const channelMap = new Map(dimChannels.map(c => [c.channel_key, c.channel_name]));
  const repMap = new Map(dimSalesReps.map(r => [r.sales_rep_key, r.sales_rep_name]));
  const serviceMap = new Map(serviceCatalog.map(s => [s.service_id, s.service_name]));

  return factOpportunities.filter(opp => {
    const oppDateStr = dateKeyToString(opp.date_key);
    if (!isWithinDateRange(oppDateStr, filters)) return false;

    if (filters.channel !== 'All') {
      const chanName = channelMap.get(opp.channel_key) || '';
      const normChanName = chanName.toLowerCase();
      const normFilterChan = filters.channel.toLowerCase();
      if (normFilterChan === 'website' && normChanName !== 'website') return false;
      if (normFilterChan === 'marketing' && normChanName !== 'marketing') return false;
      if (normFilterChan === 'events' && normChanName !== 'event') return false;
      if (normFilterChan === 'classic' && normChanName !== 'outbound') return false;
      if (normFilterChan !== 'website' && normFilterChan !== 'marketing' && normFilterChan !== 'events' && normFilterChan !== 'classic') {
        if (normChanName !== normFilterChan) return false;
      }
    }

    if (filters.salesRep !== 'All') {
      const repName = repMap.get(opp.sales_rep_key) || '';
      if (repName !== filters.salesRep) return false;
    }

    if (filters.service !== 'All') {
      const servName = serviceMap.get(opp.service_id) || '';
      if (servName !== filters.service) return false;
    }

    if (filters.status !== 'All') {
      let oppStage = opp.stage;
      if (oppStage === 'Won') oppStage = 'Gagné';
      if (oppStage === 'Lost') oppStage = 'Perdu';
      if (oppStage === 'Proposal') oppStage = 'Proposition';
      if (oppStage === 'Meeting') oppStage = 'Réunion';
      if (oppStage === 'Contacted') oppStage = 'Lead';
      
      let filterStage = filters.status;
      if (filterStage === 'Won') filterStage = 'Gagné';
      if (filterStage === 'Lost') filterStage = 'Perdu';

      if (oppStage !== filterStage) return false;
    }

    if (filters.wilaya && filters.wilaya !== 'All') {
      const cust = dimCustomers.find(c => c.customer_id === opp.customer_key);
      if (!cust || cust.wilaya !== filters.wilaya) return false;
    }

    if (filters.segment && filters.segment !== 'All') {
      const cust = dimCustomers.find(c => c.customer_id === opp.customer_key);
      if (!cust || (cust.segment || '').toLowerCase() !== filters.segment.toLowerCase()) return false;
    }

    return true;
  });
};

const getRawFilteredCustomers = (filters: GlobalFilters): DimCustomer[] => {
  const fOpps = getRawFilteredOpportunities(filters);
  const activeCustomerIds = new Set(fOpps.map(o => o.customer_key));
  return dimCustomers.filter(c => activeCustomerIds.has(c.customer_id));
};

const getRawFilteredTransactions = (filters: GlobalFilters): SimTransaction[] => {
  const fOpps = getRawFilteredOpportunities(filters);
  const activeOppIds = new Set(fOpps.map(o => o.opportunity_id));
  return simTransactions.filter(t => {
    if (!activeOppIds.has(t.opportunity_id)) return false;
    return isWithinDateRange(t.transaction_date, filters);
  });
};

const getRawFilteredProjects = (filters: GlobalFilters): SimProject[] => {
  const fCustomers = getRawFilteredCustomers(filters);
  const activeCustomerIds = new Set(fCustomers.map(c => c.customer_id));
  return simProjects.filter(p => {
    if (!activeCustomerIds.has(p.customer_id)) return false;
    return isWithinDateRange(p.start_date, filters);
  });
};

// Main Data Filter and Aggregator Service
export const DataService = {
  // Get filtered opportunities (mapped to UI Opportunity type)
  getFilteredOpportunities: (filters: GlobalFilters): Opportunity[] => {
    const raw = getRawFilteredOpportunities(filters);
    const opps: Opportunity[] = raw.map(opp => {
      const serviceName = serviceCatalog.find(s => s.service_id === opp.service_id)?.service_name || 'Offre Service';
      let stage: 'Lead' | 'Qualifié' | 'Réunion' | 'Proposition' | 'Gagné' | 'Perdu' = 'Lead';
      if (['Won', 'Gagné'].includes(opp.stage)) stage = 'Gagné';
      else if (['Lost', 'Perdu'].includes(opp.stage)) stage = 'Perdu';
      else if (['Proposal', 'Proposition'].includes(opp.stage)) stage = 'Proposition';
      else if (['Meeting', 'Réunion'].includes(opp.stage)) stage = 'Réunion';
      else if (['Contacted', 'Lead', 'Qualifié'].includes(opp.stage)) {
        stage = opp.stage === 'Qualifié' ? 'Qualifié' : 'Lead';
      }

      return {
        id: opp.opportunity_id,
        title: serviceName,
        customerId: opp.customer_key,
        value: opp.expected_revenue_da,
        stage,
        dateCreated: dateKeyToString(opp.date_key),
        commercialId: opp.sales_rep_key
      };
    });

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('moustachir_leads');
      if (stored) {
        try {
          const leads = JSON.parse(stored) as RawLead[];
          const claimedLeads = leads.filter(l => l.status === 'claimed' && l.commercialId);
          claimedLeads.forEach(l => {
            opps.unshift({
              id: l.id,
              title: `${l.requestedServices[0] || 'Custom Web Development'} - ${l.companyName}`,
              customerId: 'cust-1',
              value: l.value,
              stage: 'Lead',
              dateCreated: l.dateCreated,
              commercialId: l.commercialId || 'SR01'
            });
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    return opps;
  },

  // Get filtered customers (mapped to UI Customer type)
  getFilteredCustomers: (filters: GlobalFilters): Customer[] => {
    const raw = getRawFilteredCustomers(filters);
    return raw.map(c => {
      const c360 = reportingCustomer360.find(r => r.customer_id === c.customer_id);
      return {
        id: c.customer_id,
        name: c.name,
        segment: SEGMENT_MAPPING[(c.segment || '').toLowerCase()] || 'Startup',
        wilaya: c.wilaya,
        contactName: c.name,
        contactEmail: c.email,
        contactPhone: c.phone,
        healthScore: getCustomerHealthScore(c.customer_id, c.workshops_attended),
        cac: c360 ? c360.customer_cac_da : 25000,
        ltv: c360 ? c360.customer_ltv_da : 200000,
        commercialId: factOpportunities.find(o => o.customer_key === c.customer_id)?.sales_rep_key || 'SR01',
        dateAcquired: c.created_at,
        source: getCustomerSource(c.customer_id)
      };
    });
  },

  // Get filtered transactions (mapped to UI Transaction type)
  getFilteredTransactions: (filters: GlobalFilters): Transaction[] => {
    const raw = getRawFilteredTransactions(filters);
    return raw.map(t => {
      const serviceName = serviceCatalog.find(s => s.service_id === t.service_id)?.service_name || 'Service';
      return {
        id: t.transaction_id,
        customerId: t.customer_id,
        amount: t.amount_da,
        status: t.payment_status === 'paid' ? 'Payé' : t.payment_status === 'pending' ? 'En attente' : 'En retard',
        dateIssued: t.transaction_date,
        service: serviceName
      };
    });
  },

  // Get filtered projects (mapped to UI Project type)
  getFilteredProjects: (filters: GlobalFilters): Project[] => {
    const raw = getRawFilteredProjects(filters);
    return raw.map(p => {
      const serviceName = serviceCatalog.find(s => s.service_id === p.service_id)?.service_name || 'Projet';
      return {
        id: p.project_id,
        name: serviceName,
        customerId: p.customer_id,
        service: serviceName,
        status: p.status === 'delivered' ? 'Terminé' : p.status === 'delayed' ? 'En retard' : p.status === 'pending' ? 'En cours' : 'Maintenance',
        startDate: p.start_date,
        endDate: p.delivery_date || p.due_date
      };
    });
  },

  // Get KPIs powered by real Data Warehouse tables
  getKPIs: (filters: GlobalFilters) => {
    const fOpps = getRawFilteredOpportunities(filters);
    const fTransactions = getRawFilteredTransactions(filters);
    const fProjects = getRawFilteredProjects(filters);
    const fCustomers = getRawFilteredCustomers(filters);

    // CA Réalisé (Paid amount from transactions)
    const caRealise = fTransactions
      .filter(t => t.payment_status === 'paid')
      .reduce((sum, t) => sum + t.amount_da, 0);

    // CA Potentiel Pondéré (Weighted pipeline value of active pipeline)
    const caPotentielPondere = fOpps
      .filter(o => !['Gagné', 'Won', 'Perdu', 'Lost'].includes(o.stage))
      .reduce((sum, o) => {
        const prob = STAGE_PROBABILITIES[o.stage] || 0.10;
        return sum + (o.expected_revenue_da * prob);
      }, 0);

    // Gross Margin Percent based on real simulated_margin_da vs actual_revenue_da
    const wonOpps = fOpps.filter(o => o.stage === 'Gagné' || o.stage === 'Won' || o.is_converted);
    const totalActualRev = wonOpps.reduce((sum, o) => sum + o.actual_revenue_da, 0);
    const totalSimMargin = wonOpps.reduce((sum, o) => sum + o.simulated_margin_da, 0);
    const grossMarginPercent = totalActualRev > 0 ? (totalSimMargin / totalActualRev) * 100 : 70.5;

    // Average CAC from pre-computed reporting table for filtered customers
    const activeCustomerIds = new Set(fCustomers.map(c => c.customer_id));
    const customer360Slice = reportingCustomer360.filter(c => activeCustomerIds.has(c.customer_id));
    
    const totalCac = customer360Slice.reduce((sum, c) => sum + c.customer_cac_da, 0);
    const avgCac = customer360Slice.length > 0 ? totalCac / customer360Slice.length : 32450;

    // Average LTV
    const totalLtv = customer360Slice.reduce((sum, c) => sum + c.customer_ltv_da, 0);
    const avgLtv = customer360Slice.length > 0 ? totalLtv / customer360Slice.length : 845200;

    // Conversion rate
    const wonCount = fOpps.filter(o => o.stage === 'Gagné' || o.stage === 'Won' || o.is_converted).length;
    const lostCount = fOpps.filter(o => o.stage === 'Perdu' || o.stage === 'Lost').length;
    const closedCount = wonCount + lostCount;
    const conversionRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 35.8;

    // Qualified leads count
    const qualifiedLeads = fOpps.filter(o => 
      ['Qualifié', 'Proposal', 'Meeting', 'Réunion', 'Proposition'].includes(o.stage)
    ).length;

    // Delayed projects count
    const delayedProjects = fProjects.filter(p => p.status === 'delayed' || p.status === 'En retard').length;

    return {
      caRealise,
      caPotentielPondere,
      grossMarginPercent,
      avgCac,
      avgLtv,
      conversionRate,
      qualifiedLeads,
      delayedProjects,
      clientCount: fCustomers.length,
      oppCount: fOpps.length
    };
  },

  // Get Monthly Revenue Charts
  getMonthlyRevenueChart: (filters: GlobalFilters) => {
    // Group transactions by month
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthLabels: Record<string, string> = {
      '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin',
      '07': 'Juil', '08': 'Août', '09': 'Sept', '10': 'Oct', '11': 'Nov', '12': 'Déc'
    };

    const fTransactions = getRawFilteredTransactions(filters);
    const fOpps = getRawFilteredOpportunities(filters);
    const wonOpps = fOpps.filter(o => o.stage === 'Gagné' || o.stage === 'Won' || o.is_converted);

    // Grouping by Month
    const monthlyMap: Record<string, { revenue: number; margin: number; cost: number }> = {};
    
    // Initialize standard active months in dataset
    ['02', '03', '04', '05'].forEach(m => {
      monthlyMap[m] = { revenue: 0, margin: 0, cost: 0 };
    });

    fTransactions.forEach(t => {
      if (t.payment_status === 'paid') {
        const m = t.transaction_date.split('-')[1];
        if (monthlyMap[m]) {
          monthlyMap[m].revenue += t.amount_da;
        }
      }
    });

    wonOpps.forEach(o => {
      const dateStr = dateKeyToString(o.date_key);
      const m = dateStr.split('-')[1];
      if (monthlyMap[m]) {
        monthlyMap[m].margin += o.simulated_margin_da;
      }
    });

    // Marketing spent as costs
    const fSpend = simMarketingSpends.filter(s => {
      if (filters.channel !== 'All') {
        return s.channel.toLowerCase() === filters.channel.toLowerCase();
      }
      return true;
    });
    
    fSpend.forEach(s => {
      // s.month is like "2026-02"
      const m = s.month.split('-')[1];
      if (monthlyMap[m]) {
        monthlyMap[m].cost += s.simulated_spend_da;
      }
    });

    return Object.entries(monthlyMap).map(([m, data]) => ({
      name: monthLabels[m] || m,
      revenu: data.revenue,
      marge: data.margin,
      depenses: data.cost
    }));
  },

  // Get Lead Funnel Stage Count
  getLeadFunnelData: (filters: GlobalFilters) => {
    const fOpps = getRawFilteredOpportunities(filters);
    const stages = ['Lead', 'Qualifié', 'Réunion', 'Proposition', 'Gagné', 'Perdu'];
    
    const stageMap: Record<string, string> = {
      'Lead': 'Lead',
      'Contacted': 'Lead',
      'Qualifié': 'Qualifié',
      'Réunion': 'Réunion',
      'Meeting': 'Réunion',
      'Proposition': 'Proposition',
      'Proposal': 'Proposition',
      'Gagné': 'Gagné',
      'Won': 'Gagné',
      'Perdu': 'Perdu',
      'Lost': 'Perdu'
    };

    const counts = stages.reduce((acc, stage) => {
      acc[stage] = { count: 0, value: 0 };
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    fOpps.forEach(o => {
      const normalizedStage = stageMap[o.stage] || 'Lead';
      if (counts[normalizedStage]) {
        counts[normalizedStage].count++;
        counts[normalizedStage].value += o.expected_revenue_da;
      }
    });

    return stages.map(stage => ({
      stage,
      count: counts[stage].count,
      value: counts[stage].value
    }));
  },

  // CAC vs LTV by Segment
  getSegmentMetrics: (filters: GlobalFilters) => {
    const fCustomers = getRawFilteredCustomers(filters);
    const segments = ['startup', 'sme', 'healthcare', 'education', 'marketplace', 'enterprise'];
    const segmentLabels: Record<string, string> = {
      'startup': 'Startup',
      'sme': 'PME',
      'healthcare': 'Clinique',
      'education': 'Éducation',
      'marketplace': 'Marketplace',
      'enterprise': 'Grande Entreprise'
    };

    return segments.map(seg => {
      const segClients = fCustomers.filter(c => (c.segment || '').toLowerCase() === seg);
      const activeIds = new Set(segClients.map(c => c.customer_id));
      const c360 = reportingCustomer360.filter(c => activeIds.has(c.customer_id));

      const totalCac = c360.reduce((sum, c) => sum + c.customer_cac_da, 0);
      const totalLtv = c360.reduce((sum, c) => sum + c.customer_ltv_da, 0);
      const avgCac = c360.length > 0 ? totalCac / c360.length : 25000;
      const avgLtv = c360.length > 0 ? totalLtv / c360.length : 600000;

      return {
        segment: segmentLabels[seg] || seg,
        cac: Math.round(avgCac),
        ltv: Math.round(avgLtv),
        clients: segClients.length,
        ratio: avgCac > 0 ? Math.round((avgLtv / avgCac) * 10) / 10 : 0
      };
    });
  },

  // Revenue by Channel (Marketing Attribution)
  getAttributionChart: (filters: GlobalFilters) => {
    const fOpps = getRawFilteredOpportunities(filters);
    const channelMap = new Map(dimChannels.map(c => [c.channel_key, c.channel_name]));
    const channelLabels: Record<string, string> = {
      'website': 'Site Web',
      'marketing': 'Publicités',
      'event': 'Événements',
      'outbound': 'Prospection Classique'
    };

    const channels = ['website', 'marketing', 'event', 'outbound'];

    return channels.map(chan => {
      const channelOpps = fOpps.filter(o => {
        const cName = channelMap.get(o.channel_key) || '';
        return cName.toLowerCase() === chan;
      });

      const clientCount = channelOpps.filter(o => o.stage === 'Gagné' || o.stage === 'Won' || o.is_converted).length;
      const totalExpected = channelOpps.reduce((sum, o) => sum + o.expected_revenue_da, 0);
      
      // Marketing spent
      const marketingSpendObj = simMarketingSpends.find(s => s.channel.toLowerCase() === chan);
      const cac = marketingSpendObj ? marketingSpendObj.simulated_cac_da : 20000;
      const totalSpend = marketingSpendObj ? marketingSpendObj.simulated_spend_da : 150000;
      const revenue = channelOpps
        .filter(o => o.stage === 'Gagné' || o.stage === 'Won')
        .reduce((sum, o) => sum + o.actual_revenue_da, 0);
      const roi = totalSpend > 0 ? Math.round((revenue / totalSpend) * 100) : 0;

      return {
        name: channelLabels[chan] || chan,
        leads: channelOpps.length,
        clients: clientCount,
        cac: Math.round(cac),
        revenue,
        roi
      };
    });
  },

  // Revenue by Commercial
  getCommercialLeaderboard: (filters: GlobalFilters) => {
    const fOpps = getRawFilteredOpportunities(filters);
    const reps = dimSalesReps.filter(r => r.sales_rep_name !== 'Non Assigne' && r.sales_rep_name !== 'Non assigne');

    return reps.map(rep => {
      const repOpps = fOpps.filter(o => o.sales_rep_key === rep.sales_rep_key);
      const wonOpps = repOpps.filter(o => o.stage === 'Gagné' || o.stage === 'Won' || o.is_converted);
      const lostOpps = repOpps.filter(o => o.stage === 'Perdu' || o.stage === 'Lost');
      const totalDecided = wonOpps.length + lostOpps.length;

      const wonValue = wonOpps.reduce((sum, o) => sum + o.actual_revenue_da, 0);
      const conversionRate = totalDecided > 0 ? Math.round((wonOpps.length / totalDecided) * 100) : 0;

      // Find average contact days
      const perfObj = reportingSalesmanPerformance.find(p => p.sales_rep_name === rep.sales_rep_name);
      const avgFollowUp = perfObj ? perfObj.average_days_to_contact * 24 : 12; // in hours

      return {
        id: rep.sales_rep_key,
        name: rep.sales_rep_name,
        email: `${rep.sales_rep_name.toLowerCase().replace(' ', '.')}@moustachir.dz`,
        wonValue,
        wonCount: wonOpps.length,
        conversionRate,
        avgFollowUp,
        meetings: repOpps.filter(o => ['Réunion', 'Meeting', 'Proposition', 'Proposal'].includes(o.stage)).length
      };
    }).sort((a, b) => b.wonValue - a.wonValue);
  },

  // Service Breakdown
  getServicePerformance: (filters: GlobalFilters) => {
    const fOpps = getRawFilteredOpportunities(filters);
    const wonOpps = fOpps.filter(o => o.stage === 'Gagné' || o.stage === 'Won' || o.is_converted);
    const serviceMap = new Map(serviceCatalog.map(s => [s.service_id, s.service_name]));

    const counts: Record<string, { revenue: number; count: number }> = {};
    serviceCatalog.forEach(s => {
      counts[s.service_name] = { revenue: 0, count: 0 };
    });

    wonOpps.forEach(o => {
      const name = serviceMap.get(o.service_id);
      if (name && counts[name] !== undefined) {
        counts[name].revenue += o.actual_revenue_da;
        counts[name].count++;
      }
    });

    return Object.entries(counts).map(([service, data]) => ({
      service,
      revenue: data.revenue,
      count: data.count
    })).sort((a, b) => b.revenue - a.revenue);
  },

  // Data Quality Metrics
  getDataQualityMetrics: () => {
    const totalCustomers = dimCustomers.length;
    const missingPhoneCount = dimCustomers.filter(c => !c.phone || c.phone.trim() === '' || c.phone.includes('**')).length;
    const missingPhonePct = totalCustomers > 0 ? (missingPhoneCount / totalCustomers) * 100 : 0;

    const totalOpps = factOpportunities.length;
    const unassignedOpps = factOpportunities.filter(o => o.sales_rep_key === 'SR10' || o.sales_rep_key === 'SR11').length;
    const missingSalesRepPct = totalOpps > 0 ? (unassignedOpps / totalOpps) * 100 : 0;

    // Lineage score and other details
    const trustScore = 100 - (missingPhonePct * 0.1 + missingSalesRepPct * 0.1);

    return {
      trustScore: Math.round(trustScore * 10) / 10,
      missingPhonePct: Math.round(missingPhonePct * 10) / 10,
      missingSalesRepPct: Math.round(missingSalesRepPct * 10) / 10,
      totalCustomers,
      totalOpps,
      unassignedOpps
    };
  },

  // Customer 360 Detail lookup joining relational Data Warehouse tables
  getCustomerDetails: (customerId: string) => {
    const customer = dimCustomers.find(c => c.customer_id === customerId);
    if (!customer) return null;

    const c360Info = reportingCustomer360.find(c => c.customer_id === customerId);

    const custOpps = factOpportunities.filter(o => o.customer_key === customerId);
    const custTransactions = simTransactions.filter(t => t.customer_id === customerId);
    const custProjects = simProjects.filter(p => p.customer_id === customerId);
    const custInteractions = mockInteractions.filter(i => i.customerId === customerId);

    // Map sales rep
    let salesRepName = 'Non assigné';
    if (custOpps.length > 0) {
      const repKey = custOpps[0].sales_rep_key;
      const rep = dimSalesReps.find(r => r.sales_rep_key === repKey);
      if (rep) salesRepName = rep.sales_rep_name;
    }

    return {
      customer: {
        id: customer.customer_id,
        name: customer.name,
        segment: SEGMENT_MAPPING[(customer.segment || '').toLowerCase()] || 'Startup',
        wilaya: customer.wilaya,
        email: customer.email,
        phone: customer.phone,
        company_name: customer.company_name,
        activity_sector: customer.activity_sector,
        cac: c360Info ? c360Info.customer_cac_da : 0,
        ltv: c360Info ? c360Info.customer_ltv_da : 0,
        dateAcquired: customer.created_at,
        source: getCustomerSource(customer.customer_id),
        healthScore: getCustomerHealthScore(customer.customer_id, customer.workshops_attended),
        contactName: customer.name,
        contactEmail: customer.email,
        contactPhone: customer.phone
      },
      opportunities: custOpps.map(o => {
        const serviceName = serviceCatalog.find(s => s.service_id === o.service_id)?.service_name || 'Offre Service';
        let stage: 'Lead' | 'Qualifié' | 'Réunion' | 'Proposition' | 'Gagné' | 'Perdu' = 'Lead';
        if (['Won', 'Gagné'].includes(o.stage)) stage = 'Gagné';
        else if (['Lost', 'Perdu'].includes(o.stage)) stage = 'Perdu';
        else if (['Proposal', 'Proposition'].includes(o.stage)) stage = 'Proposition';
        else if (['Meeting', 'Réunion'].includes(o.stage)) stage = 'Réunion';
        else if (['Contacted', 'Lead', 'Qualifié'].includes(o.stage)) {
          stage = o.stage === 'Qualifié' ? 'Qualifié' : 'Lead';
        }
        return {
          id: o.opportunity_id,
          title: serviceName,
          value: o.expected_revenue_da,
          stage,
          dateCreated: dateKeyToString(o.date_key),
          commercialId: o.sales_rep_key
        };
      }),
      transactions: custTransactions.map(t => {
        const serviceName = serviceCatalog.find(s => s.service_id === t.service_id)?.service_name || 'Service';
        return {
          id: t.transaction_id,
          amount: t.amount_da,
          status: t.payment_status === 'paid' ? 'Payé' : t.payment_status === 'pending' ? 'En attente' : 'En retard' as const,
          dateIssued: t.transaction_date,
          service: serviceName
        };
      }),
      projects: custProjects.map(p => {
        const serviceName = serviceCatalog.find(s => s.service_id === p.service_id)?.service_name || 'Projet';
        return {
          id: p.project_id,
          name: serviceName,
          status: p.status === 'delivered' ? 'Terminé' : p.status === 'delayed' ? 'En retard' : p.status === 'pending' ? 'En cours' : 'Maintenance' as const,
          startDate: p.start_date,
          endDate: p.delivery_date || p.due_date,
          satisfactionScore: p.satisfaction_score,
          service: serviceName
        };
      }),
      interactions: custInteractions.map(i => ({
        id: i.id,
        customerId: i.customerId,
        type: i.type,
        notes: i.notes,
        date: i.date,
        employeeId: i.employeeId
      })),
      commercial: {
        name: salesRepName
      }
    };
  },

  getLeads: (): RawLead[] => {
    if (typeof window === 'undefined') return INITIAL_RAW_LEADS;
    const stored = localStorage.getItem('moustachir_leads');
    if (!stored) {
      localStorage.setItem('moustachir_leads', JSON.stringify(INITIAL_RAW_LEADS));
      return INITIAL_RAW_LEADS;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_RAW_LEADS;
    }
  },

  updateLeadStatus: (leadId: string, status: RawLead['status']): RawLead[] => {
    if (typeof window === 'undefined') return INITIAL_RAW_LEADS;
    const leads = DataService.getLeads();
    const updated = leads.map(l => l.id === leadId ? { ...l, status } : l);
    localStorage.setItem('moustachir_leads', JSON.stringify(updated));
    return updated;
  },

  claimLead: (leadId: string, commercialId: string): RawLead[] => {
    if (typeof window === 'undefined') return INITIAL_RAW_LEADS;
    const leads = DataService.getLeads();
    const updated = leads.map(l => l.id === leadId ? { ...l, status: 'claimed' as const, commercialId } : l);
    localStorage.setItem('moustachir_leads', JSON.stringify(updated));
    return updated;
  }
};
export default DataService;
