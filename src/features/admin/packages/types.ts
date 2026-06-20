export type AdminPackage = {
  id: string;
  name: string;
  description?: string | null;
  durationMonths: number;
  price: number;
  isActive: boolean;
  isRecommended: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePackageInput = {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  isActive?: boolean;
  isRecommended?: boolean;
};

export type UpdatePackageInput = Partial<CreatePackageInput>;
