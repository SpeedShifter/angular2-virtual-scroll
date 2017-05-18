import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

import { ListItem } from './list-item.component';

@Component({
  selector: 'virtual-array-list',
  template: `
    <button (click)="emptyList()">Empty list</button>
    <button (click)="reduceList()">Reduce to 100 Items</button>
    <button (click)="setToFullList()">Revert to 1000 Items</button>
    <button (click)="toggleLoop()">{{loop ? 'Revert to normal' : 'Loop 20 Items'}}</button>

    <div class="status">
      Showing <span class="badge">{{indices?.start + 1}}</span>
      - <span class="badge">{{indices?.end}}</span>
      of <span class="badge">{{filteredList?.length}}</span>
      <span>({{scrollItems?.length}} nodes)</span>
    </div>

    <virtual-scroll
      [origin]="filteredList"
      [length]="filteredList.length"
      (change)="scrollItems = getList($event.start, $event.end); indices = $event">

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
  loop = 0;

  getList(start: number, end: number) {
    if (this.loop) {
      const items = (this.filteredList || []);

      start = start % this.loop;
      end = end % this.loop;

      if (start > end) {
        return items.slice(start, this.loop).concat(items.slice(0, end));
      }
    }
    return (this.filteredList || []).slice(start, end);
  }

  reduceList() {
    this.filteredList = (this.items || []).slice(0, 100);
    this.loop = 0;
  }

  emptyList() {
    this.filteredList = [];
    this.loop = 0;
  }

  setToFullList() {
    this.filteredList = (this.items || []).slice();
    this.loop = 0;
  }

  ngOnChanges() {
    this.setToFullList();
  }

  toggleLoop() {
    this.filteredList = (this.filteredList || []).slice();
    this.loop = this.loop ? 0 : 20;
  }

}
