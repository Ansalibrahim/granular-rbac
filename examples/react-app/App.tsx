import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  RBACProvider, 
  AccessControl, 
  ProtectedRoute,
  usePermission,
  useUserType 
} from 'granular-rbac-react';

// Define your permissions (same structure as your current system)
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

// Mock current user (in real app, get from auth context)
const currentUser = {
  id: 1,
  email: 'manager@example.com',
  firstName: 'John',
  lastName: 'Doe',
  userType: 'user' as const,
  shopId: 123,
  permissions: ['orders.view', 'orders.create', 'products.view', 'products.edit'],
  roles: [
    {
      id: 1,
      name: 'Store Manager',
      description: 'Can manage orders and products',
      permissions: ['orders.view', 'orders.create', 'products.view', 'products.edit']
    }
  ]
};

const config = {
  permissions: PERMISSIONS,
  tenant: {
    field: 'shopId',
    model: 'Shop'
  }
};

function App() {
  return (
    <RBACProvider user={currentUser} config={config} tenantId={123}>
      <Router>
        <div className="app">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute permissions={['orders.view']}>
                    <OrdersPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute permissions={['products.view']}>
                    <ProductsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute permissions={['settings.users', 'settings.roles']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RBACProvider>
  );
}

function Navigation() {
  const { isAdmin } = useUserType();
  
  return (
    <nav className="navigation">
      <h1>My App</h1>
      <ul>
        <li><a href="/">Dashboard</a></li>
        
        <AccessControl permissions={['orders.view']}>
          <li><a href="/orders">Orders</a></li>
        </AccessControl>
        
        <AccessControl permissions={['products.view']}>
          <li><a href="/products">Products</a></li>
        </AccessControl>
        
        {isAdmin && (
          <li><a href="/settings">Settings</a></li>
        )}
      </ul>
    </nav>
  );
}

function Dashboard() {
  const { userType } = useUserType();
  
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome! Your user type: {userType}</p>
      
      <div className="dashboard-cards">
        <AccessControl permissions={['orders.view']}>
          <DashboardCard title="Orders" description="View and manage orders" />
        </AccessControl>
        
        <AccessControl permissions={['products.view']}>
          <DashboardCard title="Products" description="Manage your product catalog" />
        </AccessControl>
        
        <AccessControl permissions={['settings.users']}>
          <DashboardCard title="User Management" description="Manage users and roles" />
        </AccessControl>
      </div>
    </div>
  );
}

function OrdersPage() {
  const { allowed: canCreate } = usePermission('orders.create');
  const { allowed: canEdit } = usePermission('orders.edit');
  const { allowed: canDelete } = usePermission('orders.delete');
  
  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        {canCreate && (
          <button className="btn-primary">Create Order</button>
        )}
      </div>
      
      <div className="orders-list">
        <div className="order-item">
          <span>Order #1001</span>
          <div className="order-actions">
            {canEdit && <button>Edit</button>}
            {canDelete && <button>Delete</button>}
          </div>
        </div>
        
        <div className="order-item">
          <span>Order #1002</span>
          <div className="order-actions">
            {canEdit && <button>Edit</button>}
            {canDelete && <button>Delete</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  return (
    <div>
      <h2>Products</h2>
      
      <AccessControl 
        permissions={['products.edit']}
        fallback={<p>You can view products but cannot edit them.</p>}
      >
        <div className="product-controls">
          <button>Add Product</button>
          <button>Edit Selected</button>
        </div>
      </AccessControl>
      
      <div className="products-grid">
        <div className="product-card">
          <h3>Product 1</h3>
          <p>Description of product 1</p>
          
          <AccessControl permissions={['products.inventory']}>
            <div className="inventory-info">
              <span>Stock: 50 units</span>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h2>Settings</h2>
      
      <div className="settings-tabs">
        <AccessControl permissions={['settings.users']}>
          <div className="settings-section">
            <h3>User Management</h3>
            <p>Manage users and their permissions</p>
          </div>
        </AccessControl>
        
        <AccessControl permissions={['settings.roles']}>
          <div className="settings-section">
            <h3>Role Management</h3>
            <p>Create and manage custom roles</p>
          </div>
        </AccessControl>
      </div>
    </div>
  );
}

function DashboardCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="unauthorized">
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  );
}

export default App;
