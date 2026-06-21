/** Pagination envelope from `successResponse` `meta` on public course list */
export type PublicPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CourseType = "HYBRID" | "RECORDED";

export type PublicLiveSession = {
  id: string;
  title: string | null;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  price?: number | null;
};

export type PublicCourseCategory = {
  id: string;
  name: string;
  slug: string;
} | null;

export type PublicInstructor = {
  id: string;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
} | null;

export type PublicCourseListItem = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  type: CourseType;
  price: number;
  isLifetimePurchasable: boolean;
  category?: PublicCourseCategory;
  instructor?: PublicInstructor;
  _count: { purchases: number };
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
  type: CourseType;
  price: number;
  isLifetimePurchasable: boolean;
  category?: PublicCourseCategory;
  instructor?: PublicInstructor;
  liveSessions: PublicLiveSession[];
  _count: { purchases: number };
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
