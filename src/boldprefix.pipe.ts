import { Injectable, PipeTransform, Pipe } from '@angular/core';

/**
 * bolds the beggining of the matching string in the item
 */
@Pipe({
    name: 'boldprefix'
})
@Injectable()
export class BoldPrefix implements PipeTransform {
    transform(value: string, keyword: string): any {
        let escaped_keyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return value.replace(new RegExp(escaped_keyword, 'gi'), function(str) { return str.bold(); });
    }
}
