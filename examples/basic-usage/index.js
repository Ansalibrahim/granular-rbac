const { RBAC, PermissionEngine } = require('granular-rbac-core');
const { Sequelize } = require('sequelize');

// Example: Basic usage of the RBAC system

// 1. Define your permissions
const PERMISSIONS = {
  orders: [
    {
      name: 'View Orders',
      description: 'View order list and details',
      shortName: 'orders.view'
    },
    {
      name: 'Create Orders',
      description: 'Create new orders',
      shortName: 'orders.create'
    },
    {
      name: 'Edit Orders',
      description: 'Edit existing orders',
      shortName: 'orders.edit'
    },
    {
      name: 'Delete Orders',
      description: 'Delete orders',
      shortName: 'orders.delete'
    }
  ],
  products: [
    {
      name: 'View Products',
      description: 'View product catalog',
      shortName: 'products.view'
    },
    {
      name: 'Edit Product Details',
      description: 'Edit product information',
      shortName: 'products.edit_details'
    },
    {
      name: 'Manage Inventory',
      description: 'Manage product inventory levels',
      shortName: 'products.manage_inventory'
    }
  ],
  users: [
    {
      name: 'Manage Users',
      description: 'Create, edit, and delete users',
      shortName: 'users.manage'
    },
    {
      name: 'View Users',
      description: 'View user list and details',
      shortName: 'users.view'
    }
  ]
};

async function basicExample() {
  // 2. Set up database connection
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });

  // 3. Configure RBAC
  const config = {
    permissions: PERMISSIONS,
    tenant: {
      field: 'shopId',
      model: 'Shop'
    }
  };

  // 4. Initialize RBAC
  const rbac = new RBAC(config, sequelize);
  await rbac.initialize();

  // 5. Example user with permissions
  const user = {
    id: 1,
    email: 'manager@example.com',
    userType: 'user',
    shopId: 123,
    permissions: ['orders.view', 'orders.create', 'products.view']
  };

  // 6. Check permissions
  console.log('=== Permission Checks ===');
  
  const canViewOrders = await rbac.userHasPermission(user, 'orders.view');
  console.log('Can view orders:', canViewOrders); // true
  
  const canDeleteOrders = await rbac.userHasPermission(user, 'orders.delete');
  console.log('Can delete orders:', canDeleteOrders); // false
  
  const canManageProducts = await rbac.userHasAnyPermission(user, ['products.edit_details', 'products.manage_inventory']);
  console.log('Can manage products:', canManageProducts); // false
  
  const allOrderPermissions = await rbac.userHasAllPermissions(user, ['orders.view', 'orders.create']);
  console.log('Has all order permissions:', allOrderPermissions); // true

  // 7. Get user permissions
  const userPermissions = await rbac.getUserPermissions(user);
  console.log('User permissions:', userPermissions);

  // 8. Create roles and assign to users
  console.log('\n=== Role Management ===');
  
  try {
    // Create a manager role
    const managerRole = await rbac.createRole({
      name: 'Manager',
      description: 'Store manager with full order access',
      permissions: ['orders.view', 'orders.create', 'orders.edit', 'products.view']
    }, 123, user);
    
    console.log('Created role:', managerRole.name);
    
    // Get all roles for tenant
    const roles = await rbac.getRolesByTenant(123);
    console.log('Tenant roles:', roles.map(r => r.name));
    
  } catch (error) {
    console.error('Role management error:', error.message);
  }
}

// Run the example
basicExample().catch(console.error);
