import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when totalPages is 0', () => {
    component.totalPages = 0;
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeNull();
  });

  it('should not render when totalPages is 1', () => {
    component.totalPages = 1;
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeNull();
  });

  it('should render pagination when totalPages > 1', () => {
    component.totalPages = 3;
    component.currentPage = 1;
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  describe('getPageNumbers', () => {
    it('should return all pages when totalPages <= 5', () => {
      component.totalPages = 3;
      component.currentPage = 1;
      expect(component.getPageNumbers()).toEqual([1, 2, 3]);
    });

    it('should return 5 pages centered on currentPage', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      expect(component.getPageNumbers()).toEqual([3, 4, 5, 6, 7]);
    });

    it('should start at 1 when currentPage is near the beginning', () => {
      component.totalPages = 10;
      component.currentPage = 2;
      expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should end at totalPages when currentPage is near the end', () => {
      component.totalPages = 10;
      component.currentPage = 9;
      expect(component.getPageNumbers()).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe('onPageChange', () => {
    it('should emit pageChange event with valid page', () => {
      component.totalPages = 5;
      component.currentPage = 1;

      const spy = vi.spyOn(component.pageChange, 'emit');
      component.onPageChange(3);
      expect(spy).toHaveBeenCalledWith(3);
    });

    it('should not emit for page less than 1', () => {
      component.totalPages = 5;
      component.currentPage = 1;

      const spy = vi.spyOn(component.pageChange, 'emit');
      component.onPageChange(0);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit for page greater than totalPages', () => {
      component.totalPages = 5;
      component.currentPage = 5;

      const spy = vi.spyOn(component.pageChange, 'emit');
      component.onPageChange(6);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
