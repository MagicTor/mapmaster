'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import {
  getViewStateForRegion,
  animateViewState,
  ViewState,
} from '@/lib/map-utils';

interface Country {
  id: string;
  name: string;
  region: string;
}

interface GameMapProps {
  countries: Country[];
  answeredCountries: Set<string>;
  correctCountries?: Set<string>;
  region: string;
  onCountryClick: (countryId: string) => void;
  disabled?: boolean;
}

// Local TopoJSON asset for country boundaries.
const geoUrl = '/maps/countries-110m.json';

/**
 * Interactive SVG world map component using react-simple-maps
 * Displays countries with clickable regions, hover effects, and animations
 */
export function GameMap({
  countries,
  answeredCountries,
  correctCountries = new Set(),
  region,
  onCountryClick,
  disabled = false,
}: GameMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const viewStateRef = useRef<ViewState>({ center: [0, 0], zoom: 1 });
  const [viewState, setViewState] = useState<ViewState>({
    center: [0, 0],
    zoom: 1,
  });
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'failed'>(
    'loading'
  );

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMapStatus((prev) => (prev === 'loading' ? 'failed' : prev));
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Initialize view state for region
  useEffect(() => {
    const regionKey = region as any;
    try {
      const targetViewState = getViewStateForRegion(regionKey);
      const cancel = animateViewState(
        viewStateRef.current,
        targetViewState,
        600,
        (state) => {
          setViewState(state);
        }
      );
      return () => cancel();
    } catch (e) {
      console.warn('Failed to animate to region:', e);
      return undefined;
    }
  }, [region]);

  // Handle country click
  const handleGeographyClick = useCallback(
    (geo: any) => {
      if (disabled) return;

      const countryName = geo.properties?.name;
      if (!countryName) return;

      // Find matching country in our list
      const country = countries.find(
        (c) =>
          c.name === countryName ||
          c.name.toLowerCase() === countryName.toLowerCase()
      );

      if (country) {
        onCountryClick(country.id);
      }
    },
    [countries, disabled, onCountryClick]
  );

  // Determine country color based on state
  const getCountryColor = (geo: any): string => {
    const countryName = geo.properties?.name;
    const country = countries.find((c) => c.name === countryName);

    if (!country) {
      return 'fill-gray-200 dark:fill-gray-700 hover:fill-gray-300 dark:hover:fill-gray-600';
    }

    if (correctCountries.has(country.id)) {
      return 'fill-green-500 hover:fill-green-600';
    }

    if (answeredCountries.has(country.id)) {
      return 'fill-red-300 dark:fill-red-700 hover:fill-red-400';
    }

    return 'fill-gray-200 dark:fill-gray-700 hover:fill-gray-300 dark:hover:fill-gray-600';
  };

  const handleMapLoad = () => {
    setMapStatus('ready');
  };

  if (mapStatus === 'failed') {
    return (
      <GameMapFallback
        countries={countries}
        answeredCountries={answeredCountries}
        correctCountries={correctCountries}
        onCountryClick={onCountryClick}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Map container — fluid height so the player can see more of the map */}
      <div className="relative w-full" style={{ height: 'clamp(380px, 60vh, 700px)' }}>
        {mapStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 147 }}
          ref={svgRef}
          style={{ width: '100%', height: '100%' }}
        >
          {/* ZoomableGroup is ALWAYS interactive — pan/zoom never blocked.
              Only country-click selection is gated by the disabled prop. */}
          <ZoomableGroup
            center={viewState.center}
            zoom={viewState.zoom}
            minZoom={0.5}
            maxZoom={20}
            onMoveEnd={({ coordinates, zoom }) =>
              setViewState({ center: coordinates, zoom })
            }
          >
          <Geographies geography={geoUrl} onLoadComplete={handleMapLoad}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                return (
                  <motion.g
                    key={geo.rsmKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Geography
                      geography={geo}
                      onClick={() => handleGeographyClick(geo)}
                      style={{
                        default: {
                          stroke: '#ccc',
                          strokeWidth: 0.75,
                          outline: 'none',
                          // Always show a pointer so pan intent is obvious;
                          // click handler ignores the event when disabled.
                          cursor: 'pointer',
                          transition: 'all 200ms ease-in-out',
                          opacity: 1,
                        },
                        hover: {
                          stroke: '#fff',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer',
                          filter: disabled ? 'none' : 'brightness(1.15)',
                        },
                        pressed: {
                          stroke: '#fff',
                          strokeWidth: 1.5,
                          outline: 'none',
                        },
                      }}
                      className={`transition-all duration-200 ${getCountryColor(geo)}`}
                    />
                  </motion.g>
                );
              })
            }
          </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Overlay controls */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow p-2 space-y-2">
          <button
            className="block w-10 h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-bold text-lg"
            onClick={() => {
              const targetState = { ...viewState, zoom: viewState.zoom * 1.5 };
              setViewState(targetState);
            }}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
          <div className="border-t border-gray-300 dark:border-gray-700" />
          <button
            className="block w-10 h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-bold text-lg"
            onClick={() => {
              const targetState = { ...viewState, zoom: Math.max(1, viewState.zoom / 1.5) };
              setViewState(targetState);
            }}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <div className="border-t border-gray-300 dark:border-gray-700" />
          <button
            className="block w-10 h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-bold"
            onClick={() => {
              const regionKey = region as any;
              try {
                const targetViewState = getViewStateForRegion(regionKey);
                animateViewState(viewState, targetViewState, 600, setViewState);
              } catch (e) {
                console.warn('Failed to reset view:', e);
              }
            }}
            title="Reset view"
            aria-label="Reset view"
          >
            ⊙
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Progress:{' '}
            </span>
            {correctCountries.size} of {countries.length} countries completed
          </div>
          <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{
                width: `${(correctCountries.size / countries.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback map for when react-simple-maps fails to load
 * Grid-based country selector as backup
 */
export function GameMapFallback({
  countries,
  answeredCountries,
  correctCountries = new Set(),
  onCountryClick,
  disabled = false,
}: Omit<GameMapProps, 'region'>) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {countries.map((country) => {
          const isCorrect = correctCountries.has(country.id);
          const isAnswered = answeredCountries.has(country.id);
          const isHovered = hoveredCountry === country.id;

          return (
            <motion.button
              key={country.id}
              onClick={() => !disabled && onCountryClick(country.id)}
              className={`p-3 rounded text-sm font-medium transition-all ${
                isCorrect
                  ? 'bg-green-500 text-white'
                  : isAnswered
                  ? 'bg-red-300 text-gray-800'
                  : isHovered && !disabled
                  ? 'bg-blue-300 dark:bg-blue-600 text-gray-900 dark:text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={disabled || isCorrect}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              onHoverStart={() => setHoveredCountry(country.id)}
              onHoverEnd={() => setHoveredCountry(null)}
            >
              {country.name}
            </motion.button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>
            {correctCountries.size} / {countries.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            animate={{
              width: `${(correctCountries.size / countries.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
