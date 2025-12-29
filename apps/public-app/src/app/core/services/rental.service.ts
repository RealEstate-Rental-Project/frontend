import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RentalRequest, RentalRequestDTO } from '../models/rental.model';
import { API_CONSTANTS } from '../constants/api.constants';

import { PropertyService } from './property.service';
import { UserService } from './user.service';
import { StorageUtils } from '../../features/auth/utils/storage.utils';
import { switchMap, map, catchError } from 'rxjs/operators';
import { from, of, forkJoin } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RentalService {

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private propertyService: PropertyService
    ) { }

    createRentalRequest(dto: RentalRequestDTO): Observable<any> {
        return this.http.post(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_AGREEMENT.BASE}`,
            dto
        );
    }

    getMyRentalRequests(): Observable<RentalRequest[]> {
        const wallet = StorageUtils.getwallet();
        if (!wallet) {
            return of([]);
        }

        return from(this.userService.getUserByWallet(wallet)).pipe(
            switchMap(user => {
                if (!user || !user.id) {
                    throw new Error('User not found or missing ID');
                }
                const tenantId = Number(user.id);
                return this.http.get<RentalRequest[]>(
                    `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_AGREEMENT.BY_TENANT(tenantId)}`
                );
            }),
            switchMap(requests => {
                if (requests.length === 0) return of([]);

                // Hydrate with property details and mock dates
                const hydratedRequests$ = requests.map(req =>
                    this.propertyService.getPropertyById(String(req.propertyId)).pipe(
                        map(property => ({
                            ...req,
                            startDate: req.startDate || new Date().toISOString(), // Mock if missing
                            endDate: req.endDate || new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // Mock if missing
                            property: property // Attach full property object
                        })),
                        catchError(() => of({
                            ...req,
                            startDate: req.startDate || new Date().toISOString(),
                            endDate: req.endDate || new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                            property: null
                        }))
                    )
                );
                return forkJoin(hydratedRequests$);
            })
        );
    }

    getRequestsByPropertyId(propertyId: number): Observable<RentalRequest[]> {
        return this.http.get<RentalRequest[]>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_AGREEMENT.BY_PROPERTY(propertyId)}`
        );
    }

    updateRequestStatus(requestId: number, status: string): Observable<any> {
        return this.http.put(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_AGREEMENT.UPDATE_STATUS(requestId)}`,
            { status }
        );
    }

    createContract(contractData: any): Observable<any> {
        return this.http.post(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_CONTRACTS.BASE}`,
            contractData
        );
    }

    getMyContracts(): Observable<any[]> {
        return this.http.get<any[]>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_CONTRACTS.USER_ME}`
        ).pipe(
            switchMap(contracts => {
                if (!contracts || contracts.length === 0) return of([]);

                const hydratedContracts$ = contracts.map(contract => {
                    if (!contract.propertyId) {
                        return of({ ...contract, property: null });
                    }
                    return this.propertyService.getPropertyById(String(contract.propertyId)).pipe(
                        map(property => ({
                            ...contract,
                            property: property
                        })),
                        catchError(() => of({ ...contract, property: null }))
                    );
                });

                return forkJoin(hydratedContracts$);
            })
        );
    }

    confirmKeyDelivery(contractId: number): Observable<any> {
        return this.http.put(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_CONTRACTS.KEY_DELIVERY(contractId)}`,
            { isKeyDelivered: true }
        );
    }
}
