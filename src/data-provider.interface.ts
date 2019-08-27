export interface DataProviderInterface {
  formValueAttribute:string|null;
  getItemLabel:Function;
  getResults:Function;
  labelAttribute:string;
}
