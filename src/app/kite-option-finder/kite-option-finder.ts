import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  niftySpot = 0;
  bankNiftySpot = 0;
  sensexSpot = 0;

  loading = false;
  error: string | null = null;

  instruments: InstrumentRow[] = [];
  results: ResultSet | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInstruments();
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

    // --- NIFTY weekly ---
    const niftyInstruments = this.instruments.filter(
      r =>
        r['name'] === 'NIFTY' &&
        r['exchange'] === 'NFO' &&
        r['segment'] === 'NFO-OPT'
    );
    const niftyWeekExpiry = this.getCurrentWeekExpiry(niftyInstruments, now);
    if (!niftyWeekExpiry) {
      throw new Error('Could not find current week expiry for NIFTY.');
    }

    const niftyCEStrike = this.roundUpToNext100(this.niftySpot);
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

    // --- BANKNIFTY monthly ---
    const bankInstruments = this.instruments.filter(
      r =>
        r['name'] === 'BANKNIFTY' &&
        r['exchange'] === 'NFO' &&
        r['segment'] === 'NFO-OPT'
    );
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

    // --- SENSEX weekly (BFO, Rule A) ---
    const sensexInstruments = this.instruments.filter(
      r =>
        r['name'] === 'SENSEX' &&
        r['exchange'] === 'BFO' &&
        r['segment'] === 'BFO-OPT'
    );
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

  private getCurrentWeekExpiry(rows: InstrumentRow[], now: Date): Date | null {
    const uniqueDates: Date[] = [];
    for (const r of rows) {
      const d = this.parseExpiry(r);
      if (!d) continue;
      if (d < now) continue;
      const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        if (!uniqueDates.some(u => this.sameDate(u, d))) {
          uniqueDates.push(d);
        }
      }
    }
    uniqueDates.sort((a, b) => a.getTime() - b.getTime());
    return uniqueDates[0] ?? null;
  }

  private getCurrentMonthExpiry(rows: InstrumentRow[], now: Date): Date | null {
    const uniqueDates: Date[] = [];
    for (const r of rows) {
      const d = this.parseExpiry(r);
      if (!d) continue;
      if (d < now) continue;
      if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      ) {
        if (!uniqueDates.some(u => this.sameDate(u, d))) {
          uniqueDates.push(d);
        }
      }
    }
    uniqueDates.sort((a, b) => a.getTime() - b.getTime());
    return uniqueDates[0] ?? null;
  }

  private pickOption(
    rows: InstrumentRow[],
    instrumentType: 'CE' | 'PE',
    lotSize: number,
    strike: number,
    expiry: Date
  ): InstrumentRow {
    const eps = 0.0001;
    const match = rows.find(r => {
      const rType = r['instrument_type'];
      const rLot = Number(r['lot_size']);
      const rStrike = Number(r['strike']);
      const rExpiry = this.parseExpiry(r);
      if (!rExpiry) return false;

      return (
        rType === instrumentType &&
        rLot === lotSize &&
        Math.abs(rStrike - strike) < eps &&
        this.sameDate(rExpiry, expiry)
      );
    });

    if (!match) {
      throw new Error(
        `No ${instrumentType} found for strike=${strike}, lot=${lotSize}, expiry=${expiry.toDateString()}`
      );
    }

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
      .get('assets/instruments.csv', { responseType: 'text' })
      .subscribe({
        next: (csvText: string) => {
          this.instruments = this.parseCsv(csvText);
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.error = 'Failed to load instruments.csv from assets.';
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
