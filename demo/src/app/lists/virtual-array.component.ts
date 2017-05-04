import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

import { ListItem } from './list-item.component';

@Component({
  selector: 'virtual-array-list',
  template: `
    <button (click)="reduceList()">Reduce to 100 Items</button>
    <button (click)="setToFullList()">Revert to 1000 Items</button>

    <div class="status">
      Showing <span class="badge">{{indices?.start + 1}}</span>
      - <span class="badge">{{indices?.end}}</span>
      of <span class="badge">{{filteredList?.length}}</span>
      <span>({{scrollItems?.length}} nodes)</span>
    </div>

    <virtual-scroll
      [items]="filteredList"
      [length]="filteredList.length"
      (change)="scrollItems = getList($event.start, $event.end); indices = $event"
      [childHeight]="100">

      <list-item *ngFor="let item of scrollItems" [item]="item"></list-item>
      
    </virtual-scroll>
  `,
  styleUrls: ['./virtual-array.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualArrayComponent implements OnChanges {

  @Input()
  items: ListItem[];
  indices: any;

  filteredList: ListItem[];

  getList(start: number, end: number) {
    return (this.filteredList || []).slice(start, end);
  }

  reduceList() {
    this.filteredList = (this.items || []).slice(0, 100);
  }

  setToFullList() {
    this.filteredList = (this.items || []).slice();
  }

  ngOnChanges() {
    this.setToFullList();
  }

}
