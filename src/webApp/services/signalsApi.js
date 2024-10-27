const BASE_URL = process.env.BASE_URL || '';

export const fetchFuturesStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/futures/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching futures stats:', error);
    throw error;
  }
};

export const fetchFuturesSignals = async (params = {}) => {
  const queryParams = new URLSearchParams({
    status: params.status || 'all',
    sort: params.sort || 'newest',
    pair: params.pair || '',
    page: params.page || 1,
    limit: params.limit || 10
  }).toString();

  try {
    const response = await fetch(`${BASE_URL}/api/futures/signals?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch signals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching futures signals:', error);
    throw error;
  }
};

export const joinSignal = async (signalId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/futures/signals/${signalId}/join`, {
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