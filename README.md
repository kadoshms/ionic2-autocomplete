# ionic4-auto-complete

![](example.gif)

## Index ##

* [About](#about)
* [Setup](#setup)
* [Documentation](#documentation)
* [Issues](#issues)
* [Contributing](#contributing)
* [Deploy](#deploy)
* [Future Plans](#future-plans)
* [FAQ](#faq)

## About ## 

This is a component based on Ionic's search-bar component, with the addition of auto-complete ability. This component is super simple and light-weight. Just provide the data, and let the fun begin. This package is compatible with Angular 2+ and Ionic 2+. 

* Visit the [demo](https://ionic4-auto-complete.jrquick.com) to see it action!

## Setup

* #### Install Node ####

```
npm install ionic4-auto-complete --save
```

* #### Import assets ####

Add the following to the `assets` array in `angular.json`:

```
{
  "glob": "**/*",
  "input": "node_modules/ionic4-auto-complete/assets/",
  "output": "./assets/"
}
```

* #### Import module

Import `AutoCompleteModule` by adding the following to your parent module (i.e. `app.module.ts`):

```
import { AutoCompleteModule } from 'ionic4-auto-complete';

...

@NgModule({
  ...
  imports: [
    AutoCompleteModule,
    ...
  ],
  ...
})
export class AppModule {}
```

* #### Add styles ####

    * Import scss stylesheet from `node_modules` (i.e. `app.scss`, `global.scss`):

        `@import "../../node_modules/ionic4-auto-complete/auto-complete";`

* #### Create provider  

    * The component is not responsible for getting the data from the server. There are two options for providing data to the component.

    1. ##### Option One: Simple function returning an array
    
        ```
        import {Component} from '@angular/core';
        
        @Component({
          selector:    'auto-complete-component',
          templateUrl: 'auto-complete-component.component.html',
          styleUrls: [
            'auto-complete-component.component.scss'
          ],
        })
        export class AutoCompleteComponent {
          public labelAttribute:string;
          
          public objects:any[];
        
          constructor() {
            const objects = [
               ...
            ]
          }
          
          protected filter(keyword) {
            keyword = keyword.toLowerCase();
        
            return this.objects.filter(
              (object) => {
                const value = object[this.labelAttribute].toLowerCase();
        
                return value.includes(keyword);
              }
            );
          }
        }
        ```

    2. ##### Option Two: Create a Service and Component

        * When implementing an AutoCompleteService interface, you must implement two properties:

            1. **labelAttribute** [string] - which is the name of the object's descriptive property (leaving it null is also an option for non-object results)
            2. **getResults(keyword)** [() => any] - which is the method responsible for getting the data from server which returns either an:
                - an Observable that produces an array
                - a Subject (like an Observable)
                - a Promise that provides an array
                - directly an array of values

        ```
        import {Injectable} from '@angular/core';
        import {HttpClient} from '@angular/common/http';
        
        import {map} from 'rxjs/operators';
        import {Observable, of} from 'rxjs';
        
        import {AutoCompleteService} from 'ionic4-auto-complete';
        
        @Injectable()
        export class SimpleService implements AutoCompleteService {
          labelAttribute = 'name';
        
          private countries:any[] = [];
        
          constructor(private http:HttpClient) {
        
          }
        
          getResults(keyword:string):Observable<any[]> {
            let observable:Observable<any>;
        
            if (this.countries.length === 0) {
              observable = this.http.get('https://restcountries.eu/rest/v2/all');
            } else {
              observable = of(this.countries);
            }
        
            return observable.pipe(
              map(
                (result) => {
                  return result.filter(
                    (item) => {
                      return item.name.toLowerCase().startsWith(
                          keyword.toLowerCase()
                      );
                    }
                  );
                }
              )
            );
          }
        }
        ```

    3. ##### Option Three: Create a service and component with a form

        * To indicate that you don't want the label as value but another field of the country object returned by the REST service, you can specify the attribute **formValueAttribute** on your dataProvider. For example, we want to use the country numeric code as value and still use the country name as label.

        * Create a service which includes the `formValueAttribute` property.

            ```
            import {Injectable} from '@angular/core';
            import {map} from 'rxjs/operators';
            
            import {Http} from '@angular/http';
            
            import {AutoCompleteService} from 'ionic4-auto-complete';
            
            @Injectable()
            export class CompleteTestService implements AutoCompleteService {
              labelAttribute = 'name';
              formValueAttribute = 'numericCode';
            
              constructor(private http:Http) {
              
              }
            
              getResults(keyword:string) {
                 return this.http.get('https://restcountries.eu/rest/v1/name/' + keyword).map(
                    (result) => {
                       return result.json().filter(
                          (item) => {
                             item.name.toLowerCase().startsWith(
                                keyword.toLowerCase()
                             );
                          }
                       );
                    }
                 );
              }
            }
            ```

            * Once the form is submitted the `country` is the selected country's **numericCode** while the displayed name is the `labelAttribute`.

        * Create a component:

            ```
             import {Component} from '@angular/core';
             import {NavController} from 'ionic-angular';
             import {CompleteTestService} from '../../providers/CompleteTestService';
             import {FormGroup, Validators, FormControl } from '@angular/forms'
             
             
             @Component({
               selector: 'page-home',
               templateUrl: 'home.html'
             })
             export class HomePage {
               myForm: FormGroup
             
               constructor(public navCtrl: NavController, public completeTestService: CompleteTestService) {
               
               }
             
               ngOnInit(): void {
                 this.myForm = new FormGroup({
                   country: new FormControl('', [
                     Validators.required
                   ])
                 })
               }
             
               submit(): void {
                 let country = this.myForm.value.country
               }
             
             }
            ```
 
* #### HTML

    * Add `ion-auto-complete` within the HTML of your parent module.

    * Pass the data:
        * ##### Option 1: Vanilla

              <ion-auto-complete [dataProvider]="completeTestService"></ion-auto-complete>`

        * ##### Option 2: Angular FormGroup

            * ##### Option 2-A: Use property as form value
                * Requires `labelAttribute` as both label and form value (default behavior). 
                    * By default, if your **dataProvider** provides an array of objects, the `labelAttribute` property is used to take the good field of each object to display in the suggestion list. For backward compatibility, if nothing is specified, this attribute is also used to grab the value used in the form.

                * Add form to the component's HTML and add the `formControlName` attribute:
                    ```
                    <form [formGroup]="myForm" 
                          (ngSubmit)="submit()" 
                          novalidate>
                      <div class="ion-form-group">
                        <ion-auto-complete [dataProvider]="completeTestService" 
                                           formControlName="country"></ion-auto-complete>
                      </div>
                      
                      <button ion-button 
                              type="submit" 
                              block>
                          Add Country
                      </button>
                    </form>
                    ```

            * ##### Option 2-B: Use whole object as form value

                * Simply set `formValueAttribute` to empty string:

                    ```
                    import {AutoCompleteService} from 'ionic4-auto-complete';
                    import {HttpClient} from '@angular/http';
                    import {Injectable} from "@angular/core";
                    import 'rxjs/add/operator/map'
                    
                    @Injectable()
                    export class CompleteTestService implements AutoCompleteService {
                      ...
                      
                      formValueAttribute = ''
                    
                      constructor(private http:Http) {
                         ...
                      }
                    
                      getResults(keyword:string) {
                         ...
                      }
                    }
                    ```

## Documentation ##

* ### Events ##

    * `autoFocus($event)` is fired when the input is focused.  
    * `autoBlur($event)` is fired when the input is blured.  
    * `ionAutoInput($event)` is fired when user inputs.  
    * `itemChanged($event)` is fired when the selection changes (clicked).  
    * `itemsHidden($event)` is fired when items are hidden.  
    * `itemRemoved($event)` is fired when item is removed (clicked).  
    * `itemSelected($event)` is fired when item is selected from suggestions (clicked).  
    * `itemsShown($event)` is fired when items are shown.  

* ### Searchbar Options ##

    * Ionic4-auto-complete supports the regular Ionic's Searchbar options, which are set to their default values as specified in the [docs](https://beta.ionicframework.com/docs/api/searchbar/).

    * You can override these default values by adding the `[options]` attribute to the `<ion-auto-complete>` tag, for instance:

        ```
          <ion-auto-complete [dataProvider]="someProvider" [options]="{ placeholder : 'Lorem Ipsum' }"></ion-auto-complete>
        ```

    * Options include, but not limited to:
        * `debounce` - (default is `250`)
        * `autocomplete` - ("on" and "off")
        * `type` - ("text", "password", "email", "number", "search", "tel", "url". Default "search".)
        * `placeholder` - (default "Search")

* ### Styling

    * ##### Resize
    
        * For best visual results use `viewport size / fixed size` ( in pixels).
    
            ```
            ion-auto-complete {
              width: 50vw;
            }
            ```
    
    * ##### Custom Templates
    
        * You can display any attribute associated with your data items by accessing it from the `data` input class member in the template.
    
        * For example:
            * Let's assume that in addition to the country name, we also wish to display the country flag.
            * For that, we use the `ng-template` directive, which let's us pass the template as an input to the component.
            * Within your component's HTML add the a template:
         
                ```
                <ng-template #withFlags let-attrs="attrs">
                  <img src="assets/image/flags/{{attrs.data.name}}.png" 
                       class="flag"/>
                   <span [innerHTML]="attrs.data.name | boldprefix:attrs.keyword"></span>
                </ng-template>
                
                <ion-auto-complete [dataProvider]="service" 
                                   [template]="withFlags"></ion-auto-complete>
                ```
    
        * **IMPORTANT:** The attribute `let-attrs` is required.

    * ##### Component Options
    
        * In addition to the searchbar options, `ion-auto-complete` also supports the following option attributes:
    
            * `[template]` (TemplateRef) - custom template reference for your auto complete items (see below).
            * `[showResultsFirst]` (boolean) - for small lists it might be nicer to show all options on first tap (you might need to modify your service to handle an empty `keyword`).
            * `[alwaysShowList]` (boolean) - always show the list - defaults to false).
            * `[hideListOnSelection]` (boolean) - if allowing multiple selections, it might be nice not to dismiss the list after each selection - defaults to true).

* ### Searchbar Methods

    * ##### Access Searchbar
        * Within your component:
        
            ```
              @ViewChild('searchbar')
              searchbar: AutoCompleteComponent;
            ```
        
        * Add `#searchbar` within your component's HTML:
        
            ```
            <ion-auto-complete [dataProvider]="provider" #searchbar></ion-auto-complete>
            ```
            
    * ##### Available Methods

        * `getValue()` returns the string value of the selected item.
            * Example: `this.searchbar.getValue()`
        * `getSelection()` returns the selected object.
            * Example: `this.searchbar.getSelection()`
        * `setFocus()` sets focus on the searchbar.
            * Example: `this.searchbar.setFocus()` 

## Contributing ##

To contribute, clone the repo. Then, run `npm install` to get the packages needed for the library to work. Running `gulp` will run a series of tasks that builds the files in `/src` into `/dist`. Replace the `/dist` into whatever Ionic application's `node_modules` where you're testing your changes to continuously improve the library.

## Issues ##

If you find any issues feel free to open a request in [the Issues tab](https://github.com/jrquick17/ionic4-auto-complete/issues). If I have the time I will try to solve any issues but cannot make any guarantees. Feel free to contribute yourself.

### Demo ###

Run `npm install` to get packages required for the demo and then run `ionic serve` to run locally.

### Thanks ###

* [bushybuffalo](https://github.com/bushybuffalo)
* [jrquick17](https://github.com/jrquick17)
* [kadoshms](https://github.com/kadoshms)

## Deploy ##

* ### Build ###

    * Run `gulp build` from root.

* #### Update Version ###

    * Update version `package.json` files in both the root and `dist/` directory following [Semantic Versioning (2.0.0)](https://semver.org/).
    * Update `dist/package.json` to have `dependencies` to match root `package.json`.

* #### NPM Release ####

    * Run `npm publish` from `dist/` directory.

* #### Update Changelog ####

    * Add updates to `CHANGELOG.md` in root.

### Future Plans ###

* Create demo page
    * Simple function
    * Service and component
    * Angular Form
    * Custom Template
    
* Fix gulp (Scss does not always transfer, soft fail)

## FAQ ##

* #### How do you concatenate several fields as label?

    The auto-complete component allows you to use templates for customize the display of each suggestion. But in many cases, the default template is good. However, you need to concatenate several fields (like firstname and lastname) to produce a full label. In that case, you can declare a method named `getItemLabel` instead of using `labelAttribute`.

    For example, we want to display the country name and the population:
    
    ```
    import {AutoCompleteService} from 'ionic4-auto-complete';
    import { Http } from '@angular/http';
    import {Injectable} from "@angular/core";
    import 'rxjs/add/operator/map'
    
    @Injectable()
    export class CompleteTestService implements AutoCompleteService {
      formValueAttribute = ""
    
      constructor(private http:Http) {
      
      }
    
      getResults(keyword:string) {
        return this.http.get("https://restcountries.eu/rest/v1/name/"+keyword)
          .map(
            result =>
            {
              return result.json()
                .filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) )
            });
      }
    
      getItemLabel(country: any) {
        return country.name + ' (' + country.population + ')'
      }
    }
    ```
