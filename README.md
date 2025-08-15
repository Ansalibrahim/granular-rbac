# Granular RBAC

A comprehensive, UI-component level Role-Based Access Control (RBAC) library for Node.js and React applications. Built to handle fine-grained permissions like `returns.refund_item_modal.edit_bank_details`.

## Features

🔐 **UI-Component Level Permissions** - Control access down to individual buttons and form fields  
🏢 **Multi-Tenant Support** - Built-in tenant isolation (shops, organizations, etc.)  
⚡ **Performance Focused** - Efficient permission checking with caching support  
🎯 **Type Safe** - Full TypeScript support with comprehensive type definitions  
🔧 **Framework Agnostic** - Works with any Node.js backend and React frontend  
📦 **Modular Design** - Use only what you need (core, React, Express)  
🚀 **Easy Integration** - Drop-in replacement for existing RBAC systems  

## Quick Start

### Installation

```bash
# Core library (required)
npm install granular-rbac-core

# React components and hooks
npm install granular-rbac-react

# Express middleware and routes
npm install granular-rbac-express
```

### Basic Usage

#### 1. Define Your Permissions

```typescript
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
    }
  ],
  products: [
    {
      name: 'Edit Product Details',
      description: 'Edit product information',
      shortName: 'products.edit_details'
    }
  ]
};
```

#### 2. Initialize RBAC (Backend)

```typescript
import { RBAC } from 'granular-rbac-core';
import { Sequelize } from 'sequelize';

const config = {
  permissions: PERMISSIONS,
  tenant: {
    field: 'shopId',
    model: 'Shop'
  }
};

const rbac = new RBAC(config, sequelize);
await rbac.initialize();

// Check permissions
const user = {
  id: 1,
  email: 'user@example.com',
  userType: 'user',
  shopId: 123,
  permissions: ['orders.view', 'products.edit_details']
};

const canViewOrders = await rbac.userHasPermission(user, 'orders.view');
console.log('Can view orders:', canViewOrders); // true
```

#### 3. Use in React Components

```tsx
import { RBACProvider, AccessControl } from 'granular-rbac-react';

function App() {
  return (
    <RBACProvider user={currentUser} config={config}>
      <Dashboard />
    </RBACProvider>
  );
}

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Only show if user has permission */}
      <AccessControl permissions={['orders.view']}>
        <OrdersTable />
      </AccessControl>
      
      {/* Multiple permissions - user needs ANY */}
      <AccessControl permissions={['orders.create', 'orders.edit']}>
        <OrderForm />
      </AccessControl>
      
      {/* Require ALL permissions */}
      <AccessControl 
        permissions={['orders.view', 'orders.edit']} 
        requireAll={true}
      >
        <AdvancedOrderManager />
      </AccessControl>
    </div>
  );
}
```

#### 4. Protect API Routes (Express)

```typescript
import { createPermissionMiddleware, createRoleRoutes } from 'granular-rbac-express';

const middleware = createPermissionMiddleware(rbac.engine);

// Protect individual routes
app.get('/api/orders', 
  middleware.requirePermission('orders.view'),
  (req, res) => {
    res.json({ orders: [] });
  }
);

// Multiple permissions
app.post('/api/orders', 
  middleware.requirePermission(['orders.create'], { requireAll: true }),
  (req, res) => {
    res.json({ success: true });
  }
);

// Admin only routes
app.get('/api/admin/settings',
  middleware.requireAdmin(),
  (req, res) => {
    res.json({ settings: {} });
  }
);

// Use built-in role management routes
app.use('/api/rbac', createRoleRoutes(rbac));
```

## Advanced Usage

### Custom Role Management

```typescript
// Create custom roles
const managerRole = await rbac.createRole({
  name: 'Store Manager',
  description: 'Can manage orders and products',
  permissions: ['orders.view', 'orders.create', 'products.edit_details']
}, tenantId, createdByUser);

// Assign roles to users
await rbac.assignRoleToUser(userId, managerRole.id, tenantId, assignedByUser);
```

### React Hooks

```tsx
import { usePermission, useRole, useUserType } from 'granular-rbac-react';

function OrdersPage() {
  const { allowed: canCreate, loading } = usePermission('orders.create');
  const { allowed: canEdit } = usePermission('orders.edit');
  const hasManagerRole = useRole('Manager');
  const { isAdmin, userType } = useUserType();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Orders</h2>
      {canCreate && <button>Create Order</button>}
      {canEdit && <button>Edit Selected</button>}
      {hasManagerRole && <button>Manager Actions</button>}
      {isAdmin && <button>Admin Panel</button>}
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from 'granular-rbac-react';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute permissions={['orders.view']}>
            <OrdersPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute 
            permissions={['settings.users', 'settings.roles']}
            redirectTo="/unauthorized"
          >
            <AdminPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## Permission Patterns

This library is designed to handle fine-grained, hierarchical permissions:

```typescript
// Module.Screen.Component.Action pattern
'orders.list.export_button.click'
'products.details.price_field.edit'
'returns.refund_modal.bank_details.view'
'inventory.receiving.scan_barcode.action'
'settings.users.delete_button.click'

// Simpler patterns also work
'orders.view'
'products.create'
'admin.access'
```

## User Types

The system supports three user types with automatic permission inheritance:

- **superadmin** - Can access everything across all tenants
- **admin** - Can access everything within their tenant
- **user** - Permissions based on assigned roles

```typescript
const user = {
  id: 1,
  email: 'admin@shop.com',
  userType: 'admin', // Automatically grants all permissions
  shopId: 123,
  // roles and permissions populated automatically
};
```

## Multi-Tenant Support

Built-in support for multi-tenant applications:

```typescript
const config = {
  permissions: PERMISSIONS,
  tenant: {
    field: 'shopId',    // or 'organizationId', 'warehouseId', etc.
    model: 'Shop'       // or 'Organization', 'Warehouse', etc.
  }
};

// All roles and permissions are automatically scoped to the tenant
const role = await rbac.createRole(roleData, tenantId, createdBy);
```

## API Reference

### Core Classes

#### `RBAC`
Main class that orchestrates permission checking and role management.

```typescript
const rbac = new RBAC(config, sequelize);
await rbac.initialize();

// Permission checking
await rbac.userHasPermission(user, 'orders.view');
await rbac.userHasAnyPermission(user, ['orders.view', 'orders.create']);
await rbac.userHasAllPermissions(user, ['orders.view', 'orders.edit']);

// Role management
await rbac.createRole(roleData, tenantId, user);
await rbac.assignRoleToUser(userId, roleId, tenantId, user);
```

#### `PermissionEngine`
Handles permission validation and checking logic.

```typescript
const engine = new PermissionEngine(config);

engine.validatePermission('orders.view'); // true/false
engine.getAllPermissions(); // All permission objects
engine.getPermissionsByModule('orders'); // Orders permissions only
```

### React Components

#### `<AccessControl>`
Conditionally renders children based on permissions.

```tsx
<AccessControl 
  permissions={['orders.view']}
  roles={['Manager']}
  requireAll={false}
  fallback={<div>Access Denied</div>}
  showLoader={true}
>
  <OrdersTable />
</AccessControl>
```

#### `<ProtectedRoute>`
Protects routes based on permissions.

```tsx
<ProtectedRoute 
  permissions={['admin.access']}
  redirectTo="/login"
  unauthorizedComponent={<Unauthorized />}
>
  <AdminPanel />
</ProtectedRoute>
```

### Express Middleware

#### `requirePermission(permission, options?)`
Protects routes with permission requirements.

```typescript
app.get('/api/orders',
  middleware.requirePermission('orders.view'),
  controller.getOrders
);

app.post('/api/admin/users',
  middleware.requirePermission(['users.create', 'admin.access'], { requireAll: true }),
  controller.createUser
);
```

#### `requireAdmin()` / `requireSuperAdmin()`
Shortcuts for common access patterns.

```typescript
app.get('/api/admin/*', middleware.requireAdmin());
app.post('/api/system/*', middleware.requireSuperAdmin());
```

## Migration Guide

### From Basic RBAC

If you're using a simple role-based system:

```typescript
// Before
if (user.role === 'admin') {
  // show admin content
}

// After
<AccessControl permissions={['admin.access']}>
  {/* admin content */}
</AccessControl>
```

### From Your Current System

This library was designed to be a drop-in replacement for complex permission systems:

```typescript
// Your current permissions work as-is
const PERMISSIONS = {
  returns: [
    { 
      name: 'Edit Bank Details',
      shortName: 'returns.refund_item_modal.edit_bank_details',
      description: 'Permission to edit bank details in refund modal'
    }
  ]
};

// Your current components
<AccessControl permissions={['returns.refund_item_modal.edit_bank_details']}>
  <BankDetailsEditor />
</AccessControl>
```

## Examples

See the `/examples` directory for complete working examples:

- **Basic Usage** - Simple permission checking
- **React App** - Full React integration with routing
- **Express API** - Backend API with protected routes
- **Multi-Tenant** - Complex multi-tenant setup

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  Permission, 
  RBACConfig, 
  User, 
  Role, 
  CreateRoleRequest 
} from 'granular-rbac-core';

// Your config is fully typed
const config: RBACConfig = {
  permissions: PERMISSIONS,
  tenant: {
    field: 'shopId',
    model: 'Shop'
  }
};
```

## Performance

- **Efficient Permission Checking** - O(1) lookups using Sets and Maps
- **Caching Support** - Built-in support for Redis caching
- **Minimal Database Queries** - Optimized queries with proper indexing
- **Tree Shaking** - Only import what you need

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/hashboosh/granular-rbac/issues)
- 💬 [Discussions](https://github.com/hashboosh/granular-rbac/discussions)
