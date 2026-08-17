export type HackathonRecord = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};
