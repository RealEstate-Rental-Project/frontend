import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyCreationRequest, TypeOfRental, RoomCreationRequest } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';

@Component({
    selector: 'app-create-property',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './create-property.component.html',
    styleUrls: ['./create-property.component.scss']
})
export class CreatePropertyComponent {
    currentStep = 1;
    totalSteps = 4;

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
        private propertyService: PropertyService
    ) { }

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
                files: []
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

    submitProperty() {
        console.log('Submitting Property:', this.property);

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
