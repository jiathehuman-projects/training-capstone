import { Request, Response } from 'express';
// import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MenuItem } from '../../shared/models';
import { AppDataSource } from '../../shared/data-source';
import { Any } from 'typeorm';

interface MulterRequest extends Request {
  file?: any;
}

const menuItemRepository = AppDataSource.getRepository(MenuItem);

// Configure multer for file uploads (temporarily disabled)
/*
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });
*/

// Placeholder upload middleware
export const upload = {
  single: (fieldName: string) => (req: any, res: any, next: any) => next()
};

export const createMenuItem = async (req: MulterRequest, res: Response) => {
  try {
    const {
      name,
      category,
      price,
      description,
      preparationTimeMin,
      costOfGoods,
      allergens,
      promoPercent,
      promoStartsAt,
      promoEndsAt,
      qtyOnHand,
      reorderThreshold,
      isActive
    } = req.body;

    // Validate required fields
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: name, category, and price are required'
      });
    }

    // Validate price
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        message: 'Price must be a non-negative number'
      });
    }

    // Process allergens
    let processedAllergens: string[] = [];
    if (allergens) {
      if (Array.isArray(allergens)) {
        processedAllergens = allergens;
      } else if (typeof allergens === 'string') {
        try {
          processedAllergens = JSON.parse(allergens);
        } catch {
          processedAllergens = allergens.split(',').map(a => a.trim());
        }
      }
    }

    // Handle file upload (if any)
    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Create new menu item
    const newMenuItem = menuItemRepository.create({
      name: name.trim(),
      category: category.trim(),
      price: typeof price === 'string' ? parseFloat(price) : price,
      description: description?.trim() || null,
      photoUrl,
      preparationTimeMin: preparationTimeMin ? parseInt(preparationTimeMin) : null,
      costOfGoods: costOfGoods ? parseFloat(costOfGoods) : null,
      allergens: processedAllergens,
      promoPercent: promoPercent ? parseFloat(promoPercent) : null,
      promoStartsAt: promoStartsAt || null,
      promoEndsAt: promoEndsAt || null,
      qtyOnHand: qtyOnHand ? parseInt(qtyOnHand) : 0,
      reorderThreshold: reorderThreshold ? parseInt(reorderThreshold) : 0,
      reorderStatus: false,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    const savedMenuItem = await menuItemRepository.save(newMenuItem);

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: savedMenuItem
    });

  } catch (error: any) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      message: 'Failed to create menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      isActive, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    // Build where conditions
    const whereConditions: any = {};
    
    if (category) {
      whereConditions.category = category;
    }
    
    if (isActive !== undefined) {
      whereConditions.isActive = isActive === 'true';
    }

    // Build query
    let queryBuilder = menuItemRepository.createQueryBuilder('menuItem')
      .where(whereConditions);

    // Add search functionality
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(LOWER(menuItem.name) LIKE LOWER(:search) OR LOWER(menuItem.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Add price filters
    if (minPrice) {
      queryBuilder = queryBuilder.andWhere('menuItem.price >= :minPrice', { minPrice: parseFloat(minPrice as string) });
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.andWhere('menuItem.price <= :maxPrice', { maxPrice: parseFloat(maxPrice as string) });
    }

    // Add sorting
    const validSortFields = ['name', 'category', 'price', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    queryBuilder = queryBuilder.orderBy(`menuItem.${sortField}`, order);

    // Add pagination
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNumber - 1) * limitNumber;

    queryBuilder = queryBuilder.skip(offset).take(limitNumber);

    // Execute query
    const [menuItems, total] = await queryBuilder.getManyAndCount();

    res.json({
      menuItems,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });

  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      message: 'Failed to fetch menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const menuItem = await menuItemRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ menuItem });

  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      message: 'Failed to fetch menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateMenuItem = async (req: MulterRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    // Find existing menu item
    const existingMenuItem = await menuItemRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const {
      name,
      category,
      price,
      description,
      preparationTimeMin,
      costOfGoods,
      allergens,
      promoPercent,
      promoStartsAt,
      promoEndsAt,
      qtyOnHand,
      reorderThreshold,
      isActive
    } = req.body;

    // Validate price if provided
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
          message: 'Price must be a non-negative number'
        });
      }
    }

    // Process allergens if provided
    let processedAllergens: string[] | undefined;
    if (allergens !== undefined) {
      if (Array.isArray(allergens)) {
        processedAllergens = allergens;
      } else if (typeof allergens === 'string') {
        try {
          processedAllergens = JSON.parse(allergens);
        } catch {
          processedAllergens = allergens.split(',').map(a => a.trim());
        }
      }
    }

    // Handle file upload (if any)
    let photoUrl: string | null | undefined;
    if (req.file) {
      // Delete old file if it exists
      if (existingMenuItem.photoUrl) {
        const oldFilePath = path.join(__dirname, '../../', existingMenuItem.photoUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Update fields
    const updateData: Partial<MenuItem> = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (preparationTimeMin !== undefined) updateData.preparationTimeMin = preparationTimeMin ? parseInt(preparationTimeMin) : null;
    if (costOfGoods !== undefined) updateData.costOfGoods = costOfGoods ? parseFloat(costOfGoods) : null;
    if (processedAllergens !== undefined) updateData.allergens = processedAllergens;
    if (promoPercent !== undefined) updateData.promoPercent = promoPercent ? parseFloat(promoPercent) : null;
    if (promoStartsAt !== undefined) updateData.promoStartsAt = promoStartsAt || null;
    if (promoEndsAt !== undefined) updateData.promoEndsAt = promoEndsAt || null;
    if (qtyOnHand !== undefined) updateData.qtyOnHand = qtyOnHand ? parseInt(qtyOnHand) : 0;
    if (reorderThreshold !== undefined) updateData.reorderThreshold = reorderThreshold ? parseInt(reorderThreshold) : 0;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Update reorder status based on quantity and threshold
    if (updateData.qtyOnHand !== undefined || updateData.reorderThreshold !== undefined) {
      const currentQty = updateData.qtyOnHand !== undefined ? updateData.qtyOnHand : existingMenuItem.qtyOnHand;
      const currentThreshold = updateData.reorderThreshold !== undefined ? updateData.reorderThreshold : existingMenuItem.reorderThreshold;
      updateData.reorderStatus = currentQty <= currentThreshold;
    }

    // Perform update
    await menuItemRepository.update(parseInt(id), updateData);

    // Fetch updated item
    const updatedMenuItem = await menuItemRepository.findOne({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });

  } catch (error: any) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      message: 'Failed to update menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    // Find existing menu item
    const existingMenuItem = await menuItemRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Delete associated file if it exists
    if (existingMenuItem.photoUrl) {
      const filePath = path.join(__dirname, '../../', existingMenuItem.photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete menu item
    await menuItemRepository.remove(existingMenuItem);

    res.json({
      message: 'Menu item deleted successfully',
      menuItem: existingMenuItem
    });

  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      message: 'Failed to delete menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await menuItemRepository
      .createQueryBuilder('menuItem')
      .select('DISTINCT menuItem.category', 'category')
      .where('menuItem.isActive = :isActive', { isActive: true })
      .getRawMany();

    const categories = result.map((row: any) => row.category).sort();

    res.json({
      categories,
      count: categories.length
    });

  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};