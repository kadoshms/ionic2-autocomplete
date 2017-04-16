import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { AutoCompleteComponent } from './src/autocomplete.component';
import { BoldPrefix } from './src/boldprefix.pipe';
import {IonicApp, IonicModule} from 'ionic-angular';
import {AutoCompleteItemComponent} from './src/autocompleteitem.component';

export * from './src/autocomplete.component';
export * from './src/boldprefix.pipe';
export * from './src/autocompleteitem.component';
export * from './src/auto-complete.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule.forRoot(IonicApp)
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
