import React, { useState, useRef } from 'react';
import ScentMap from './components/ScentMap';
import FormulationSheet from './components/FormulationSheet';
import { generateFormulation } from './services/geminiService';
import { Formulation } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [formulation, setFormulation] = useState<Formulation | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText && !imagePreview) return;
    
    setLoading(true);
    try {
      // If image exists, pass the base64 string (stripping the prefix if needed by the service logic)
      const imageBase64 = imagePreview ? imagePreview.split(',')[1] : undefined;
      const result = await generateFormulation(inputText, imageBase64);
      setFormulation(result);
    } catch (error) {
      alert("Failed to generate formulation. Please check your API Key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
             <span className="serif text-4xl font-semibold text-slate-900">D.</span>
             <h1 className="text-lg serif text-slate-500 ml-3 tracking-wide">Distillate</h1>
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden sm:block">
            AI-Augmented Perfumery Workbench
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Panel: Input & Control */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto pb-4 custom-scrollbar">
            
            {/* Input Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h2 className="font-serif text-lg mb-4 text-slate-800">Olfactive Inspiration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Mood / Description</label>
                  <textarea 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition-all resize-none h-32"
                    placeholder="e.g., A rainy afternoon in Kyoto, smelling of wet concrete and green tea..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>

                <div>
                   <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Visual Reference</label>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group"
                   >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white text-xs">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                           <svg className="w-8 h-8 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           <span className="text-xs text-slate-400">Upload Source Material</span>
                        </div>
                      )}
                   </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading || (!inputText && !imagePreview)}
                  className={`w-full py-3 rounded-lg font-serif text-lg transition-all duration-300 shadow-md
                    ${loading 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg active:transform active:scale-95'
                    }`}
                >
                  {loading ? 'Distilling...' : 'Compose Formula'}
                </button>
              </div>
            </div>

            {/* Mini Scent Map (Mobile/Condensed view context) */}
            <div className="flex-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
               <ScentMap formulation={formulation} />
            </div>
          </div>

          {/* Right Panel: Formulation Sheet */}
          <div className="lg:col-span-9 bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden h-full flex flex-col">
            <div className="flex-1 p-6 lg:p-8 overflow-hidden">
               <FormulationSheet formulation={formulation} isLoading={loading} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;