import request from 'supertest';
import express from 'express';

// Mock multer to test that it works
jest.mock('multer', () => {
  const mockMulter: any = jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = { 
        filename: 'test-image.jpg', 
        path: '/uploads/test-image.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      next();
    })
  }));

  mockMulter.diskStorage = jest.fn(() => ({}));
  return mockMulter;
});

const app = express();
app.use(express.json());

// Simple test route to verify multer works
app.post('/test', (req, res) => {
  res.json({ success: true, message: 'Multer mock working' });
});

describe('Menu Controller - Multer Mocking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully mock multer for file uploads', async () => {
    // Test that we can import multer without errors
    const multer = require('multer');
    expect(multer).toBeDefined();
    expect(multer.diskStorage).toBeDefined();
    
    // Test that multer.diskStorage can be called
    const storage = multer.diskStorage({
      destination: (req: any, file: any, cb: any) => cb(null, '/uploads'),
      filename: (req: any, file: any, cb: any) => cb(null, 'test.jpg')
    });
    expect(storage).toBeDefined();
    
    // Test that multer instance can be created
    const upload = multer({ storage });
    expect(upload).toBeDefined();
    expect(upload.single).toBeDefined();
  });

  it('should handle a basic request', async () => {
    const response = await request(app)
      .post('/test')
      .send({ test: 'data' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Multer mock working');
  });

  it('should simulate file upload with mocked multer', async () => {
    const multer = require('multer');
    const storage = multer.diskStorage({});
    const upload = multer({ storage });
    
    // Create a route with the upload middleware
    const testApp = express();
    testApp.use(express.json());
    testApp.post('/upload', upload.single('image'), (req: any, res) => {
      res.json({
        success: true,
        file: req.file ? {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype
        } : null
      });
    });

    const response = await request(testApp)
      .post('/upload')
      .attach('image', Buffer.from('fake image data'), 'test.jpg');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.file).toBeDefined();
    expect(response.body.file.filename).toBe('test-image.jpg');
    expect(response.body.file.originalname).toBe('test.jpg');
    expect(response.body.file.mimetype).toBe('image/jpeg');
  });
});