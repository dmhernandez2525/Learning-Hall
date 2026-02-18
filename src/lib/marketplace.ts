import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  MarketplaceListing,
  MarketplacePurchase,
  MarketplaceReview,
  MarketplaceAnalytics,
} from '@/types/marketplace';

function mapTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

export function formatListing(doc: Record<string, unknown>): MarketplaceListing {
  const seller = doc.seller as string | Record<string, unknown>;
  const course = doc.course as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    sellerId: typeof seller === 'object' ? String(seller.id) : String(seller ?? ''),
    sellerName: typeof seller === 'object'
      ? String((seller as Record<string, unknown>).name ?? (seller as Record<string, unknown>).email ?? '')
      : '',
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    courseTitle: typeof course === 'object'
      ? String((course as Record<string, unknown>).title ?? '')
      : '',
    price: Number(doc.price ?? 0),
    currency: String(doc.currency ?? 'USD'),
    licenseType: (doc.licenseType as MarketplaceListing['licenseType']) ?? 'single-use',
    licenseDurationDays: doc.licenseDurationDays != null ? Number(doc.licenseDurationDays) : null,
    status: (doc.status as MarketplaceListing['status']) ?? 'draft',
    category: String(doc.category ?? ''),
    tags: mapTags(doc.tags),
    previewUrl: String(doc.previewUrl ?? ''),
    thumbnailUrl: String(doc.thumbnailUrl ?? ''),
    rating: Number(doc.rating ?? 0),
    reviewCount: Number(doc.reviewCount ?? 0),
    purchaseCount: Number(doc.purchaseCount ?? 0),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatPurchase(doc: Record<string, unknown>): MarketplacePurchase {
  const listing = doc.listing as string | Record<string, unknown>;
  const buyer = doc.buyer as string | Record<string, unknown>;
  const seller = doc.seller as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    listingId: typeof listing === 'object' ? String(listing.id) : String(listing ?? ''),
    buyerId: typeof buyer === 'object' ? String(buyer.id) : String(buyer ?? ''),
    sellerId: typeof seller === 'object' ? String(seller.id) : String(seller ?? ''),
    price: Number(doc.price ?? 0),
    currency: String(doc.currency ?? 'USD'),
    licenseType: (doc.licenseType as MarketplacePurchase['licenseType']) ?? 'single-use',
    licenseExpiresAt: doc.licenseExpiresAt ? String(doc.licenseExpiresAt) : null,
    status: (doc.status as MarketplacePurchase['status']) ?? 'pending',
    purchasedAt: String(doc.createdAt ?? ''),
  };
}

export function formatReview(doc: Record<string, unknown>): MarketplaceReview {
  const listing = doc.listing as string | Record<string, unknown>;
  const reviewer = doc.reviewer as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    listingId: typeof listing === 'object' ? String(listing.id) : String(listing ?? ''),
    reviewerId: typeof reviewer === 'object' ? String(reviewer.id) : String(reviewer ?? ''),
    reviewerName: typeof reviewer === 'object'
      ? String((reviewer as Record<string, unknown>).name ?? (reviewer as Record<string, unknown>).email ?? '')
      : '',
    rating: Number(doc.rating ?? 0),
    comment: String(doc.comment ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Listings ---------------

export async function listMarketplaceItems(
  filters?: { category?: string; search?: string; sellerId?: string }
): Promise<MarketplaceListing[]> {
  const payload = await getPayloadClient();
  const where: Where = { status: { equals: 'active' } };

  if (filters?.category) {
    where.category = { equals: filters.category };
  }
  if (filters?.sellerId) {
    where.seller = { equals: filters.sellerId };
  }

  const result = await payload.find({
    collection: 'marketplace-listings',
    where,
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  });

  let listings = result.docs.map((doc) =>
    formatListing(doc as Record<string, unknown>)
  );

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term) ||
        l.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  return listings;
}

export async function getListing(id: string): Promise<MarketplaceListing | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({
      collection: 'marketplace-listings',
      id,
      depth: 1,
    });
    if (!doc) return null;
    return formatListing(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateListingInput {
  title: string;
  description: string;
  courseId: string;
  price: number;
  currency?: string;
  licenseType?: MarketplaceListing['licenseType'];
  licenseDurationDays?: number;
  category?: string;
  tags?: string[];
  previewUrl?: string;
  thumbnailUrl?: string;
}

export async function createListing(
  input: CreateListingInput,
  user: User
): Promise<MarketplaceListing> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'marketplace-listings',
    data: {
      title: input.title,
      description: input.description,
      seller: user.id,
      course: input.courseId,
      price: input.price,
      currency: input.currency ?? 'USD',
      licenseType: input.licenseType ?? 'single-use',
      licenseDurationDays: input.licenseDurationDays,
      status: 'draft',
      category: input.category ?? '',
      tags: input.tags ?? [],
      previewUrl: input.previewUrl ?? '',
      thumbnailUrl: input.thumbnailUrl ?? '',
      rating: 0,
      reviewCount: 0,
      purchaseCount: 0,
      tenant: user.tenant,
    },
  });
  return formatListing(doc as Record<string, unknown>);
}

export async function updateListing(
  id: string,
  data: Partial<CreateListingInput & { status: MarketplaceListing['status'] }>
): Promise<MarketplaceListing> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.courseId) {
    updateData.course = data.courseId;
    delete updateData.courseId;
  }
  const doc = await payload.update({
    collection: 'marketplace-listings',
    id,
    data: updateData,
  });
  return formatListing(doc as Record<string, unknown>);
}

// --------------- Purchases ---------------

export async function purchaseListing(
  listingId: string,
  user: User
): Promise<MarketplacePurchase> {
  const payload = await getPayloadClient();
  const listing = await payload.findByID({
    collection: 'marketplace-listings',
    id: listingId,
    depth: 0,
  });
  const raw = listing as Record<string, unknown>;

  const sellerId = typeof raw.seller === 'object'
    ? String((raw.seller as Record<string, unknown>).id)
    : String(raw.seller ?? '');

  if (sellerId === user.id) {
    throw new Error('Cannot purchase your own listing');
  }

  const licenseType = String(raw.licenseType ?? 'single-use');
  let licenseExpiresAt: string | undefined;
  if (licenseType === 'time-limited' && raw.licenseDurationDays) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(raw.licenseDurationDays));
    licenseExpiresAt = expiry.toISOString();
  }

  const doc = await payload.create({
    collection: 'marketplace-purchases',
    data: {
      listing: listingId,
      buyer: user.id,
      seller: sellerId,
      price: Number(raw.price ?? 0),
      currency: String(raw.currency ?? 'USD'),
      licenseType,
      licenseExpiresAt,
      status: 'completed',
      tenant: user.tenant,
    },
  });

  await payload.update({
    collection: 'marketplace-listings',
    id: listingId,
    data: { purchaseCount: Number(raw.purchaseCount ?? 0) + 1 },
  });

  return formatPurchase(doc as Record<string, unknown>);
}

export async function listPurchasesForUser(
  userId: string
): Promise<MarketplacePurchase[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'marketplace-purchases',
    where: { buyer: { equals: userId } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatPurchase(doc as Record<string, unknown>));
}

// --------------- Reviews ---------------

export async function addReview(
  listingId: string,
  rating: number,
  comment: string,
  user: User
): Promise<MarketplaceReview> {
  const payload = await getPayloadClient();

  const doc = await payload.create({
    collection: 'marketplace-reviews',
    data: {
      listing: listingId,
      reviewer: user.id,
      rating,
      comment,
      tenant: user.tenant,
    },
  });

  await recalculateListingRating(listingId);
  return formatReview(doc as Record<string, unknown>);
}

export async function listReviewsForListing(
  listingId: string
): Promise<MarketplaceReview[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'marketplace-reviews',
    where: { listing: { equals: listingId } },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => formatReview(doc as Record<string, unknown>));
}

async function recalculateListingRating(listingId: string): Promise<void> {
  const payload = await getPayloadClient();
  const reviews = await payload.find({
    collection: 'marketplace-reviews',
    where: { listing: { equals: listingId } },
    limit: 500,
    depth: 0,
  });

  const count = reviews.docs.length;
  if (count === 0) return;

  let sum = 0;
  for (const doc of reviews.docs) {
    const raw = doc as Record<string, unknown>;
    sum += Number(raw.rating ?? 0);
  }

  const avg = Math.round((sum / count) * 10) / 10;
  await payload.update({
    collection: 'marketplace-listings',
    id: listingId,
    data: { rating: avg, reviewCount: count },
  });
}

// --------------- Analytics ---------------

export async function getMarketplaceAnalytics(
  sellerId?: string
): Promise<MarketplaceAnalytics> {
  const payload = await getPayloadClient();
  const listingWhere: Where = sellerId
    ? { seller: { equals: sellerId } }
    : {};

  const listings = await payload.find({
    collection: 'marketplace-listings',
    where: listingWhere,
    limit: 200,
    depth: 0,
  });

  let activeListings = 0;
  let totalRating = 0;
  let ratingCount = 0;
  const categoryMap = new Map<string, number>();

  for (const doc of listings.docs) {
    const raw = doc as Record<string, unknown>;
    if (String(raw.status) === 'active') activeListings += 1;
    const r = Number(raw.rating ?? 0);
    if (r > 0) {
      totalRating += r;
      ratingCount += 1;
    }
    const cat = String(raw.category ?? 'Uncategorized');
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
  }

  const purchaseWhere: Where = sellerId
    ? { seller: { equals: sellerId } }
    : {};

  const purchases = await payload.find({
    collection: 'marketplace-purchases',
    where: purchaseWhere,
    limit: 500,
    depth: 0,
  });

  let totalRevenue = 0;
  for (const doc of purchases.docs) {
    const raw = doc as Record<string, unknown>;
    if (String(raw.status) === 'completed') {
      totalRevenue += Number(raw.price ?? 0);
    }
  }

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalListings: listings.docs.length,
    activeListings,
    totalPurchases: purchases.docs.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
    topCategories,
  };
}
