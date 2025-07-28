import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initializeForm();
    this.checkRememberedUser();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Add real-time validation feedback
    this.loginForm.valueChanges.subscribe(() => {
      this.clearMessages();
    });
  }

  checkRememberedUser(): void {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser);
      this.loginForm.patchValue({
        username: userData.username,
        rememberMe: true
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.clearMessages();

      const loginData = this.loginForm.value;

      this.accountService.login(loginData).subscribe({
        next: (response) => {
          this.handleLoginSuccess(loginData);
        },
        error: (error) => {
          this.handleLoginError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleLoginSuccess(loginData: any): void {
    this.isLoading = false;
    this.successMessage = 'Login successful! Redirecting...';
    
    // Handle remember me functionality
    if (loginData.rememberMe) {
      localStorage.setItem('rememberedUser', JSON.stringify({
        username: loginData.username
      }));
    } else {
      localStorage.removeItem('rememberedUser');
    }

    // Redirect after short delay to show success message
    setTimeout(() => {
      this.router.navigateByUrl('/members');
    }, 1500);
  }

  private handleLoginError(error: any): void {
    this.isLoading = false;
    
    if (error.status === 401) {
      this.errorMessage = 'Invalid username or password. Please try again.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'Login failed. Please try again.';
    }

    // Clear error message after 5 seconds
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);

    this.toastr.error(this.errorMessage, 'Login Failed');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    // TODO: Implement forgot password functionality
    this.toastr.info('Forgot password functionality will be available soon!', 'Coming Soon');
  }

  loginWithGoogle(): void {
    // TODO: Implement Google OAuth login
    this.toastr.info('Google login will be available soon!', 'Coming Soon');
  }

  loginWithFacebook(): void {
    // TODO: Implement Facebook OAuth login
    this.toastr.info('Facebook login will be available soon!', 'Coming Soon');
  }

  // Utility method for form validation messages
  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}