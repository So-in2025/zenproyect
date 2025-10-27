
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { fetchPricingData } from '../../services/pricingService';
import { useDashboardState, useDashboardDispatch } from '../../contexts/DashboardContext';
import type { AllServices, MonthlyPlan, Service } from '../../types';

const ServiceItem: React.FC<{
    item: Service | MonthlyPlan,
    type: 'radio' | 'checkbox',
    name: string,
    isSelected: boolean,
    isDisabled: boolean,
    onToggle: () => void
}> = ({ item, type, name, isSelected, isDisabled, onToggle }) => (
    <div
        className={`item-card flex items-center justify-between p-3 bg-slate-900 rounded-lg transition duration-150 border ${
            isSelected ? 'border-cyan-400' : 'border-slate-700'
        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700'}`}
        onClick={() => !isDisabled && onToggle()}
    >
        <label className="flex-grow cursor-pointer text-sm pr-2 text-slate-200">{item.name}</label>
        <div className="flex items-center gap-3">
            <span className="font-bold text-red-400">${item.price.toFixed(2)}</span>
            <input
                type={type}
                name={name}
                checked={isSelected}
                disabled={isDisabled}
                onChange={onToggle}
                className="form-checkbox h-5 w-5 text-cyan-400 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500"
            />
        </div>
    </div>
);


const ServiceSelection: React.FC = () => {
    const [pricing, setPricing] = useState<{ allServices: AllServices; monthlyPlans: MonthlyPlan[] }>({ allServices: {}, monthlyPlans: [] });
    const state = useDashboardState();
    const dispatch = useDashboardDispatch();

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchPricingData();
            setPricing(data);
        };
        loadData();
    }, []);

    const { serviceType, selectedPackage, selectedPlan, selectedStandardServices, selectedPlanServices } = state;

    const renderPuntualServices = () => (
        <>
            {Object.entries(pricing.allServices).map(([key, category]) => (
                <div key={key} className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-cyan-500">{category.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.items.map(item => (
                            <ServiceItem
                                key={item.id}
                                item={item}
                                type={category.isExclusive ? 'radio' : 'checkbox'}
                                name={category.isExclusive ? 'package' : `service-${item.id}`}
                                isSelected={
                                    category.isExclusive
                                        ? selectedPackage?.id === item.id
                                        : selectedStandardServices.some(s => s.id === item.id)
                                }
                                isDisabled={
                                    category.isExclusive
                                        ? !!selectedStandardServices.length
                                        : !!selectedPackage
                                }
                                onToggle={() => {
                                    if (category.isExclusive) {
                                        dispatch({ type: 'SET_PACKAGE', payload: selectedPackage?.id === item.id ? null : item });
                                    } else {
                                        dispatch({ type: 'TOGGLE_STANDARD_SERVICE', payload: item });
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );

    const renderMensualServices = () => {
        const usedPoints = selectedPlanServices.reduce((sum, s) => sum + (s.pointCost || 0), 0);
        const totalPoints = selectedPlan?.points || 0;
        const remainingPoints = totalPoints - usedPoints;

        return (
            <>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-cyan-500">Planes Mensuales</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pricing.monthlyPlans.map(plan => (
                             <ServiceItem
                                key={plan.id}
                                item={plan}
                                type="radio"
                                name="plan"
                                isSelected={selectedPlan?.id === plan.id}
                                isDisabled={false}
                                onToggle={() => dispatch({ type: 'SET_PLAN', payload: selectedPlan?.id === plan.id ? null : plan })}
                             />
                        ))}
                     </div>
                </div>
                {selectedPlan && (
                    <>
                        <div className="sticky top-0 bg-slate-800 z-10 py-2 mb-4">
                             <div className="points-display bg-slate-900 border border-cyan-400 rounded-lg p-3 text-center font-bold text-lg text-white">
                                Puntos de Desarrollo: <span className="text-cyan-400">{usedPoints} / {totalPoints}</span>
                            </div>
                        </div>
                        {Object.entries(pricing.allServices).filter(([,cat]) => !cat.isExclusive).map(([key, category]) => (
                             <div key={key} className="mb-6">
                                <h3 className="text-xl font-semibold mb-3 text-cyan-500">{category.name}</h3>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {category.items.map(item => {
                                        const isSelected = selectedPlanServices.some(s => s.id === item.id);
                                        return (
                                             <ServiceItem
                                                key={item.id}
                                                item={item}
                                                type="checkbox"
                                                name={`plan-service-${item.id}`}
                                                isSelected={isSelected}
                                                isDisabled={!isSelected && (item.pointCost || 0) > remainingPoints}
                                                onToggle={() => dispatch({ type: 'TOGGLE_PLAN_SERVICE', payload: item })}
                                             />
                                        )
                                    })}
                                 </div>
                            </div>
                        ))}
                    </>
                )}
            </>
        );
    };

    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">2. Configurar la Solución</h2>
            {serviceType === 'puntual' ? renderPuntualServices() : renderMensualServices()}
        </Card>
    );
};

export default ServiceSelection;
