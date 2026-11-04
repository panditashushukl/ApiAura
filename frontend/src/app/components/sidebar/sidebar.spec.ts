import { TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
    }).compileComponents();
  });

  it('should create sidebar component', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an aside skeleton element', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside).toBeTruthy();
  });
});
