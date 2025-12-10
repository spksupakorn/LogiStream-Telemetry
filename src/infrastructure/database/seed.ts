import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../../domain/entities/User.entity.js';
import { Role } from '../../domain/entities/Role.entity.js';
import { Permission } from '../../domain/entities/Permission.entity.js';

export async function seedDatabase(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);

  console.log('🌱 Starting database seeding...');

  // Create Permissions
  const permissions = [
    { name: 'user:read', description: 'Read user information', resource: 'user', action: 'read' },
    { name: 'user:create', description: 'Create new users', resource: 'user', action: 'create' },
    { name: 'user:update', description: 'Update user information', resource: 'user', action: 'update' },
    { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
    { name: 'role:read', description: 'Read role information', resource: 'role', action: 'read' },
    { name: 'role:manage', description: 'Manage roles', resource: 'role', action: 'manage' },
  ];

  const createdPermissions = await Promise.all(
    permissions.map(async (perm) => {
      const existing = await permissionRepo.findOne({ where: { name: perm.name } });
      if (existing) return existing;
      return await permissionRepo.save(permissionRepo.create(perm));
    })
  );

  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Create Roles
  const adminRole = await roleRepo.findOne({ where: { name: 'admin' } }) || 
    await roleRepo.save(roleRepo.create({
      name: 'admin',
      description: 'Administrator with full access',
      permissions: createdPermissions
    }));

  const userRole = await roleRepo.findOne({ where: { name: 'user' } }) ||
    await roleRepo.save(roleRepo.create({
      name: 'user',
      description: 'Regular user with limited access',
      permissions: createdPermissions.filter(p => p.name === 'user:read')
    }));

  console.log(`✅ Created roles: admin, user`);

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await userRepo.findOne({ where: { email: 'admin@example.com' } }) ||
    await userRepo.save(userRepo.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      roles: [adminRole]
    }));

  // Create Regular User
  const userPassword = await bcrypt.hash('user123', 10);
  const regularUser = await userRepo.findOne({ where: { email: 'user@example.com' } }) ||
    await userRepo.save(userRepo.create({
      username: 'user',
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      isActive: true,
      roles: [userRole]
    }));

  console.log(`✅ Created users:`);
  console.log(`   - Admin: admin@example.com / admin123`);
  console.log(`   - User: user@example.com / user123`);
  console.log('🎉 Database seeding completed!');
}
