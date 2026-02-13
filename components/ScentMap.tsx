import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, CartesianGrid, ReferenceLine, Label } from 'recharts';
import { Formulation } from '../types';

interface ScentMapProps {
  formulation: Formulation | null;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#f06292', '#ba68c8'
];

const ScentMap: React.FC<ScentMapProps> = ({ formulation }) => {
  
  const data = useMemo(() => {
    if (!formulation) return [];
    return formulation.ingredients.map((ing, index) => ({
      ...ing,
      x: ing.coordinates.x,
      y: ing.coordinates.y,
      z: ing.quantity,
      // Assign a consistent color based on chemical family
      fill: '' // Will be set in next step
    }));
  }, [formulation]);

  // Generate color mapping
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!formulation) return map;
    
    let colorIndex = 0;
    formulation.ingredients.forEach(ing => {
      if (!map.has(ing.chemicalFamily)) {
        map.set(ing.chemicalFamily, COLORS[colorIndex % COLORS.length]);
        colorIndex++;
      }
    });
    return map;
  }, [formulation]);

  // Enriched data with color
  const chartData = useMemo(() => {
    return data.map(d => ({
        ...d,
        fill: colorMap.get(d.chemicalFamily) || '#8884d8'
    }))
  }, [data, colorMap]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = data.fill;

      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-lg shadow-xl text-sm text-slate-800 z-50 max-w-xs ring-1 ring-slate-100">
          <p className="font-serif font-bold text-lg mb-1" style={{ color: color }}>{data.name}</p>
          <div className="flex items-center gap-2 mb-2">
             <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide text-white" style={{ backgroundColor: color }}>
                {data.chemicalFamily}
             </span>
             <span className="text-xs text-slate-400 italic">{data.note} Note</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Receptor</span>
                <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{data.biologicalReceptor}</span>
            </div>
            <div className="text-right">
                <span className="font-semibold text-slate-500 block mb-0.5">Trigger</span>
                <span className="text-slate-700">{data.neuroTrigger}</span>
            </div>
            <div>
                 <span className="font-semibold text-slate-500 block mb-0.5">Mol. Weight</span>
                 <span className="font-mono text-slate-600">{data.molecularWeight}</span>
            </div>
            <div className="text-right">
                 <span className="font-semibold text-slate-500 block mb-0.5">Character</span>
                 <span style={{ color: color }}>{data.y > 50 ? 'Narcotic/Soft' : 'Stimulating/Dry'}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!formulation) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
        <div className="text-center p-6">
            <p className="text-slate-400 font-serif italic text-lg mb-2">Generate a formula to visualize the molecular map</p>
            <p className="text-slate-300 text-xs uppercase tracking-widest">Jellinek's Odor Effects Projection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm z-10">
        <h3 className="font-serif text-xl text-slate-800">Scent Topography</h3>
      </div>
      
      <div className="flex-1 w-full min-h-[400px] p-2 relative">
        {/* Quadrant Background Labels - Subtle */}
        <div className="absolute inset-0 pointer-events-none p-12 opacity-30">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                <div className="flex items-start justify-start p-2"><span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Stimulating<br/>(Dry)</span></div>
                <div className="flex items-start justify-end p-2"><span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 text-right">Narcotic<br/>(Soft)</span></div>
                <div className="flex items-end justify-start p-2"><span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Erogenous<br/>(Warm)</span></div>
                <div className="flex items-end justify-end p-2"><span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 text-right">Anti-erogenous<br/>(Fresh)</span></div>
            </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 30, right: 30, bottom: 80, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
                type="number" 
                dataKey="x" 
                domain={[0, 100]} 
                axisLine={{ stroke: '#cbd5e1' }}
                tick={false}
            >
                <Label value="Volatility / Freshness" offset={20} position="bottom" style={{ fontSize: '10px', fill: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
            </XAxis>
            <YAxis 
                type="number" 
                dataKey="y" 
                domain={[0, 100]} 
                axisLine={{ stroke: '#cbd5e1' }}
                tick={false}
            >
                <Label value="Olfactive Character" angle={-90} position="left" offset={20} style={{ fontSize: '10px', fill: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
            </YAxis>
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Quantity" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {/* Center Crosshairs */}
            <ReferenceLine y={50} stroke="#e2e8f0" strokeWidth={2} />
            <ReferenceLine x={50} stroke="#e2e8f0" strokeWidth={2} />
            
            <Scatter name="Ingredients" data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} stroke="#fff" strokeWidth={2} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 text-xs max-h-28 overflow-y-auto custom-scrollbar">
         {Array.from(colorMap.entries()).map(([key, color]) => (
           <div key={key} className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
             <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
             <span className="text-slate-600 font-medium truncate max-w-[120px]">{key}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default ScentMap;