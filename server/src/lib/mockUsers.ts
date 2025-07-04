export type UserRole = 'admin' | 'contributor';

export interface MockUser {
  username: string;
  role: UserRole;
}

export const mockUsers: Record<string, MockUser> = {
  netrunnerX: {
    username: 'netrunnerX',
    role: 'contributor',
  },
  reliefAdmin: {
    username: 'reliefAdmin',
    role: 'admin',
  },
};
