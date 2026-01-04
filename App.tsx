
import React, { useState } from 'react';
import { LogoProject, ImageSize, DiscoveryQuestion } from './types';
import Button from './components/Button';
import { generateDiscoveryQuestions, generateLogo, editLogo } from './services/gemini';

type Step = 'initial' | 'discovery' | 'generating' | 'results';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('initial');
  const [currentProject, setCurrentProject] = useState<LogoProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [concept, setConcept] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1K');

  const startDiscovery = async () => {
    if (!name || !concept) return;
    setIsLoading(true);
    setError(null);
    try {
      const questions = await generateDiscoveryQuestions(name, concept);
      setCurrentProject({
        id: Math.random().toString(36).substr(2, 9),
        name,
        description: concept,
        questions,
        createdAt: Date.now()
      });
      setStep('discovery');
    } catch (err: any) {
      setError("Strategic engine initialization failed. Ensure your API key is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    setStep('generating');
    setError(null);
    try {
      const imageUrl = await generateLogo(name, concept, answers, selectedSize);
      setCurrentProject(prev => prev ? ({ ...prev, imageUrl, answers }) : null);
      setStep('results');
    } catch (err: any) {
      setError("Visual synthesis failed. Check your network or environment variable API key.");
      setStep('discovery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!currentProject?.imageUrl || !editPrompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const newUrl = await editLogo(editPrompt, currentProject.imageUrl);
      setCurrentProject(prev => prev ? ({ ...prev, imageUrl: newUrl }) : null);
      setEditPrompt('');
    } catch (err: any) {
      setError("Refinement encountered a neural error.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('initial');
    setName('');
    setConcept('');
    setAnswers({});
    setCurrentProject(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full h-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-xl shadow-blue-200">
            <span className="text-white font-black text-xl italic tracking-tighter">N</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">Neurologo</span>
        </div>
        {step !== 'initial' && (
          <Button variant="outline" onClick={reset} className="px-5 py-2 text-xs uppercase tracking-widest rounded-xl">New Brand</Button>
        )}
      </nav>

      <main className="w-full max-w-4xl px-6 py-12 md:py-20 flex-1 flex flex-col items-center">
        {step === 'initial' && (
          <div className="w-full space-y-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] md:text-8xl">
                The Blue <br /><span className="text-blue-600 italic">Synthesis.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg mx-auto font-medium leading-relaxed">
                Expert brand identity generation for the next tech era.
              </p>
            </div>

            <div className="bg-white rounded-[48px] p-8 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-100 space-y-10 blue-glow text-left">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] px-1">Organization Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cobalt Dynamics"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 text-2xl font-bold focus:outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] px-1">Primary Objective</label>
                  <textarea 
                    placeholder="e.g. Building sub-sea robotic swarms for oceanic research."
                    value={concept}
                    onChange={e => setConcept(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 text-2xl font-bold focus:outline-none transition-all h-36 resize-none placeholder:text-slate-300"
                  />
                </div>
                <Button 
                  className="w-full py-6 text-xl rounded-[32px] h-20" 
                  onClick={startDiscovery} 
                  isLoading={isLoading}
                  disabled={!name || !concept}
                >
                  Initiate Discovery
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'discovery' && currentProject && (
          <div className="w-full space-y-14 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex bg-blue-50 text-blue-600 border border-blue-100 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">Deep Discovery</div>
              <h2 className="text-5xl font-black tracking-tighter text-slate-900">Define the <span className="text-blue-600">Essence.</span></h2>
            </div>
            
            <div className="space-y-6">
              {currentProject.questions?.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4 hover:border-blue-100 transition-all">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{q.question}</h3>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{q.context}</p>
                    </div>
                  </div>
                  <textarea 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none transition-all resize-none min-h-[100px]"
                    placeholder="Describe your vision..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  />
                </div>
              ))}

              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Technical Resolution</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['1K', '2K', '4K'] as ImageSize[]).map(sz => (
                    <button 
                      key={sz} 
                      onClick={() => setSelectedSize(sz)}
                      className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${selectedSize === sz ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-transparent hover:border-blue-100'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full py-8 text-2xl rounded-[32px] h-24 mt-8" 
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={Object.keys(answers).length < (currentProject.questions?.length || 0)}
              >
                Synthesize Visuals
              </Button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-12">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-20 animate-pulse rounded-full"></div>
                <div className="w-40 h-40 bg-blue-600 rounded-[48px] flex items-center justify-center animate-bounce shadow-2xl shadow-blue-300 relative z-10">
                  <span className="text-white text-6xl font-black italic">N</span>
                </div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black tracking-tighter">Synthesizing DNA...</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Optimizing Blue Vectors for {name}</p>
            </div>
          </div>
        )}

        {step === 'results' && currentProject && currentProject.imageUrl && (
          <div className="w-full space-y-20 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
              <div className="inline-flex bg-blue-50 text-blue-600 border border-blue-100 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">Identity Realized</div>
              <h2 className="text-6xl font-black tracking-tighter text-slate-900">{currentProject.name}</h2>
            </div>

            <div className="space-y-16">
              <div className="group relative aspect-square max-w-xl mx-auto bg-white rounded-[80px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(37,99,235,0.1)] border border-slate-100 p-20 transition-all hover:scale-[1.01] duration-700 logo-grid">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                  src={currentProject.imageUrl} 
                  alt="Neural Logo Result" 
                  className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                />
              </div>

              <div className="max-w-2xl mx-auto space-y-10 bg-white p-12 rounded-[64px] border border-slate-100 shadow-2xl">
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-3xl tracking-tight">Refine Geometry</h4>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Adjust colors or shapes</p>
                </div>
                <div className="flex flex-col gap-6">
                  <input 
                    type="text" 
                    placeholder="e.g. Make the blue darker, add a neon glow..."
                    value={editPrompt}
                    onChange={e => setEditPrompt(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] px-8 py-5 text-xl font-bold focus:outline-none transition-all"
                  />
                  <div className="flex gap-4">
                    <Button onClick={handleEdit} isLoading={isLoading} disabled={!editPrompt} className="flex-1 h-16 rounded-[24px]">
                      Apply Refinement
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = currentProject.imageUrl!;
                            link.download = `${name}-neurologo-export.png`;
                            link.click();
                        }} 
                        className="px-8 h-16 rounded-[24px]"
                        title="Download Asset"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-20 border-t border-slate-50 text-center space-y-6 bg-white">
        <div className="flex justify-center items-center gap-4 opacity-50">
           <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white font-black text-sm italic">N</span>
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">Neurologo</span>
        </div>
        <p className="text-slate-300 text-[10px] tracking-[0.5em] font-black uppercase">
          Synthesized by Gemini 3 & Nano Banana &copy; {new Date().getFullYear()}
        </p>
      </footer>

      {error && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[20px] shadow-3xl flex items-center gap-4 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="font-bold text-xs tracking-tight">{error}</span>
            <button onClick={() => setError(null)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
