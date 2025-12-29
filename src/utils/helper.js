export const getBrowserFingerprint = () => {
  const { userAgent, language, pixelDepth, colorDepth } = navigator;
  const { width, height } = screen;
  const timezoneOffset = new Date().getTimezoneOffset();
  const data = `${userAgent}-${language}-${width}x${height}-${pixelDepth}-${colorDepth}-${timezoneOffset}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(16);
};

// I extracted this from your RecruiterCard component so it can be reused
export const formatDate = (seconds) => {
  if (!seconds) return 'Recently';
  return new Date(seconds * 1000).toLocaleDateString();
};