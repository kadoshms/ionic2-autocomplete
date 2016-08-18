// Import all directives
import {AutoCompleteComponent} from './directives/auto-complete.component';
import {AutoCompleteItemComponent} from './directives/auto-complete-item.component';

// Export all directives
export * from './directives/auto-complete-item.component';
export * from './directives/auto-complete.component';

// Export convenience property
export const AUTOCOMPLETE_DIRECTIVES: any[] = [
  AutoCompleteComponent,
  AutoCompleteItemComponent
];
