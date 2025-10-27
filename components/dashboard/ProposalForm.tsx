
import React from 'react';
import Card from '../ui/Card';
import { useDashboardState, useDashboardDispatch } from '../../contexts/DashboardContext';

const ProposalForm: React.FC = () => {
    const { clientName, webName, serviceType } = useDashboardState();
    const dispatch = useDashboardDispatch();

    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">1. Iniciar Nueva Propuesta</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="Nombre del Cliente"
                    className="w-full p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    value={clientName}
                    onChange={(e) => dispatch({ type: 'UPDATE_DETAILS', payload: { clientName: e.target.value, webName } })}
                />
                <input
                    type="text"
                    placeholder="Nombre del Proyecto"
                    className="w-full p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    value={webName}
                    onChange={(e) => dispatch({ type: 'UPDATE_DETAILS', payload: { clientName, webName: e.target.value } })}
                />
                <select
                    className="w-full p-3 bg-slate-700 text-cyan-300 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    value={serviceType}
                    onChange={(e) => dispatch({ type: 'SET_SERVICE_TYPE', payload: e.target.value as 'puntual' | 'mensual' })}
                >
                    <option value="puntual">Proyecto de Pago Único</option>
                    <option value="mensual">Servicio Mensual (Retainer)</option>
                </select>
            </div>
        </Card>
    );
};

export default ProposalForm;
