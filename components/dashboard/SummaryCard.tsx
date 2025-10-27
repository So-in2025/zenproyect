import React, { useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useDashboardState, useDashboardDispatch } from '../../contexts/DashboardContext';
import { SelectedService } from '../../types';

const COMBO_DISCOUNT = 0.10;

const SummaryCard: React.FC<{ onSave: (proposal: any) => void }> = ({ onSave }) => {
    const state = useDashboardState();
    const dispatch = useDashboardDispatch();
    const { margin, selectedPackage, selectedPlan, selectedStandardServices, customServices, selectedPlanServices } = state;

    const { totalDevCost, feedback } = useMemo(() => {
        let total = 0;
        let feedbackMessage = '';
        
        if (selectedPackage) {
            total = selectedPackage.price;
            feedbackMessage = `Costo fijo de paquete: $${total.toFixed(2)}`;
        } else if (selectedPlan) {
            total = selectedPlan.price;
            feedbackMessage = `Costo fijo de plan: $${total.toFixed(2)}`;
        } else {
            const standardCost = selectedStandardServices.reduce((sum, item) => sum + item.price, 0);
            const customCost = customServices.reduce((sum, item) => sum + item.price, 0);
            total = standardCost + customCost;

            if (selectedStandardServices.length >= 3) {
                const discountAmount = standardCost * COMBO_DISCOUNT;
                total -= discountAmount;
                feedbackMessage = `Descuento del 10% aplicado! (Ahorro: $${discountAmount.toFixed(2)})`;
            } else {
                feedbackMessage = `Añade ${3 - selectedStandardServices.length} servicio(s) más para un 10% de descuento.`;
            }
        }
        return { totalDevCost: total, feedback: feedbackMessage };
    }, [selectedPackage, selectedPlan, selectedStandardServices, customServices]);

    const totalClientPrice = useMemo(() => {
        const marginDecimal = margin / 100;
        return totalDevCost / (1 - marginDecimal);
    }, [totalDevCost, margin]);

    const selectedItems: SelectedService[] = useMemo(() => {
        // FIX: Added 'as const' to the 'type' property's string literals.
        // This prevents TypeScript from widening them to the generic 'string' type,
        // ensuring they match the specific union type required by 'SelectedService'.
        if (selectedPackage) return [ { ...selectedPackage, type: 'package' as const } ];
        if (selectedPlan) return [ { ...selectedPlan, type: 'plan' as const }, ...selectedPlanServices.map(s => ({...s, type: 'plan-service' as const})) ];
        return [...selectedStandardServices.map(s => ({...s, type: 'standard' as const})), ...customServices.map(s => ({...s, type: 'custom' as const}))];
    }, [selectedPackage, selectedPlan, selectedStandardServices, customServices, selectedPlanServices]);

    const handleSaveClick = () => {
        // In a real app, this would be a more complete proposal object
        onSave({ ...state, totalDev: totalDevCost, totalClient: totalClientPrice });
        dispatch({type: 'RESET_PROPOSAL'});
    };

    return (
        <Card className="sticky top-6">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">3. Calcular Rentabilidad</h2>
            <div className="mb-4">
                <label htmlFor="marginPercentage" className="block text-sm font-medium text-slate-300 mb-2">
                    Tu Margen de Ganancia (%)
                </label>
                <input
                    type="number"
                    id="marginPercentage"
                    value={margin}
                    onChange={(e) => dispatch({ type: 'UPDATE_MARGIN', payload: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full p-3 bg-slate-700 text-cyan-300 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                />
                <p className="text-xs mt-1 text-slate-400 h-4">{feedback}</p>
            </div>
            <div className="text-lg font-bold space-y-2 pt-4 border-t border-slate-700">
                <p>Costo Producción: $<span id="totalDeveloperPrice">{totalDevCost.toFixed(2)}</span> USD</p>
                <p className="text-cyan-400">Precio a Cliente: $<span id="totalClientPrice">{totalClientPrice.toFixed(2)}</span> USD</p>
            </div>
            
            <Button onClick={handleSaveClick} className="w-full mt-4 text-lg">
                Guardar Propuesta
            </Button>
            
            <h3 className="text-md font-semibold mt-6 mb-2 text-slate-300 border-t border-slate-700 pt-4">
                Resumen de la Solución:
            </h3>
            <div className="text-sm space-y-2 p-3 bg-slate-900 rounded-lg h-40 overflow-y-auto border border-slate-700">
                {selectedItems.length > 0 ? (
                    selectedItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-slate-300">
                           <span>{item.name}</span>
                           {item.pointCost && <span className="text-yellow-400">{item.pointCost} Pts</span>}
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400">Los servicios seleccionados aparecerán aquí.</p>
                )}
            </div>
        </Card>
    );
};

export default SummaryCard;