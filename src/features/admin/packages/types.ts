export type AdminPackagePricingTier = {
  id?: string;
  name: string;
  nameAr: string;
  price: number;
  durationDays: number | null;
  isActive?: boolean;
};

export type AdminPackage = {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  isActive: boolean;
  isRecommended: boolean;
  courses?: Array<{
    id: string;
    courseId: string;
    course?: {
      id: string;
      title: string;
      price: number;
    };
  }>;
  pricingTiers?: AdminPackagePricingTier[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePackageInput = {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  isActive?: boolean;
  courseIds?: string[];
  pricingTiers?: AdminPackagePricingTier[];
};

export type UpdatePackageInput = Partial<CreatePackageInput>;
