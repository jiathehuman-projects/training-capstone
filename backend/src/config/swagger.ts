import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Management API',
      version: '1.0.0',
      description: 'A comprehensive API for restaurant order management system',
      contact: {
        name: 'API Support',
        email: 'support@restaurant.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.restaurant.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            username: {
              type: 'string',
              description: 'Unique username',
              example: 'johndoe123'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1-555-123-4567'
            },
            roles: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'User roles',
              example: ['customer']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Menu item ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Menu item name',
              example: 'Margherita Pizza'
            },
            category: {
              type: 'string',
              description: 'Menu item category',
              example: 'Pizza'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Menu item price',
              example: 12.99
            },
            description: {
              type: 'string',
              description: 'Menu item description',
              example: 'Fresh mozzarella, tomato sauce, and basil'
            },
            photoUrl: {
              type: 'string',
              description: 'Menu item photo URL',
              example: 'https://example.com/pizza.jpg'
            },
            preparationTimeMin: {
              type: 'integer',
              description: 'Preparation time in minutes',
              example: 15
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the item is available',
              example: true
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID',
              example: 1
            },
            customerId: {
              type: 'integer',
              description: 'Customer ID',
              example: 1
            },
            tableNumber: {
              type: 'integer',
              description: 'Table number',
              example: 5
            },
            status: {
              type: 'string',
              enum: ['draft', 'placed', 'in_kitchen', 'ready', 'served', 'closed', 'cancelled'],
              description: 'Order status',
              example: 'placed'
            },
            subtotalAmount: {
              type: 'number',
              format: 'decimal',
              description: 'Subtotal amount',
              example: 25.98
            },
            taxAmount: {
              type: 'number',
              format: 'decimal',
              description: 'Tax amount',
              example: 2.60
            },
            totalAmount: {
              type: 'number',
              format: 'decimal',
              description: 'Total amount',
              example: 28.58
            },
            paymentMode: {
              type: 'string',
              enum: ['card', 'cash', 'qr'],
              description: 'Payment method',
              example: 'card'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed'],
              description: 'Payment status',
              example: 'pending'
            },
            placedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order placement timestamp'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              }
            }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order item ID',
              example: 1
            },
            orderId: {
              type: 'integer',
              description: 'Order ID',
              example: 1
            },
            menuItemId: {
              type: 'integer',
              description: 'Menu item ID',
              example: 1
            },
            nameSnapshot: {
              type: 'string',
              description: 'Menu item name at time of order',
              example: 'Margherita Pizza'
            },
            unitPrice: {
              type: 'number',
              format: 'decimal',
              description: 'Unit price',
              example: 12.99
            },
            quantity: {
              type: 'integer',
              description: 'Item quantity',
              example: 2
            },
            lineTotal: {
              type: 'number',
              format: 'decimal',
              description: 'Line total',
              example: 25.98
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid input data'
            },
            error: {
              type: 'string',
              description: 'Error details',
              example: 'Validation failed'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Restaurant API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    }
  }));

  // Serve swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};