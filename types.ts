
export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  pointCost?: number;
}

export interface ServiceCategory {
  name: string;
  isExclusive: boolean;
  items: Service[];
}

export interface AllServices {
  [key: string]: ServiceCategory;
}

export interface MonthlyPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  points: number;
}

export interface SelectedService {
  id: string;
  name: string;
  price: number;
  type: 'package' | 'standard' | 'custom' | 'plan' | 'plan-service';
  pointCost?: number;
}

export interface Proposal {
  clientName: string;
  webName: string;
  margin: number;
  totalDev: number;
  totalClient: number;
  package: SelectedService | null;
  plan: {
    id: string;
    selectedServiceIds: string[];
    pointsUsed: number;
    totalPointsInBudget: number;
    remainingPoints: number;
  } | null;
  services: SelectedService[];
  type: 'puntual' | 'mensual';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
    introduction: string;
    services: {
        id: string;
        is_new: boolean;
        name: string;
        description?: string;
        price?: number;
    }[];
    closing: string;
    client_questions: string[];
    sales_pitch: string;
}

// --- NUEVOS TIPOS PARA EL CONTEXTO DEL DASHBOARD ---

export interface ProposalBuilderState {
  clientName: string;
  webName: string;
  serviceType: 'puntual' | 'mensual';
  selectedPackage: Service | null;
  selectedPlan: MonthlyPlan | null;
  selectedStandardServices: Service[];
  selectedPlanServices: Service[];
  customServices: Service[];
  margin: number; // as a percentage, e.g., 60
}

export type ProposalAction =
  | { type: 'RESET_PROPOSAL' }
  | { type: 'UPDATE_DETAILS'; payload: { clientName: string; webName: string } }
  | { type: 'SET_SERVICE_TYPE'; payload: 'puntual' | 'mensual' }
  | { type: 'SET_PACKAGE'; payload: Service | null }
  | { type: 'SET_PLAN'; payload: MonthlyPlan | null }
  | { type: 'TOGGLE_STANDARD_SERVICE'; payload: Service }
  | { type: 'TOGGLE_PLAN_SERVICE'; payload: Service }
  | { type: 'ADD_CUSTOM_SERVICE'; payload: { name: string; price: number } }
  | { type: 'REMOVE_CUSTOM_SERVICE'; payload: { id: string } }
  | { type: 'UPDATE_MARGIN'; payload: number }
  | { type: 'LOAD_PROPOSAL'; payload: ProposalBuilderState };
