const Material = require('../models/EducationalMaterial');
const userService = require('./userService');

class EducationalMaterialService {
  async getMaterials(filters = {}) {
    try {
      const query = {};
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.premium !== undefined) {
        query.premium = filters.premium;
      }
      
      const materials = await Material.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);
        
      return materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }
  
  async getMaterialById(id) {
    try {
      const material = await Material.findById(id);
      return material;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error;
    }
  }
  
  async trackProgress(userId, materialId, progress) {
    try {
      const user = await userService.getUserById(userId);
      if (!user) throw new Error('User not found');
      
      // Знаходимо чи оновлюємо прогрес
      const existingProgress = user.materialProgress?.find(
        p => p.materialId.toString() === materialId
      );
      
      if (existingProgress) {
        existingProgress.progress = progress;
        existingProgress.updatedAt = new Date();
      } else {
        user.materialProgress = user.materialProgress || [];
        user.materialProgress.push({
          materialId,
          progress,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await user.save();
      return true;
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }
  
  async getUserProgress(userId) {
    try {
      const user = await userService.getUserById(userId);
      if (!user) throw new Error('User not found');
      
      return user.materialProgress || [];
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }
  
  async getRecommendations(userId) {
    try {
      const user = await userService.getUserById(userId);
      if (!user) throw new Error('User not found');
      
      // Логіка рекомендацій на основі прогресу користувача
      const userProgress = user.materialProgress || [];
      const completedMaterials = userProgress
        .filter(p => p.progress >= 100)
        .map(p => p.materialId);
        
      // Знаходимо матеріали того ж типу/категорії, які користувач ще не завершив
      const recommendations = await Material.find({
        _id: { $nin: completedMaterials },
        category: {
          $in: await this._getUserPreferredCategories(userProgress)
        }
      }).limit(5);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
  
  async _getUserPreferredCategories(progress) {
    // Аналіз переваг користувача на основі його прогресу
    const categories = {};
    
    progress.forEach(p => {
      if (p.progress > 50) { // Враховуємо тільки матеріали з прогресом >50%
        const category = p.materialId.category;
        categories[category] = (categories[category] || 0) + p.progress;
      }
    });
    
    // Повертаємо топ-3 категорії
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }
}

module.exports = new EducationalMaterialService();