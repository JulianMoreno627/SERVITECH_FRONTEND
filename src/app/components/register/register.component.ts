import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      usuario: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['CLIENTE', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.error = '';
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          if (err.status === 400) {
            this.error = err?.error || 'El usuario ya existe o los datos son inválidos.';
            return;
          }

          if (err.status === 404) {
            this.error = 'El endpoint de registro no existe. Verifica que el backend correcto esté corriendo (SERVITECH-BACKEND) y que la URL sea http://localhost:8081/api.';
            return;
          }

          if (err.status === 0) {
            this.error = 'No se pudo conectar con el servidor (backend apagado o CORS). Verifica que SERVITECH-BACKEND esté corriendo en http://localhost:8081.';
            return;
          }

          this.error = `Error del servidor (${err.status}). Intente más tarde.`;
        }
      });
    }
  }
}
