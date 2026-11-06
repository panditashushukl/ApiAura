import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRole } from '../../../../core/models/admin.models';
import { PermissionGroup } from '../../shared/admin-resource-helper';

@Component({
  selector: 'app-role-permissions-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen() && role()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        role="dialog"
        aria-modal="true"
        (keydown.escape)="closed.emit()"
      >
        <div
          class="bg-surface border border-app rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] text-main animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-app flex items-center justify-between shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-main">Manage Role Permissions</h3>
                <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-bhagwa-500/10 text-bhagwa border border-bhagwa-500/20">
                  {{ role()?.code }}
                </span>
              </div>
              <p class="text-xs text-muted mt-0.5">
                Configure fine-grained resource permissions granted to {{ role()?.name }}.
              </p>
            </div>
            <button
              type="button"
              (click)="closed.emit()"
              class="p-1.5 rounded-lg text-muted hover:text-main hover:bg-subtle transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Search & Filter Toolbar -->
          <div class="px-6 py-3 border-b border-app bg-subtle/30 flex items-center gap-3 shrink-0">
            <div class="relative flex-1">
              <input
                type="text"
                placeholder="Search permissions by name, code, resource, or action..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                class="w-full px-3 py-2 text-xs rounded-xl bg-surface border border-app text-main placeholder-muted focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500/30 transition-all pr-8"
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
          </div>

          <!-- Grouped Permissions List -->
          <div class="p-6 flex-1 overflow-y-auto space-y-5">
            @for (group of permissionGroups(); track group.resource) {
              <div class="border border-app rounded-2xl bg-surface overflow-hidden shadow-2xs">
                <!-- Group Header -->
                <div class="px-4 py-3 bg-subtle/40 border-b border-app flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-main">{{ group.displayName }}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface border border-app text-secondary">
                        {{ group.grantedCount }} / {{ group.totalCount }}
                      </span>
                    </div>
                    <p class="text-[11px] text-muted mt-0.5">{{ group.description }}</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="toggleGroup.emit({ group, grant: true })"
                      [disabled]="isLoading() || group.grantedCount === group.totalCount"
                      class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface border border-app text-secondary hover:text-bhagwa hover:border-bhagwa-500/30 transition-all cursor-pointer disabled:opacity-40"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      (click)="toggleGroup.emit({ group, grant: false })"
                      [disabled]="isLoading() || group.grantedCount === 0"
                      class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface border border-app text-secondary hover:text-rose-600 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-40"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>

                <!-- Group Items Grid -->
                <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (perm of group.permissions; track perm.id) {
                    <div
                      class="p-2.5 rounded-xl border border-app flex items-center justify-between gap-2 hover:bg-subtle/40 transition-colors"
                      [class.bg-bhagwa-500/5]="isGranted(perm.id)"
                      [class.border-bhagwa-500/30]="isGranted(perm.id)"
                    >
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-semibold text-main truncate">{{ perm.name }}</span>
                          <span class="text-[10px] font-mono font-bold text-muted bg-subtle px-1.5 py-0.5 rounded border border-app shrink-0">
                            {{ perm.action }}
                          </span>
                        </div>
                        <p class="text-[10px] font-mono text-muted truncate mt-0.5">{{ perm.code }}</p>
                      </div>

                      <button
                        type="button"
                        (click)="togglePermission.emit(perm.id)"
                        [disabled]="isLoading()"
                        [class]="isGranted(perm.id)
                          ? 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-600 transition-all cursor-pointer shrink-0'
                          : 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-subtle border border-app text-secondary hover:text-bhagwa hover:border-bhagwa-500/30 transition-all cursor-pointer shrink-0'"
                      >
                        {{ isGranted(perm.id) ? 'Active ✓' : 'Grant +' }}
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-xs text-muted border border-dashed border-app rounded-2xl">
                No matching permissions found.
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 border-t border-app flex items-center justify-end shrink-0">
            <button
              type="button"
              (click)="closed.emit()"
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-bhagwa-600 hover:bg-bhagwa-700 text-white shadow-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RolePermissionsDialogComponent {
  readonly isOpen = input<boolean>(false);
  readonly role = input<AdminRole | null>(null);
  readonly permissionGroups = input<PermissionGroup[]>([]);
  readonly grantedPermissionIds = input<Set<string>>(new Set());
  readonly searchQuery = model<string>('');
  readonly isLoading = input<boolean>(false);

  readonly togglePermission = output<string>();
  readonly toggleGroup = output<{ group: PermissionGroup; grant: boolean }>();
  readonly closed = output<void>();

  isGranted(id: string): boolean {
    return this.grantedPermissionIds().has(id);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}

