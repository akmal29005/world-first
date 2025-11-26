import React, { useState, useEffect } from 'react';
import { Category, Story } from '../types';

interface StoryFormProps {
  lat: number;
  lng: number;
  initialCountry?: string;
  onSave: (story: Omit<Story, 'id'>) => void;
  onCancel: () => void;
}

const StoryForm: React.FC<StoryFormProps> = ({ lat, lng, initialCountry, onSave, onCancel }) => {
  const [category, setCategory] = useState<Category>(Category.FIRST_HEARTBREAK);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [text, setText] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState(initialCountry || '');
  const [error, setError] = useState<string | null>(null);

  // Update country if initialCountry changes
  useEffect(() => {
    if (initialCountry) setCountry(initialCountry);
  }, [initialCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rate Limit Check (1 Week)
    const LAST_SUBMISSION_KEY = 'map_of_firsts_last_submission';
    const lastSubmission = localStorage.getItem(LAST_SUBMISSION_KEY);
    
    if (lastSubmission) {
      const lastTime = parseInt(lastSubmission, 10);
      const currentTime = Date.now();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      
      if (currentTime - lastTime < oneWeekMs) {
        const daysLeft = Math.ceil((oneWeekMs - (currentTime - lastTime)) / (24 * 60 * 60 * 1000));
        setError(`To keep each mark special, we limit stories to one per week. Please return in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`);
        return;
      }
    }

    // Save timestamp
    localStorage.setItem(LAST_SUBMISSION_KEY, Date.now().toString());

    onSave({
      category,
      year,
      text,
      lat,
      lng,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
    });
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4">
      <div className="glass-panel rounded-xl p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse"></span>
           Mark Your First
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-3 animate-pulse">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-200 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-800 text-white rounded border border-gray-600 p-2 focus:border-neon-blue focus:outline-none transition-colors"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold">Year</label>
                <input 
                  type="number" 
                  min="1900" 
                  max={new Date().getFullYear()} 
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-800 text-white rounded border border-gray-600 p-2 focus:border-neon-blue focus:outline-none transition-colors"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold">City</label>
               <input 
                  type="text" 
                  placeholder="e.g. Paris"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded border border-gray-600 p-2 focus:border-neon-blue focus:outline-none transition-colors"
                />
            </div>
             <div>
               <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold">State / Region</label>
               <input 
                  type="text" 
                  placeholder="e.g. Île-de-France"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded border border-gray-600 p-2 focus:border-neon-blue focus:outline-none transition-colors"
                />
            </div>
          </div>
          
          <div>
             <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold">Country</label>
             <input 
                type="text" 
                placeholder="e.g. France"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-800 text-white rounded border border-gray-600 p-2 focus:border-neon-blue focus:outline-none transition-colors"
              />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide font-bold">Your Story (2 sentences max)</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="I dropped my ice cream here and met..."
              className="w-full bg-slate-800 text-white rounded border border-gray-600 p-2 focus:border-neon-blue focus:outline-none resize-none transition-colors"
              required
            />
            <div className="text-right text-xs text-gray-500 mt-1">{text.length}/200</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 bg-transparent border border-gray-600 text-gray-300 py-2 rounded hover:bg-white/5 transition-colors font-bold text-sm"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              disabled={!!error}
              className={`flex-1 font-bold py-2 rounded transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)] text-sm
                ${error 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-neon-blue text-white hover:bg-blue-500'}`
              }
            >
              DROP PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryForm;