export class AutoCompleteOptions {
  public animated:boolean = false;
  public color:string|null = null;
  public autocomplete:'on'|'off' = 'off';
  public autocorrect:'on'|'off' = 'off';
  public cancelButtonIcon:string = 'arrow-round-back';
  public cancelButtonText:string = 'Cancel';
  public clearIcon:string = 'close';
  public clearInput:boolean = false;
  public clearOnEdit:boolean = false;
  public debounce:number = 250;
  public mode:'ios'|'md' = 'md';
  public noItems:string = '';
  public placeholder:string = 'Search';
  public searchIcon:string = 'search';
  public showCancelButton:boolean = false;
  public spellcheck:'on'|'off' = 'off';
  public type:string = 'search';
  public value:string = '';

  constructor() {

  }
}
