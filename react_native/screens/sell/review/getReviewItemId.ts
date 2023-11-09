import { type ReviewItem } from '../../../atoms/sellFlow';

export function getReviewItemId(item: ReviewItem | null) {
  return item?.type === 'item'
    ? `item-${item?.itemId}-${item?.expirationId}`
    : `otherItem-${item?.itemId}`;
}
