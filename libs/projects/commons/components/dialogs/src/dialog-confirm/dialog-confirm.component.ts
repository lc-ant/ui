import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DialogInlineComponent } from '../dialog-inline/dialog-inline.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LcAntCoreModule } from '@lc-ant/core';

@Component({
  selector: 'lc-ant-commons-dialog-confirm',
  standalone: true,
  imports: [
    CommonModule,
    DialogInlineComponent,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    LcAntCoreModule,
  ],
  templateUrl: './dialog-confirm.component.html',
  styleUrl: './dialog-confirm.component.css'
})
export class DialogConfirmComponent {

  @Input()
  public color = '';

  @Input()
  public title?: string;

  @Input()
  public message?: string;

  @Output()
  public confirmed = new EventEmitter<any>();

  @ViewChild('dialogInline') dialogInline!: DialogInlineComponent;

  public open(): MatDialogRef<any> {
    return this.dialogInline.open();
  }

}
