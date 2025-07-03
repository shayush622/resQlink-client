export async function geocodeLocation(locationName: string): Promise<{ lat: number, lng: number } | null> {
  const apiKey = process.env.OPENCAGE_API_KEY;

  if (!apiKey) {
    console.error("Missing OPENCAGE_API_KEY in env");
    return null;
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationName)}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    }

    console.warn("No geocoding results for:", locationName);
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}
