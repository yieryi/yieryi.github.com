export interface HeroPalette {
  skyTop: number;
  skyBottom: number;
  fog: number;
  sun: number;
  sunOpacity: number;
  hemiSky: number;
  hemiGround: number;
  light: number;
  lightIntensity: number;
  terrainLow: number;
  terrainMid: number;
  terrainHigh: number;
  terrainRock: number;
  terrainSnow: number;
  contour: number;
  contourOpacity: number;
  waterDeep: number;
  waterShallow: number;
  waterHighlight: number;
  bird: number;
  starOpacity: number;
}

export const heroPalettes: Record<'light' | 'dark', HeroPalette> = {
  light: {
    skyTop: 0x8fbfd8,
    skyBottom: 0xf2f6f8,
    fog: 0xe4edf3,
    sun: 0xfff3d6,
    sunOpacity: 0.85,
    hemiSky: 0xe7f2f8,
    hemiGround: 0x58706d,
    light: 0xfff4dd,
    lightIntensity: 2.6,
    terrainLow: 0x2f4a45,
    terrainMid: 0x5c706d,
    terrainHigh: 0xf7fdff,
    terrainRock: 0x46595d,
    terrainSnow: 0xf9fdff,
    contour: 0x0a6f63,
    contourOpacity: 0.23,
    waterDeep: 0x14556b,
    waterShallow: 0x3fb3b0,
    waterHighlight: 0xe7fffb,
    bird: 0x26363d,
    starOpacity: 0,
  },
  dark: {
    skyTop: 0x02050a,
    skyBottom: 0x0b1b2b,
    fog: 0x0b1724,
    sun: 0xd9fbff,
    sunOpacity: 0.7,
    hemiSky: 0x1a3440,
    hemiGround: 0x07100f,
    light: 0xc9fff4,
    lightIntensity: 2.2,
    terrainLow: 0x0a1e22,
    terrainMid: 0x1e3a40,
    terrainHigh: 0xd8f8f2,
    terrainRock: 0x2b4a50,
    terrainSnow: 0xe5fffc,
    contour: 0x8ff8e8,
    contourOpacity: 0.2,
    waterDeep: 0x073942,
    waterShallow: 0x2aa79f,
    waterHighlight: 0xb9fff4,
    bird: 0xc9eee7,
    starOpacity: 0.85,
  },
};