import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    @Input() wallet: string | null = null;
    @Output() registerSuccess = new EventEmitter<void>();

    registerForm: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.registerForm = this.fb.group({
            username: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            description: [''],
            role: ['ROLE_USER', Validators.required]
        });
    }

    ngOnInit(): void {
        // We don't put wallet in the form control as user input, 
        // but we will merge it when submitting.
    }

    async onSubmit() {
        if (this.registerForm.invalid || !this.wallet) return;

        this.loading = true;
        this.error = null;

        try {
            const formValue = this.registerForm.getRawValue();
            const userData = {
                ...formValue,
                wallet: this.wallet
            };

            await this.authService.register(userData);
            this.registerSuccess.emit();
        } catch (err: any) {
            console.error('Registration error:', err);
            this.error = err.message || 'Registration failed. Please try again.';
        } finally {
            this.loading = false;
        }
    }
}
