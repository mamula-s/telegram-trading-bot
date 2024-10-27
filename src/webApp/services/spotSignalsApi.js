const BASE_URL = process.env.BASE_URL || '';

export const fetchSpotStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/spot/stats`);
    if (!response.ok) throw new Error('Failed to fetch spot stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching spot stats:', error);
    throw error;
  }
};

export const fetchSpotSignals = async (params = {}) => {
  const queryParams = new URLSearchParams({
    status: params.status || 'all',
    sort: params.sort || 'newest',
    pair: params.pair || '',
    page: params.page || 1,
    limit: params.limit || 10,
    holdingPeriod: params.holdingPeriod || 'all',
    minVolume: params.minVolume || '',
    direction: params.direction || ''
  }).toString();

  try {
    const response = await fetch(`${BASE_URL}/api/spot/signals?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch signals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching spot signals:', error);
    throw error;
  }
};

export const fetchHoldings = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/spot/holdings`);
    if (!response.ok) throw new Error('Failed to fetch holdings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching holdings:', error);
    throw error;
  }
};

export const joinSpotSignal = async (signalId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/spot/signals/${signalId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to join signal');
    return await response.json();
  } catch (error) {
    console.error('Error joining signal:', error);
    throw error;
  }
};