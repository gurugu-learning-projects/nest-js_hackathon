export type UserPublicProfile = {
  id: string;
  email: string;
  name: string;
  role: 'PARTICIPANT' | 'ADMIN';
};

export const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;
