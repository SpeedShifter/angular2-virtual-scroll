import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

export interface ChangeEvent {
  start?: number;
  end?: number;
}

@Component({
  selector: 'virtual-scroll',
  template: `
    <div class="total-padding" [style.height]="scrollHeight + 'px'"></div>
    <div class="scrollable-content" #content [style.transform]="'translateY(' + topPadding + 'px)'">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      overflow: hidden;
      overflow-y: auto;
      position: relative;
      -webkit-overflow-scrolling: touch;
    }

    .scrollable-content {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      position: absolute;
    }

    .total-padding {
      width: 1px;
      opacity: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScrollComponent implements OnInit, OnChanges {

  @Input()
  items: any[] = [];

  @Input()
  origin: any;

  @Input()
  length: number;

  @Input()
  scrollbarWidth: number;

  @Input()
  scrollbarHeight: number;

  @Input()
  childWidth: number;

  @Input()
  childHeight: number;

  @Output()
  update: EventEmitter<any[]> = new EventEmitter<any[]>();
  isUpdateRequired = false;

  @Output()
  change: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  @Output()
  start: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  @Output()
  end: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  @ViewChild('content', {read: ElementRef})
  contentElementRef: ElementRef;

  topPadding: number;
  scrollHeight: number;
  previousStart: number;
  previousEnd: number;
  startupLoop: boolean = true;

  constructor(private element: ElementRef) {
  }

  ngOnInit() {
    this.scrollbarWidth = 0; // this.element.nativeElement.offsetWidth - this.element.nativeElement.clientWidth;
    this.scrollbarHeight = 0; // this.element.nativeElement.offsetHeight - this.element.nativeElement.clientHeight;

    this.isUpdateRequired = this.update.observers.length > 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.previousStart = undefined;
    this.previousEnd = undefined;
    this.refresh();
  }

  refresh() {
    requestAnimationFrame(this.calculateItems.bind(this));
  }

  scrollInto(index: number) {
    if (index < 0 || index >= this.getListLength()) return;

    let d = this.calculateDimensions();
    this.element.nativeElement.scrollTop = Math.floor(index / d.itemsPerRow) *
      d.childHeight - Math.max(0, (d.itemsPerCol - 1)) * d.childHeight;
    this.refresh();
  }

  @HostListener('scroll')
  onScroll() {
    this.refresh();
  }

  private getListLength() {
    return this.length || (this.items && this.items.length) || 0;
  }

  private countItemsPerRow() {
    let offsetTop;
    let itemsPerRow;
    let children = this.contentElementRef.nativeElement.children;
    for (itemsPerRow = 0; itemsPerRow < children.length; itemsPerRow++) {
      if (offsetTop != undefined && offsetTop !== children[itemsPerRow].offsetTop) break;
      offsetTop = children[itemsPerRow].offsetTop;
    }
    return itemsPerRow;
  }

  private calculateDimensions() {
    let el = this.element.nativeElement;
    let content = this.contentElementRef.nativeElement;

    let itemCount = this.getListLength();
    let viewWidth = el.clientWidth - this.scrollbarWidth;
    let viewHeight = el.clientHeight - this.scrollbarHeight;

    let contentDimensions;
    if (this.childWidth == undefined || this.childHeight == undefined) {
      contentDimensions = content.children[0] ? content.children[0].getBoundingClientRect() : {
        width: viewWidth,
        height: viewHeight
      };
    }
    let childWidth = this.childWidth || contentDimensions.width;
    let childHeight = this.childHeight || contentDimensions.height;

    let itemsPerRow = Math.max(1, this.countItemsPerRow());
    let itemsPerRowByCalc = Math.max(1, Math.floor(viewWidth / childWidth));
    let itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
    if (itemsPerCol === 1 && Math.floor(el.scrollTop / this.scrollHeight * itemCount) + itemsPerRowByCalc >= itemCount) {
      itemsPerRow = itemsPerRowByCalc;
    }

    return {
      itemCount: itemCount,
      viewWidth: viewWidth,
      viewHeight: viewHeight,
      childWidth: childWidth,
      childHeight: childHeight,
      itemsPerRow: itemsPerRow,
      itemsPerCol: itemsPerCol,
      itemsPerRowByCalc: itemsPerRowByCalc
    };
  }

  private calculateItems() {
    let el = this.element.nativeElement;

    let d = this.calculateDimensions();
    this.scrollHeight = d.childHeight * d.itemCount / d.itemsPerRow;
    if (this.element.nativeElement.scrollTop > this.scrollHeight) {
      this.element.nativeElement.scrollTop = this.scrollHeight;
    }

    let indexByScrollTop = el.scrollTop / this.scrollHeight * d.itemCount / d.itemsPerRow;
    let end = Math.min(d.itemCount, Math.ceil(indexByScrollTop) * d.itemsPerRow + d.itemsPerRow * (d.itemsPerCol + 1));

    let maxStartEnd = end;
    const modEnd = end % d.itemsPerRow;
    if (modEnd) {
      maxStartEnd = end + d.itemsPerRow - modEnd;
    }
    let maxStart = Math.max(0, maxStartEnd - d.itemsPerCol * d.itemsPerRow - d.itemsPerRow);
    let start = Math.min(maxStart, Math.floor(indexByScrollTop) * d.itemsPerRow);

    if (isNaN(start) || isNaN(end)) {
      start = end = 0;
    }

    this.topPadding = d.childHeight * Math.ceil(start / d.itemsPerRow);
    if (start !== this.previousStart || end !== this.previousEnd) {

      if (this.isUpdateRequired) { // we don't wont to make unnecessary slice operation
        // update the scroll list
        this.update.emit((this.items || []).slice(start, end));
      }

      // emit 'start' event
      if (start !== this.previousStart && this.startupLoop === false) {
        this.start.emit({start, end});
      }

      // emit 'end' event
      if (end !== this.previousEnd && this.startupLoop === false) {
        this.end.emit({start, end});
      }

      this.previousStart = start;
      this.previousEnd = end;

      this.change.emit({start, end});

      if (this.startupLoop === true) {
        this.refresh();
      }
    } else if (this.startupLoop === true) {
      this.startupLoop = false;
      this.refresh();
    }
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [VirtualScrollComponent],
  declarations: [VirtualScrollComponent]
})
export class VirtualScrollModule {
}
