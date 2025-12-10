import { Component, OnInit, NgZone  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface InstrumentRow {
  [key: string]: string;
}

interface OptionSelection {
  strike: number;
  tradingSymbol: string;
  instrumentToken: number;
  expiry: Date;
  tvSymbol: string;
}

interface ResultSet {
  niftyCE?: OptionSelection;
  niftyPE?: OptionSelection;
  bankNiftyCE?: OptionSelection;
  bankNiftyPE?: OptionSelection;
  sensexCE?: OptionSelection;
  sensexPE?: OptionSelection;
}
interface IndexLtp {
  NIFTY50: number | null;
  BANKNIFTY: number | null;
  SENSEX: number | null;
}

@Component({
  selector: 'app-kite-option-finder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 max-w-4xl mx-auto space-y-4">
      <h2 class="text-xl font-bold mb-2">Zerodha Index Option Picker</h2>

      <div class="border rounded p-3 space-y-3">
        <h3 class="font-semibold">Inputs</h3>
        <p class="text-xs text-gray-600">
          instruments.csv is loaded from <code>assets/instruments.csv</code>
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label class="flex flex-col text-sm">
            NIFTY Spot
            <input
              type="number"
              class="border rounded px-2 py-1"
              [(ngModel)]="niftySpot"
              name="niftySpot"
            />
          </label>

          <label class="flex flex-col text-sm">
            BANKNIFTY Spot
            <input
              type="number"
              class="border rounded px-2 py-1"
              [(ngModel)]="bankNiftySpot"
              name="bankNiftySpot"
            />
          </label>

          <label class="flex flex-col text-sm">
            SENSEX Spot
            <input
              type="number"
              class="border rounded px-2 py-1"
              [(ngModel)]="sensexSpot"
              name="sensexSpot"
            />
          </label>
        </div>

        <button
          class="mt-2 px-4 py-2 rounded bg-blue-600 text-white text-sm"
          (click)="onCalculate()"
          [disabled]="loading"
        >
          {{ loading ? 'Loading instruments…' : 'Calculate & Find Options' }}
        </button>

        <div *ngIf="instruments.length" class="text-xs text-green-700 mt-1">
          Loaded {{ instruments.length }} instruments.
        </div>

        <div *ngIf="error" class="mt-2 text-sm text-red-600">
          {{ error }}
        </div>
      </div>

      <div *ngIf="results" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- NIFTY -->
        <div
          class="border rounded p-3"
          *ngIf="results && results.niftyCE && results.niftyPE"
        >
          <h3 class="font-semibold mb-2">NIFTY (Weekly)</h3>
          <div class="text-sm space-y-1">
            <div>
              <span class="font-medium">CE Strike:</span>
              {{ results.niftyCE.strike }}
            </div>
            <div>
              <span class="font-medium">CE Symbol:</span>
              {{ results.niftyCE.tradingSymbol }}
            </div>
            <div>
              <span class="font-medium">CE Token:</span>
              {{ results.niftyCE.instrumentToken }}
            </div>
            <div>
              <span class="font-medium">CE TV:</span>
              {{ results.niftyCE.tvSymbol }}
            </div>
            <hr />
            <div>
              <span class="font-medium">PE Strike:</span>
              {{ results.niftyPE.strike }}
            </div>
            <div>
              <span class="font-medium">PE Symbol:</span>
              {{ results.niftyPE.tradingSymbol }}
            </div>
            <div>
              <span class="font-medium">PE Token:</span>
              {{ results.niftyPE.instrumentToken }}
            </div>
            <div>
              <span class="font-medium">PE TV:</span>
              {{ results.niftyPE.tvSymbol }}
            </div>
          </div>
        </div>

        <!-- BANKNIFTY -->
        <div
          class="border rounded p-3"
          *ngIf="results && results.bankNiftyCE && results.bankNiftyPE"
        >
          <h3 class="font-semibold mb-2">BANKNIFTY (Monthly)</h3>
          <div class="text-sm space-y-1">
            <div>
              <span class="font-medium">CE Strike:</span>
              {{ results.bankNiftyCE.strike }}
            </div>
            <div>
              <span class="font-medium">CE Symbol:</span>
              {{ results.bankNiftyCE.tradingSymbol }}
            </div>
            <div>
              <span class="font-medium">CE Token:</span>
              {{ results.bankNiftyCE.instrumentToken }}
            </div>
            <div>
              <span class="font-medium">CE TV:</span>
              {{ results.bankNiftyCE.tvSymbol }}
            </div>
            <hr />
            <div>
              <span class="font-medium">PE Strike:</span>
              {{ results.bankNiftyPE.strike }}
            </div>
            <div>
              <span class="font-medium">PE Symbol:</span>
              {{ results.bankNiftyPE.tradingSymbol }}
            </div>
            <div>
              <span class="font-medium">PE Token:</span>
              {{ results.bankNiftyPE.instrumentToken }}
            </div>
            <div>
              <span class="font-medium">PE TV:</span>
              {{ results.bankNiftyPE.tvSymbol }}
            </div>
          </div>
        </div>

        <!-- SENSEX -->
        <div
          class="border rounded p-3"
          *ngIf="results && results.sensexCE && results.sensexPE"
        >
          <h3 class="font-semibold mb-2">SENSEX (Weekly, BFO)</h3>
          <div class="text-sm space-y-1">
            <div>
              <span class="font-medium">CE Strike:</span>
              {{ results.sensexCE.strike }}
            </div>
            <div>
              <span class="font-medium">CE Symbol:</span>
              {{ results.sensexCE.tradingSymbol }}
            </div>
            <div>
              <span class="font-medium">CE Token:</span>
              {{ results.sensexCE.instrumentToken }}
            </div>
            <div>
              <span class="font-medium">CE TV:</span>
              {{ results.sensexCE.tvSymbol }}
            </div>
            <hr />
            <div>
              <span class="font-medium">PE Strike:</span>
              {{ results.sensexPE.strike }}
            </div>
            <div>
              <span class="font-medium">PE Symbol:</span>
              {{ results.sensexPE.tradingSymbol }}
            </div>
            <div>
              <span class="font-medium">PE Token:</span>
              {{ results.sensexPE.instrumentToken }}
            </div>
            <div>
              <span class="font-medium">PE TV:</span>
              {{ results.sensexPE.tvSymbol }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class KiteOptionFinderComponent implements OnInit {
  private debug(...args: any[]) {
  console.log('[DEBUG]', ...args);
}
  niftySpot = 0;
  bankNiftySpot = 0;
  sensexSpot = 0;

  loading = false;
  error: string | null = null;

  instruments: InstrumentRow[] = [];
  results: ResultSet | null = null;

  constructor(private http: HttpClient,  private ngZone: NgZone) {}

ngOnInit(): void {
  // 1) Load instruments from CSV once
  console.log('[DEBUG] KiteOptionFinder ngOnInit');
  this.loadInstruments();

  timer(0, 3000)
  .pipe(
    switchMap(() =>
      this.http.get<IndexLtp>('http://localhost:4000/api/index-ltp')
    )
  )
  .subscribe({
    next: (ltp) => {
      this.ngZone.run(() => {
        console.log('LTP from backend:', ltp);

        if (ltp.NIFTY50 != null) {
          this.niftySpot = ltp.NIFTY50;
        }
        if (ltp.BANKNIFTY != null) {
          this.bankNiftySpot = ltp.BANKNIFTY;
        }
        if (ltp.SENSEX != null) {
          this.sensexSpot = ltp.SENSEX;
        }
      });
    },
    error: (err) => {
      this.ngZone.run(() => {
        console.error('Error calling /api/index-ltp:', err);
      });
    },
  });


}


  onCalculate(): void {
    this.error = null;
    this.results = null;

    if (!this.instruments.length) {
      this.error = 'Instruments are not loaded yet.';
      return;
    }

    if (!this.niftySpot || !this.bankNiftySpot || !this.sensexSpot) {
      this.error = 'Please enter NIFTY, BANKNIFTY and SENSEX spot prices.';
      return;
    }

    try {
      this.results = this.calculateAll();
    } catch (e: any) {
      this.error = e?.message ?? 'Error while calculating instruments.';
    }
  }

  // ========= Core logic =========

  private calculateAll(): ResultSet {
    const now = new Date();
    this.debug('NIFTY spot:', this.niftySpot);
this.debug('BANKNIFTY spot:', this.bankNiftySpot);
this.debug('SENSEX spot:', this.sensexSpot);





    // --- NIFTY weekly ---
const niftyInstruments = this.instruments.filter(r =>
  r['exchange'] === 'NFO' &&
  r['segment'] === 'NFO-OPT' &&
  r['tradingsymbol']?.startsWith('NIFTY')
);

this.debug('NIFTY instruments count:', niftyInstruments.length);
this.debug('Sample NIFTY instruments:', niftyInstruments.slice(0, 5));

    const niftyWeekExpiry = this.getCurrentWeekExpiry(niftyInstruments, now);
    console.log('NIFTY upcoming week expiry:', niftyWeekExpiry);
    if (!niftyWeekExpiry) {
      throw new Error('Could not find current week expiry for NIFTY.');
    }

    const niftyCEStrike = this.roundUpToNext50(this.niftySpot);
    const niftyPEStrike = niftyCEStrike + 50;

    const niftyCE = this.pickOption(
      niftyInstruments,
      'CE',
      75,
      niftyCEStrike,
      niftyWeekExpiry
    );
    const niftyPE = this.pickOption(
      niftyInstruments,
      'PE',
      75,
      niftyPEStrike,
      niftyWeekExpiry
    );

    const niftyCEResult: OptionSelection = {
      strike: niftyCEStrike,
      tradingSymbol: niftyCE['tradingsymbol'],
      instrumentToken: Number(niftyCE['instrument_token']),
      expiry: niftyWeekExpiry,
      tvSymbol: this.buildTvSymbol('NSE', 'NIFTY', niftyWeekExpiry, 'C', niftyCEStrike),
    };

    const niftyPEResult: OptionSelection = {
      strike: niftyPEStrike,
      tradingSymbol: niftyPE['tradingsymbol'],
      instrumentToken: Number(niftyPE['instrument_token']),
      expiry: niftyWeekExpiry,
      tvSymbol: this.buildTvSymbol('NSE', 'NIFTY', niftyWeekExpiry, 'P', niftyPEStrike),
    };


this.debug('Finding NIFTY weekly expiry...');
this.debug('Finding BANKNIFTY monthly expiry...');
this.debug('Finding SENSEX weekly expiry...');
this.debug('Selected NIFTY CE strike:', niftyCEStrike);
this.debug('Selected NIFTY PE strike:', niftyPEStrike);
    // --- BANKNIFTY monthly ---

const bankInstruments = this.instruments.filter(r =>
  r['exchange'] === 'NFO' &&
  r['segment'] === 'NFO-OPT' &&
  r['tradingsymbol']?.startsWith('BANKNIFTY')
);

this.debug('BANKNIFTY instruments count:', bankInstruments.length);
this.debug('Sample BANKNIFTY instruments:', bankInstruments.slice(0, 5));

    const bankMonthExpiry = this.getCurrentMonthExpiry(bankInstruments, now);
    if (!bankMonthExpiry) {
      throw new Error('Could not find current month expiry for BANKNIFTY.');
    }

    const bankCEStrike = this.roundUpToNext100(this.bankNiftySpot);
    const bankPEStrike = bankCEStrike + 100;

    const bankCE = this.pickOption(
      bankInstruments,
      'CE',
      35,
      bankCEStrike,
      bankMonthExpiry
    );
    const bankPE = this.pickOption(
      bankInstruments,
      'PE',
      35,
      bankPEStrike,
      bankMonthExpiry
    );

    const bankCEResult: OptionSelection = {
      strike: bankCEStrike,
      tradingSymbol: bankCE['tradingsymbol'],
      instrumentToken: Number(bankCE['instrument_token']),
      expiry: bankMonthExpiry,
      tvSymbol: this.buildTvSymbol(
        'NSE',
        'BANKNIFTY',
        bankMonthExpiry,
        'C',
        bankCEStrike
      ),
    };

    const bankPEResult: OptionSelection = {
      strike: bankPEStrike,
      tradingSymbol: bankPE['tradingsymbol'],
      instrumentToken: Number(bankPE['instrument_token']),
      expiry: bankMonthExpiry,
      tvSymbol: this.buildTvSymbol(
        'NSE',
        'BANKNIFTY',
        bankMonthExpiry,
        'P',
        bankPEStrike
      ),
    };
    this.debug('Selected BANKNIFTY CE strike:', bankCEStrike);
this.debug('Selected BANKNIFTY PE strike:', bankPEStrike);


    // --- SENSEX weekly (BFO, Rule A) ---
const sensexInstruments = this.instruments.filter(r =>
  r['exchange'] === 'BFO' &&
  r['segment'] === 'BFO-OPT' &&
  r['tradingsymbol']?.startsWith('SENSEX')
);

this.debug('SENSEX instruments count:', sensexInstruments.length);
this.debug('Sample SENSEX instruments:', sensexInstruments.slice(0, 5));

    const sensexWeekExpiry = this.getCurrentWeekExpiry(sensexInstruments, now);
    if (!sensexWeekExpiry) {
      throw new Error('Could not find current week expiry for SENSEX.');
    }

    const sensexCEStrike =
      this.sensexSpot - (this.sensexSpot % 100);
    const sensexPEStrike = sensexCEStrike + 100;

    const sensexCE = this.pickOption(
      sensexInstruments,
      'CE',
      20,
      sensexCEStrike,
      sensexWeekExpiry
    );
    const sensexPE = this.pickOption(
      sensexInstruments,
      'PE',
      20,
      sensexPEStrike,
      sensexWeekExpiry
    );

    const sensexCEResult: OptionSelection = {
      strike: sensexCEStrike,
      tradingSymbol: sensexCE['tradingsymbol'],
      instrumentToken: Number(sensexCE['instrument_token']),
      expiry: sensexWeekExpiry,
      tvSymbol: this.buildTvSymbol(
        'BSE',
        'SENSEX',
        sensexWeekExpiry,
        'C',
        sensexCEStrike
      ),
    };

    const sensexPEResult: OptionSelection = {
      strike: sensexPEStrike,
      tradingSymbol: sensexPE['tradingsymbol'],
      instrumentToken: Number(sensexPE['instrument_token']),
      expiry: sensexWeekExpiry,
      tvSymbol: this.buildTvSymbol(
        'BSE',
        'SENSEX',
        sensexWeekExpiry,
        'P',
        sensexPEStrike
      ),
    };
this.debug('Selected SENSEX CE strike:', sensexCEStrike);
this.debug('Selected SENSEX PE strike:', sensexPEStrike);
    return {
      niftyCE: niftyCEResult,
      niftyPE: niftyPEResult,
      bankNiftyCE: bankCEResult,
      bankNiftyPE: bankPEResult,
      sensexCE: sensexCEResult,
      sensexPE: sensexPEResult,
    };
  }

  // ========= helpers =========

  private roundUpToNext100(value: number): number {
    return value - (value % 100);
  }
  private roundUpToNext50(value: number): number {
    return value - (value % 50);
  }
  private parseExpiry(row: InstrumentRow): Date | null {
    const raw = row['expiry'];
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

private sameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


  private normalizeDate(d: Date): Date {
  // strip time part, keep only Y-M-D
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

private getCurrentWeekExpiry(rows: InstrumentRow[], now: Date): Date | null {
  this.debug('Finding weekly expiry… total rows:', rows.length);

  const today = this.normalizeDate(now);
  const oneDayMs = 1000 * 60 * 60 * 24;
  const futureDates: Date[] = [];

  for (const r of rows) {
    const d = this.parseExpiry(r);
    if (!d) continue;

    const dDay = this.normalizeDate(d);

    if (dDay < today) {
      this.debug('Skipping past expiry:', dDay);
      continue;
    }

    if (!futureDates.some(u => this.sameDate(u, dDay))) {
      futureDates.push(dDay);
      this.debug('Found expiry date:', dDay);
    }
  }

  futureDates.sort((a, b) => a.getTime() - b.getTime());
  this.debug('All future expiry dates sorted:', futureDates);

  if (!futureDates.length) {
    this.debug('No future expiry dates found.');
    return null;
  }

  // Try this week
  const within7 = futureDates.find(d => {
    const diff = (d.getTime() - today.getTime()) / oneDayMs;
    return diff >= 0 && diff <= 7;
  });

  this.debug('Within 7 days expiry:', within7);

  if (within7) return within7;

  // Try next week
  const within14 = futureDates.find(d => {
    const diff = (d.getTime() - today.getTime()) / oneDayMs;
    return diff > 7 && diff <= 14;
  });

  this.debug('Within 14 days expiry:', within14);

  if (within14) return within14;

  // Fall back
  this.debug('No weekly expiry found → using earliest:', futureDates[0]);
  return futureDates[0];
}




private getCurrentMonthExpiry(rows: InstrumentRow[], now: Date): Date | null {
  const today = this.normalizeDate(now);
  const futureDates: Date[] = [];

  for (const r of rows) {
    const d = this.parseExpiry(r);
    if (!d) continue;

    const dDay = this.normalizeDate(d);

    if (dDay < today) continue;

    if (
      dDay.getFullYear() === today.getFullYear() &&
      dDay.getMonth() === today.getMonth()
    ) {
      if (!futureDates.some(u => this.sameDate(u, dDay))) {
        futureDates.push(dDay);
      }
    }
  }

  futureDates.sort((a, b) => a.getTime() - b.getTime());
  return futureDates[0] ?? null;
}


private pickOption(
  rows: InstrumentRow[],
  instrumentType: 'CE' | 'PE',
  lotSize: number,
  strike: number,
  expiry: Date
): InstrumentRow {
  
  this.debug(`Searching for ${instrumentType} strike=${strike} lot=${lotSize} expiry=${expiry}`);

  let match = null;

  for (const r of rows) {
    const rType = r['instrument_type'];
    const rLot = Number(r['lot_size']);
    const rStrike = Number(r['strike']);
    const rExpiry = this.parseExpiry(r);

    if (!rExpiry) continue;

    if (rType === instrumentType &&
        rLot === lotSize &&
        rStrike === strike &&
        this.sameDate(rExpiry, expiry)) {

      match = r;
      break;
    }
  }

  if (!match) {
    this.debug(`NO MATCH FOUND for`, {
      instrumentType,
      lotSize,
      strike,
      expiry
    });

    const sample = rows.slice(0, 10);
    this.debug('Sample rows for debugging:', sample);

    throw new Error(
      `Could not find ${instrumentType} for strike=${strike}, expiry=${expiry.toDateString()}`
    );
  }

  this.debug(`MATCH FOUND for ${instrumentType}:`, match);
  return match;
}


  private buildTvSymbol(
    prefix: string,
    underlying: string,
    expiry: Date,
    optType: 'C' | 'P',
    strike: number
  ): string {
    const yy = expiry.getFullYear() % 100;
    const mm = (expiry.getMonth() + 1).toString().padStart(2, '0');
    const dd = expiry.getDate().toString().padStart(2, '0');
    return `${prefix}:${underlying}${yy.toString().padStart(2, '0')}${mm}${dd}${optType}${Math.round(
      strike
    )}`;
  }

  // ========= load instruments =========

private loadInstruments(): void {
  
  this.loading = true;
  this.error = null;

  this.http
    .get('http://localhost:4000/api/instruments', {
      responseType: 'text',
    })
    .subscribe({
      next: (csvText: string) => {
        this.instruments = this.parseCsv(csvText);
        this.loading = false;
        this.debug('Loaded instruments count:', this.instruments.length);

const sample = this.instruments.filter(r => r['name'] === 'NIFTY').slice(0, 5);
this.debug('Sample NIFTY rows:', sample);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load instruments from backend.';
        this.loading = false;
      },
    });
}


  private parseCsv(csvText: string): InstrumentRow[] {
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (!lines.length) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const rows: InstrumentRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',');
      if (!cols.length || cols.length < header.length) continue;

      const row: InstrumentRow = {};
      header.forEach((h, idx) => {
        row[h] = (cols[idx] ?? '').trim();
      });
      rows.push(row);
    }

    return rows;
  }
}
