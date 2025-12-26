import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()"
           class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 animate-slide-in flex items-start gap-3"
           [ngClass]="{
             'bg-red-600': toast.type === 'error',
             'bg-green-600': toast.type === 'success',
             'bg-blue-600': toast.type === 'info',
             'bg-yellow-600': toast.type === 'warning'
           }">
        
        <!-- Icon based on type -->
        <div class="mt-0.5">
            <span *ngIf="toast.type === 'success'">✓</span>
            <span *ngIf="toast.type === 'error'">⚠</span>
            <span *ngIf="toast.type === 'info'">ℹ</span>
            <span *ngIf="toast.type === 'warning'">!</span>
        </div>

        <div class="flex-1 text-sm font-medium">
          {{ toast.message }}
        </div>

        <button (click)="toastService.remove(toast.id)" class="text-white/80 hover:text-white transition-colors">
          ✕
        </button>
      </div>
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
