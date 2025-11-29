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

  const { triggerSuccess } = useHaptics();

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

      // Combine database and static stories
      setStories([...dbStories, ...staticStories]);
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
    if (visibleStories.length === 0) return;
    const randomIndex = Math.floor(Math.random() * visibleStories.length);
    setSelectedStory(visibleStories[randomIndex]);
  }, [visibleStories, isTourActive]);

  // Reaction handler
  const handleReaction = useCallback((storyId: string, reaction: string) => {
    console.log(`Story ${storyId} received reaction: ${reaction}`);
    // TODO: Send to API endpoint when implemented
    // For now, just log it
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilter('ALL');
    setSearchQuery('');
    setShowRecent(false);
    setIsTimeTravelOpen(false);
    setShowHeatmap(false);
  }, []);

  // --- Journey Mode Logic ---

  const startTour = useCallback(() => {
    if (stories.length === 0) return;

    // Pick a random category to tour, or just random stories if mixed
    const categories = Object.values(Category);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Filter stories by this category (or use all if few)
    let tourSet = stories.filter(s => s.category === randomCategory);
    if (tourSet.length < 3) tourSet = stories; // Fallback to all if not enough

    // Shuffle and pick 5
    const shuffled = [...tourSet].sort(() => 0.5 - Math.random()).slice(0, 5);

    setTourStories(shuffled);
    setTourIndex(0);
    setIsTourActive(true);
    setSelectedStory(shuffled[0]);

    // Set filter to match tour for visual consistency (optional)
    // setFilter(randomCategory); 
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

  // Tour Loop
  useEffect(() => {
    if (!isTourActive || tourStories.length === 0) return;

    // Schedule next story
    tourTimerRef.current = window.setTimeout(() => {
      const nextIndex = tourIndex + 1;
      if (nextIndex < tourStories.length) {
        setTourIndex(nextIndex);
        setSelectedStory(tourStories[nextIndex]);
      } else {
        stopTour(); // End of tour
      }
    }, 10000); // 10 seconds per story

    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, [isTourActive, tourIndex, tourStories, stopTour]);


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
      </div>

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