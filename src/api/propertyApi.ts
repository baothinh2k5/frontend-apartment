import axiosClient from './axiosClient';

const PROPERTY_ENDPOINTS = {
  me: '/properties/me',
  approved: '/properties/approved',
  base: '/properties'
} as const;

export const propertyApi = {
  getMyProperties: async (page = 0, size = 10) => {
    return axiosClient.get(PROPERTY_ENDPOINTS.me, { params: { page, size } });
  },

  getApprovedProperties: async (page = 0, size = 10) => {
    return axiosClient.get(PROPERTY_ENDPOINTS.approved, { params: { page, size } });
  },

  searchProperties: async (params: {
    areaId?: number;
    roomTypeId?: number;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    allowPets?: boolean;
    page?: number;
    size?: number;
  }) => {
    return axiosClient.get(`${PROPERTY_ENDPOINTS.base}/search`, { params });
  },

  getPropertyById: async (id: string) => {
    return axiosClient.get(`${PROPERTY_ENDPOINTS.base}/${id}`);
  },

  createProperty: async (formData: FormData) => {
    return axiosClient.post(PROPERTY_ENDPOINTS.base, formData);
  },

  updateProperty: async (id: string, formData: FormData) => {
    return axiosClient.put(`${PROPERTY_ENDPOINTS.base}/${id}`, formData);
  },

  deleteProperty: async (id: string) => {
    return axiosClient.delete(`${PROPERTY_ENDPOINTS.base}/${id}`);
  }
};

export const lookupApi = {
  getAreas: async () => {
    return axiosClient.get('/areas');
  },
  getRoomTypes: async () => {
    return axiosClient.get('/room-types');
  }
};
