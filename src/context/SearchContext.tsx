import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { lookupApi } from '../api/propertyApi';

export interface SearchFilters {
  areaId?: number;
  roomTypeId?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  allowPets?: string;
  keyword?: string;
  amenityIds?: string[];
}

interface LookupItem {
  id: number;
  name: string;
}

interface SearchContextType {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  triggerSearch: () => void;
  resetSearch: () => void;
  searchVersion: number;
  areas: LookupItem[];
  roomTypes: LookupItem[];
  loadingLookups: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchVersion, setSearchVersion] = useState(0);
  const [areas, setAreas] = useState<LookupItem[]>([]);
  const [roomTypes, setRoomTypes] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const triggerSearch = useCallback(() => {
    setSearchVersion((v) => v + 1);
  }, []);

  const resetSearch = useCallback(() => {
    setFilters({});
    setSearchVersion(0);
  }, []);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoadingLookups(true);
        const [areasRes, roomTypesRes] = await Promise.all([
          lookupApi.getAreas(),
          lookupApi.getRoomTypes(),
        ]);
        
        // Handle both Wrapped ApiResponse { data: [...] } and direct array from interceptor
        setAreas((areasRes.data || areasRes) as LookupItem[]);
        setRoomTypes((roomTypesRes.data || roomTypesRes) as LookupItem[]);
      } catch (err) {
        console.error('Failed to fetch lookup data in SearchProvider:', err);
      } finally {
        setLoadingLookups(false);
      }
    };

    fetchLookups();
  }, []);

  return (
    <SearchContext.Provider 
      value={{ 
        filters, 
        setFilters, 
        triggerSearch, 
        resetSearch,
        searchVersion, 
        areas, 
        roomTypes,
        loadingLookups 
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
