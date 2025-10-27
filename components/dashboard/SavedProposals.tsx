
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Proposal } from '../../types';

interface SavedProposalsProps {
    proposals: Proposal[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onClearAll: () => void;
}

const SavedProposals: React.FC<SavedProposalsProps> = ({ proposals, onEdit, onDelete, onClearAll }) => {
    const totals = proposals.reduce(
        (acc, p) => {
            acc.dev += p.totalDev;
            acc.client += p.totalClient;
            return acc;
        },
        { dev: 0, client: 0 }
    );
    const profit = totals.client - totals.dev;

    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-4 text-pink-400">4. Propuestas Guardadas</h2>
            <div className="space-y-4 max-h-72 overflow-y-auto">
                {proposals.length === 0 ? (
                    <p className="text-slate-400">Aún no hay propuestas guardadas.</p>
                ) : (
                    proposals.map((task, index) => (
                        <div key={index} className="p-3 border border-slate-700 rounded-lg bg-slate-900">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-base text-white">{task.clientName} - {task.webName}</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(index)} className="text-blue-400 hover:text-blue-300 text-sm">Editar</button>
                                    <button onClick={() => onDelete(index)} className="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-green-400">Precio Cliente: ${task.totalClient.toFixed(2)}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="text-lg font-bold space-y-2 pt-4 mt-4 border-t border-slate-700">
                <p>COSTO TOTAL (Prod): $<span className="text-white">{totals.dev.toFixed(2)}</span></p>
                <p className="text-green-400">VENTA TOTAL: ${totals.client.toFixed(2)}</p>
                <p className="text-yellow-400">GANANCIA TOTAL: ${profit.toFixed(2)}</p>
            </div>
             <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="secondary" className="flex-grow" disabled={proposals.length === 0}>Generar Documentos</Button>
                <Button variant="danger" className="flex-grow" onClick={onClearAll} disabled={proposals.length === 0}>Limpiar Todo</Button>
            </div>
        </Card>
    );
};

export default SavedProposals;
