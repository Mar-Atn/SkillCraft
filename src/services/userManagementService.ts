// User Management Service - Handles user registration and admin management
// CONSTITUTIONAL: Preserves all existing data flows and integrations

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  password: string; // In production, this would be hashed
  createdAt: Date;
  lastActivity: Date;
}

class UserManagementService {
  private readonly STORAGE_KEY = 'scsx_registered_users';

  /**
   * Initialize with default test users - preserves existing functionality
   */
  private getDefaultUsers(): Record<string, User> {
    return {
      'test@test.com': {
        id: 'test-user-1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        password: 'test',
        createdAt: new Date('2024-01-01'),
        lastActivity: new Date()
      },
      'admin@admin.com': {
        id: 'admin-user-1',
        email: 'admin@admin.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        password: 'admin',
        createdAt: new Date('2024-01-01'),
        lastActivity: new Date()
      },
      'user@user.com': {
        id: 'user-user-1',
        email: 'user@user.com',
        firstName: 'User',
        lastName: 'User',
        role: 'user',
        password: 'user',
        createdAt: new Date('2024-01-01'),
        lastActivity: new Date()
      }
    };
  }

  /**
   * Get all registered users from localStorage
   */
  getAllUsers(): Record<string, User> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const users = JSON.parse(stored);
        // Convert date strings back to Date objects
        Object.values(users).forEach((user: any) => {
          user.createdAt = new Date(user.createdAt);
          user.lastActivity = new Date(user.lastActivity);
        });
        return users;
      } catch (error) {
        console.error('❌ Failed to parse stored users:', error);
      }
    }
    
    // Initialize with default users if no storage exists
    const defaultUsers = this.getDefaultUsers();
    this.saveAllUsers(defaultUsers);
    return defaultUsers;
  }

  /**
   * Save all users to localStorage
   */
  private saveAllUsers(users: Record<string, User>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  /**
   * Register a new user
   */
  registerUser(email: string, password: string, firstName?: string, lastName?: string): User {
    const users = this.getAllUsers();
    
    // Check if user already exists
    if (users[email]) {
      throw new Error('User with this email already exists');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate password
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters long');
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      role: 'user', // Default role
      password: password, // In production, this would be hashed
      createdAt: new Date(),
      lastActivity: new Date()
    };

    // Add to users and save
    users[email] = newUser;
    this.saveAllUsers(users);

    console.log('✅ New user registered:', email);
    return newUser;
  }

  /**
   * Authenticate user (preserves existing login flow)
   */
  authenticateUser(email: string, password: string): User {
    const users = this.getAllUsers();
    const user = users[email];

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Update last activity
    user.lastActivity = new Date();
    users[email] = user;
    this.saveAllUsers(users);

    return user;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users[email] || null;
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return Object.values(users).find(user => user.id === id) || null;
  }

  /**
   * Update user role (admin function)
   */
  updateUserRole(email: string, role: 'user' | 'admin'): User {
    const users = this.getAllUsers();
    const user = users[email];

    if (!user) {
      throw new Error('User not found');
    }

    user.role = role;
    user.lastActivity = new Date();
    users[email] = user;
    this.saveAllUsers(users);

    console.log('✅ User role updated:', email, '→', role);
    return user;
  }

  /**
   * Delete user (admin function)
   */
  deleteUser(email: string): boolean {
    const users = this.getAllUsers();
    
    if (!users[email]) {
      throw new Error('User not found');
    }

    // Prevent deleting the last admin
    const adminCount = Object.values(users).filter(user => user.role === 'admin').length;
    if (users[email].role === 'admin' && adminCount <= 1) {
      throw new Error('Cannot delete the last admin user');
    }

    delete users[email];
    this.saveAllUsers(users);

    console.log('✅ User deleted:', email);
    return true;
  }

  /**
   * Get all users as array for admin interface
   */
  getAllUsersArray(): User[] {
    const users = this.getAllUsers();
    return Object.values(users).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Add user manually (admin function)
   */
  addUserManually(email: string, password: string, firstName: string, lastName: string, role: 'user' | 'admin'): User {
    const users = this.getAllUsers();
    
    // Check if user already exists
    if (users[email]) {
      throw new Error('User with this email already exists');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role,
      password: password,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    // Add to users and save
    users[email] = newUser;
    this.saveAllUsers(users);

    console.log('✅ User added manually by admin:', email);
    return newUser;
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();