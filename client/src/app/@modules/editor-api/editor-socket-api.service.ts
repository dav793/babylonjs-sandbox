import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, of } from 'rxjs';
import { io } from 'socket.io-client';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditorSocketApiService {

  private _ioClient: any;
  private _onConnect = new ReplaySubject<boolean>(1);
  private _isConnected = false;

  constructor() { }

  connect(): Observable<boolean> {
    if (this._isConnected)
      return of(true);

    const serverUrl = `ws://${environment.editor.host}:${environment.editor.wsPort}`;
    this._ioClient = io(serverUrl);

    this._ioClient.on('connect', () => {
      console.log('Client connected to editor server socket');
      this._isConnected = true;
      this._onConnect.next(true);
    });
    
    this._ioClient.on('disconnect', () => {
      console.log('Client disconnected from editor server socket');
      this._isConnected = false;
      this._onConnect.next(false);
    });

    return this._onConnect.asObservable();
  }

}
