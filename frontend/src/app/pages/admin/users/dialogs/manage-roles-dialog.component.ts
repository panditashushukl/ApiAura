import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRole, AdminUser } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-manage-roles-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen() && user()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        role="dialog"
        aria-modal="true"
        (keydown.escape)="cancelled.emit()"
      >
        <div
          class="bg-surface border border-app rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[85vh] text-main animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-app flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-base font-bold text-main">Manage User Roles</h3>
              <p class="text-xs text-muted">Assign or revoke security roles for {{ user()?.name }}.</p>
            </div>
            <button
              type="button"
              (click)="cancelled.emit()"
              class="p-1.5 rounded-lg text-muted hover:text-main hover:bg-subtle transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 flex-1 overflow-y-auto space-y-3">
            @for (role of allRoles(); track role.id) {
              <div
                class="flex items-center justify-between p-3.5 rounded-xl border border-app hover:border-bhagwa-500/30 transition-all bg-subtle/30"
              >
                <div class="min-w-0 pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-main">{{ role.name }}</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface border border-app text-muted">
                      {{ role.code }}
                    </span>
                    @if (role.systemRole) {
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-bhagwa-500/10 text-bhagwa border border-bhagwa-500/20">
                        SYSTEM
                      </span>
                    }
                  </div>
                  @if (role.description) {
                    <p class="text-[11px] text-muted mt-0.5 truncate">{{ role.description }}</p>
                  }
                </div>

                <button
                  type="button"
                  (click)="roleToggled.emit(role.id)"
                  [disabled]="isLoading()"
                  [class]="isRoleAssigned(role.id)
                    ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-600 cursor-pointer transition-all'
                    : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-app text-secondary hover:text-bhagwa hover:border-bhagwa-500/30 cursor-pointer transition-all'"
                >
                  {{ isRoleAssigned(role.id) ? 'Assigned ✓' : '+ Assign' }}
                </button>
              </div>
            } @empty {
              <div class="p-8 text-center text-xs text-muted">No roles found in system.</div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-app flex items-center justify-end shrink-0">
            <button
              type="button"
              (click)="cancelled.emit()"
              class="px-4 py-2 text-xs font-semibold rounded-xl bg-subtle hover:bg-surface border border-app text-main transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ManageRolesDialogComponent {
  readonly isOpen = input<boolean>(false);
  readonly user = input<AdminUser | null>(null);
  readonly allRoles = input<AdminRole[]>([]);
  readonly userRoles = input<AdminRole[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly roleToggled = output<string>();
  readonly cancelled = output<void>();

  isRoleAssigned(roleId: string): boolean {
    return this.userRoles().some((r) => r.id === roleId);
  }
}

