import { Component, ContentChild, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'lc-ant-commons-dialog-inline',
  standalone: true,
  imports: [
    MatDialogModule,
  ],
  templateUrl: './dialog-inline.component.html',
  styleUrl: './dialog-inline.component.css'
})
export class DialogInlineComponent {

  @ContentChild(TemplateRef, { read: TemplateRef} ) content!: TemplateRef<any>;

  constructor(
    private matDialog: MatDialog
  ) {}

  public open(): MatDialogRef<any> {
    return this.matDialog.open(this.content);
  }

}
