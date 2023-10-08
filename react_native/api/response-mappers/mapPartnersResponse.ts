import { assoc, indexBy, map, pipe, prop } from 'ramda';
import { PartnersResponseData } from '../response-types/PartnersResponseType';
import { PartnerLocation } from '../response-types/common/PartnerType';

export type Partners = (Omit<PartnersResponseData[number], 'locations'> & {
  locations: Record<PartnerLocation['locationType'], PartnerLocation>;
})[];

export default function mapPartnersResponse(partners: PartnersResponseData): Partners {
  return pipe(
    map((partner: PartnersResponseData[number]) =>
      assoc('locations', indexBy(prop('locationType'), partner.locations), partner)
    )
  )(partners);
}
