# ionic4-auto-complete

## About ##
This is a component based on Ionic's search-bar component, with the addition of auto-complete ability.
This component is super simple and light-weight. Just provide the data, and let the fun begin.

This is a **free software** please feel free to contribute! :)

![](example.gif)

### Setup

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

`import { AutoCompleteModule } from 'ionic4-auto-complete';`

..

```
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
Import scss stylesheet from `node_modules` (i.e. `app.scss`, `global.scss`):

`@import "../../node_modules/ionic4-auto-complete/auto-complete";`

* #### Create provider  

The component is not responsible for getting the data from the server. There are two options for providing data to the component.

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
        const value = this.variableService.getString(
          object[this.labelAttribute]
        ).toLowerCase();

        return value.includes(keyword);
      }
    );
  }
}
```

2. ##### Option Two: Create a Service

When implementing an AutoCompleteService interface, you must implement two properties:

1. **labelAttribute** [string] - which is the name of the object's descriptive property (leaving it null is also an option for non-object results)
2. **getResults(keyword)** [() => any] - which is the method responsible for getting the data from server which returns either an:
    - an Observable that produces an array
    - a Subject (like an Observable)
    - a Promise that provides an array
    - directly an array of values

```
import {Http} from '@angular/http';
import {Injectable} from '@angular/core';

import {of} from 'rxjs';
import {map} from 'rxjs/operators';

import {AutoCompleteService} from 'ionic4-auto-complete';

@Injectable()
export class CompleteTestService implements AutoCompleteService {
  private labelAttribute = 'name';
  
  private countries:any[];

  constructor(private http:Http) {
     this.countries = [];
  }
  
  getResults(keyword:string):Observable<any[]> {
     let observable:Observable;
     
     if (this.countries.length === 0) {
        observable = this.http.get('https://restcountries.eu/rest/v1/name/' + keyword);
     } else {
        observable = of(this.countries);
     }
     
     return observable.pipe(
        map(
           () => {
              return result.json().filter(
                 (item) => {
                    item.name.toLowerCase().startsWith(
                       keyword.toLowerCase()
                    )
                 }
              );
           }
        )
      )
  }
}
```

* #### HTML

Add `ion-auto-complete` within the HTML of your parent module.

##### Option 1: Simple function

`<ion-auto-complete (on)="filter($event)"></ion-auto-complete>`

##### Option 2: Service

`<ion-auto-complete [dataProvider]="completeTestService"></ion-auto-complete>`

##### Option 3: Angular FormGroup

#### Use labelAttribute as both label and form value (default behavior) ####

By default, if your **dataProvider** provides an array of objects, the `labelAttribute` property is used to take the good field of each object to display in the suggestion list. For backward compatibility, if nothing is specified, this attribute is also used to grab the value used in the form.

The page should look like this:

```
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CompleteTestService } from '../../providers/CompleteTestService';
import { FormGroup, Validators, FormControl } from '@angular/forms'


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

Then, in *home.html* place the auto-complete component in the form group and add the `formControlName` attribute:
```
<form [formGroup]="myForm" (ngSubmit)="submit()" novalidate>
  <div class="ion-form-group">
    <ion-auto-complete [dataProvider]="completeTestService" formControlName="country"></ion-auto-complete>
  </div>
  <button ion-button type="submit" block>Add country</button>
</form>
```

Now when the `submit` method is called, the `country` is the selected country **name**.


#### How to use another field as form value ? ####

To indicate that you don't want the label as value but another field of the country object returned by the REST service, you can specify the attribute **formValueAttribute** on your dataProvider. For example, we want to use the country numeric code as value and still use the country name as label.

Let's update the service (just declare `formValueAttribute` property):

```
import {AutoCompleteService} from 'ionic4-auto-complete';
import { Http } from '@angular/http';
import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map'

@Injectable()
export class CompleteTestService implements AutoCompleteService {
  labelAttribute = "name";
  formValueAttribute = "numericCode"

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
}
```

Now when the `submit` method is called, the `country` is the selected country **numericCode**. The name is still used as the label.

#### How to use the whole object as form value ? ####

Simply set `formValueAttribute` to empty string:
```
import {AutoCompleteService} from 'ionic4-auto-complete';
import { Http } from '@angular/http';
import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map'

@Injectable()
export class CompleteTestService implements AutoCompleteService {
  labelAttribute = "name";
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
}
```


----------------------------------------------------------------------------

### Styling ###

Currently for best visual result, use viewport size / fixed size (pixels) if you are interested in resizing the component:
```
ion-auto-complete {
  width: 50vw;
}
```

<!--
### How to concatenate several fields as label ? ###


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
-->


### Custom Templates ###

Ionic4-auto-complete also supports custom templates for the list items.
Actually, you can display any attribute associated with your data items by simply accessing it from the `data` input class member in the template.

For example:

Let's assume that in addition to the country name, we also wish to display the country flag.
For that, we use the `ng-template` directive, which let's us pass the template as an input to the component.

On the page where your `ion-auto-complete` is located:

```
<ng-template #withFlags let-attrs="attrs">
  <img src="assets/image/flags/{{attrs.data.name}}.png" class="flag" /> <span [innerHTML]="attrs.data.name | boldprefix:attrs.keyword"></span>
</ng-template>
<ion-auto-complete [dataProvider]="service" [template]="withFlags"></ion-auto-complete>
```

Please note that you must add the `let-attrs="attrs"` attribute to your template.

With that, you can easily of **different templates for different components**!

## Events ##

**itemChanged($event)** - fired when the selection changes (clicked)  
**itemRemoved($event)** - fired when item is removed (clicked)  
**itemSelected($event)** - fired when item is selected from suggestions (clicked)  
**itemsShown($event)** - fired when items are shown  
**itemsHidden($event)** - fired when items are hidden  
**ionAutoInput($event)** - fired when user inputs  
**autoFocus($event)** - fired when the input is focused  
**autoBlur($event)** - fired when the input is blured  

## Searchbar options ##

Ionic4-auto-complete supports the regular Ionic's Searchbar options, which are set to their default values as specified in the [docs](https://beta.ionicframework.com/docs/api/searchbar/).

You can override these default values by adding the `[options]` attribute to the `<ion-auto-complete>` tag, for instance:

```
  <ion-auto-complete [dataProvider]="someProvider" [options]="{ placeholder : 'Lorem Ipsum' }"></ion-auto-complete>
```
Options include, but not limited to:
1. debounce (default is `250`)
2. autocomplete ("on" and "off")
3. type ("text", "password", "email", "number", "search", "tel", "url". Default "search".)
4. placeholder (default "Search")

## Component specific options

In addition to the searchbar options, ion-auto-complete also supports the following option attributes:

* **[template]** (TemplateRef) - custom template reference for your auto complete items (see below)
* **[showResultsFirst]** (Boolean) - for small lists it might be nicer to show all options on first tap (you might need to modify your service to handle an empty `keyword`)
* **[alwaysShowList]** (Boolean) - always show the list - defaults to false)
* **[hideListOnSelection]** (Boolean) - if allowing multiple selections, it might be nice not to dismiss the list after each selection - defaults to true)

Will set the Searchbar's placeholder to *Lorem Ipsum*

## Accessing Searchbar component ##

By using the `@ViewChild()` decorator, and the built-in `getValue()` method we can easily access the actual value in the searchbar component.
Just define a new property within the desired page, for instance (the chosen names are arbitrary):

```
  @ViewChild('searchbar')
  searchbar: AutoCompleteComponent;
```

And then, in the component tag we need to add `#searchbar`:

```
<ion-auto-complete [dataProvider]="provider" #searchbar></ion-auto-complete>
```

Available methods:

1. getValue(): `this.searchbar.getValue()` - get the string value of the selected item
2. getSelection(): `this.searchbar.getSelection()` - get the selected object
3. setFocus(): `this.searchbar.setFocus()` - focus on searchbar

### Contributing ###

To contribute, clone the repo. Then, run `npm install` to get the packages needed for the library to work. Running `gulp` will run a series of tasks that builds the files in `/src` into `/dist`. Replace the `/dist` into whatever Ionic application's `node_modules` where you're testing your changes to continuously improve the library.

### Deploy Procedure ###

### Build ###

Run `gulp build` from root.

#### Update Version ###

Update version `package.json` files in both the root and `dist/` directory following [Semantic Versioning (2.0.0)](https://semver.org/).
Update `dist/package.json` to have `dependencies` to match root `package.json`.

#### NPM Release ####

Run `npm publish` from `dist/` directory.

#### Update Changelog ####

Add updates to `CHANGELOG.md` in root.

### Thanks ###

[kadoshms](https://github.com/kadoshms)
[bushybuffalo](https://github.com/bushybuffalo)

### To Do ###
* Update README
* Create demo page
* Fix gulp (Scss does not always transfer, soft fail)
