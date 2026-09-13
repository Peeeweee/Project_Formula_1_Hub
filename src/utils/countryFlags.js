// Shared country → flag emoji mapping used across LiveSeason and Circuits
export const COUNTRY_FLAGS = {
  'Australia': '🇦🇺', 'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Japan': '🇯🇵',
  'China': '🇨🇳', 'Monaco': '🇲🇨', 'Canada': '🇨🇦', 'Spain': '🇪🇸',
  'Austria': '🇦🇹', 'UK': '🇬🇧', 'Great Britain': '🇬🇧', 'Hungary': '🇭🇺',
  'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬', 'USA': '🇺🇸', 'United States': '🇺🇸', 'Mexico': '🇲🇽',
  'Brazil': '🇧🇷', 'Qatar': '🇶🇦', 'Abu Dhabi': '🇦🇪', 'UAE': '🇦🇪',
  'Las Vegas': '🇺🇸', 'Miami': '🇺🇸', 'Portugal': '🇵🇹', 'Turkey': '🇹🇷',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Russia': '🇷🇺', 'South Korea': '🇰🇷',
  'India': '🇮🇳', 'Malaysia': '🇲🇾',
};

/**
 * Returns a flag emoji for a given country name, or 🏁 as fallback.
 * @param {string} countryName
 * @returns {string}
 */
export const getFlagEmoji = (countryName) => {
  if (!countryName) return '🏁';
  return COUNTRY_FLAGS[countryName.trim()] || '🏁';
};
