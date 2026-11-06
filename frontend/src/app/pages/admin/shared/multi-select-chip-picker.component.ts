import { Component, computed, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PickerItem {
  id: string;
  name: string;
  code?: string;
  slug?: string;
}

@Component({
  selector: 'app-multi-select-chip-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-2">
      @if (title()) {
        <label class="text-xs font-semibold text-secondary flex items-center justify-between">
          <span>{{ title() }}</span>
          <span class="text-muted text-[11px] font-normal">
            {{ selectedIds().length }} selected
          </span>
        </label>
      }

      <!-- Selected Chips Display -->
      @if (selectedItems().length > 0) {
        <div class="flex flex-wrap gap-1.5 p-2 bg-subtle/50 border border-app rounded-xl max-h-24 overflow-y-auto">
          @for (item of selectedItems(); track item.id) {
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-bhagwa text-bhagwa text-xs font-medium shadow-2xs"
            >
              <span class="truncate max-w-[140px]">{{ item.name }}</span>
              <button
                type="button"
                (click)="removeItem(item.id)"
                class="hover:text-rose-500 rounded-full p-0.5 transition-colors cursor-pointer"
                title="Remove"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </span>
          }
        </div>
      }

      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          [placeholder]="placeholder()"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          class="w-full px-3 py-2 text-xs rounded-xl bg-subtle border border-app text-main placeholder-muted focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500/30 transition-all pr-8"
        />
        @if (searchQuery()) {
          <button
            type="button"
            (click)="searchQuery.set('')"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }
      </div>

      <!-- Items List -->
      <div class="max-h-36 overflow-y-auto border border-app rounded-xl bg-surface divide-y divide-subtle">
        @for (item of filteredItems(); track item.id) {
          <label
            class="flex items-center justify-between px-3 py-2 text-xs hover:bg-subtle/60 transition-colors cursor-pointer select-none"
          >
            <div class="flex items-center gap-2 min-w-0">
              <input
                type="checkbox"
                [checked]="isSelected(item.id)"
                (change)="toggleItem(item.id)"
                class="rounded border-app text-bhagwa-600 focus:ring-bhagwa-500 cursor-pointer"
              />
              <span class="truncate font-medium text-main">{{ item.name }}</span>
            </div>
            @if (item.code || item.slug) {
              <span class="text-[10px] text-muted font-mono shrink-0 ml-2">
                {{ item.code || item.slug }}
              </span>
            }
          </label>
        } @empty {
          <div class="px-3 py-4 text-center text-xs text-muted">
            No matching items found
          </div>
        }
      </div>
    </div>
  `,
})
export class MultiSelectChipPickerComponent {
  readonly title = input<string>('');
  readonly placeholder = input<string>('Search items...');
  readonly items = input<PickerItem[]>([]);
  readonly selectedIds = model<string[]>([]);

  readonly searchQuery = signal<string>('');

  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.items();
    if (!query) return all;
    return all.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(query) ||
        (item.code || '').toLowerCase().includes(query) ||
        (item.slug || '').toLowerCase().includes(query),
    );
  });

  readonly selectedItems = computed(() => {
    const selected = new Set(this.selectedIds());
    return this.items().filter((i) => selected.has(i.id));
  });

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggleItem(id: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }

  removeItem(id: string): void {
    this.selectedIds.update((ids) => ids.filter((item) => item !== id));
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}

