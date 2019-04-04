import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {AutoCompleteModule} from 'ionic4-auto-complete';

import {SimpleServiceComponent} from './simple-service.component';

import {SimpleService} from '../../services/simple-service.service';

@NgModule({
  declarations: [
    SimpleServiceComponent
  ],
  entryComponents: [
    SimpleServiceComponent
  ],
  exports: [
    SimpleServiceComponent
  ],
  imports: [
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    IonicModule
  ],
  providers: [
    SimpleService
  ]
})
export class SimpleServiceModule {}
