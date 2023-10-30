import { type ReviewItem } from '../../../providers/sell-flow-hooks/useReview';

export function getReviewItemId(item: ReviewItem | null) {
  return item?.type === 'item'
    ? `item-${item?.itemId}-${item?.expirationId}`
    : `otherItem-${item?.itemId}`;
}
