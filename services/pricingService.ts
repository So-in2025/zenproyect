
import type { AllServices, MonthlyPlan } from '../types';

interface PricingData {
  allServices: AllServices;
  monthlyPlans: MonthlyPlan[];
}

export const fetchPricingData = async (): Promise<PricingData> => {
  try {
    const response = await fetch('/pricing.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: PricingData = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch pricing data:', error);
    // Return empty structure on failure to prevent app crash
    return { allServices: {}, monthlyPlans: [] };
  }
};
