import {Component, Input} from '@angular/core';

export const defaultTemplate = `<span [innerHTML]='labelAttribute ? data[labelAttribute] : data | boldprefix:keyword'></span>`;

export function AutoCompleteItem(config: any) {
  return function(cls: any) {
    const _reflect: any = Reflect;

    let annotations = _reflect.getMetadata('annotations', cls) || [];
    let extendedConfig: any = config;

    extendedConfig.selector = 'ion-auto-complete-item';

    if (config.template == null && config.templateUrl == null) {
    }

    annotations.push(new Component(extendedConfig));
    _reflect.defineMetadata('annotations', annotations, cls);

    return cls;
  };
};

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