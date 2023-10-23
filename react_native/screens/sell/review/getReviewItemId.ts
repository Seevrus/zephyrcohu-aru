import { ReviewItem } from '../../../providers/sell-flow-hooks/useReview';

export default function getReviewItemId(item: ReviewItem) {
  return item.type === 'item'
    ? `item-${item.itemId}-${item.expirationId}`
    : `otherItem-${item.itemId}`;
}
