import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KiteOptionFinder } from './kite-option-finder';

describe('KiteOptionFinder', () => {
  let component: KiteOptionFinder;
  let fixture: ComponentFixture<KiteOptionFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KiteOptionFinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KiteOptionFinder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
