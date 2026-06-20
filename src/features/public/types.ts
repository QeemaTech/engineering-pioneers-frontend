/** Pagination envelope from `successResponse` `meta` on public course list */
export type PublicPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PublicPackage = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMonths: number;
  isActive: boolean;
  isRecommended: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicCohortSummary = {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate?: string | null;
  price: number;
  instructor?: {
    id: string;
    fullName: string;
    avatar?: string | null;
    bio?: string | null;
  } | null;
  _count?: { enrollments: number };
};

export type PublicCourseCategory = {
  id: string;
  name: string;
  slug: string;
} | null;

export type PublicCourseListItem = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  category?: PublicCourseCategory;
  instructor?: PublicCohortSummary["instructor"] | null;
  availableCohorts: PublicCohortSummary[];
  _count: { cohorts: number };
};

export type PublicCoursesListResult = {
  courses: PublicCourseListItem[];
  meta: PublicPaginationMeta | null;
};

export type PublicCourseDetail = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  introVideoUrl?: string | null;
  category?: PublicCourseCategory;
  instructor?: PublicCohortSummary["instructor"] | null;
  availableCohorts: PublicCohortSummary[];
  _count: { cohorts: number };
};

export type PublicPostAuthor = {
  fullName: string;
};

export type PublicPostListItem = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  excerpt: string | null;
  createdAt: string;
  updatedAt: string;
  author: PublicPostAuthor;
};

export type PublicPostsListResult = {
  posts: PublicPostListItem[];
  meta: PublicPaginationMeta | null;
};

export type PublicPostDetail = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  content: unknown;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: PublicPostAuthor;
};
