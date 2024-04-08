import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiDataChangeEvent } from './api-data-change-event';
import { I18nService } from '../i18n/i18n.service';
import { AuthService } from '../auth/auth.service';
import { first, forkJoin } from 'rxjs';
import { HttpService } from '../http/http.service';

export interface ApiDataChangeEventListener {

  connected(): void;
  disconnected(): void;
  event(event: ApiDataChangeEvent): void;

}

class TypeListener {

  public listeners: ApiDataChangeEventListener[] = [];
  public listening = false;

}

@Injectable({
  providedIn: 'root'
})
export class ApiDataEventsService {

  private listeners = new Map<string, TypeListener>();
  private ws?: WebSocket;
  private isConnected = false;
  private disconnectTimeout?: any;

  constructor(
    private http: HttpService,
    private authService: AuthService,
    private toastController: ToastController,
    private i18n: I18nService,
  ) { }

  public listen(dataType: string, listener: ApiDataChangeEventListener): void {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = undefined;
    }
    if (this.listeners.size === 0 && !this.ws) {
      this.startListening(undefined, 0);
    }
    let typeListener = this.listeners.get(dataType);
    if (!typeListener) {
      typeListener = new TypeListener();
      this.listeners.set(dataType, typeListener);
      if (this.isConnected) {
        console.log('First listener, start listening for ' + dataType);
        this.ws!.send('net.lecousin.ant.apigateway.events.v1.dto.ListenRequest:{"dataType": "' + dataType + '"}');
      }
    }
    typeListener.listeners.push(listener);
    if (typeListener.listening) {
      listener.connected();
    }
  }

  public unlisten(dataType: string, listener: ApiDataChangeEventListener): void {
    const typeListener = this.listeners.get(dataType);
    if (typeListener) {
      const index = typeListener.listeners.indexOf(listener);
      if (index >= 0) {
        typeListener.listeners.splice(index, 1);
        if (typeListener.listeners.length === 0) {
          this.listeners.delete(dataType);
          if (this.isConnected) {
            console.log('Stop listening for ' + dataType);
            this.ws!.send('net.lecousin.ant.apigateway.events.v1.dto.UnlistenRequest:{"dataType": "' + dataType + '"}');
          }
        }
      }
    }
    if (this.listeners.size === 0) {
      this.disconnectTimeout = setTimeout(() => this.stopListening(), 30000);
    }
  }

  private startListening(toast: HTMLIonToastElement | undefined, trial: number): void {
    console.log('Connecting to Web Socket (trial ' + trial + ')');
    const accessToken = this.authService.user!.accessToken;
    this.isConnected = false;
    this.ws = new WebSocket('ws://' + location.host + this.http.getApiBaseUrl() +
      'api/api-data-events/v1/socket?authorization=' +
      encodeURIComponent(accessToken)
    );
    this.ws.onmessage = (event: MessageEvent<any>) => {
      console.log('Web socket message received', event);
      if (typeof event.data === 'string') {
        this.handleMessage(event.data);
      }
    };
    let reuseToast = true;
    this.ws.onopen = () => {
      console.log('Connected to Web Socket');
      if (toast) {
        toast.dismiss();
        reuseToast = false;
      }
      this.isConnected = true;
      for (const dataType of this.listeners.keys()) {
        console.log('Connected, listening events for ' + dataType);
        this.ws!.send('net.lecousin.ant.apigateway.events.v1.dto.ListenRequest:{"dataType": "' + dataType + '"}');
      }
    };
    this.ws.onerror = (event) => {
      console.error('Web Socket error', event);
    };
    this.ws.onclose = () => {
      console.log('Disconnected from Web Socket');
      this.isConnected = false;
      for (const dataType of this.listeners.keys()) {
        const typeListener = this.listeners.get(dataType)!;
        typeListener.listening = false;
        for (const listener of typeListener.listeners) {
          listener.disconnected();
        }
      }
      if (this.listeners.size > 0) {
        // we need to reconnect
        if (toast && reuseToast) {
          this.retryConnection(toast, trial + 1);
        } else {
          this.autoReconnect();
        }
      }
    };
  }

  private handleMessage(msg: string): void {
    if (msg.startsWith('net.lecousin.ant.apigateway.events.v1.dto.ListenRequest:')) {
      msg = msg.substring('net.lecousin.ant.apigateway.events.v1.dto.ListenRequest:'.length);
      const json = JSON.parse(msg);
      const dataType = json.dataType;
      const typeListener = this.listeners.get(dataType);
      if (typeListener && !typeListener.listening) {
        typeListener.listening = true;
        for (const l of typeListener.listeners) {
          l.connected();
        }
      }
    } else if (msg.startsWith('net.lecousin.ant.core.springboot.messaging.ApiDataChangeEvent:')) {
      msg = msg.substring('net.lecousin.ant.core.springboot.messaging.ApiDataChangeEvent:'.length);
      const ev = <ApiDataChangeEvent>JSON.parse(msg);
      const typeListener = this.listeners.get(ev.dataType);
      console.log('Data event received: ', ev, '; listeners: ', typeListener);
      if (typeListener != null) {
        for (const listener of typeListener.listeners) {
          listener.event(ev);
        }
      }
    }
  }

  private autoReconnect(): void {
    this.i18n.getValue('core', 'close').pipe(first()).subscribe(closeText => {
      this.toastController.create({
        message: '',
        translucent: true,
        buttons: [
          {
            text: closeText,
            role: 'cancel'
          }
        ]
      }).then(toast => {
        toast.present().then(() => {
          this.retryConnection(toast, 1);
        });
      });
    });
  }

  private retryConnection(toast: HTMLIonToastElement, trial: number): void {
    const seconds = Math.min(trial * 5, 60);
    console.log('Retry to connect in ' + seconds + ' second(s)');
    this.retryConnectionIn(toast, trial, seconds);
  }

  private retryConnectionIn(toast: HTMLIonToastElement, trial: number, seconds: number): void {
    forkJoin([
      this.i18n.getValue('core', 'disconnected from server, retrying in').pipe(first()),
      this.i18n.getValue('core', 'second').pipe(first()),
      this.i18n.getValue('core', 'seconds').pipe(first()),
      this.i18n.getValue('core', 'reconnecting').pipe(first()),
    ]).subscribe(texts => {
      if (seconds > 0) {
        toast.message = texts[0] + ' ' + seconds + ' ' + (seconds > 1 ? texts[2] : texts[1]);
        setTimeout(() => this.retryConnectionIn(toast, trial, seconds - 1), 1000);
        return;
      }
      toast.message = texts[3] + '...';
      this.startListening(toast, trial);
    })
  }

  private stopListening(): void {
    this.isConnected = false;
    this.ws?.close();
    this.ws = undefined;
  }

}
