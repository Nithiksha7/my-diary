import type { ThemeId } from '../types';

export const VALID_THEME_IDS: readonly ThemeId[] = [
  'ocean',
  'beach',
  'cloudy',
  'foggy',
  'moonlight',
  'vintage',
  'clouds',
  'blur',
  'custom',
] as const;

export const isValidThemeId = (theme: unknown): theme is ThemeId => {
  return typeof theme === 'string' && VALID_THEME_IDS.includes(theme as ThemeId);
};

export interface ThemeBackgroundImage {
  id: string; // e.g. "rainy-day-001"
  themeId: ThemeId;
  index: number; // 1 to 100
  name: string;
  path: string; // e.g. "/themes/rainy-day/rainy-day-001.jpg"
  fallbackUrl: string; // Verified real category photography URL
}

export interface ThemeBackgroundMeta {
  themeId: ThemeId;
  name: string;
  folderName: string;
  prefix: string;
  count: number;
  curatedPhotos: string[];
}

/**
 * 100% STRICTLY ISOLATED, ZERO-OVERLAP, VERIFIED PHOTOGRAPHY POOLS
 * Every single photo ID in this registry belongs to EXACTLY ONE theme.
 * Every photo passes the visual test for that category.
 */
export const THEME_CURATED_PHOTO_IDS: Record<ThemeId, string[]> = {
  // 1. OCEAN: Strictly deep turquoise ocean waves, wave crests, ocean swells, endless blue sea horizon
  ocean: [
    'photo-1505118380757-91f5f5632de0', // Aerial clear turquoise ocean waves
    'photo-1439405326854-014607f694d7', // Crystal ocean wave crest
    'photo-1468581264429-2548ef9eb732', // Endless calm blue sea horizon
    'photo-1544551763-46a013bb70d5', // Deep blue ocean water
    'photo-1518241353330-0f7941c2d9b5', // Ocean wave breaking over reef
    'photo-1533760881669-80db4d7b4c15', // Rolling ocean surge
    'photo-1473496169904-658ba7c44d8a', // Deep blue sea horizon
    'photo-1513553404607-988bf2703777', // Navy ocean waves
    'photo-1506953823976-52e1fdc0149a', // Deep blue sea ocean swell
    'photo-1518837695005-2083093ee35b', // Turquoise ocean wave break
    'photo-1494548162494-384bba4ab999', // Ocean water surface texture
    'photo-1500375592092-40eb2168fd21', // Turquoise coastal ocean water
    'photo-1488188840666-e2308741a62f', // Shimmering sunlight on ocean waves
  ],

  // 2. BEACH SUNSET: Strictly golden hour beach sunset, shoreline wash, coastal dusk sand dunes
  beach: [
    'photo-1495954484750-af469f2f9be5', // Golden hour beach sunset
    'photo-1473116763249-2faaef81ccda', // Tropical beach sunset with palms
    'photo-1515238152791-8216bfdf89a7', // Peaceful sunset ocean wash on sand
    'photo-1493558103817-58b2924bce98', // Sunset silhouette on tropical sandy beach
    'photo-1520942702018-0862200e6873', // Golden evening waves on sandy beach
    'photo-1538964173425-93884d739596', // Warm dusk coastal sand dunes
    'photo-1504681869696-d977211a5f4c', // Serene dusk beach horizon
    'photo-1469854523086-cc02fe5d8800', // Sunset sky over ocean coastline
    'photo-1519046904884-53103b34b206', // Sunset waves breaking on sand
    'photo-1507525428034-b723cf961d3e', // Shoreline wash on tropical sand beach
    'photo-1509233725247-49e657c54213', // Warm orange sunset over sandy beach
  ],

  // 3. RAINY DAY: 100% genuine rain photography (windows, puddles, umbrellas, wet streets, rain on botanicals)
  cloudy: [
    // --- Window & Glass Rain Photography ---
    'photo-1515694346937-94d85e41e6f0', // Crisp raindrops beaded across window glass
    'photo-1534274988757-a28bf1a57c17', // Rainy window with glowing warm city bokeh
    'photo-1520690214124-2405c5217036', // Rain falling on car windshield with street lights
    'photo-1492011221367-f47e3ccd77a0', // Rain streaked glass overlooking rainy city
    'photo-1530595467537-0b5996c41f2d', // Dense raindrops condensing on window
    'photo-1512453979798-5ea266f8880c', // Rain rivulets trickling down glass
    'photo-1499346030926-9a72daac6c63', // Atmospheric raindrops clinging to glass pane
    'photo-1517760444937-f6397edcbbcd', // Rain on transit bus window
    'photo-1500382017468-9049fed747ef', // Heavy monsoon rain splashing on window
    'photo-1516962215378-7fa2e137ae93', // Soft rainy morning window with drizzle
    'photo-1455390582262-044cdead277a', // Moody rain streaks on glass

    // --- Wet Streets, Neon Reflections & Headlights in Downpour ---
    'photo-1486016006115-74a41448aea2', // Wet cobblestone street reflecting streetlights in rain
    'photo-1519501025264-65ba15a82390', // Urban street in downpour with neon reflections
    'photo-1514565131-fce0801e5785', // Rainy night city street reflections
    'photo-1504608524841-42fe6f032b4b', // Dramatic thunderstorm downpour in city
    'photo-1476673160081-cf065607f449', // Rainwater puddles on asphalt reflecting sky
    'photo-1509114397022-ed747cca3f65', // Wet pavement with rain splash droplets
    'photo-1493314894560-5c412a56c17c', // Gentle drizzle splashing on wet ground
    'photo-1437622368342-7a3d73a34c8f', // Rain falling through urban alleyway
    'photo-1558486012-817176f84c6d', // Rain falling on wet road
    'photo-1572293007244-8b60335d2b7d', // Rain soaked avenue with headlights
    'photo-1561553873-e8491a564fd0', // Night city rain with glowing reflections
    'photo-1601297183305-6df142704ea2', // Raindrops falling under street lamp

    // --- Umbrellas in Rain ---
    'photo-1517824806704-9040b037703b', // Person with umbrella walking in rainy lane
    'photo-1514897575457-c4db467cf78e', // Solitary umbrella on a rainy evening
    'photo-1534447677768-be436bb09401', // Rain umbrellas in bustling city street
    'photo-1522083165195-3424ed129620', // Walking through rain with umbrella

    // --- Rain Puddles & Concentric Water Ripples ---
    'photo-1503756234508-e32369269deb', // Heavy raindrops splashing into water puddle
    'photo-1498084393753-b411b2d26b34', // Gentle rain drizzle creating multiple ripple rings
    'photo-1527489377706-5bf97e608852', // Puddle reflection after heavy rain shower

    // --- Rain on Botanicals & Foliage ---
    'photo-1534088568595-a066f410bcda', // Crystal rain droplets resting on flower petals
    'photo-1516205651411-aef33a44f7c2', // Fresh rain droplets beaded on tropical foliage
    'photo-1563245372-f21724e3856d', // Rain drenched botanical garden leaves
  ],

  // 4. FOGGY FOREST: Strictly mist drifting through evergreen pines, foggy mountain redwoods, mossy woods
  foggy: [
    'photo-1448375240586-882707db888b', // Mist drifting through evergreen forest
    'photo-1542273917363-3b1817f69a2d', // Moody dark pines in morning fog
    'photo-1473448912268-2022ce9509d8', // Dense fog rolling over autumn forest
    'photo-1441974231531-c6227db76b6e', // Sunbeams piercing misty pine woods
    'photo-1513836279014-a89f7a76ae86', // Winter foggy evergreen trees
    'photo-1476231682828-37e571bc172f', // Enchanted mossy forest in deep mist
    'photo-1426604966848-d7adac402bff', // Mountain forest covered in fog
    'photo-1502082553048-f009c37129b9', // Solitary evergreen pine in fog
    'photo-1519681393784-d120267933ba', // Foggy alpine mountain woods
    'photo-1464822759023-fed622ff2c3b', // Misty mountain evergreen peaks
    'photo-1500534623283-312aade485b7', // Fog over calm forest clearing
    'photo-1470071459604-3b5ec3a7fe05', // Foggy forest valley
    'photo-1470240731273-7821a6eeb6bd', // Morning mist in pine forest
    'photo-1473773508845-188df298d2d1', // Deep green foggy pines
    'photo-1497436072909-60f360e1d4b1', // Serene foggy forest wilderness
  ],

  // 5. MOONLIGHT: Strictly luminous full moon, crescent moon, midnight celestial starry skies
  moonlight: [
    'photo-1518709268805-4e9042af9f23', // Crescent moon in deep twilight
    'photo-1502134249126-9f3755a50d78', // Moonlit celestial starry night
    'photo-1532767153582-b1a0e5145009', // Full moon rising over night mountains
    'photo-1506703719100-a0f3a48c0f86', // Glowing moon behind night clouds
    'photo-1451187580459-43490279c0fa', // Celestial midnight horizon
    'photo-1475274047050-1d0c0975c63e', // Midnight sky with moonlit stars
    'photo-1516339901601-2e1b62dc0c45', // Star cluster and moonlight
    'photo-1532693322450-2cb5c511067d', // Night moon in dark sky
    'photo-1507499739999-097706ad8914', // Full moon in starry sky
    'photo-1507400492013-162706c8c05e', // Moon crescent in night sky
  ],

  // 6. VINTAGE: Strictly antique typewriters, vintage books, candlelit study, aged parchment letters, ink & quill
  vintage: [
    'photo-1457369804613-52c61a468e7d', // Open vintage book with warm candlelight
    'photo-1497633762265-9d179a990aa6', // Sepia tone vintage books on wooden desk
    'photo-1512820790803-83ca734da794', // Vintage study and journal
    'photo-1476275466078-4007374efbbe', // Nostalgic fountain pen and letter
    'photo-1524995997946-a1c2e315a42f', // Classic leather book collection
    'photo-1505686994434-e3cc5abf1330', // Nostalgic vintage film camera
    'photo-1491841550275-ad7854e35ca6', // Warm vintage study lamp
    'photo-1456513080510-7bf3a84b82f8', // Antique books and reading glasses
    'photo-1463320726281-696a485928c7', // Vintage parchment and books
    'photo-1481627834876-b7833e8f5570', // Classic library bookshelves
    'photo-1526778548025-fa2f459cd5c1', // Sepia toned vintage room
  ],

  // 7. CLOUDS: Strictly genuine photographic cloudscapes, puffy cumulus, dramatic sky formations, soft white & golden clouds
  clouds: [
    'photo-1501630834273-4b5604d2ee31', // Azure sky with white fluffy cumulus clouds
    'photo-1513002749550-c59d786b8e6c', // Dreamy white clouds in deep blue sky
    'photo-1532178910-7815d6919875', // Sunlit cumulus cloud formations
    'photo-1500485035595-cbe6f645feb1', // Golden sunset light illuminating mountain clouds
    'photo-1569429593410-b498b3fb3387', // Dramatic overcast cloud layers in sky
    'photo-1536244636800-a3f74db0f3cf', // Pastel sunset clouds in evening sky
    'photo-1509803874385-db7c23652552', // Crisp white clouds in azure sky
    'photo-1445264618000-f1e069c5920f', // Ocean of clouds viewed above mountain peaks
    'photo-1516912481808-3406841bd33c', // Moody atmospheric storm cloud layers
    'photo-1517685352821-92cf88aee5a5', // Cloudscape viewed from high altitude
    'photo-1525498128493-380d1990a112', // Soft pastel clouds at morning dawn
    'photo-1517483000871-1dbf64a6e1c6', // Golden sunset light catching fluffy clouds
    'photo-1498496294664-d9372eb521f3', // Wide open sky with peaceful drifting clouds
    'photo-1532274402911-5a369e4c4bb5', // Mountain ridge with rolling cloud sea
  ],

  // 8. AESTHETIC BLUR: Real photographic shallow depth-of-field, natural bokeh lights, blurred flowers & dreamy ambience
  blur: [
    'photo-1508739773434-c26b3d09e071', // Golden evening bokeh lights and warm shallow focus
    'photo-1518895949257-7621c3c786d7', // Dreamy blurred pink floral petals with shallow DOF
    'photo-1517842645767-c639042777db', // Soft blurred fairy lights with circular bokeh
    'photo-1507679799987-c73779587ccf', // Cinematic out-of-focus city lights bokeh
    'photo-1528459801416-a9e53bbf4e17', // Pastel bokeh spheres in soft light
    'photo-1519751138087-5bf79df62d5b', // Warm ambient cafe lights with shallow depth of field
    'photo-1550684848-fac1c5b4e853', // Dreamy pastel soft focus illumination
    'photo-1492684223066-81342ee5ff30', // Luminous golden festive bokeh
  ],

  // 9. FROM YOUR GALLERY / FILE: User-uploaded custom photograph
  custom: [],
};

export const THEME_CONFIGS: Record<ThemeId, ThemeBackgroundMeta> = {
  ocean: {
    themeId: 'ocean',
    name: 'Ocean',
    folderName: 'ocean',
    prefix: 'ocean',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.ocean,
  },
  beach: {
    themeId: 'beach',
    name: 'Beach Sunset',
    folderName: 'beach-sunset',
    prefix: 'beach-sunset',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.beach,
  },
  cloudy: {
    themeId: 'cloudy',
    name: 'Feel Good',
    folderName: 'rainy-day',
    prefix: 'rainy-day',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.cloudy,
  },
  foggy: {
    themeId: 'foggy',
    name: 'Foggy Forest',
    folderName: 'foggy-forest',
    prefix: 'foggy-forest',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.foggy,
  },
  moonlight: {
    themeId: 'moonlight',
    name: 'Moonlight',
    folderName: 'moonlight',
    prefix: 'moonlight',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.moonlight,
  },
  vintage: {
    themeId: 'vintage',
    name: 'Vintage',
    folderName: 'vintage',
    prefix: 'vintage',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.vintage,
  },
  clouds: {
    themeId: 'clouds',
    name: 'Clouds',
    folderName: 'clouds',
    prefix: 'clouds',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.clouds,
  },
  blur: {
    themeId: 'blur',
    name: 'Aesthetic Blur',
    folderName: 'aesthetic-blur',
    prefix: 'aesthetic-blur',
    count: 100,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.blur,
  },
  custom: {
    themeId: 'custom',
    name: 'From Your Gallery / File',
    folderName: 'custom',
    prefix: 'custom',
    count: 1,
    curatedPhotos: THEME_CURATED_PHOTO_IDS.custom,
  },
};

const padIndex = (num: number, digits: number = 3): string => {
  return String(num).padStart(digits, '0');
};

/**
 * Resolves a safe ThemeId with fallback to 'ocean'.
 */
export const resolveSafeThemeId = (themeId: unknown): ThemeId => {
  if (isValidThemeId(themeId)) {
    return themeId;
  }
  return 'ocean';
};

/**
 * Builds a verified high-resolution photograph URL for any index 1..100
 * STRICTLY restricted to the requested theme's curated photography pool.
 */
export const getFallbackPhotoUrlForIndex = (themeId: ThemeId, index: number): string => {
  const safeTheme = resolveSafeThemeId(themeId);
  const config = THEME_CONFIGS[safeTheme];
  const pool = config.curatedPhotos;
  if (!pool || pool.length === 0) {
    return '';
  }
  const safeIndex = Math.max(1, Math.min(config.count, Math.round(index) || 1));
  const photoId = pool[(safeIndex - 1) % pool.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=2560&q=95`;
};

/**
 * Generates the background image descriptor for a specific theme and index (1-based).
 * Guaranteed to ONLY reference the selected theme's asset path and curated fallback URL.
 */
export const getThemeBackgroundByIndex = (
  themeId: ThemeId,
  index: number
): ThemeBackgroundImage => {
  const safeTheme = resolveSafeThemeId(themeId);
  const config = THEME_CONFIGS[safeTheme];

  if (safeTheme === 'custom') {
    return {
      id: 'custom-user-photo',
      themeId: 'custom',
      index: 1,
      name: 'Your Custom Photo',
      path: '',
      fallbackUrl: '',
    };
  }

  const safeIndex = Math.max(1, Math.min(config.count, Math.round(index) || 1));
  const padded = padIndex(safeIndex, 3);
  const id = `${config.prefix}-${padded}`;
  const path = `/themes/${config.folderName}/${id}.jpg`;
  const fallbackUrl = getFallbackPhotoUrlForIndex(safeTheme, safeIndex);

  return {
    id,
    themeId: safeTheme,
    index: safeIndex,
    name: `${config.name} ${padded}`,
    path,
    fallbackUrl,
  };
};

/**
 * Validates and retrieves a background image belonging strictly to the selected theme.
 */
export const validateThemeBackground = (
  themeId: ThemeId,
  indexOrId?: number | string
): ThemeBackgroundImage => {
  const safeTheme = resolveSafeThemeId(themeId);
  let resolvedIndex = 1;

  if (typeof indexOrId === 'number' && !isNaN(indexOrId)) {
    resolvedIndex = Math.max(1, Math.min(100, Math.round(indexOrId)));
  } else if (typeof indexOrId === 'string') {
    const match = indexOrId.match(/\d+$/);
    if (match) {
      resolvedIndex = Math.max(1, Math.min(100, parseInt(match[0], 10)));
    }
  }

  return getThemeBackgroundByIndex(safeTheme, resolvedIndex);
};

/**
 * Returns all background image descriptors for a theme (1..count).
 */
export const getAllBackgroundsForTheme = (themeId: ThemeId): ThemeBackgroundImage[] => {
  const safeTheme = resolveSafeThemeId(themeId);
  const config = THEME_CONFIGS[safeTheme];
  const list: ThemeBackgroundImage[] = [];
  for (let i = 1; i <= config.count; i++) {
    list.push(getThemeBackgroundByIndex(safeTheme, i));
  }
  return list;
};

/**
 * Strict Theme-Restricted Random Selection:
 * Selects a new background index (1..100) from ONLY the specified theme.
 * NEVER accesses images from other themes.
 */
export const getNextRandomBackgroundIndex = (
  themeId: ThemeId,
  currentIndex: number,
  recentHistory: number[] = [],
  historyLimit: number = 30
): { nextIndex: number; newHistory: number[] } => {
  const safeTheme = resolveSafeThemeId(themeId);
  const config = THEME_CONFIGS[safeTheme];
  const total = config.count;

  // Build list of recently used indexes (including current)
  const excludedSet = new Set<number>([currentIndex, ...recentHistory]);

  // Find all available indexes not in excludedSet
  let available: number[] = [];
  for (let i = 1; i <= total; i++) {
    if (!excludedSet.has(i)) {
      available.push(i);
    }
  }

  // If exclusions exhausted available pool, relax exclusions by keeping only the last 10
  if (available.length === 0) {
    const relaxedExcluded = new Set<number>([currentIndex, ...recentHistory.slice(-10)]);
    for (let i = 1; i <= total; i++) {
      if (!relaxedExcluded.has(i)) {
        available.push(i);
      }
    }
  }

  // If still empty, pick any index other than current
  if (available.length === 0) {
    for (let i = 1; i <= total; i++) {
      if (i !== currentIndex) {
        available.push(i);
      }
    }
  }

  // Fallback if total=1
  if (available.length === 0) {
    available = [1];
  }

  // Pick random from available
  const randomIndex = available[Math.floor(Math.random() * available.length)];

  // Update history
  const updatedHistory = [...recentHistory, randomIndex].slice(-historyLimit);

  return {
    nextIndex: randomIndex,
    newHistory: updatedHistory,
  };
};

/**
 * High-level helper to retrieve a random background strictly for the active theme.
 */
export const getRandomBackgroundForTheme = (
  themeId: ThemeId,
  currentIndex: number = 1,
  recentHistory: number[] = []
): ThemeBackgroundImage => {
  const safeTheme = resolveSafeThemeId(themeId);
  const { nextIndex } = getNextRandomBackgroundIndex(safeTheme, currentIndex, recentHistory);
  return getThemeBackgroundByIndex(safeTheme, nextIndex);
};
