# Ionic2-auto-complete

This is a component based on Ionic's search-bar component, with the addition of auto-complete abillity.
This component is super simple and light-weight. Just provide the data, and let the fun begin.

This is a **free software** please feel free to contribute! :)

![](example.gif)

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

`@import "../../node_modules/ionic2-auto-complete/src/auto-complete";`

Now, let's add the component to our app!

Add the following tag to one of your pages, in this example I am using the Homepage:

`<ion-auto-complete></ion-auto-complete>`

Now let's see what wev'e done so far by running `ionic serve`.

Now, when everything is up and running you should see a nice search-bar component. Open the **developer console** and try to type something.

Oh no! something is wrong. You probably see an excpetion similiar to :

`EXCEPTION: Error in ./AutoCompleteComponent class AutoCompleteComponent - inline template:1:21`

This is totatlly cool, for now. The exception shows up since we did not provide a **dataProvider** to the autocomplete component.

**How does it work?** So, ionic2-auto-complete is not responsible for getting the data from the server. As a developer, you should implement your own service which eventually be responsible to get the data for the component to work, as well we determing how many results to show and/or their order of display.

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

In the above example, we fetch countries data from the amazing https://restcountries.eu/ project, and we filter the results accordingly.

**Important!** the above example is just an example! the best practice would be to let the server to the filtering for us! Here, since I used the countries-api, that's the best I could do.

Another thing - the `getResults` method can also return static data, it does not have to return an Observable object.

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


### Styling ###

Currently for best visual result, use viewport size / fixed size (pixels) if you are interested in resizing the component:
```
ion-auto-complete {
  width: 50vw;
}
```
### Custom Templates ###

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


**DEPREACTED (applies for<=1.5.0)** 
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
**ionAutoInput($event)** - fired when user inputs

## Searchbar options ##

Ionic2-auto-complete supports the regular Ionic's Searchbar options, which are set to their default values as specified in the [docs](http://ionicframework.com/docs/v2/api/components/searchbar/Searchbar/).

You can override these default values by adding the `[options]` attribute to the `<ion-auto-complete>` tag, for instance:

```
  <ion-auto-complete [dataProvider]="someProvider" [options]="{ placeholder : 'Lorem Ipsum' }"></ion-auto-complete>
```

## Component specific options

In addition to the searchbar options, ion-auto-complete also supports the following option attributes:

* **[template]** (TemplateRef) - custom template reference for your auto complete items (see below)
* **[showResultsFirst]** (Boolean) - for small lists it might be nicer to show all options on first tap (you might need to modify your service to handle an empty `keyword`)

Will set the Searchbar's placeholder to *Lorem Ipsum*


## Accessing Searchbar value ##

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

By doing that, we can access the current value anywhere in the page simpprivate @ViewChild('searchbar') searchbar: anyly by calling `this.searchbar.getValue()`

