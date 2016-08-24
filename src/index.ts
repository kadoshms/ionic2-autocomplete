import {AUTOCOMPLETE_DIRECTIVES} from './directives';
import {AUTOCOMPLETE_PIPES} from './pipes';

export * from './directives';
export * from './pipes';

export {AutoCompleteService} from './interfaces/auto-complete-service';

export default {
  directives: [AUTOCOMPLETE_DIRECTIVES],
  pipes: [AUTOCOMPLETE_PIPES]
}
