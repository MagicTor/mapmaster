// Map utilities for handling region bounds, zooming, and clicking

import { Country, Region } from '@/types';

export interface MapBounds {
  x: [number, number]; // [minX, maxX]
  y: [number, number]; // [minY, maxY]
}

export interface ViewState {
  center: [number, number];
  zoom: number;
}

/**
 * Region geographic bounds (approximate)
 * Used for zoom-to-region functionality
 */
export const REGION_BOUNDS: Record<Region, MapBounds> = {
  'North America': {
    x: [-170, -50],
    y: [15, 85],
  },
  'South America': {
    x: [-82, -34],
    y: [-56, 13],
  },
  Europe: {
    x: [-10, 40],
    y: [35, 71],
  },
  Asia: {
    x: [26, 180],
    y: [-10, 77],
  },
  Oceania: {
    x: [113, 180],
    y: [-47, 0],
  },
  Africa: {
    x: [-17, 52],
    y: [-35, 37],
  },
  World: {
    x: [-180, 180],
    y: [-85, 85],
  },
};

/**
 * Calculate center point and zoom level for a region
 * @param bounds - The geographic bounds
 * @returns View state with center and zoom
 */
export function getViewStateForBounds(bounds: MapBounds): ViewState {
  const [minX, maxX] = bounds.x;
  const [minY, maxY] = bounds.y;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Estimate zoom level based on bounds width
  // This is approximate and may need tuning per library
  const width = maxX - minX;
  const zoom = Math.max(1, 5 - Math.log2(width / 50));

  return {
    center: [centerX, centerY],
    zoom: Math.min(5, zoom),
  };
}

/**
 * Get view state for a specific region
 * @param region - Region name
 * @returns View state for that region
 */
export function getViewStateForRegion(region: Region): ViewState {
  const bounds = REGION_BOUNDS[region];
  return getViewStateForBounds(bounds);
}

/**
 * Check if a point is inside a polygon (GeoJSON coordinates)
 * Uses ray casting algorithm
 * @param point - [longitude, latitude]
 * @param polygon - Array of [longitude, latitude] coordinate pairs
 * @returns true if point is inside polygon
 */
export function pointInPolygon(
  point: [number, number],
  polygon: Array<[number, number]>
): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Find closest country to a clicked point
 * Useful for small countries that are hard to click
 * @param point - [longitude, latitude]
 * @param countries - Array of country objects with boundaries
 * @param maxDistance - Maximum distance to consider (in degrees)
 * @returns Country object or null if no match found
 */
export function findClosestCountry(
  point: [number, number],
  countries: Country[],
  maxDistance: number = 5
): Country | null {
  let closestCountry: Country | null = null;
  let closestDistance = maxDistance;

  countries.forEach((country) => {
    if (!country.centroid) return;

    const distance = Math.sqrt(
      Math.pow(point[0] - country.centroid[0], 2) +
        Math.pow(point[1] - country.centroid[1], 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestCountry = country;
    }
  });

  return closestCountry;
}

/**
 * Get click tolerance radius for a country
 * Smaller countries get larger tolerance to make them easier to click
 * @param country - Country object
 * @returns Tolerance radius in degrees
 */
export function getClickTolerance(country: Country): number {
  // Base tolerance
  let tolerance = 1;

  // Island nations and small countries get larger tolerance
  if (country.area && country.area < 100000) {
    tolerance = 3;
  } else if (country.area && country.area < 1000000) {
    tolerance = 2;
  }

  return tolerance;
}

/**
 * Convert screen coordinates to geographic coordinates
 * Requires SVG transform context
 * @param screenX - X coordinate on screen
 * @param screenY - Y coordinate on screen
 * @param svgElement - SVG element with transform
 * @returns [longitude, latitude] or null
 */
export function screenToGeo(
  screenX: number,
  screenY: number,
  svgElement: SVGSVGElement | null
): [number, number] | null {
  if (!svgElement) return null;

  try {
    const pt = svgElement.createSVGPoint();
    pt.x = screenX;
    pt.y = screenY;

    const screenCTM = svgElement.getScreenCTM();
    if (!screenCTM) return null;

    const cursorpt = pt.matrixTransform(screenCTM.inverse());

    // Map from SVG coordinates to geographic coordinates
    // SVG viewport is typically [-180, -85] to [180, 85]
    const width = 960; // Default SVG width in react-simple-maps
    const height = 600; // Default SVG height
    const minX = -180;
    const maxX = 180;
    const minY = -85;
    const maxY = 85;

    const lon = minX + (cursorpt.x / width) * (maxX - minX);
    const lat = maxY - (cursorpt.y / height) * (maxY - minY);

    return [lon, lat];
  } catch (e) {
    console.error('Error converting screen to geo coordinates:', e);
    return null;
  }
}

/**
 * Smooth animation between two view states
 * @param startState - Starting view state
 * @param endState - Ending view state
 * @param duration - Duration in ms
 * @param onUpdate - Called with intermediate states
 */
export function animateViewState(
  startState: ViewState,
  endState: ViewState,
  duration: number = 800,
  onUpdate: (state: ViewState) => void
): () => void {
  const startTime = Date.now();
  let animationId: number;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-in-out-cubic)
    const eased =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const currentCenter: [number, number] = [
      startState.center[0] +
        (endState.center[0] - startState.center[0]) * eased,
      startState.center[1] +
        (endState.center[1] - startState.center[1]) * eased,
    ];

    const currentZoom =
      startState.zoom + (endState.zoom - startState.zoom) * eased;

    onUpdate({
      center: currentCenter,
      zoom: currentZoom,
    });

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    }
  };

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => cancelAnimationFrame(animationId);
}

/**
 * Get all countries in a specific region
 * @param countries - Array of all countries
 * @param region - Region to filter by
 * @returns Filtered countries array
 */
export function getCountriesByRegion(
  countries: Country[],
  region: Region
): Country[] {
  return countries.filter((c) => c.region === region);
}

/**
 * Group countries by continent for advanced filtering
 * @param countries - Array of countries
 * @returns Grouped by continent
 */
export function groupByContinent(
  countries: Country[]
): Record<string, Country[]> {
  return countries.reduce(
    (acc, country) => {
      const continent = country.region || 'Unknown';
      if (!acc[continent]) {
        acc[continent] = [];
      }
      acc[continent].push(country);
      return acc;
    },
    {} as Record<string, Country[]>
  );
}

/**
 * Calculate bounds for an array of countries
 * Useful for auto-fitting map to selection
 * @param countries - Countries to calculate bounds for
 * @returns MapBounds
 */
export function calculateBounds(countries: Country[]): MapBounds {
  if (countries.length === 0) {
    return REGION_BOUNDS.World;
  }

  let minX = 180;
  let maxX = -180;
  let minY = 85;
  let maxY = -85;

  countries.forEach((country) => {
    if (country.bounds) {
      minX = Math.min(minX, country.bounds.x[0]);
      maxX = Math.max(maxX, country.bounds.x[1]);
      minY = Math.min(minY, country.bounds.y[0]);
      maxY = Math.max(maxY, country.bounds.y[1]);
    }
  });

  // Add 5 degree padding
  const padding = 5;
  return {
    x: [minX - padding, maxX + padding],
    y: [minY - padding, maxY + padding],
  };
}
