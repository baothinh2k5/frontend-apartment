import axiosClient from './axiosClient';

export interface AiSearchCriteria {
  roomType?: string;
  area?: string;
  bedrooms?: number;
  allowPets?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PropertyImage {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
  sortOrder: number;
}

export interface Property {
  id: string;
  hostId: string;
  hostName: string;
  areaId: number;
  areaName: string;
  roomTypeId: number;
  roomTypeName: string;
  title: string;
  description: string;
  addressLine: string;
  monthlyPrice: number;
  areaM2: number;
  bedrooms: number;
  allowPets: boolean;
  status: string;
  images: PropertyImage[];
}

export interface AiSearchResponse {
  replyMessage: string;
  extractedCriteria: AiSearchCriteria;
  properties: Property[];
}

export const searchWithAI = async (message: string): Promise<AiSearchResponse> => {
  try {
    const response = await axiosClient.post<AiSearchResponse>('/api/v1/ai/search', {
      message: message
    });
    // axiosClient.js has an interceptor that already returns response.data
    // We cast to any then AiSearchResponse to satisfy TS while keeping runtime correctness
    return (response as any) as AiSearchResponse;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      throw new Error(error.response.data.message || 'Đã chạm đến giới hạn gửi request AI');
    }
    throw new Error('Dịch vụ AI hiện tại không sẵn sàng. Vui lòng thử lại sau.');
  }
};
