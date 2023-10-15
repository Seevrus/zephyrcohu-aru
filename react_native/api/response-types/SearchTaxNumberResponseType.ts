type Address = {
  taxpayerAddressType: 'HQ' | 'SITE';
  taxpayerAddress: {
    countryCode: string;
    postalCode: string;
    city: string;
    streetName: string;
    publicPlaceCategory: string;
    number: string;
  };
};

export type SearchTaxNumberResponseData = {
  infoDate: string | null; // UTC
  validity: boolean;
  name: string | null;
  shortName: string | null;
  taxNumber: string;
  addressList: Address | Address[] | null;
};

export type SearchTaxNumberResponseType = {
  data: SearchTaxNumberResponseData;
};
