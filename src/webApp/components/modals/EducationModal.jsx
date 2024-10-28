import React, { useState } from 'react';
import { 
  PlayCircle, 
  Book, 
  Clock, 
  Star, 
  Share2, 
  Download,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Lock,
  AlertCircle
} from 'lucide-react';
import Modal from '../Modal';
import { useNotification } from '../../contexts/NotificationContext';

const EducationModal = ({ 
  isOpen, 
  onClose, 
  material,
  onStartLearning,
  userSubscription = 'free' // 'free', 'basic', 'pro'
}) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const { addNotification } = useNotification();

  if (!material) return null;

  const handleStartLearning = () => {
    if (material.premium && userSubscription === 'free') {
      addNotification('warning', 'Цей матеріал доступний тільки для преміум підписників');
      return;
    }
    onStartLearning(material.id);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/education/${material.id}`);
      addNotification('success', 'Посилання скопійовано');
    } catch (error) {
      addNotification('error', 'Помилка при копіюванні посилання');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span>{material.title}</span>
          {material.premium && (
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm">
              <Lock className="w-4 h-4" />
              <span>Premium</span>
            </div>
          )}
        </div>
      }
      size="large"
    >
      <div className="divide-y">
        {/* Header Content */}
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600">{material.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{material.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{material.rating}</span>
                </div>
                {material.level && (
                  <span className={`
                    text-sm px-2 py-1 rounded-full
                    ${material.level === 'beginner' && 'bg-green-100 text-green-700'}
                    ${material.level === 'intermediate' && 'bg-blue-100 text-blue-700'}
                    ${material.level === 'advanced' && 'bg-purple-100 text-purple-700'}
                  `}>
                    {material.level === 'beginner' && 'Початківець'}
                    {material.level === 'intermediate' && 'Середній'}
                    {material.level === 'advanced' && 'Просунутий'}
                  </span>
                )}
                <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {material.type === 'video' ? '🎥 Відео' : '📄 Стаття'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={copyShareLink}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Поділитися"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              {material.type === 'pdf' && (
                <button 
                  onClick={() => onStartLearning(material.id, 'download')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Завантажити"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartLearning}
            className={`
              w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
              ${material.premium && userSubscription === 'free'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {material.premium && userSubscription === 'free' ? (
              <>
                <Lock className="w-5 h-5" />
                Доступно з Premium підпискою
              </>
            ) : material.type === 'video' ? (
              <>
                <PlayCircle className="w-5 h-5" />
                Почати перегляд
              </>
            ) : (
              <>
                <Book className="w-5 h-5" />
                Почати вивчення
              </>
            )}
          </button>
        </div>

        {/* Progress (if started) */}
        {material.progress && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Прогрес</span>
              <span className="text-sm font-medium">{material.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${material.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Chapters List */}
        {material.chapters && (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Зміст:</h3>
            <div className="space-y-2">
              {material.chapters.map((chapter, index) => (
                <button
                  key={index}
                  className="w-full text-left"
                  onClick={() => setSelectedChapter(
                    selectedChapter === index ? null : index
                  )}
                  disabled={chapter.locked && userSubscription === 'free'}
                >
                  <div className={`
                    flex items-center justify-between p-3 rounded-xl
                    ${chapter.locked && userSubscription === 'free'
                      ? 'bg-gray-50 opacity-60'
                      : 'hover:bg-gray-50'
                    }
                  `}>
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-sm
                        ${chapter.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
                      `}>
                        {chapter.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {chapter.title}
                          {chapter.locked && userSubscription === 'free' && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {selectedChapter === index && chapter.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {chapter.description}
                          </p>
                        )}
                        {chapter.duration && (
                          <div className="text-sm text-gray-500 mt-1">
                            {chapter.duration}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`
                      w-5 h-5 text-gray-400 transform transition-transform
                      ${selectedChapter === index ? 'rotate-90' : ''}
                    `} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Requirements & What You'll Learn */}
        {(material.requirements || material.learningOutcomes) && (
          <div className="p-4 grid gap-6 md:grid-cols-2">
            {material.requirements && (
              <div>
                <h3 className="font-semibold mb-3">Вимоги:</h3>
                <ul className="space-y-2">
                  {material.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {material.learningOutcomes && (
              <div>
                <h3 className="font-semibold mb-3">Ви навчитесь:</h3>
                <ul className="space-y-2">
                  {material.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Author Info */}
        {material.author && (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Автор:</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                {material.author.avatar || material.author.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{material.author.name}</div>
                <div className="text-sm text-gray-500">{material.author.role}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EducationModal;