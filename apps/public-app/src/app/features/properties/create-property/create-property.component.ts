import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  PropertyCreationRequest,
  TypeOfRental,
  RoomCreationRequest,
  Property,
  PropertyType,
} from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { MAD_PER_ETH_TEST } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-property.component.html',
  styleUrls: ['./create-property.component.scss'],
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
    rooms: [],
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
    private blockchainService: BlockchainService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
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
          rooms: prop.rooms.map((room) => ({
            name: room.name,
            orderIndex: room.orderIndex,
            imageIndexes: [],
            files: [],
            existingImages: room.roomImages,
          })),
        };
      },
      error: (err) => {
        console.error('Error loading property', err);
        this.toastService.show('Failed to load property details.', 'error');
        this.router.navigate(['/properties/my-listings']);
      },
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

    const leafletModule = await import('leaflet');
    const L = (leafletModule as any).default || leafletModule;

    // Fix Leaflet marker icon issues
    const iconRetinaUrl =
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl =
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl =
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    // Default to Marrakech if no coordinates
    const lat = this.property.latitude || 31.6295;
    const lng = this.property.longitude || -7.9811;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
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
        existingImages: [],
      };
      this.property.rooms.push(newRoom);
      this.newRoomName = '';
    }
  }

  removeRoom(index: number) {
    this.property.rooms.splice(index, 1);
    // Re-index
    this.property.rooms.forEach(
      (room: RoomCreationRequest, i: number) => (room.orderIndex = i + 1)
    );
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

  async submitProperty() {
    console.log('Submitting Property:', this.property);

    if (this.isEditMode && this.propertyId) {
      this.propertyService
        .updateProperty(this.propertyId, this.property)
        .subscribe({
          next: (res) => {
            console.log('Property updated successfully', res);
            this.toastService.show('Property updated successfully!', 'success');
            this.router.navigate(['/properties/my-listings']);
          },
          error: (err) => {
            console.error('Error updating property', err);
            this.toastService.show('Error updating property', 'error');
          },
        });
    } else {
      try {
        this.toastService.show(
          'Please confirm the transaction in MetaMask...',
          'info'
        );

        // Convert MAD (frontend) to ETH (smart contract) using test ratio
        const rentEth = (
          this.property.rentAmount / MAD_PER_ETH_TEST
        ).toString();
        const depositEth = (
          this.property.securityDeposit / MAD_PER_ETH_TEST
        ).toString();

        // 1. Blockchain Call
        const result = await this.blockchainService.listProperty(
          this.property.address,
          this.property.description,
          rentEth,
          depositEth,
          this.property.typeOfRental === TypeOfRental.DAILY ? 1 : 0
        );

        console.log('Blockchain transaction successful:', result);
        this.toastService.show(
          'Transaction confirmed! Saving to database...',
          'success'
        );

        // 2. Set onChainId
        this.property.onChainId = result.propertyId;

        // 3. Backend Call
        this.propertyService.createPropertyFlow(this.property).subscribe({
          next: (res) => {
            console.log('Property created successfully', res);
            this.toastService.show('Property listed successfully!', 'success');
            this.router.navigate(['/properties/my-listings']);
          },
          error: (err) => {
            console.error('Error creating property in DB', err);
            this.toastService.show(
              'CRITICAL: Property on blockchain but failed to save in DB. Please contact support.',
              'error'
            );
            // Ideally we would have a retry mechanism or a way to manually sync
          },
        });
      } catch (error: any) {
        console.error('Error listing property:', error);
        if (error.code === 'ACTION_REJECTED') {
          this.toastService.show('Transaction rejected by user.', 'error');
        } else {
          this.toastService.show(
            'Failed to list property on blockchain.',
            'error'
          );
        }
      }
    }
  }
}
