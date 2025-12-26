const { db, COLLECTIONS } = require('./firestore');
const admin = require('./admin');
const UserManager = require('./userManager');

class CategoryManager {
  // Create a new category
  static async createCategory(categoryData, creatorId) {
    try {
      // Validate input
      if (!categoryData.name || !categoryData.description) {
        throw new Error('Missing required category data');
      }

      // Create the category document
      const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc();
      const categoryId = categoryRef.id;
      
      await categoryRef.set({
        id: categoryId,
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon || '',
        color: categoryData.color || '#000000',
        defaultLimit: categoryData.defaultLimit || 0,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log the action
      await UserManager.logAction(creatorId, 'category_created', {
        categoryId,
        categoryName: categoryData.name
      });

      return { success: true, categoryId };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getCategory(categoryId) {
    try {
      const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc(categoryId);
      const doc = await categoryRef.get();
      
      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  // Get category by name
  static async getCategoryByName(name) {
    try {
      const snapshot = await db.collection(COLLECTIONS.CATEGORIES)
        .where('name', '==', name)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting category by name:', error);
      throw error;
    }
  }

  // Get all active categories
  static async getActiveCategories() {
    try {
      const snapshot = await db.collection(COLLECTIONS.CATEGORIES)
        .where('isActive', '==', true)
        .get();

      const categories = [];
      snapshot.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return categories;
    } catch (error) {
      console.error('Error getting active categories:', error);
      throw error;
    }
  }

  // Update category
  static async updateCategory(categoryId, updateData, updaterId) {
    try {
      const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc(categoryId);
      const doc = await categoryRef.get();
      
      if (!doc.exists) {
        throw new Error('Category not found');
      }

      await categoryRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log the action
      await UserManager.logAction(updaterId, 'category_updated', {
        categoryId,
        updateData
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Deactivate category
  static async deactivateCategory(categoryId, deactivatedBy) {
    try {
      const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc(categoryId);
      
      await categoryRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log the action
      await UserManager.logAction(deactivatedBy, 'category_deactivated', {
        categoryId
      });

      return { success: true };
    } catch (error) {
      console.error('Error deactivating category:', error);
      throw error;
    }
  }

  // Set default category limits
  static async setDefaultCategoryLimits(categoryLimits, updatedBy) {
    try {
      // Update default limits for each category
      for (const [categoryName, limit] of Object.entries(categoryLimits)) {
        const category = await this.getCategoryByName(categoryName);
        if (category) {
          await this.updateCategory(category.id, { defaultLimit: limit }, updatedBy);
        } else {
          // Create category if it doesn't exist
          await this.createCategory({
            name: categoryName,
            description: `${categoryName} category`,
            defaultLimit: limit,
            isActive: true
          }, updatedBy);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting default category limits:', error);
      throw error;
    }
  }
}

module.exports = CategoryManager;