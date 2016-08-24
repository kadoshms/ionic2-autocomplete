# Ionic2-auto-complete

This is a component based on Ionic's search-bar component, with the addition of auto-complete abillity.
This component is super simple and light-weight. Just provide the data, and let the fun begin.

### Installation
```
$ npm install ionic2-auto-complete --save
```
In addition, Ionic2-auto-complete has some stylesheets we must include in order to have a nice and tidy component.
Than, we must modify **gulpfile.js**:

Replace the following line:

```
gulp.task('sass',buildSass); 
```

With the following:

```
gulp.task('sass', function () {
  return buildSass({
    sassOptions: {
      includePaths: [
        'node_modules/ionic-angular',
        'node_modules/ionicons/dist/scss',
        'node_modules/ionic2-auto-complete/dist',
        'www/scss'
      ]
    }
  });
});
```

That will let ionic know it has to compile also *scss* files from this module as well as it's default files.
We now need to import the css file to the project.
Open `app.core.scss` and add:

`` @import "auto-complete"; `` 
Before the other imports (some of you might notice that the IDE doesn't like this import, you can ignore that).

### Usage
Let's open some page file. For example, *home.ts*, and import the following:

`import {AUTOCOMPLETE_DIRECTIVES} from 'ionic2-auto-complete';`

In addition, we must inform Angular that we have some new directives we want to use, so we just need to add *AUTOCOMPLETE_DIRECTIVES* to the *directives* property:
```
@Component({
  templateUrl: 'build/pages/home/home.html',
  directives : [AUTOCOMPLETE_DIRECTIVES]
})
```

Now we can add the component to *home.html*, simply by adding:

`<ion-auto-complete></ion-auto-complete>` to the file.
Now let's see what wev'e done so far by running `ionic serve`.

Now, when everything is up and running you should see a nice search-bar component. Open the **developer console** and try to type something.

Oh no! something is wrong. You probably see an excpetion similiar to :

`EXCEPTION: Error in ./AutoCompleteComponent class AutoCompleteComponent - inline template:1:21`

This is totatlly cool, for now. The exception shows up since we did not provide a **dataProvider** to the autocomplete component.

**How does it work?** So, ionic2-auto-complete is not responsible for getting the data from the server. As a developer, you should implement your own service which eventually be responsible to get the data for the component to work, as well we determing how many results to show and/or their order of display.

Let's start by creating the service:

import {AutoCompleteService} from 'ionic2-auto-complete';
```
import {AutoCompleteService} from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import {Injectable} from "@angular/core";

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

1. **labelAttribute** [string] - which is the name of the object's descriptive property
2. **getResults(keyword)** [() => any] - which is the method responsible for getting the data from server.

In the above example, we fetch countries data from the amazing https://restcountries.eu/ project, and we filter the results accordingly.

**Important!** the above example is just an example! the best practice would be to let the server to the filtering for us! Here, since I used the countries-api, that's the best I could do.

Another thing - the `getResults` method can also return static data, it does not have to return an Observable object.

Now, we need to let ionic2-auto-complete that we want to use CompleteTestService as the data provider, edit *home.ts* and add `private completeTestService: CompleteTestService` to the constructor argument list.
Should look like that:
```
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AUTOCOMPLETE_DIRECTIVES} from 'ionic2-auto-complete';
import {CompleteTestService} from '../../services/complete-test.service';

@Component({
  templateUrl: 'build/pages/home/home.html',
  directives : [AUTOCOMPLETE_DIRECTIVES],
  providers  : [CompleteTestService]
})
export class HomePage {
  constructor(public navCtrl: NavController, private completeTestService: CompleteTestService) {

  }
}
```

Than, in *home.html* modify `<ion-auto-complete>`:
```
<ion-auto-complete [dataProvider]="completeTestService"></ion-auto-complete>
```

Now, everything should be up and ready :)

### Custom Templates ###

Ionic2-auto-complete also supports custom templates for the list items.
Let's assuming that in addition to the country name, we also wish to display the country flag.

For that, we need to create a new file, let's call it for instance `comp-test-item.ts`:
```
import {AutoCompleteItem, AutoCompleteItemComponent, AUTOCOMPLETE_PIPES} from 'ionic2-auto-complete';

@AutoCompleteItem({
  template : `<img src="build/images/flags/{{data.name}}.png" class="flag" /> <span [innerHTML]="data.name | boldbegin:keyword"></span>`,
  pipes    : [AUTOCOMPLETE_PIPES]
})
export class CompTestItem extends AutoCompleteItemComponent{
}
```

What is going on above is very simple.
In order to implement a custom Item component, you need to follow these steps:

1. Import all neccessary classes. **Note:** Importing and using `AUTOCOMPLETE_PIPES` is optional.
2. Use the `@AutoCompleteItem` decorator, which currently accepts `template` or `templateUrl` and `pipes`.
3. Extend the AutoCompleteItemComponent class with your own class.
4. Add the custom component to the page's directives properties, e.g, in *home.ts* : `directives : [AUTOCOMPLETE_DIRECTIVES, CompTestItem]`

## Events ##

**itemSelected($event)** - fired when item is selected (clicked)
**ionAutoInput($event)** - fired when user inputs

## Searchbar options ##

Ionic2-auto-complete supports the regular Ionic's Searchbar options, which are set to their default values as specified in the [docs](http://ionicframework.com/docs/v2/api/components/searchbar/Searchbar/).

You can override these default values by adding the `[options]` attribute to the `<ion-auto-complete>` tag, for instance:

```
  <ion-auto-complete [dataProvider]="someProvider" options="{ placeholder : 'Lorem Ipsum' }"></ion-auto-complete>
```

Will set the Searchbar's placeholder to *Lorem Ipsum*


## Accessing Searchbar value ##

By using the `@ViewChild()` decorator, and the built-in `getValue()` method we can easily access the actual value in the searchbar component.
Just define a new property within the desired page, for instance (the chosen names are arbitrary):

```
    private @ViewChild('searchbar') searchbar: any;
```

And then, in the component tag we need to add `#searchbar`:

```
<ion-auto-complete [dataProvider]="provider" #searchbar></ion-auto-complete>
```

By doing that, we can access the current value anywhere in the page simply by calling `this.searchbar.getValue()`

