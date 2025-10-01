import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MenuItem } from '../models';
import { AppDataSource } from '../data-source';

const menuItemRepository = AppDataSource.getRepository(MenuItem);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG and PNG files are allowed'));
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, category, price, description, preparationTimeMin, costOfGoods, allergens, qtyOnHand, reorderThreshold } = req.body;

    // Validate required fields
    if (!name || !category || !price || !description || qtyOnHand === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, category, price, description, and qtyOnHand are required' 
      });
    }

    // Parse numeric fields
    const parsedPrice = parseFloat(price);
    const parsedQtyOnHand = parseInt(qtyOnHand);
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (isNaN(parsedQtyOnHand) || parsedQtyOnHand < 0) {
      return res.status(400).json({ message: 'Quantity on hand must be a non-negative number' });
    }

    const menuItem = new MenuItem();
    menuItem.name = name.trim();
    menuItem.category = category.trim();
    menuItem.price = parsedPrice;
    menuItem.description = description.trim();
    menuItem.qtyOnHand = parsedQtyOnHand;

    // Handle optional fields
    if (preparationTimeMin) {
      const parsedPrepTime = parseInt(preparationTimeMin);
      if (!isNaN(parsedPrepTime) && parsedPrepTime > 0) {
        menuItem.preparationTimeMin = parsedPrepTime;
      }
    }

    if (costOfGoods) {
      const parsedCost = parseFloat(costOfGoods);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        menuItem.costOfGoods = parsedCost;
      }
    }

    if (reorderThreshold) {
      const parsedThreshold = parseInt(reorderThreshold);
      if (!isNaN(parsedThreshold) && parsedThreshold >= 0) {
        menuItem.reorderThreshold = parsedThreshold;
      }
    }

    // Handle allergens
    if (allergens) {
      try {
        const allergensArray = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
        if (Array.isArray(allergensArray)) {
          menuItem.allergens = allergensArray;
        }
      } catch (e) {
        return res.status(400).json({ message: 'Allergens must be a valid JSON array' });
      }
    }

    // Handle uploaded image
    if (req.file) {
      menuItem.photoUrl = `/uploads/${req.file.filename}`;
    }

    const savedMenuItem = await menuItemRepository.save(menuItem);
    
    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: savedMenuItem
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, active, search, page = 1, limit = 10 } = req.query;
    
    let queryBuilder = menuItemRepository.createQueryBuilder('menuItem');

    if (category) {
      queryBuilder = queryBuilder.andWhere('menuItem.category = :category', { category });
    }

    if (active !== undefined) {
      const isActive = active === 'true';
      queryBuilder = queryBuilder.andWhere('menuItem.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(menuItem.name ILIKE :search OR menuItem.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    
    queryBuilder = queryBuilder
      .orderBy('menuItem.category', 'ASC')
      .addOrderBy('menuItem.name', 'ASC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const [menuItems, total] = await queryBuilder.getManyAndCount();
    
    res.json({
      menuItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItemId = parseInt(id);

    if (isNaN(menuItemId)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const menuItem = await menuItemRepository.findOne({ where: { id: menuItemId } });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ menuItem });

  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItemId = parseInt(id);

    if (isNaN(menuItemId)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const menuItem = await menuItemRepository.findOne({ where: { id: menuItemId } });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const { name, category, price, description, preparationTimeMin, costOfGoods, allergens, qtyOnHand, reorderThreshold, isActive } = req.body;

    // Update fields if provided
    if (name !== undefined) menuItem.name = name.trim();
    if (category !== undefined) menuItem.category = category.trim();
    if (description !== undefined) menuItem.description = description.trim();
    if (isActive !== undefined) menuItem.isActive = Boolean(isActive);

    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      menuItem.price = parsedPrice;
    }

    if (qtyOnHand !== undefined) {
      const parsedQtyOnHand = parseInt(qtyOnHand);
      if (isNaN(parsedQtyOnHand) || parsedQtyOnHand < 0) {
        return res.status(400).json({ message: 'Quantity on hand must be a non-negative number' });
      }
      menuItem.qtyOnHand = parsedQtyOnHand;
    }

    if (preparationTimeMin !== undefined) {
      if (preparationTimeMin === null || preparationTimeMin === '') {
        menuItem.preparationTimeMin = null;
      } else {
        const parsedPrepTime = parseInt(preparationTimeMin);
        if (!isNaN(parsedPrepTime) && parsedPrepTime > 0) {
          menuItem.preparationTimeMin = parsedPrepTime;
        }
      }
    }

    if (costOfGoods !== undefined) {
      if (costOfGoods === null || costOfGoods === '') {
        menuItem.costOfGoods = null;
      } else {
        const parsedCost = parseFloat(costOfGoods);
        if (!isNaN(parsedCost) && parsedCost >= 0) {
          menuItem.costOfGoods = parsedCost;
        }
      }
    }

    if (reorderThreshold !== undefined) {
      const parsedThreshold = parseInt(reorderThreshold);
      if (!isNaN(parsedThreshold) && parsedThreshold >= 0) {
        menuItem.reorderThreshold = parsedThreshold;
      }
    }

    if (allergens !== undefined) {
      try {
        const allergensArray = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
        if (Array.isArray(allergensArray)) {
          menuItem.allergens = allergensArray;
        }
      } catch (e) {
        return res.status(400).json({ message: 'Allergens must be a valid JSON array' });
      }
    }

    // Handle uploaded image
    if (req.file) {
      // Delete old image file if it exists
      if (menuItem.photoUrl && menuItem.photoUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', menuItem.photoUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      menuItem.photoUrl = `/uploads/${req.file.filename}`;
    }

    const updatedMenuItem = await menuItemRepository.save(menuItem);
    
    res.json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });

  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItemId = parseInt(id);

    if (isNaN(menuItemId)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const menuItem = await menuItemRepository.findOne({ where: { id: menuItemId } });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Soft delete by setting isActive to false
    menuItem.isActive = false;
    await menuItemRepository.save(menuItem);
    
    res.json({
      message: 'Menu item deleted successfully',
      menuItem
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};