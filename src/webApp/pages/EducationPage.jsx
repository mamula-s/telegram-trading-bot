import React, { useState, useEffect } from 'react';
import { Book, Video, File, Clock, Lock, PlayCircle, Download } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const EducationPage = () => {
  const { addNotification } = useNotification();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Всі матеріали' },
    { id: 'basics', name: 'Основи трейдингу' },
    { id: 'technical', name: 'Технічний аналіз' },
    { id: 'fundamental', name: 'Фундаментальний аналіз' },
    { id: 'psychology', name: 'Психологія трейдингу' }
  ];

  useEffect(() => {
    loadMaterials();
  }, [activeCategory]);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/educational-materials?category=${activeCategory}`);
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error loading materials:', error);
      addNotification('error', 'Помилка завантаження матеріалів');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'pdf':
        return <File className="w-6 h-6" />;
      case 'course':
        return <Book className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Навчальні матеріали</h1>
        <p className="opacity-90">
          Вивчайте трейдинг з нашою добіркою навчальних матеріалів
        </p>
      </div>

      {/* Search and Categories */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Пошук матеріалів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto py-2 -mx-4 px-4 space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Завантаження матеріалів...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchQuery 
                ? 'Матеріалів за вашим запитом не знайдено' 
                : 'У цій категорії поки немає матеріалів'}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      material.type === 'video' 
                        ? 'bg-red-100 text-red-600'
                        : material.type === 'pdf'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {getIcon(material.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{material.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {material.description}
                      </p>
                    </div>
                  </div>
                  {material.premium && (
                    <div className="ml-4">
                      <Lock className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{material.duration}</span>
                  </div>
                  
                  {material.type === 'video' ? (
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <PlayCircle className="w-4 h-4" />
                      <span>Дивитися</span>
                    </button>
                  ) : (
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                      <span>Завантажити</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationPage;