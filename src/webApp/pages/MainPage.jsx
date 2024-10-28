import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart2, BookOpen, Users } from 'lucide-react';

const MainPage = () => {
  const navigate = useNavigate();

  const menu = [
    {
      title: "Ф'ючерсні сигнали",
      description: "Торгові сигнали для ф'ючерсів",
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/futures',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Спотові сигнали',
      description: 'Торгові сигнали для споту',
      icon: <BarChart2 className="w-6 h-6" />,
      path: '/spot',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Навчальні матеріали',
      description: 'База знань по трейдингу',
      icon: <BookOpen className="w-6 h-6" />,
      path: '/education',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Реферальна програма',
      description: 'Запрошуйте друзів та отримуйте бонуси',
      icon: <Users className="w-6 h-6" />,
      path: '/referral',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Trading Bot</h1>
        <p className="text-gray-600 mt-2">Торгові сигнали та навчання</p>
      </div>

      {/* Menu */}
      <div className="grid gap-4">
        {menu.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left w-full"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <h2 className="font-medium">{item.title}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainPage;