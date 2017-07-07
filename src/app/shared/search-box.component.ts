import { Component, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'app-search-box',
  template: `
    <div class="search-box" (click)="$event.stopPropagation()">
        <input #input type="text" placeholder="Search" (input)="update()" [(ngModel)]="search">
        <button md-icon-button (click)="clearText()" [@textState]="textState">
            <md-icon>close</md-icon>
        </button>
    </div>
    `,
  styleUrls: ['./search-box.component.css'],
  animations: [
    trigger('textState', [
        state('empty', style({
            transform: 'scale(0)'
        })),
        state('nonEmpty', style({
            transform: 'scale(1)'
        })),
        transition('empty => nonEmpty', animate('120ms ease-in')),
        transition('nonEmpty => empty', animate('120ms ease-out'))
    ])
  ]
})
export class SearchBoxComponent {
    search: string;
    textState = 'empty';
    @Output() textChange = new EventEmitter<string>();
    debouncer = new EventEmitter<string>();

    constructor() {
        // We create a debouncer stream to delay input to parent components
        this.debouncer.debounceTime(200)
                 .distinctUntilChanged()
                 .subscribe( val => this.textChange.emit( val ));
    }

    update() {
        if ( this.search && this.search !== '' ) {
            this.textState = 'nonEmpty';
        } else {
            this.textState = 'empty'
        }
        this.debouncer.next( this.search );
    }

    clearText() {
        this.search = '';
        this.update();
    }
}
