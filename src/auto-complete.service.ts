export interface AutoCompleteService {

    /**
     * the literal name of the title attribute
     */
    labelAttribute?: string;

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
    parseItem?(item: any): any;
}