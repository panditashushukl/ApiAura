import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
  });

  it('should create logo component', () => {
    expect(component).toBeTruthy();
  });

  it('should render fire svg symbol', () => {
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.innerHTML).toContain('M12.963');
  });

  it('should render brand text when showText is true', () => {
    fixture.componentRef.setInput('showText', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Api');
    expect(el.textContent).toContain('Aura');
  });
});
