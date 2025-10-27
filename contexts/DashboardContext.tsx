
import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import type { ProposalBuilderState, ProposalAction, Service, MonthlyPlan } from '../types';

const initialState: ProposalBuilderState = {
    clientName: '',
    webName: '',
    serviceType: 'puntual',
    selectedPackage: null,
    selectedPlan: null,
    selectedStandardServices: [],
    selectedPlanServices: [],
    customServices: [],
    margin: 60,
};

const proposalReducer = (state: ProposalBuilderState, action: ProposalAction): ProposalBuilderState => {
    switch (action.type) {
        case 'RESET_PROPOSAL':
            return initialState;
        case 'UPDATE_DETAILS':
            return { ...state, ...action.payload };
        case 'SET_SERVICE_TYPE':
            return { ...initialState, serviceType: action.payload }; // Reset on type change
        case 'SET_PACKAGE':
            return { ...state, selectedPackage: action.payload, selectedPlan: null, selectedStandardServices: [], selectedPlanServices: [] };
        case 'SET_PLAN':
             return { ...state, selectedPlan: action.payload, selectedPackage: null, selectedStandardServices: [], selectedPlanServices: [] };
        case 'TOGGLE_STANDARD_SERVICE': {
            const serviceExists = state.selectedStandardServices.some(s => s.id === action.payload.id);
            const selectedStandardServices = serviceExists
                ? state.selectedStandardServices.filter(s => s.id !== action.payload.id)
                : [...state.selectedStandardServices, action.payload];
            return { ...state, selectedStandardServices, selectedPackage: null, selectedPlan: null };
        }
        case 'TOGGLE_PLAN_SERVICE': {
            const serviceExists = state.selectedPlanServices.some(s => s.id === action.payload.id);
            const selectedPlanServices = serviceExists
                ? state.selectedPlanServices.filter(s => s.id !== action.payload.id)
                : [...state.selectedPlanServices, action.payload];
            return { ...state, selectedPlanServices };
        }
        case 'ADD_CUSTOM_SERVICE': {
            const newService: Service = { ...action.payload, id: `custom-${Date.now()}`, description: 'Servicio personalizado' };
            return { ...state, customServices: [...state.customServices, newService] };
        }
        case 'REMOVE_CUSTOM_SERVICE':
            return { ...state, customServices: state.customServices.filter(s => s.id !== action.payload.id) };
        case 'UPDATE_MARGIN':
            return { ...state, margin: action.payload };
        case 'LOAD_PROPOSAL':
            return action.payload;
        default:
            return state;
    }
};

const DashboardStateContext = createContext<ProposalBuilderState | undefined>(undefined);
const DashboardDispatchContext = createContext<Dispatch<ProposalAction> | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(proposalReducer, initialState);
    return (
        <DashboardStateContext.Provider value={state}>
            <DashboardDispatchContext.Provider value={dispatch}>
                {children}
            </DashboardDispatchContext.Provider>
        </DashboardStateContext.Provider>
    );
};

export const useDashboardState = () => {
    const context = useContext(DashboardStateContext);
    if (context === undefined) {
        throw new Error('useDashboardState must be used within a DashboardProvider');
    }
    return context;
};

export const useDashboardDispatch = () => {
    const context = useContext(DashboardDispatchContext);
    if (context === undefined) {
        throw new Error('useDashboardDispatch must be used within a DashboardProvider');
    }
    return context;
};
