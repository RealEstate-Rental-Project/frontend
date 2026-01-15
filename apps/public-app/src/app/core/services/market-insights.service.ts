import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeatmapResponseDTO } from '../models/heatmap.model';
import { TypeOfRental } from '../models/property.model';
import { API_CONSTANTS } from '../constants/api.constants';

@Injectable({
    providedIn: 'root'
})
export class MarketInsightsService {

    constructor(private http: HttpClient) { }

    getMarketHeatmap(type: TypeOfRental): Observable<HeatmapResponseDTO> {
        return this.http.get<HeatmapResponseDTO>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.HEATMAP}`,
            { params: { type } }
        );
    }
}
