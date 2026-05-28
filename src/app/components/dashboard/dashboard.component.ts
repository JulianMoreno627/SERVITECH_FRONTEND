import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Rol } from '../../models/auth.model';
import { OrdenService } from '../../services/orden.service';
import { Opcion } from '../../models/opcion.model';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavItemComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  usuario: string | null = '';
  rol: Rol | null = null;
  sidebarOpen: boolean = true;
  stats: any = {};
  today: Date = new Date();
  facturaSeleccionada: any = null;
  showFacturaModal: boolean = false;

  // Menú dinámico
  menuOpciones: Opcion[] = [];

  constructor(
    public authService: AuthService, 
    public dashboardService: DashboardService,
    public router: Router,
    private ordenService: OrdenService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = localStorage.getItem('usuario');
    this.rol = this.authService.getRol();
    this.cargarEstadisticas();
    this.cargarMenu();
    
    if (this.isCliente()) {
      this.cargarMisOrdenes();
    } else if (this.isTecnico()) {
      this.cargarOrdenesTecnico();
    }
  }

  cargarMenu(): void {
     this.menuService.getMenu().subscribe({
       next: (data) => {
         this.menuOpciones = data;
       },
       error: (err) => {
         console.error('Error al cargar el menú dinámico', err);
         // Fallback con el menú de Gestión de Servicios restaurado
         this.menuOpciones = [
           {
             id: 1,
             nombre: 'ServiTech',
             icono: 'build',
             hijos: [
               {
                 id: 2,
                 nombre: 'Gestión de Servicios',
                 icono: 'assignment',
                 hijos: [
                   { id: 3, nombre: 'Panel Principal', ruta: '/dashboard', icono: 'dashboard' },
                   { id: 4, nombre: 'Órdenes de Servicio', ruta: '/dashboard/ordenes', icono: 'list_alt' },
                   { id: 5, nombre: 'Solicitar Reparación', ruta: '/dashboard/solicitud', icono: 'add_circle' }
                 ]
               }
             ]
           }
         ];
       }
     });
   }

  cargarEstadisticas(): void {
    this.dashboardService.getEstadisticas().subscribe({
      next: (data) => {
        this.stats = data;
        // Si es cliente, sobreescribimos totalOrdenes con sus propias órdenes
        if (this.isCliente()) {
          this.stats.totalOrdenes = this.misOrdenes.length;
          this.stats.ordenesPendientes = this.misOrdenes.filter(o => o.estado === 'PENDIENTE' || o.estado === 'EN_REVISION' || o.estado === 'EN_REPARACION').length;
        }
      },
      error: (err) => console.error('Error al cargar estadísticas', err)
    });
  }

  misOrdenes: any[] = [];
  cargarMisOrdenes(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.dashboardService.getOrdenesActivas(Number(userId)).subscribe({
        next: (data) => {
          this.misOrdenes = data;
          this.stats.misReparaciones = data.length;
          this.stats.pendientes = data.filter(o => o.estado === 'PENDIENTE').length;
        },
        error: (err) => console.error('Error al cargar reparaciones del cliente', err)
      });
    }
  }

  ordenesTecnico: any[] = [];
  cargarOrdenesTecnico(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.ordenService.getOrdenesByTecnico(Number(userId)).subscribe({
        next: (data) => {
          this.ordenesTecnico = data;
        },
        error: (err) => console.error('Error al cargar órdenes para el técnico', err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isAdmin(): boolean {
    return this.rol === Rol.ADMIN;
  }

  isTecnico(): boolean {
    return this.rol === Rol.TECNICO;
  }

  isCliente(): boolean {
    return this.rol === Rol.CLIENTE;
  }

  verFactura(ordenId: number): void {
    this.ordenService.getFacturaByOrden(ordenId).subscribe({
      next: (factura) => {
        this.facturaSeleccionada = factura;
        this.showFacturaModal = true;
      },
      error: (err) => {
        alert('La factura aún no ha sido generada o no se pudo encontrar.');
        console.error('Error al obtener factura', err);
      }
    });
  }

  cerrarFactura(): void {
    this.showFacturaModal = false;
    this.facturaSeleccionada = null;
  }

  pagarFactura(facturaId: number): void {
    if (confirm('¿Deseas proceder con el pago de esta factura?')) {
      this.ordenService.pagarFactura(facturaId).subscribe({
        next: (factura) => {
          alert('¡Pago realizado con éxito!');
          this.facturaSeleccionada = factura;
          this.cargarMisOrdenes(); // Recargar para actualizar estados
        },
        error: (err) => {
          alert('Error al procesar el pago. Por favor intente de nuevo.');
          console.error('Error en pago', err);
        }
      });
    }
  }
}
