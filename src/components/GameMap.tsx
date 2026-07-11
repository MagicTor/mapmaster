'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposableMap,
  Geographies,
  Geography,
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

// GeoJSON URL for country boundaries
const geoUrl =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

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
    setMapLoaded(true);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Map container */}
      <div className="relative w-full h-full min-h-[400px] md:min-h-[600px]">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}

        <ComposableMap projection="geoMercator" ref={svgRef}>
          <Geographies geography={geoUrl} onLoadComplete={handleMapLoad}>
            {({ geographies }) =>
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
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'all 200ms ease-in-out',
                          opacity: 1,
                        },
                        hover: {
                          stroke: '#fff',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.7 : 1,
                          filter: 'brightness(1.1)',
                        },
                        pressed: {
                          stroke: '#fff',
                          strokeWidth: 1.5,
                          outline: 'none',
                        },
                      }}
                      className={`transition-all duration-200 ${getCountryColor(
                        geo
                      )} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </motion.g>
                );
              })
            }
          </Geographies>
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
