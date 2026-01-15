import { TypeOfRental } from './property.model';

export interface HeatmapPointDTO {
    neighborhood: string;
    latitude: number;
    longitude: number;
    current_avg_price: number;
    trend_status: string;
    trend_description: string;
}

export interface HeatmapResponseDTO {
    rentalType: TypeOfRental;
    data: HeatmapPointDTO[];
}
