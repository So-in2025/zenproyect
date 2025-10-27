
import React, { useState, useEffect } from 'react';
import { DashboardProvider } from '../../contexts/DashboardContext';
import AIChat from './AIChat';
import ProposalForm from './ProposalForm';
import ServiceSelection from './ServiceSelection';
import SummaryCard from './SummaryCard';
import SavedProposals from './SavedProposals';
import type { Proposal } from '../../types';

const DashboardPage: React.FC = () => {
    const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
    
    useEffect(() => {
        try {
            const stored = localStorage.getItem('proposals');
            if (stored) {
                setSavedProposals(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load proposals from localStorage", e);
        }
    }, []);

    const updateAndStoreProposals = (newProposals: Proposal[]) => {
        setSavedProposals(newProposals);
        localStorage.setItem('proposals', JSON.stringify(newProposals));
    };

    const handleSaveProposal = (proposal: Proposal) => {
        updateAndStoreProposals([...savedProposals, proposal]);
    };
    
    const handleDeleteProposal = (index: number) => {
        const newProposals = savedProposals.filter((_, i) => i !== index);
        updateAndStoreProposals(newProposals);
    };

    const handleClearAll = () => {
        if (window.confirm("¿Estás seguro de que quieres borrar TODAS las propuestas?")) {
            updateAndStoreProposals([]);
        }
    };
    
    // Edit functionality would require loading the proposal state back into the context
    const handleEditProposal = (index: number) => {
        alert(`La edición de propuestas es una funcionalidad avanzada. Por ahora, borra la propuesta y créala de nuevo.`);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-400 mb-2 tracking-wider">
                Centro de Operaciones
            </h1>
            <p className="text-center text-slate-400 mb-8">
                Crea, gestiona y exporta propuestas de alto impacto.
            </p>

            <DashboardProvider>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                        <AIChat />
                        <ProposalForm />
                        <ServiceSelection />
                    </div>

                    <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                        <SummaryCard onSave={handleSaveProposal} />
                        <SavedProposals
                            proposals={savedProposals}
                            onEdit={handleEditProposal}
                            onDelete={handleDeleteProposal}
                            onClearAll={handleClearAll}
                        />
                    </div>
                </div>
            </DashboardProvider>
        </div>
    );
};

export default DashboardPage;
