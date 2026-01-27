import { getPayloadClient } from '@/lib/payload';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'instructor' | 'student';
  tenant?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  expires: string;
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    });

    if (result.user && result.user.email) {
      return {
        id: String(result.user.id),
        email: result.user.email,
        name: result.user.name || undefined,
        role: (result.user.role as User['role']) || 'student',
        tenant: result.user.tenant ? String(result.user.tenant) : undefined,
        createdAt: result.user.createdAt || new Date().toISOString(),
        updatedAt: result.user.updatedAt || new Date().toISOString(),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<User | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.create({
      collection: 'users',
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'student',
      },
    });

    if (!result.email) return null;

    return {
      id: String(result.id),
      email: result.email,
      name: result.name || undefined,
      role: (result.role as User['role']) || 'student',
      tenant: result.tenant ? String(result.tenant) : undefined,
      createdAt: result.createdAt || new Date().toISOString(),
      updatedAt: result.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.findByID({
      collection: 'users',
      id,
    });

    if (result && result.email) {
      return {
        id: String(result.id),
        email: result.email,
        name: result.name || undefined,
        role: (result.role as User['role']) || 'student',
        tenant: result.tenant ? String(result.tenant) : undefined,
        createdAt: result.createdAt || new Date().toISOString(),
        updatedAt: result.updatedAt || new Date().toISOString(),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function updateUserPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  try {
    const payload = await getPayloadClient();

    await payload.update({
      collection: 'users',
      id,
      data: {
        password: newPassword,
      },
    });

    return true;
  } catch {
    return false;
  }
}
