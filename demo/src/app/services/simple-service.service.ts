import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {AutoCompleteService} from 'ionic4-auto-complete';

import {Country} from '../models/country.model';

@Injectable()
export class SimpleService implements AutoCompleteService {
  labelAttribute = 'name';

  private countries:Country[] = [];

  constructor(
    private http:HttpClient
  ) {

  }

  getResults(keyword:string):Observable<any[]> {
    let observable:Observable<any>;

    if (this.countries.length === 0) {
      observable = this.http.get('https://restcountries.eu/rest/v2/all').pipe(
        map(
          (results:Country[]) => {
            if (results) {
              this.countries = results;
            }

            return this.countries;
          }
        )
      );
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
