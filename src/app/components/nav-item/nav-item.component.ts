import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Opcion } from '../../models/opcion.model';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, RouterModule, NavItemComponent],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.css']
})
export class NavItemComponent {
  @Input() opcion!: Opcion;
  @Input() nivel: number = 0;

  expanded: boolean = false;

  toggle() {
    this.expanded = !this.expanded;
  }
}
