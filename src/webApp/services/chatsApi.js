const BASE_URL = '/api/chats';

// Отримання списку чатів
export const fetchChats = async () => {
  const response = await fetch(`${BASE_URL}/list`);
  if (!response.ok) throw new Error('Failed to fetch chats');
  return await response.json();
};

// Отримання деталей чату
export const fetchChatDetails = async (chatId) => {
  const response = await fetch(`${BASE_URL}/${chatId}`);
  if (!response.ok) throw new Error('Failed to fetch chat details');
  return await response.json();
};

// Перевірка доступу до чату
export const checkChatAccess = async (chatId) => {
  const response = await fetch(`${BASE_URL}/${chatId}/access`);
  if (!response.ok) throw new Error('Failed to check access');
  return await response.json();
};