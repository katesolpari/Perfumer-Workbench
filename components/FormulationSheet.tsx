import React, { useMemo } from 'react';
import { Formulation, NoteType, Ingredient } from '../types';

interface FormulationSheetProps {
  formulation: Formulation | null;
  isLoading: boolean;
}

const FormulationSheet: React.FC<FormulationSheetProps> = ({ formulation, isLoading }) => {
  
  // Calculate total quantity to derive percentages
  const totalParts = useMemo(() => {
    if (!formulation) return 0;
    return formulation.ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
  }, [formulation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400 space-y-4">
        <div className="w-8 h-8 border-4 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif italic animate-pulse">Distilling essences...</p>
      </div>
    );
  }

  if (!formulation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <p className="text-center font-serif text-lg">Ready for formulation</p>
      </div>
    );
  }

  // Group ingredients by note
  const groupedIngredients = formulation.ingredients.reduce((acc, ing) => {
    if (!acc[ing.note]) acc[ing.note] = [];
    acc[ing.note].push(ing);
    return acc;
  }, { [NoteType.Top]: [], [NoteType.Heart]: [], [NoteType.Base]: [] } as Record<NoteType, Ingredient[]>);

  const renderSection = (title: string, ingredients: Ingredient[], colorClass: string) => {
    if (ingredients.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className={`text-xs font-mono uppercase tracking-widest mb-3 ${colorClass} font-bold border-b border-slate-100 pb-2 flex justify-between`}>
          <span>{title} Notes</span>
          <span className="opacity-50">Conc.</span>
        </h4>
        <div className="space-y-3">
          {ingredients.map((ing) => {
            const percentage = totalParts > 0 ? ((ing.quantity / totalParts) * 100).toFixed(1) : 0;
            
            return (
              <div key={ing.id} className="group relative bg-white border border-slate-100 rounded-lg p-3 hover:shadow-md hover:border-amber-200 transition-all duration-300">
                <div className="flex justify-between items-start mb-1">
                  <div>
                      <h5 className="font-serif font-semibold text-slate-800 text-lg leading-tight">{ing.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{ing.casNumber}</span>
                  </div>
                  <div className="text-right">
                      <span className="text-xl font-bold text-slate-700">{percentage}%</span>
                      <span className="text-[10px] text-slate-400 block -mt-1">of total</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-2 italic">{ing.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-slate-400 block text-[10px] uppercase">Family</span>
                    <span className="font-medium text-slate-700">{ing.chemicalFamily}</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                      <span className="text-slate-400 block text-[10px] uppercase">Mol. Weight</span>
                      <span className="font-medium text-slate-700">{ing.molecularWeight}</span>
                  </div>
                  <div className="bg-indigo-50/50 p-1.5 rounded col-span-2 flex justify-between items-center border border-indigo-100/50">
                      <div>
                          <span className="text-indigo-400 block text-[10px] uppercase">Bio-Receptor</span>
                          <span className="font-medium text-indigo-900">{ing.biologicalReceptor}</span>
                      </div>
                       <div className="text-right">
                          <span className="text-indigo-400 block text-[10px] uppercase">Trigger</span>
                          <span className="font-medium text-indigo-900">{ing.neuroTrigger}</span>
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="mb-8 p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h2 className="text-3xl font-serif mb-1">{formulation.name}</h2>
        <p className="text-slate-300 italic mb-4 text-sm">{formulation.description}</p>
        
        <div className="flex items-center space-x-4">
            <div className="flex-1">
                <div className="flex justify-between text-xs uppercase tracking-wide text-slate-400 mb-1">
                    <span>Estimated Sillage</span>
                    <span>{formulation.totalSillage}/100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-200 to-amber-500 transition-all duration-1000 ease-out"
                        style={{ width: `${formulation.totalSillage}%` }}
                    ></div>
                </div>
            </div>
        </div>
      </div>

      {renderSection("Top", groupedIngredients[NoteType.Top], "text-cyan-500")}
      {renderSection("Heart", groupedIngredients[NoteType.Heart], "text-pink-500")}
      {renderSection("Base", groupedIngredients[NoteType.Base], "text-amber-600")}
    </div>
  );
};

export default FormulationSheet;