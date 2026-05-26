import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrdenService } from '../../services/orden.service';

@Component({
  selector: 'app-solicitud-reparacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './solicitud-reparacion.component.html',
  styles: ``
})
export class SolicitudReparacionComponent implements OnInit {
  solicitudForm: FormGroup;
  loading = false;
  success = false;
  error = '';

  tiposEquipo = [
    'Lavadora', 'Secadora', 'Nevera', 'Nevecon', 'Aire Acondicionado', 
    'Lavavajillas', 'Horno', 'Microondas', 'Estufa', 'Calentador'
  ];

  constructor(
    private fb: FormBuilder,
    private ordenService: OrdenService,
    private router: Router
  ) {
    this.solicitudForm = this.fb.group({
      equipo: this.fb.group({
        tipo: ['', Validators.required],
        marca: ['', Validators.required],
        modelo: ['', Validators.required],
        numeroSerie: [''],
        descripcionFalla: ['', [Validators.required, Validators.minLength(10)]]
      })
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.solicitudForm.valid) {
      this.loading = true;
      this.error = '';
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.error = 'No se pudo identificar al usuario. Por favor inicie sesión nuevamente.';
        this.loading = false;
        return;
      }

      const nuevaSolicitud = {
        ...this.solicitudForm.value,
        cliente: { id: parseInt(userId) }
      };

      this.ordenService.crear(nuevaSolicitud).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => this.router.navigate(['/dashboard']), 3000);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || err.message || 'Ocurrió un error al enviar la solicitud. Intente nuevamente.';
          console.error('Error al crear solicitud:', err);
        }
      });
    }
  }
}