import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../services/orden.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.css'
})
export class OrdenesComponent implements OnInit {
  ordenes: any[] = [];
  ordenesFiltradas: any[] = [];
  loading: boolean = true;
  estados: string[] = ['PENDIENTE', 'EN_REVISION', 'EN_REPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'];
  userRol: string | null = null;
  userId: number | null = null;
  facturaSeleccionada: any = null;
  showFacturaModal: boolean = false;

  // Filtros
  filtroTexto: string = '';
  filtroEstado: string = '';

  constructor(private ordenService: OrdenService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userRol = this.authService.getRol();
    const id = localStorage.getItem('userId');
    this.userId = id ? Number(id) : null;
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    const observer = {
      next: (data: any[]) => {
        this.ordenes = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar órdenes', err);
        this.loading = false;
      }
    };

    if (this.userRol === 'CLIENTE' && this.userId) {
      this.ordenService.getOrdenesByCliente(this.userId).subscribe(observer);
    } else {
      this.ordenService.getOrdenes().subscribe(observer);
    }
  }

  aplicarFiltros(): void {
    this.ordenesFiltradas = this.ordenes.filter(orden => {
      const cumpleTexto = !this.filtroTexto || 
        orden.id?.toString().includes(this.filtroTexto) ||
        orden.cliente?.nombre?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        orden.equipo?.marca?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        orden.equipo?.modelo?.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      const cumpleEstado = !this.filtroEstado || orden.estado === this.filtroEstado;
      
      return cumpleTexto && cumpleEstado;
    });
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  getEstadoClass(estado: string): string {
    const classes: any = {
      'PENDIENTE': 'bg-amber-50 text-amber-600 border border-amber-100',
      'EN_REVISION': 'bg-blue-50 text-blue-600 border border-blue-100',
      'EN_REPARACION': 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      'LISTO': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      'ENTREGADO': 'bg-slate-50 text-slate-600 border border-slate-100',
      'CANCELADO': 'bg-rose-50 text-rose-600 border border-rose-100'
    };
    return classes[estado] || 'bg-slate-50 text-slate-600 border border-slate-100';
  }

  getEstadoDotClass(estado: string): string {
    const classes: any = {
      'PENDIENTE': 'bg-amber-500',
      'EN_REVISION': 'bg-blue-500',
      'EN_REPARACION': 'bg-indigo-500',
      'LISTO': 'bg-emerald-500',
      'ENTREGADO': 'bg-slate-500',
      'CANCELADO': 'bg-rose-500'
    };
    return classes[estado] || 'bg-slate-500';
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    if (nuevoEstado === 'LISTO') {
      const costo = prompt('Ingrese el costo final de mano de obra para completar la orden:');
      if (costo === null) return;
      
      this.ordenService.actualizarEstado(id, 'LISTO', 'Completado por técnico', Number(costo)).subscribe({
        next: () => this.cargarOrdenes(),
        error: (err) => {
          console.error('Error al cambiar estado a LISTO', err);
          alert('Hubo un error al procesar la orden y generar la factura.');
        }
      });
      return;
    }

    if (confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`)) {
      this.ordenService.actualizarEstado(id, nuevoEstado).subscribe({
        next: () => {
          this.cargarOrdenes();
        },
        error: (err) => console.error('Error al cambiar estado', err)
      });
    }
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
          this.cargarOrdenes();
        },
        error: (err) => {
          alert('Error al procesar el pago. Por favor intente de nuevo.');
          console.error('Error en pago', err);
        }
      });
    }
  }

  eliminarOrden(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
      this.ordenService.eliminar(id).subscribe({
        next: () => {
          this.cargarOrdenes();
        },
        error: (err) => console.error('Error al eliminar orden', err)
      });
    }
  }

  editarOrden(orden: any): void {
    const nuevoCosto = prompt('Ingrese el nuevo costo de mano de obra:', orden.costoManoObra);
    const nuevaDescripcion = prompt('Ingrese la nueva descripción de la falla:', orden.equipo?.descripcionFalla || '');
    
    if (nuevoCosto !== null || nuevaDescripcion !== null) {
      const ordenActualizada = { 
        ...orden, 
        costoManoObra: nuevoCosto !== null ? Number(nuevoCosto) : orden.costoManoObra,
        equipo: {
          ...orden.equipo,
          descripcionFalla: nuevaDescripcion !== null ? nuevaDescripcion : orden.equipo?.descripcionFalla
        }
      };
      
      this.ordenService.actualizar(orden.id, ordenActualizada).subscribe({
        next: () => {
          this.cargarOrdenes();
        },
        error: (err) => console.error('Error al actualizar orden', err)
      });
    }
  }
}
