import axiosClient from "./axiosClient";

export interface Amenity {
  id: string;
  nameCode: string;
  name: string;
  icon: string;
  type: 'BOOLEAN' | 'NUMBER' | 'PRICE';
}

export interface AmenityValue {
  amenityId: string;
  nameCode: string;
  name: string;
  icon: string;
  type: 'BOOLEAN' | 'NUMBER' | 'PRICE';
  value: string;
}

export interface AmenitySet {
  id: string;
  name: string;
  isSystem: boolean;
  values: AmenityValue[];
}

export const amenityApi = {
  getAmenities: (lang: string = 'vi'): Promise<Amenity[]> => {
    return axiosClient.get(`/amenities`, { params: { lang } });
  },

  getAmenitySets: (lang: string = 'vi'): Promise<AmenitySet[]> => {
    return axiosClient.get(`/amenities/sets`, { params: { lang } });
  },

  createAmenitySet: (data: { name: string; values: { nameCode: string; value: string }[] }): Promise<AmenitySet> => {
    return axiosClient.post(`/amenities/sets`, data);
  },

  updateAmenitySet: (id: string, data: { name: string; values: { nameCode: string; value: string }[] }): Promise<AmenitySet> => {
    return axiosClient.put(`/amenities/sets/${id}`, data);
  },

  deleteAmenitySet: (id: string): Promise<void> => {
    return axiosClient.delete(`/amenities/sets/${id}`);
  }
};
