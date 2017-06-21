import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import { ElementRef, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
export interface ChangeEvent {
    start?: number;
    end?: number;
}
export declare class VirtualScrollComponent implements OnInit, OnChanges {
    private element;
    items: any[];
    origin: any;
    length: number;
    scrollbarWidth: number;
    scrollbarHeight: number;
    childWidth: number;
    childHeight: number;
    update: EventEmitter<any[]>;
    isUpdateRequired: boolean;
    change: EventEmitter<ChangeEvent>;
    start: EventEmitter<ChangeEvent>;
    end: EventEmitter<ChangeEvent>;
    contentElementRef: ElementRef;
    scroll$: Subject<Event>;
    onScrollListener: Function;
    topPadding: number;
    scrollHeight: number;
    previousStart: number;
    previousEnd: number;
    startupLoop: boolean;
    constructor(element: ElementRef);
    onScroll(e: Event): void;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    refresh(): void;
    scrollInto(index: number): void;
    private getListLength();
    private countItemsPerRow();
    private calculateDimensions();
    private calculateItems();
}
export declare class VirtualScrollModule {
}
