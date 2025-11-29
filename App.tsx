import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Globe from './components/Globe';
import StoryCard from './components/StoryCard';
import StoryForm from './components/StoryForm';
import FilterBar from './components/FilterBar';
import TutorialOverlay from './components/TutorialOverlay';
import DiscoveryPanel from './components/DiscoveryPanel';
import { GlobeLoader, EmptyState } from './components/LoadingStates';
import { Story, Category } from './types';
import TimeSlider from './components/TimeSlider';
import AmbientSound from './components/AmbientSound';
import { useHaptics } from './hooks/useHaptics';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';

interface NewPinState {
  lat: number;
  lng: number;
  country?: string;
}

const App: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newPinLocation, setNewPinLocation] = useState<NewPinState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecent, setShowRecent] = useState(false);
  const [isTimeTravelOpen, setIsTimeTravelOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  // Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStories, setTourStories] = useState<Story[]>([]);
  const [tourIndex, setTourIndex] = useState(0);
  const tourTimerRef = useRef<number | null>(null);

  // Time Travel State
  const [yearRange, setYearRange] = useState<[number, number]>([1950, new Date().getFullYear()]);

  // Visual Settings State
  const [showDayNight, setShowDayNight] = useState(true);
  const [showConstellations, setShowConstellations] = useState(true);
  const [enableGyro, setEnableGyro] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const { triggerSuccess } = useHaptics();

  // --- Journey Mode Logic ---
  const startTour = useCallback(() => {
    if (stories.length === 0) return;
    const categories = Object.values(Category);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    let tourSet = stories.filter(s => s.category === randomCategory);
    if (tourSet.length < 3) tourSet = stories;
    const shuffled = [...tourSet].sort(() => 0.5 - Math.random()).slice(0, 5);
    setTourStories(shuffled);
    setTourIndex(0);
    setIsTourActive(true);
    setSelectedStory(shuffled[0]);
  }, [stories]);

  const stopTour = useCallback(() => {
    setIsTourActive(false);
    setTourStories([]);
    setTourIndex(0);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
  }, []);

  const toggleTour = useCallback(() => {
    if (isTourActive) {
      stopTour();
    } else {
      startTour();
    }
  }, [isTourActive, startTour, stopTour]);

  useEffect(() => {
    if (!isTourActive || tourStories.length === 0) return;
    tourTimerRef.current = window.setTimeout(() => {
      const nextIndex = tourIndex + 1;
      if (nextIndex < tourStories.length) {
        setTourIndex(nextIndex);
        setSelectedStory(tourStories[nextIndex]);
      } else {
        stopTour();
      }
    }, 10000);
    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, [isTourActive, tourIndex, tourStories, stopTour]);

  // Initialize with DB data and Static stories
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      let dbStories: Story[] = [];

      // 1. Fetch from Database (Neon via Vercel Postgres)
      try {
        const res = await fetch('/api/stories');
        if (res.ok) {
          const rawStories = await res.json();
          dbStories = rawStories.map((s: any) => ({
            ...s,
            createdAt: s.created_at || s.createdAt // Handle both cases
          }));
        } else {
          console.error("Failed to fetch stories");
        }
      } catch (e) {
        console.error("Error fetching stories", e);
      }

      // 2. Static Stories (Client-side fallback)
      /*
      const staticStories: Story[] = [
        {
          id: 'static-1',
          category: Category.FIRST_OCEAN,
          year: 2005,
          text: "I thought it would be cold, but it felt like a warm bath. I never wanted to leave.",
          lat: -33.8688,
          lng: 151.2093,
          city: "Sydney",
          state: "NSW",
          country: "Australia",
          createdAt: new Date().toISOString()
        },
        {
          id: 'static-2',
          category: Category.FIRST_OCEAN,
          year: 2010,
          text: "The Pacific looked infinite from the cliffs of Big Sur.",
          lat: 36.2704,
          lng: -121.8081,
          city: "Big Sur",
          state: "California",
          country: "USA",
          createdAt: new Date().toISOString()
        },
        {
          id: 'static-3',
          category: Category.FIRST_OCEAN,
          year: 2015,
          text: "Dipping my toes in the Mediterranean, the water was crystal clear.",
          lat: 41.3851,
          lng: 2.1734,
          city: "Barcelona",
          state: "Catalonia",
          country: "Spain",
          createdAt: new Date().toISOString()
        },
        {
          id: 'static-4',
          category: Category.FIRST_HEARTBREAK,
          year: 2008,
          text: "Walking through Shibuya crossing, feeling completely alone in the crowd.",
          lat: 35.6591,
          lng: 139.7006,
          city: "Tokyo",
          state: "Tokyo",
          country: "Japan",
          createdAt: new Date().toISOString()
        },
        {
          id: 'static-5',
          category: Category.FIRST_HEARTBREAK,
          year: 2012,
          text: "Rain in London hides the tears well.",
          lat: 51.5074,
          lng: -0.1278,
          city: "London",
          state: "England",
          country: "UK",
          createdAt: new Date().toISOString()
        },
        {
          id: 'static-6',
          category: Category.FIRST_TRAVEL,
          year: 2019,
          text: "The lights of Times Square were overwhelming, but I felt alive.",
          lat: 40.7580,
          lng: -73.9855,
          city: "New York",
          state: "NY",
          country: "USA",
          createdAt: new Date().toISOString()
        }
      ];
      */

      // Combine database and static stories
      setStories([...dbStories]);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleStoryClick = useCallback((story: Story) => {
    if (isAddingMode) return;
    // If tour is active and user clicks manually, stop the tour
    if (isTourActive) stopTour();
    setSelectedStory(story);
  }, [isAddingMode, isTourActive]);

  const handleMapClick = useCallback((lat: number, lng: number, country?: string) => {
    if (isAddingMode) {
      setNewPinLocation({ lat, lng, country });
    } else {
      if (isTourActive) stopTour();
      setSelectedStory(null);
    }
  }, [isAddingMode, isTourActive]);

  const handleSaveStory = async (newStoryData: Omit<Story, 'id'>) => {
    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticStory = { ...newStoryData, id: tempId, createdAt: new Date().toISOString() };
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
        const savedRaw = await res.json();
        const savedStory = {
          ...savedRaw,
          createdAt: savedRaw.created_at || savedRaw.createdAt
        };
        // Replace optimistic story with real one
        setStories(prev => prev.map(s => s.id === tempId ? savedStory : s));
        setSelectedStory(savedStory);
      } else {
        const errorData = await res.json();
        console.error("Failed to save story", errorData);
        alert(`Failed to save story: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error("Error saving story", e);
      alert(`Error saving story: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleAddModeToggle = () => {
    if (isTourActive) stopTour();
    setIsAddingMode(!isAddingMode);
    setSelectedStory(null);
    setNewPinLocation(null);
  };

  // Filtering Logic
  const visibleStories = useMemo(() => {
    let result = stories;

    // 1. Filter by Recent (last 30 days)
    if (showRecent) {
      const currentYear = new Date().getFullYear();
      // Since we don't have created_at, approximate using year
      result = result.filter(s => s.year >= currentYear - 1);
    }

    // 2. Filter by Year Range (Time Travel)
    if (!showRecent) { // Only apply time travel if not showing "Recent"
      result = result.filter(s => s.year >= yearRange[0] && s.year <= yearRange[1]);
    }

    // 3. Filter by Category
    if (filter !== 'ALL') {
      result = result.filter(s => s.category === filter);
    }

    // 4. Filter by Search Query
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
  }, [stories, filter, searchQuery, showRecent, yearRange]);

  // Random story handler
  const handleRandomStory = useCallback(() => {
    if (isTourActive) stopTour();
    setShowRecent(false);
    setIsTimeTravelOpen(false);
    setShowHeatmap(false);
  }, [isTourActive, stopTour]);

  // Reaction handler
  const handleReaction = useCallback(async (storyId: string, reaction: string) => {
    // 1. Optimistic Update
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const key = `reaction_${reaction}` as keyof Story;
        return {
          ...s,
          [key]: (s[key] as number || 0) + 1
        };
      }
      return s;
    }));

    if (selectedStory && selectedStory.id === storyId) {
      const key = `reaction_${reaction}` as keyof Story;
      setSelectedStory(prev => prev ? ({
        ...prev,
        [key]: (prev[key] as number || 0) + 1
      }) : null);
    }

    // 2. API Call
    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, type: reaction }),
      });
      triggerSuccess();
    } catch (e) {
      console.error("Failed to submit reaction", e);
    }
  }, [selectedStory, triggerSuccess]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilter('ALL');
    setSearchQuery('');
    setShowRecent(false);
    setIsTimeTravelOpen(false);
    setShowHeatmap(false);
  }, []);

  const handleSettingToggle = (setting: 'showDayNight' | 'showHeatmap' | 'showConstellations' | 'enableGyro') => {
    if (setting === 'showDayNight') setShowDayNight(!showDayNight);
    if (setting === 'showHeatmap') setShowHeatmap(!showHeatmap);
    if (setting === 'showConstellations') setShowConstellations(!showConstellations);
    if (setting === 'enableGyro') setEnableGyro(!enableGyro);
  };

  const hasActiveFilters = filter !== 'ALL' || searchQuery.trim() !== '' || showRecent || isTimeTravelOpen || showHeatmap;

  return (
    <div className="relative w-screen h-screen bg-space text-white overflow-hidden font-sans selection:bg-neon-blue selection:text-white">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-space pointer-events-none" />

      {/* Tutorial Overlay */}
      <TutorialOverlay />

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

        <div className="hidden md:flex items-center gap-4 pointer-events-auto">
          {/* Tour Status Indicator */}
          {isTourActive && (
            <div className="bg-purple-500/20 backdrop-blur-md border border-purple-500/50 px-4 py-2 rounded-full flex items-center gap-3 animate-pulse">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
              <span className="text-purple-200 font-medium tracking-wide text-sm">
                Journey Mode • {tourIndex + 1}/{tourStories.length}
              </span>
              <button
                onClick={stopTour}
                className="ml-2 text-white/50 hover:text-white pointer-events-auto"
              >
                ✕
              </button>
            </div>
          )}

          {/* GitHub Button */}
          <a
            href="https://github.com/akmal29005/world-first"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
            aria-label="GitHub Repository"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>

          {/* Info Button */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="w-10 h-10 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
            aria-label="About"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={{ showDayNight, showHeatmap, showConstellations, enableGyro }}
        onToggle={handleSettingToggle}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Discovery Panel */}
      <DiscoveryPanel
        onToggleTour={toggleTour}
        isTourActive={isTourActive}
      />

      {/* Time Slider (Only show if NOT in "Recent" mode, NOT adding, and Time Travel is OPEN) */}
      {isTimeTravelOpen && !showRecent && !isAddingMode && !isLoading && (
        <TimeSlider
          minYear={1950}
          maxYear={new Date().getFullYear()}
          startYear={yearRange[0]}
          endYear={yearRange[1]}
          onChange={(start, end) => setYearRange([start, end])}
        />
      )}

      {/* Instruction Toast for Adding Mode */}
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
        {isLoading ? (
          <GlobeLoader />
        ) : visibleStories.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onReset={handleResetFilters}
            onAddStory={handleAddModeToggle}
          />
        ) : (
          <Globe
            stories={visibleStories}
            onStoryClick={handleStoryClick}
            onMapClick={handleMapClick}
            isAddingMode={isAddingMode}
            showHeatmap={showHeatmap}
            showDayNight={showDayNight}
            showConstellations={showConstellations}
            enableGyro={enableGyro}
            hoveredCategory={hoveredCategory}
            selectedCategory={filter === 'ALL' ? null : filter}
            selectedStory={selectedStory}
          />
        )}
      </div>

      {/* Overlays */}
      <FilterBar
        selected={filter}
        onSelect={setFilter}
        onAddClick={handleAddModeToggle}
        isAddingMode={isAddingMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRandomStory={handleRandomStory}
        isTimeTravelOpen={isTimeTravelOpen}
        onToggleTimeTravel={() => {
          setIsTimeTravelOpen(!isTimeTravelOpen);
          if (!isTimeTravelOpen) setShowRecent(false); // Close recent if opening time travel
        }}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        onHover={setHoveredCategory}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {selectedStory && (
        <StoryCard
          story={selectedStory}
          onClose={() => {
            setSelectedStory(null);
            if (isTourActive) stopTour();
          }}
          onReact={handleReaction}
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

      {/* Ambient Sound Controller */}
      <AmbientSound />

    </div>
  );
};

export default App;