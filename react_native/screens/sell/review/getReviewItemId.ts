import { type ReviewItem } from './Review';

export function getReviewItemId(item: ReviewItem | null) {
  return item?.type === 'item'
    ? `item-${item?.itemId}-${item?.expirationId}`
    : `otherItem-${item?.itemId}`;
}
