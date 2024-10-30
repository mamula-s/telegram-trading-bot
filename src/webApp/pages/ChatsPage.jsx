import React from 'react';
import { MessageCircle, Users, Bell, ExternalLink, Shield } from 'lucide-react';
import Card from '../components/Card';
import { useTelegram } from '../hooks/useTelegram';
import { useApi } from '../contexts/ApiContext';
import { useNotification } from '../contexts/NotificationContext';

const ChatsPage = () => {
  const { openLink } = useTelegram();
  const { isLoading } = useApi();
  const { addNotification } = useNotification();

  const chats = [
    {
      id: 1,
      type: 'channel',
      name: 'Trading Signals VIP',
      description: 'Основний канал з сигналами',
      members: 5200,
      isPrivate: true,
      link: 'https://t.me/+abc123'
    },
    {
      id: 2,
      type: 'group',
      name: 'Trading Chat',
      description: 'Обговорення сигналів та стратегій',
      members: 3100,
      isPrivate: false,
      link: 'https://t.me/tradingchat'
    },
    {
      id: 3,
      type: 'channel',
      name: 'Crypto News',
      description: 'Новини криптовалют та ринку',
      members: 4800,
      isPrivate: false,
      link: 'https://t.me/cryptonews'
    }
  ];

  const handleJoinChat = (chat) => {
    try {
      if (chat.isPrivate) {
        addNotification('info', 'Перевіряємо підписку...');
        // Тут можна додати перевірку підписки через API
        setTimeout(() => {
          openLink(chat.link);
        }, 500);
      } else {
        openLink(chat.link);
      }
    } catch (error) {
      console.error('Error joining chat:', error);
      addNotification('error', 'Помилка при спробі приєднатися до чату');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Наші чати</h1>
        </div>
        <p className="opacity-90">
          Приєднуйтесь до нашої спільноти трейдерів
        </p>
      </div>

      {/* Chats List */}
      <div className="space-y-4">
        {chats.map(chat => (
          <Card 
            key={chat.id}
            className="hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                chat.type === 'channel' 
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                {chat.type === 'channel' ? <Bell className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {chat.name}
                      {chat.isPrivate && (
                        <Shield className="w-4 h-4 text-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {chat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{chat.members.toLocaleString()} учасників</span>
                  </div>

                  <button
                    onClick={() => handleJoinChat(chat)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Приєднатися</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-yellow-50 border border-yellow-100">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium">Важлива інформація:</p>
            <ul className="mt-2 space-y-1">
              <li>• VIP чати доступні тільки для користувачів з активною підпискою</li>
              <li>• Дотримуйтесь правил спільноти</li>
              <li>• Остерігайтеся шахраїв та фейкових груп</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatsPage;