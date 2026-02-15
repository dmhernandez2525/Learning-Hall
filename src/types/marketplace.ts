export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  sellerId: string;
  sellerName: string;
  courseId: string;
  courseTitle: string;
  price: number;
  currency: string;
  licenseType: 'single-use' | 'unlimited' | 'time-limited';
  licenseDurationDays: number | null;
  status: 'draft' | 'active' | 'suspended' | 'archived';
  category: string;
  tags: string[];
  previewUrl: string;
  thumbnailUrl: string;
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  createdAt: string;
}

export interface MarketplacePurchase {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  currency: string;
  licenseType: MarketplaceListing['licenseType'];
  licenseExpiresAt: string | null;
  status: 'pending' | 'completed' | 'refunded';
  purchasedAt: string;
}

export interface MarketplaceReview {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MarketplaceAnalytics {
  totalListings: number;
  activeListings: number;
  totalPurchases: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: Array<{ category: string; count: number }>;
}
