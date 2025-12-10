import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PropertyCreationRequest, TypeOfRental, RoomCreationRequest, Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';

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
        description: '',
        typeOfRental: TypeOfRental.LONG_TERM,
        rentPerMonth: 0,
        securityDeposit: 0,
        rooms: []
    };

    rentalTypes = Object.values(TypeOfRental);

    // Temporary room input
    newRoomName = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private propertyService: PropertyService
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
                    description: prop.description,
                    typeOfRental: prop.typeOfRental as TypeOfRental,
                    rentPerMonth: prop.rentPerMonth,
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
                alert('Failed to load property details.');
                this.router.navigate(['/properties/my-listings']);
            }
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
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
                    alert('Property updated successfully!');
                    this.router.navigate(['/properties/my-listings']);
                },
                error: (err) => {
                    console.error('Error updating property', err);
                    alert('Failed to update property. See console for details.');
                }
            });
        } else {
            this.propertyService.createPropertyFlow(this.property).subscribe({
                next: (res) => {
                    console.log('Property created successfully', res);
                    alert('Property created successfully!');
                    this.router.navigate(['/properties/my-listings']);
                },
                error: (err) => {
                    console.error('Error creating property', err);
                    alert('Failed to create property. See console for details.');
                }
            });
        }
    }
}
