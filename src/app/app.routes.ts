import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: 'ordenes', loadComponent: () => import('./components/ordenes/ordenes.component').then(m => m.OrdenesComponent) },
      { path: 'solicitud', loadComponent: () => import('./components/solicitud-reparacion/solicitud-reparacion.component').then(m => m.SolicitudReparacionComponent) }
    ]
  }
];
