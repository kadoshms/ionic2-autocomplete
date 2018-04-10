# Ionic2-auto-complete

## Disclaimer ##
Due to a very little free time, I am not fully available for mainting and supporting this project, so contributions are very welcome!!!


## About ##
This is a component based on Ionic's search-bar component, with the addition of auto-complete abillity.
This component is super simple and light-weight. Just provide the data, and let the fun begin.

This is a **free software** please feel free to contribute! :)

![](example.gif)

### Angular 5.0 Support

Since Angular 5.0 was out, a several issues occured. 
Thanks to @CoreyCole, most of them are gone now :)

If you encounter another issues regrading Angular 5, pleae file an issue!

For more info: https://github.com/kadoshms/ionic2-autocomplete/issues/128

### Installation
```
$ npm install ionic2-auto-complete --save
```

#### Usage guide

Open `app.module.ts` and add the following import statetment:

``
import { AutoCompleteModule } from 'ionic2-auto-complete';
``

Then, add the `AutoCompleteModule` to the `imports` array:

```
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    MyItem
  ],
  imports: [
    BrowserModule,
    AutoCompleteModule,
    FormsModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  ...
  ...
})
export class AppModule {}
```
Now let's import the styling file. Open `app.scss` and add the following:

`@import "../../node_modules/ionic2-auto-complete/auto-complete";`

Now, let's add the component to our app!

Add the following tag to one of your pages, in this example I am using the Homepage:

`<ion-auto-complete></ion-auto-complete>`

Now let's see what wev'e done so far by running `ionic serve`.

Now, when everything is up and running you should see a nice search-bar component. Open the **developer console** and try to type something.

Oh no! something is wrong. You probably see an excpetion similiar to :

`EXCEPTION: Error in ./AutoCompleteComponent class AutoCompleteComponent - inline template:1:21`

This is totatlly cool, for now. The exception shows up since we did not provide a **dataProvider** to the autocomplete component.

**How does it work?** So, ionic2-auto-complete is not responsible for getting the data from the server. As a developer, you should implement your own service which eventually be responsible to get the data for the component to work, as well we determing how many results to show and/or their order of display.

So there are two possibilities to provide data:

1. A simple function that returns an Array of items
2. An instance of 'AutocompleteService' (specified below)

Let's start by creating the service:

```
import {AutoCompleteService} from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map'

@Injectable()
export class CompleteTestService implements AutoCompleteService {
  labelAttribute = "name";

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

By implementing an AutoCompleteService interface, you must implement two properties:

1. **labelAttribute** [string] - which is the name of the object's descriptive property (leaving it null is also an option for non-object results)
2. **getResults(keyword)** [() => any] - which is the method responsible for getting the data from server.

The **getResults** method can return one of:
- an Observable that produces an array
- a Subject (like an Observable)
- a Promise that provides an array
- directly an array of values

In the above example, we fetch countries data from the amazing https://restcountries.eu/ project, and we filter the results accordingly.

**Important!** the above example is just an example! the best practice would be to let the server to the filtering for us! Here, since I used the countries-api, that's the best I could do.

Now, we need to let ionic2-auto-complete that we want to use CompleteTestService as the data provider, edit *home.ts* and add `private completeTestService: CompleteTestService` to the constructor argument list.
Should look like that:
```
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CompleteTestService } from '../../providers/CompleteTestService';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public completeTestService: CompleteTestService) {

  }

}

```

Than, in *home.html* modify `<ion-auto-complete>`:
```
<ion-auto-complete [dataProvider]="completeTestService"></ion-auto-complete>
```

Now, everything should be up and ready :)


----------------------------------------------------------------------------

### Use auto-complete in Angular FormGroup ###

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

**NOTE** As said above by default for backward compatibility, only the name is used as value not the country object.


#### How to use another field as form value ? ####

To indicate that you don't want the label as value but another field of the country object returned by the REST service, you can specify the attribute **formValueAttribute** on your dataProvider. For example, we want to use the country numeric code as value and still use the country name as label.

Let's update the service (juste declare `formValueAttribute` property):

```
import {AutoCompleteService} from 'ionic2-auto-complete';
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
import {AutoCompleteService} from 'ionic2-auto-complete';
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
import {AutoCompleteService} from 'ionic2-auto-complete';
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


### Custom Templates (for versions 1.5.0 and above) ###

**NOTE** this feature uses ng-template which was introduced in Angular versions 4.0.0 and later, it might not work in earlier versions.

Ionic2-auto-complete also supports custom templates for the list items.
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

#### Old custom templates mechanism (depreacted) ####
**NOTE** the following is depreacted! (versions less than 1.5.0)


**DEPREACTED (applies for<1.5.0)**
For that, we need to create a new file, let's call it for instance `comp-test-item.ts`:
```
import {AutoCompleteItem, AutoCompleteItemComponent} from 'ionic2-auto-complete';

@AutoCompleteItem({
  template: `<img src="assets/image/flags/{{data.name}}.png" class="flag" /> <span [innerHTML]="data.name | boldprefix:keyword"></span>`
})
export class CompTestItem extends AutoCompleteItemComponent{

}

```

And we must also add this component to our module:

```
@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    CompTestItem
  ],
  ...
  ...
  providers: [
    StatusBar,
    SplashScreen,
    CompleteTestService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]

```

What is going on above is very simple.
In order to implement a custom Item component, you need to follow these steps:

1. Import all neccessary classes.
2. Use the `@AutoCompleteItem` decorator, which currently accepts `template` only (`templeteUrl` is currently not supported).
3. Extend the AutoCompleteItemComponent class with your own class.

**DEPREACTED**

## Events ##

**itemSelected($event)** - fired when item is selected (clicked)  
**itemsShown($event)** - fired when items are shown  
**itemsHidden($event)** - fired when items are hidden  
**ionAutoInput($event)** - fired when user inputs  
**autoFocus($event)** - fired when the input is focused  
**autoBlur($event)** - fired when the input is blured  

## Searchbar options ##

Ionic2-auto-complete supports the regular Ionic's Searchbar options, which are set to their default values as specified in the [docs](http://ionicframework.com/docs/v2/api/components/searchbar/Searchbar/).

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

## ngModel (since 1.5.3) ##

Many thanks to [bushybuffalo](https://github.com/bushybuffalo) for contributing this cool feature.
You can now bind the component with an ngModel.
Please note that if you use an object as your model, the component will try to achieve the initial keyword value using the labelAttribute.
For plain string models, it will just use the value itself.

## Contributing ##

To contribute, clone the repo. Then, run `npm install` to get the packages needed for the library to work. Running `gulp` will run a series of tasks that builds the files in `/src` into `/dist`. Replace the `/dist` into whatever Ionic application's `node_modules` where you're testing your changes to continously improve the library.
