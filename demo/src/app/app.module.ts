import {NgModule} from '@angular/core';

import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';

import {AppRoutingModule} from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  exports: [],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot()
  ],
  providers: [
    {
      provide:  RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    SplashScreen,
    StatusBar
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
