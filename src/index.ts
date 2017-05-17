import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { AutoCompleteComponent } from './autocomplete.component';
import { BoldPrefix } from './boldprefix.pipe';
import {IonicModule} from 'ionic-angular';
import {AutoCompleteItemComponent} from './autocompleteitem.component';

export * from './autocomplete.component';
export * from './boldprefix.pipe';
export * from './autocompleteitem.component';
export * from './auto-complete.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [
    AutoCompleteComponent,
    BoldPrefix,
    AutoCompleteItemComponent
  ],
  exports: [
    AutoCompleteComponent,
    BoldPrefix,
    AutoCompleteItemComponent
  ]
})
export class AutoCompleteModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AutoCompleteModule,
      providers: []
    };
  }
}
