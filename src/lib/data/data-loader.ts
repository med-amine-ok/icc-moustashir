import dimChannelData from '@/mock/dim_channel.json';
import dimCustomerData from '@/mock/dim_customer.json';
import dimDateData from '@/mock/dim_date.json';
import dimSalesRepData from '@/mock/dim_sales_rep.json';
import factOpportunityData from '@/mock/fact_opportunity.json';
import reportingCustomer360Data from '@/mock/reporting_customer_360.json';
import reportingProductKpisData from '@/mock/reporting_product_kpis.json';
import reportingSalesmanPerformanceData from '@/mock/reporting_salesman_performance.json';
import serviceCatalogData from '@/mock/service_catalog.json';
import simMarketingSpendData from '@/mock/sim_marketing_spend.json';
import simProjectsData from '@/mock/sim_projects.json';
import simTransactionsData from '@/mock/sim_transactions.json';

export interface DimChannel {
  channel_key: string;
  channel_name: string;
}

export interface DimCustomer {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  activity_sector: string | null;
  segment: string;
  wilaya: string;
  workshops_attended: number;
  created_at: string;
}

export interface DimDate {
  date_key: number;
  date: string;
  year: number;
  month: number;
  quarter: number;
}

export interface DimSalesRep {
  sales_rep_key: string;
  sales_rep_name: string;
}

export interface FactOpportunity {
  opportunity_id: string;
  customer_key: string;
  channel_key: string;
  service_id: string;
  date_key: number;
  stage: 'Lead' | 'Qualifié' | 'Réunion' | 'Proposition' | 'Gagné' | 'Perdu' | string;
  stage_probability: number;
  expected_revenue_da: number;
  weighted_revenue_da: number;
  actual_revenue_da: number;
  is_converted: boolean;
  simulated_margin_da: number;
  source_file: string;
  sales_rep_key: string;
}

export interface ReportingCustomer360 {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  activity_sector: string | null;
  segment: string;
  wilaya: string;
  workshops_attended: number;
  created_at: string;
  customer_key: string;
  total_leads_submitted: number;
  total_converted_leads: number;
  total_revenue_paid: number;
  total_margin_generated: number;
  is_converted: boolean;
  customer_cac_da: number;
  customer_ltv_da: number;
}

export interface ReportingProductKPI {
  service_id: string;
  family: string;
  service_name: string;
  tier: string;
  dev_price_da: number;
  hosting_price_da_year: number;
  maintenance_price_da_year: number;
  margin_rate: number;
  recommended_segment: string;
  total_requests: number;
  converted_requests: number;
  total_revenue: number;
  total_margin: number;
  conversion_rate: number;
}

export interface ReportingSalesmanPerformance {
  sales_rep_name: string;
  total_leads_assigned: number;
  converted_leads: number;
  total_revenue_generated: number;
  total_margin_generated: number;
  conversion_rate: number;
  average_days_to_contact: number;
}

export interface ServiceCatalog {
  service_id: string;
  family: string;
  service_name: string;
  tier: string;
  dev_price_da: number;
  hosting_price_da_year: number;
  maintenance_price_da_year: number;
  margin_rate: number;
  recommended_segment: string;
}

export interface SimMarketingSpend {
  month: string;
  channel: string;
  simulated_spend_da: number;
  observed_leads: number;
  simulated_conversion_rate: number;
  simulated_clients_won: number;
  simulated_cac_da: number;
}

export interface SimProject {
  project_id: string;
  customer_id: string;
  service_id: string;
  start_date: string;
  due_date: string;
  delivery_date: string | null;
  status: 'En cours' | 'En retard' | 'Terminé' | 'Maintenance' | string;
  satisfaction_score: number | null;
}

export interface SimTransaction {
  transaction_id: string;
  opportunity_id: string;
  customer_id: string;
  service_id: string;
  amount_da: number;
  transaction_date: string;
  payment_status: 'Payé' | 'En attente' | 'En retard' | string;
}

// Typed exports of real Data Warehouse tables
export const dimChannels = dimChannelData as DimChannel[];
export const dimCustomers = dimCustomerData as DimCustomer[];
export const dimDates = dimDateData as DimDate[];
export const dimSalesReps = dimSalesRepData as DimSalesRep[];
export const factOpportunities = factOpportunityData as FactOpportunity[];
export const reportingCustomer360 = reportingCustomer360Data as ReportingCustomer360[];
export const reportingProductKpis = reportingProductKpisData as ReportingProductKPI[];
export const reportingSalesmanPerformance = reportingSalesmanPerformanceData as ReportingSalesmanPerformance[];
export const serviceCatalog = serviceCatalogData as ServiceCatalog[];
export const simMarketingSpends = simMarketingSpendData as SimMarketingSpend[];
export const simProjects = simProjectsData as SimProject[];
export const simTransactions = simTransactionsData as SimTransaction[];
