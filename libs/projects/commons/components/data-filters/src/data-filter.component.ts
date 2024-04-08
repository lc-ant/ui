import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractComponent, LcAntCoreModule } from '@lc-ant/core';
import { StringFilterComponent } from './string/string-filter.component';
import { DataFilter } from './data-filter';

@Component({
  selector: 'lc-ant-commons-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrl: './data-filter.component.scss',
  standalone: true,
  imports: [
    LcAntCoreModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    StringFilterComponent,
  ]
})
export class DataFilterComponent extends AbstractComponent {

  @Input()
  filter?: DataFilter;

}
