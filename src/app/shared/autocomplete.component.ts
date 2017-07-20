import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import {MdAutocompleteTrigger, MdOptionSelectionChange} from '@angular/material';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-autocomplete',
  template: `
    <md-input-container class="mat-search-box">
        <input mdInput type="text" [placeholder]="placeholder" [formControl]="formControl" [mdAutocomplete]="auto">
        <button mdSuffix md-icon-button (click)="clearText()" [@textState]="textState">
            <md-icon>close</md-icon>
        </button>
    </md-input-container>
    <md-autocomplete flex #auto="mdAutocomplete">
        <md-option *ngFor="let option of filteredList | async" [value]="option.cn" (onSelectionChange)="onSelect(option.cn)">
            {{ option.cn }}
        </md-option>
    </md-autocomplete>
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
            transition('empty <=> nonEmpty', animate('120ms ease-in-out'))
        ])
    ]
})
export class AutocompleteComponent implements OnInit {
    @Input() list: any[];
    @Input() searchField = 'cn'; // default to LDAP common name
    @Input() placeholder = 'Add Group';
    textState = 'empty';
    options = this.list;
    filteredList: Observable<any>;
    formControl = new FormControl();
    @Output() textChange = new EventEmitter<string>();

    ngOnInit() {
        this.formControl = new FormControl();
        this.filteredList = this.formControl.valueChanges
                 .map( search => {
                     if ( search && search !== '' ) {
                         this.textState = 'nonEmpty';
                     } else {
                         this.textState = 'empty'
                     }
                     return search ? this.filterList( search ) : this.list.slice()
                 });
    }

    onSelect( name: string ) {
        this.textChange.emit( name );
        this.formControl.reset();
    }

    filterList( val: string ) {
        return val ? this.list.filter( (obj) => obj[this.searchField].toLowerCase().indexOf( val.toLowerCase() ) === 0 )
                   : this.list;
    }

    clearText() {
        this.formControl.reset();
    }
}
