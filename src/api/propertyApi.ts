import axiosClient from './axiosClient';

const PROPERTY_ENDPOINTS = {
  me: '/api/v1/properties/me',
  approved: '/api/v1/properties/approved',
  base: '/api/v1/properties'
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
    return axiosClient.post(PROPERTY_ENDPOINTS.base, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateProperty: async (id: string, formData: FormData) => {
    return axiosClient.put(`${PROPERTY_ENDPOINTS.base}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProperty: async (id: string) => {
    return axiosClient.delete(`${PROPERTY_ENDPOINTS.base}/${id}`);
  }
};

export const lookupApi = {
  getAreas: async () => {
    return axiosClient.get('/api/v1/areas');
  },
  getRoomTypes: async () => {
    return axiosClient.get('/api/v1/room-types');
  }
};
