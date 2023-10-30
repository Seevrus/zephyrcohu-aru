import { assoc, indexBy, map, pipe, prop } from 'ramda';

import { type PartnersResponseData } from '../response-types/PartnersResponseType';
import { type PartnerLocation } from '../response-types/common/PartnerType';

export type Partners = (Omit<PartnersResponseData[number], 'locations'> & {
  locations: Record<PartnerLocation['locationType'], PartnerLocation>;
})[];

export function mapPartnersResponse(partners: PartnersResponseData): Partners {
  return pipe(
    map((partner: PartnersResponseData[number]) =>
      assoc(
        'locations',
        indexBy(prop('locationType'), partner?.locations),
        partner
      )
    )
  )(partners ?? []);
}
