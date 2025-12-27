import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PropertyCreationRequest, TypeOfRental, RoomCreationRequest, Property, PropertyType } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-create-property',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './create-property.component.html',
    styleUrls: ['./create-property.component.scss']
})
export class CreatePropertyComponent implements OnInit {
    currentStep = 1;
    totalSteps = 4;
    isEditMode = false;
    propertyId: number | null = null;

    property: PropertyCreationRequest = {
        title: '',
        country: '',
        city: '',
        address: '',
        longitude: 0,
        latitude: 0,
        description: '',
        sqM: 0,
        typeOfProperty: PropertyType.APARTMENT,
        typeOfRental: TypeOfRental.MONTHLY,
        rentAmount: 0,
        securityDeposit: 0,
        rooms: []
    };

    rentalTypes = Object.values(TypeOfRental);
    propertyTypes = Object.values(PropertyType);

    // Temporary room input
    newRoomName = '';

    // Map related
    private map: any;
    private marker: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private propertyService: PropertyService,
        private toastService: ToastService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode = true;
                this.propertyId = +id;
                this.loadProperty(id);
            }
        });
    }

    loadProperty(id: string) {
        this.propertyService.getPropertyById(id).subscribe({
            next: (prop: Property) => {
                this.property = {
                    title: prop.title,
                    country: prop.country,
                    city: prop.city,
                    address: prop.address,
                    longitude: prop.longitude || 0,
                    latitude: prop.latitude || 0,
                    description: prop.description,
                    sqM: prop.sqM,
                    typeOfProperty: prop.typeOfProperty,
                    typeOfRental: prop.typeOfRental as TypeOfRental,
                    rentAmount: prop.rentAmount,
                    securityDeposit: prop.securityDeposit,
                    rooms: prop.rooms.map(room => ({
                        name: room.name,
                        orderIndex: room.orderIndex,
                        imageIndexes: [],
                        files: [],
                        existingImages: room.roomImages
                    }))
                };
            },
            error: (err) => {
                console.error('Error loading property', err);
                this.toastService.show('Failed to load property details.', 'error');
                this.router.navigate(['/properties/my-listings']);
            }
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            if (this.currentStep === 2) {
                // Initialize map after view update
                setTimeout(() => {
                    this.initMap();
                }, 100);
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    private async initMap() {
        if (!isPlatformBrowser(this.platformId)) return;

        const L = await import('leaflet');

        // Fix Leaflet marker icon issues
        const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
        const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
        const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

        delete (L.Icon.Default.prototype as any)._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl,
            iconUrl,
            shadowUrl
        });

        // Default to Marrakech if no coordinates
        const lat = this.property.latitude || 31.6295;
        const lng = this.property.longitude || -7.9811;

        if (this.map) {
            this.map.remove();
        }

        this.map = L.map('map').setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        // Add marker if coordinates exist
        if (this.property.latitude && this.property.longitude) {
            this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => {
                const position = this.marker.getLatLng();
                this.updateCoordinates(position.lat, position.lng);
            });
        }

        // Map click handler
        this.map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            if (this.marker) {
                this.marker.setLatLng([lat, lng]);
            } else {
                this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
                this.marker.on('dragend', () => {
                    const position = this.marker.getLatLng();
                    this.updateCoordinates(position.lat, position.lng);
                });
            }
            this.updateCoordinates(lat, lng);
        });
    }

    private updateCoordinates(lat: number, lng: number) {
        this.property.latitude = lat;
        this.property.longitude = lng;
        console.log('Updated coordinates:', lat, lng);
    }

    addRoom() {
        if (this.newRoomName.trim()) {
            const newRoom: RoomCreationRequest = {
                name: this.newRoomName,
                orderIndex: this.property.rooms.length + 1,
                imageIndexes: [],
                files: [],
                existingImages: []
            };
            this.property.rooms.push(newRoom);
            this.newRoomName = '';
        }
    }

    removeRoom(index: number) {
        this.property.rooms.splice(index, 1);
        // Re-index
        this.property.rooms.forEach((room: RoomCreationRequest, i: number) => room.orderIndex = i + 1);
    }

    onFileSelected(event: any, roomIndex: number) {
        const files: FileList = event.target.files;
        if (files) {
            const room = this.property.rooms[roomIndex];
            if (!room.files) {
                room.files = [];
            }
            for (let i = 0; i < files.length; i++) {
                room.files.push(files[i]);
            }
        }
    }

    removeFile(roomIndex: number, fileIndex: number) {
        this.property.rooms[roomIndex].files?.splice(fileIndex, 1);
    }

    removeExistingImage(roomIndex: number, imageIndex: number) {
        this.property.rooms[roomIndex].existingImages?.splice(imageIndex, 1);
    }

    // Image Preview
    previewImage: string | null = null;

    openPreview(url: string) {
        this.previewImage = url;
    }

    closePreview() {
        this.previewImage = null;
    }

    submitProperty() {
        console.log('Submitting Property:', this.property);

        if (this.isEditMode && this.propertyId) {
            this.propertyService.updateProperty(this.propertyId, this.property).subscribe({
                next: (res) => {
                    console.log('Property updated successfully', res);
                    this.toastService.show('Property updated successfully!', 'success');
                    this.router.navigate(['/properties/my-listings']);
                },
                error: (err) => {
                    console.error('Error updating property', err);
                    // Error is already handled by interceptor, but we can show specific message if needed
                }
            });
        } else {
            // Generate random onChainId for now
            this.property.onChainId = Math.floor(Math.random() * 1000000);

            this.propertyService.createPropertyFlow(this.property).subscribe({
                next: (res) => {
                    console.log('Property created successfully', res);
                    this.toastService.show('Property created successfully!', 'success');
                    this.router.navigate(['/properties/my-listings']);
                },
                error: (err) => {
                    console.error('Error creating property', err);
                    // Error is already handled by interceptor
                }
            });
        }
    }
}
