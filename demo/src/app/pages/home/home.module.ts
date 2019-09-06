import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HomePage} from './home.page';

import {CustomTemplateModule} from '../../components/custom-template/custom-template.module';
import {MultiFunctionModule} from '../../components/multi-function/multi-function.module';
import {SimpleFunctionModule} from '../../components/simple-function/simple-function.module';
import {SimpleServiceModule} from '../../components/simple-service/simple-service.module';

@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    CommonModule,
    CustomTemplateModule,
    FormsModule,
    IonicModule,
    MultiFunctionModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    SimpleFunctionModule,
    SimpleServiceModule
  ]
})
export class HomePageModule {}
