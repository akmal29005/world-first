import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Globe from './components/Globe';
import StoryCard from './components/StoryCard';
import StoryForm from './components/StoryForm';
import FilterBar from './components/FilterBar';
import { Story, Category } from './types';
import { generateSeedStories } from './services/geminiService';

interface NewPinState {
  lat: number;
  lng: number;
  country?: string;
}

const USER_STORIES_KEY = 'map_of_firsts_user_stories';

const App: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newPinLocation, setNewPinLocation] = useState<NewPinState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with DB data and Seed data
  useEffect(() => {
    const init = async () => {
      let dbStories: Story[] = [];

      // 1. Fetch from Database (Vercel Postgres)
      try {
        const res = await fetch('/api/stories');
        if (res.ok) {
          dbStories = await res.json();
        } else {
          console.error("Failed to fetch stories");
        }
      } catch (e) {
        console.error("Error fetching stories", e);
      }

      // 2. Static/Seed Stories (Client-side)
      const staticStories: Story[] = [
        {
          id: 'static-2',
          category: Category.FIRST_OCEAN,
          year: 2005,
          text: "I thought it would be cold, but it felt like a warm bath. I never wanted to leave.",
          lat: -33.8688,
          lng: 151.2093,
          city: "Sydney",
          state: "NSW",
          country: "Australia"
        }
      ];

      // Set initial state
      setStories([...dbStories, ...staticStories]);

      // 3. Fetch AI generated ones (optional, maybe we don't need this every time if we have DB?)
      // Let's keep it for "filling the map" feel
      try {
        const seed = await generateSeedStories(5); // Reduced count
        setStories(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newSeeds = seed.filter(s => !existingIds.has(s.id));
          return [...prev, ...newSeeds];
        });
      } catch (err) {
        console.error("Failed to load seed stories", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleStoryClick = useCallback((story: Story) => {
    if (isAddingMode) return;
    setSelectedStory(story);
  }, [isAddingMode]);

  const handleMapClick = useCallback((lat: number, lng: number, country?: string) => {
    if (isAddingMode) {
      setNewPinLocation({ lat, lng, country });
    } else {
      setSelectedStory(null);
    }
  }, [isAddingMode]);

  const handleSaveStory = async (newStoryData: Omit<Story, 'id'>) => {
    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticStory = { ...newStoryData, id: tempId };
    setStories(prev => [optimisticStory, ...prev]);

    setNewPinLocation(null);
    setIsAddingMode(false);
    setSelectedStory(optimisticStory);

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStoryData),
      });

      if (res.ok) {
        const savedStory = await res.json();
        // Replace optimistic story with real one
        setStories(prev => prev.map(s => s.id === tempId ? savedStory : s));
        setSelectedStory(savedStory);
      } else {
        console.error("Failed to save story");
        // Revert on failure? Or just alert.
        alert("Failed to save story to cloud. It may disappear on refresh.");
      }
    } catch (e) {
      console.error("Error saving story", e);
      alert("Error saving story.");
    }
  };

  const handleAddModeToggle = () => {
    setIsAddingMode(!isAddingMode);
    setSelectedStory(null);
    setNewPinLocation(null);
  };

  // Filtering Logic
  const visibleStories = useMemo(() => {
    let result = stories;

    // 1. Filter by Category
    if (filter !== 'ALL') {
      result = result.filter(s => s.category === filter);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.text.toLowerCase().includes(query) ||
        (s.city && s.city.toLowerCase().includes(query)) ||
        (s.state && s.state.toLowerCase().includes(query)) ||
        (s.country && s.country.toLowerCase().includes(query)) ||
        s.year.toString().includes(query)
      );
    }

    return result;
  }, [stories, filter, searchQuery]);

  return (
    <div className="relative w-screen h-screen bg-space text-white overflow-hidden font-sans selection:bg-neon-blue selection:text-white">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-space pointer-events-none" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none z-30">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-white drop-shadow-lg">
            The Map of Firsts
          </h1>
          <p className="text-gray-400 mt-2 max-w-md text-sm md:text-base hidden md:block backdrop-blur-sm">
            A geography of emotion. Click a light to read a story, or add your own to the collective memory.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-neon-blue animate-pulse">
            <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
            <span className="text-xs uppercase tracking-widest">Discovering Memories...</span>
          </div>
        )}
      </div>

      {/* Instruction Toast for Adding Mode - Moved to TOP CENTER */}
      {isAddingMode && !newPinLocation && (
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 w-full flex justify-center px-4">
          <div className="bg-slate-900/90 text-neon-blue px-6 py-3 rounded-full backdrop-blur-md border border-neon-blue/30 shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-[bounce_2s_infinite]">
            <span className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></span>
              Tap country to drop pin
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="absolute inset-0 z-10">
        <Globe
          stories={visibleStories}
          onStoryClick={handleStoryClick}
          onMapClick={handleMapClick}
          isAddingMode={isAddingMode}
        />
      </div>

      {/* Overlays */}
      <FilterBar
        selected={filter}
        onSelect={setFilter}
        onAddClick={handleAddModeToggle}
        isAddingMode={isAddingMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {selectedStory && (
        <StoryCard
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {newPinLocation && (
        <StoryForm
          lat={newPinLocation.lat}
          lng={newPinLocation.lng}
          initialCountry={newPinLocation.country}
          onSave={handleSaveStory}
          onCancel={() => setNewPinLocation(null)}
        />
      )}

    </div>
  );
};

export default App;