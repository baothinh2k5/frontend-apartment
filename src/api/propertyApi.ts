import axiosClient from './axiosClient';

const PROPERTY_ENDPOINTS = {
  me: '/api/v1/properties/me',
  base: '/api/v1/properties'
} as const;

export const propertyApi = {
  getMyProperties: async (page = 0, size = 10) => {
    return axiosClient.get(PROPERTY_ENDPOINTS.me, { params: { page, size } });
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
