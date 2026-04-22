import { Wifi, Wind, Trash2, Tv, Bed, Waves, Dumbbell, Car, ArrowUpCircle, Home } from "lucide-react";

export const IconMap: Record<string, any> = {
  'wifi': Wifi,
  'ac_unit': Wind,
  'cleaning_services': Trash2,
  'tv': Tv,
  'bed': Bed,
  'pool': Waves,
  'fitness_center': Dumbbell,
  'local_parking': Car,
  'elevator': ArrowUpCircle,
  'Wifi': Wifi,
  'Wind': Wind,
  'Tv': Tv,
  'Bed': Bed,
  'Car': Car,
};

export const getAmenityIcon = (iconName: string) => {
  return IconMap[iconName] || Home;
};
