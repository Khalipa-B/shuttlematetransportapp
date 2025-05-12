import { addMinutes, format } from 'date-fns';

// Weather conditions and their impact on travel time (in percentage)
export const WEATHER_IMPACT = {
  'clear': 0,           // Clear sky - no impact
  'clouds': 5,          // Cloudy - minor impact
  'mist': 10,           // Mist/Fog - moderate impact
  'rain': 15,           // Rain - significant impact
  'drizzle': 10,        // Drizzle - moderate impact
  'thunderstorm': 25,   // Thunderstorm - major impact
  'snow': 30,           // Snow - severe impact
  'sleet': 20,          // Sleet - significant impact
  'haze': 10,           // Haze - moderate impact
  'dust': 15,           // Dust - significant impact
  'fog': 15,            // Fog - significant impact
  'sand': 20,           // Sand - severe impact
  'ash': 25,            // Ash - severe impact
  'squall': 20,         // Squall - significant impact
  'tornado': 50,        // Tornado - extreme impact (rare)
};

// Weather severity levels
export const WEATHER_SEVERITY = {
  0: 'minimal',
  5: 'minimal',
  10: 'moderate',
  15: 'significant',
  20: 'significant',
  25: 'severe',
  30: 'severe',
  50: 'extreme'
};

// Temperature impact (in percentage)
export const TEMPERATURE_IMPACT = {
  'freezing': 15,      // Below 0°C
  'cold': 5,           // 0-10°C
  'cool': 0,           // 10-18°C
  'mild': 0,           // 18-25°C
  'warm': 5,           // 25-32°C
  'hot': 10            // Above 32°C
};

interface WeatherData {
  main: {
    temp: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  visibility: number;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY || '';
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

export function getWeatherConditionFromData(weatherData: WeatherData): string {
  // Get the primary weather condition
  const condition = weatherData.weather[0].main.toLowerCase();
  
  // Map the OpenWeatherMap condition to our internal conditions
  const mappedConditions: {[key: string]: string} = {
    'clear': 'clear',
    'clouds': 'clouds',
    'mist': 'mist',
    'rain': 'rain',
    'drizzle': 'drizzle',
    'thunderstorm': 'thunderstorm',
    'snow': 'snow',
    'haze': 'haze',
    'dust': 'dust',
    'fog': 'fog',
    'sand': 'sand',
    'ash': 'ash',
    'squall': 'squall',
    'tornado': 'tornado'
  };
  
  return mappedConditions[condition] || 'clear';
}

export function getTemperatureCategory(temp: number): string {
  if (temp < 0) return 'freezing';
  if (temp < 10) return 'cold';
  if (temp < 18) return 'cool';
  if (temp < 25) return 'mild';
  if (temp < 32) return 'warm';
  return 'hot';
}

export function getWindImpact(windSpeed: number): number {
  // Wind speed in m/s
  if (windSpeed < 5) return 0;       // Light breeze
  if (windSpeed < 10) return 5;      // Moderate breeze
  if (windSpeed < 15) return 10;     // Strong breeze
  if (windSpeed < 20) return 15;     // High wind
  return 20;                         // Gale or stronger
}

export function getVisibilityImpact(visibility: number): number {
  // Visibility in meters
  if (visibility >= 10000) return 0;     // Clear visibility
  if (visibility >= 5000) return 5;      // Good visibility
  if (visibility >= 2000) return 10;     // Moderate visibility
  if (visibility >= 1000) return 15;     // Poor visibility
  return 25;                             // Very poor visibility
}

export function calculateArrivalDelay(
  baseTime: number, 
  weatherData: WeatherData | null
): { 
  delayMinutes: number, 
  factors: { name: string, impact: number }[], 
  totalImpactPercent: number 
} {
  // Default return for no weather data
  if (!weatherData) {
    return { 
      delayMinutes: 0, 
      factors: [{ name: 'No weather data', impact: 0 }],
      totalImpactPercent: 0
    };
  }

  const factors: { name: string, impact: number }[] = [];
  
  // Weather condition impact
  const weatherCondition = getWeatherConditionFromData(weatherData);
  const weatherImpact = WEATHER_IMPACT[weatherCondition as keyof typeof WEATHER_IMPACT] || 0;
  if (weatherImpact > 0) {
    factors.push({ name: `Weather: ${weatherCondition}`, impact: weatherImpact });
  }
  
  // Temperature impact
  const tempCategory = getTemperatureCategory(weatherData.main.temp);
  const tempImpact = TEMPERATURE_IMPACT[tempCategory as keyof typeof TEMPERATURE_IMPACT] || 0;
  if (tempImpact > 0) {
    factors.push({ name: `Temperature: ${tempCategory} (${Math.round(weatherData.main.temp)}°C)`, impact: tempImpact });
  }
  
  // Wind impact
  const windImpact = getWindImpact(weatherData.wind.speed);
  if (windImpact > 0) {
    factors.push({ name: `Wind: ${Math.round(weatherData.wind.speed)} m/s`, impact: windImpact });
  }
  
  // Visibility impact
  const visibilityImpact = getVisibilityImpact(weatherData.visibility);
  if (visibilityImpact > 0) {
    factors.push({ name: `Visibility: ${weatherData.visibility}m`, impact: visibilityImpact });
  }
  
  // Calculate total impact percentage
  const totalImpactPercent = factors.reduce((sum, factor) => sum + factor.impact, 0);
  
  // Calculate delay in minutes
  const delayMinutes = Math.round((baseTime * totalImpactPercent) / 100);
  
  return { delayMinutes, factors, totalImpactPercent };
}

export function calculateEstimatedArrival(
  baseArrivalTime: Date,
  delayMinutes: number
): string {
  // Add delay to the base arrival time
  const estimatedArrival = addMinutes(baseArrivalTime, delayMinutes);
  
  // Format the time
  return format(estimatedArrival, 'h:mm a');
}

export function getWeatherSeverity(impactPercentage: number): string {
  // Find the closest severity level
  const levels = Object.keys(WEATHER_SEVERITY)
    .map(Number)
    .filter(level => level <= impactPercentage)
    .sort((a, b) => b - a);
  
  const closestLevel = levels[0] || 0;
  return WEATHER_SEVERITY[closestLevel as keyof typeof WEATHER_SEVERITY] || 'minimal';
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}