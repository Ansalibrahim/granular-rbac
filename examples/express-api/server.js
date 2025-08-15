const express = require('express');
const { Sequelize } = require('sequelize');
const { RBAC } = require('granular-rbac-core');
const { createPermissionMiddleware, createRoleRoutes } = require('granular-rbac-express');

// Define your permissions (same as your current system)
const PERMISSIONS = {
  orders: [
    { name: 'View Orders', description: 'View order list', shortName: 'orders.view' },
    { name: 'Create Orders', description: 'Create new orders', shortName: 'orders.create' },
    { name: 'Edit Orders', description: 'Edit existing orders', shortName: 'orders.edit' },
    { name: 'Delete Orders', description: 'Delete orders', shortName: 'orders.delete' }
  ],
  products: [
    { name: 'View Products', description: 'View products', shortName: 'products.view' },
    { name: 'Edit Products', description: 'Edit products', shortName: 'products.edit' },
    { name: 'Manage Inventory', description: 'Manage inventory', shortName: 'products.inventory' }
  ],
  settings: [
    { name: 'Manage Users', description: 'Manage users', shortName: 'settings.users' },
    { name: 'Manage Roles', description: 'Manage roles', shortName: 'settings.roles' }
  ]
};

async function createServer() {
  const app = express();
  app.use(express.json());

  // Set up database
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });

  // Configure RBAC
  const config = {
    permissions: PERMISSIONS,
    tenant: {
      field: 'shopId',
      model: 'Shop'
    }
  };

  // Initialize RBAC
  const rbac = new RBAC(config, sequelize);
  await rbac.initialize();

  // Create middleware
  const middleware = createPermissionMiddleware(rbac.engine);

  // Mock authentication middleware (replace with your actual auth)
  app.use((req, res, next) => {
    // In real app, decode JWT and fetch user from database
    req.user = {
      id: 1,
      email: 'manager@example.com',
      userType: 'admin',
      shopId: 123,
      permissions: ['orders.view', 'orders.create', 'products.view']
    };
    next();
  });

  // Use RBAC routes
  app.use('/api/rbac', createRoleRoutes(rbac));

  // Example protected routes
  app.get('/api/orders', 
    middleware.requirePermission('orders.view'),
    (req, res) => {
      res.json({ 
        orders: [
          { id: 1, customer: 'John Doe', total: 100 },
          { id: 2, customer: 'Jane Smith', total: 150 }
        ]
      });
    }
  );

  app.post('/api/orders', 
    middleware.requirePermission('orders.create'),
    (req, res) => {
      res.json({ 
        message: 'Order created successfully',
        order: { id: 3, ...req.body }
      });
    }
  );

  app.put('/api/orders/:id', 
    middleware.requirePermission('orders.edit'),
    (req, res) => {
      res.json({ 
        message: 'Order updated successfully',
        order: { id: req.params.id, ...req.body }
      });
    }
  );

  app.delete('/api/orders/:id', 
    middleware.requirePermission('orders.delete'),
    (req, res) => {
      res.json({ message: 'Order deleted successfully' });
    }
  );

  // Multiple permission example
  app.get('/api/admin/dashboard',
    middleware.requirePermission(['orders.view', 'products.view'], { requireAll: true }),
    (req, res) => {
      res.json({
        message: 'Admin dashboard data',
        stats: {
          orders: 150,
          products: 50,
          users: 10
        }
      });
    }
  );

  // User type restricted route
  app.get('/api/admin/settings',
    middleware.requireAdmin(),
    (req, res) => {
      res.json({ message: 'Admin settings' });
    }
  );

  // Super admin only route
  app.post('/api/superadmin/migrate',
    middleware.requireSuperAdmin(),
    (req, res) => {
      res.json({ message: 'Migration started' });
    }
  );

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`\nExample API endpoints:`);
    console.log(`GET  /api/orders - View orders (requires orders.view)`);
    console.log(`POST /api/orders - Create order (requires orders.create)`);
    console.log(`PUT  /api/orders/:id - Update order (requires orders.edit)`);
    console.log(`DELETE /api/orders/:id - Delete order (requires orders.delete)`);
    console.log(`\nRBAC Management endpoints:`);
    console.log(`GET  /api/rbac/123/permissions - Get all permissions`);
    console.log(`POST /api/rbac/123 - Create role`);
    console.log(`GET  /api/rbac/123 - Get roles`);
  });

  return app;
}

createServer().catch(console.error);
