export interface AutoCompleteService {
    /**
     * the literal name of the title attribute
     */
    labelAttribute?: string;
    
    /**
     * the value of the field when used in a formGroup. If null, labelAttribute is used
     */
    formValueAttribute?: any;
    
    /**
     * this method should return an array of objects (results)
     * @param term
     */
    getResults(term: any): any;

    /**
     * this method parses each item of the results from data service.
     * the returned value is the displayed form of the result
     * @param item
     */
    getItemLabel?(item: any): any;
}
