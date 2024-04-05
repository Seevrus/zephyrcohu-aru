import { assoc, indexBy, map, pipe, prop } from 'ramda';

import { type PartnerLocation } from '../response-types/common/PartnerType';
import { type PartnersResponseData } from '../response-types/PartnersResponseType';

export type Partner = Omit<PartnersResponseData[number], 'locations'> & {
  locations: Record<PartnerLocation['locationType'], PartnerLocation>;
};

export type Partners = Partner[];

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
