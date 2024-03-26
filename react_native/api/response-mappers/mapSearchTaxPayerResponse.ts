import { formatISO } from 'date-fns';

import { type PartnerLocation } from '../response-types/common/PartnerType';
import { type SearchTaxNumberResponseData } from '../response-types/SearchTaxNumberResponseType';

export type TaxPayer = {
  id: number;
  vatNumber: string;
  locations: {
    C?: PartnerLocation;
    D: PartnerLocation;
  };
};

export function mapSearchTaxPayerResponse(
  response: SearchTaxNumberResponseData
): TaxPayer[] {
  const now = formatISO(new Date());

  if (Array.isArray(response.addressList)) {
    const hqAddress = response.addressList.find(
      (address) => address.taxpayerAddressType === 'HQ'
    );

    const centralAddress = hqAddress
      ? ({
          name: response?.name ?? '',
          locationType: 'C',
          country: hqAddress.taxpayerAddress?.countryCode,
          postalCode: hqAddress.taxpayerAddress?.postalCode,
          city: hqAddress.taxpayerAddress?.city,
          address: [
            hqAddress.taxpayerAddress?.streetName,
            hqAddress.taxpayerAddress?.publicPlaceCategory,
            hqAddress.taxpayerAddress?.number,
          ].join(' '),
          createdAt: now,
          updatedAt: now,
        } as const)
      : undefined;

    const siteAddresses = response?.addressList.filter(
      (address) => address.taxpayerAddressType === 'SITE'
    );

    return siteAddresses.map(({ taxpayerAddress: address }, idx) => ({
      id: idx + 1,
      vatNumber: response?.taxNumber,
      locations: {
        ...(centralAddress && { C: centralAddress }),
        D: {
          name: response?.name ?? '',
          locationType: 'D',
          country: address?.countryCode,
          postalCode: address?.postalCode,
          city: address?.city,
          address: [
            address?.streetName,
            address?.publicPlaceCategory,
            address?.number,
          ].join(' '),
          createdAt: now,
          updatedAt: now,
        },
      },
    }));
  }

  const address = response?.addressList?.taxpayerAddress;

  return [
    {
      id: 1,
      vatNumber: response?.taxNumber,
      locations: {
        D: {
          name: response?.name ?? '',
          locationType: 'D',
          country: address?.countryCode ?? '',
          postalCode: address?.postalCode ?? '',
          city: address?.city ?? '',
          address: [
            address?.streetName,
            address?.publicPlaceCategory,
            address?.number,
          ].join(' '),
          createdAt: now,
          updatedAt: now,
        },
      },
    },
  ];
}
