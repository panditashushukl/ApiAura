import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteTarget } from './admin-resource-helper';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen() && target()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        role="dialog"
        aria-modal="true"
        (keydown.escape)="cancelled.emit()"
      >
        <div
          class="bg-surface border border-app rounded-2xl shadow-2xl max-w-md w-full p-6 text-main animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-main">Confirm Deletion</h3>
              <p class="text-xs text-muted">This action is permanent and cannot be undone.</p>
            </div>
          </div>

          <p class="text-sm text-secondary mb-6">
            Are you sure you want to delete
            <span class="font-bold text-main">{{ target()?.name }}</span>?
            All associated access rules and permissions for this {{ target()?.type }} will be removed immediately.
          </p>

          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="cancelled.emit()"
              [disabled]="isLoading()"
              class="px-4 py-2 text-xs font-semibold rounded-xl text-secondary hover:text-main hover:bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmed.emit()"
              [disabled]="isLoading()"
              class="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (isLoading()) {
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              }
              <span>Delete {{ target()?.type }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DeleteConfirmDialogComponent {
  readonly isOpen = input<boolean>(false);
  readonly target = input<DeleteTarget | null>(null);
  readonly isLoading = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}

