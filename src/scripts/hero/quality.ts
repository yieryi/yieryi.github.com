export interface HeroQuality {
  isMobile: boolean;
  dpr: number;
  antialias: boolean;
  terrainSegments: number;
  birdCount: number;
  starCount: number;
  cameraDistance: number;
  fov: number;
}

export function getHeroQuality(): HeroQuality {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const deviceDpr = window.devicePixelRatio || 1;

  if (isMobile) {
    return {
      isMobile: true,
      dpr: Math.min(deviceDpr, 1.25),
      antialias: false,
      terrainSegments: 84,
      birdCount: 0,
      starCount: 160,
      cameraDistance: 16.5,
      fov: 48,
    };
  }

  return {
    isMobile: false,
    dpr: Math.min(deviceDpr, 1.5),
    antialias: true,
    terrainSegments: 140,
    birdCount: 16,
    starCount: 320,
    cameraDistance: 14,
    fov: 44,
  };
}