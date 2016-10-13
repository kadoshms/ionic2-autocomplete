import {Component, Input} from '@angular/core';
import {AUTOCOMPLETE_PIPES} from '../pipes';

/**
 * AutoCompleteItem metadata interface
 */
export interface AutoCompleteItemMetadata {
  template?: string;
  templateUrl?: string;
};

export const defaultTemplate = `<span [innerHTML]='data[labelAttribute] | boldprefix:keyword'></span>`;

/**
 * AutoCompleteItem annotation
 * @param config
 * @returns {(cls:any)=>any}
 * @constructor
 */
export function AutoCompleteItem( config: AutoCompleteItemMetadata ) {
  return function(cls: any) {
    const _reflect: any = Reflect;

    let annotations = _reflect.getMetadata('annotations', cls) || [];
    let extendedConfig: any = config;

    extendedConfig.selector = 'ion-auto-complete-item';

    if (config.template == null && config.templateUrl == null) {
      config.template = defaultTemplate;
    }

    annotations.push(new Component(extendedConfig));
    _reflect.defineMetadata('annotations', annotations, cls);

    return cls;
  };
}

/**
 * Auto complete Item base class
 */
@AutoCompleteItem({
  template: defaultTemplate
})
export class AutoCompleteItemComponent {

  @Input() data: any;
  @Input() keyword: string;
  @Input() labelAttribute: string;

  constructor() {
  }

}
