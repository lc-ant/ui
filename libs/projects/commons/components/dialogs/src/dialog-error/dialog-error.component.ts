import { Component, Injector, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ApiError, LcAntCoreModule } from '@lc-ant/core';
import { Observable, catchError, defaultIfEmpty, switchMap, throwError } from 'rxjs';
import { DialogInlineComponent } from '../dialog-inline/dialog-inline.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'lc-ant-commons-dialog-error',
  standalone: true,
  imports: [
    CommonModule,
    DialogInlineComponent,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    LcAntCoreModule,
  ],
  templateUrl: './dialog-error.component.html',
  styleUrl: './dialog-error.component.css'
})
export class DialogErrorComponent {

  @Input()
  public message?: string;

  @Input()
  public apiError?: ApiError;

  @ViewChild('dialogInline') dialogInline!: DialogInlineComponent;

  public open(): MatDialogRef<any> {
    return this.dialogInline.open();
  }

  public static openDialog(injector: Injector, error: string | ApiError): Observable<MatDialogRef<any>> {
    const errorRef = injector.get(ViewContainerRef).createComponent(DialogErrorComponent);
    if (error instanceof ApiError) {
      errorRef.setInput('apiError', error);
    } else {
      errorRef.setInput('message', error);
    }
    return new Observable<MatDialogRef<any>>(subscriber => {
      setTimeout(() => {
        const dialogRef = errorRef.instance.open();
        dialogRef.afterClosed().subscribe(() => errorRef.destroy());
        subscriber.next(dialogRef);
        subscriber.complete();
      }, 0);
    });
  }

  public static catch(injector: Injector, observable: Observable<any>): Observable<any> {
    return observable.pipe(
      catchError(error =>
        DialogErrorComponent.openDialog(injector, error).pipe(
          switchMap(dialogRef => dialogRef.afterClosed()),
          defaultIfEmpty(null),
          switchMap(value => throwError(() => error))
        )
      )
    );
  }

}
