export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface EntryDoc {
  id: string;
  cottage: string;
  bl: string;
  file: string;
  importer: string;
  carrier: string;
  goods: string;
  brand: string;
  unloadDate: JalaliDate;
  trailers: number;
  unloaded: number;
  pallets: number;
  invoicePaid: boolean;
  receipt: {
    number: string;
    count: string;
  };
  tasks: {
    bl: boolean;
    arr: boolean;
    tali: boolean;
  };
  createdAt: number;
}

export interface Batch {
  id: string; // SEETECxxxxxCOMBxxxx
  goods: string;
  file: string;
  createdAt: JalaliDate;
  docIds: string[];
  finalized: boolean;
  exited?: boolean;
}

export interface LabRecord {
  id: string;
  goods: string;
  brand: string;
  sampleDate: JalaliDate;
  validity: number; // in months (e.g. 6)
  comment: string;
  exitId?: string;
  createdAt: number;
}

export interface ExitDoc {
  id: string;
  cottage: string;
  bl: string;
  file: string;
  unloadDate: JalaliDate;
  importer: string;
  carrier: string;
  goods: string;
  brand: string;
  trailers: number;
  pallets: number;
  batchId: string;
  route: 'red' | 'yellow' | null;
  evaluator: {
    done: boolean;
    comment: string;
  };
  jihad: {
    done: boolean;
    comment: string;
  };
  lab: {
    needed: boolean;
    sampled: boolean;
    sampleDate: JalaliDate | null;
    sent: boolean;
    tested: boolean;
    comment: string;
    reusedFrom: string | null;
    recordId: string | null;
    validity: number;
  };
  expert: {
    done: boolean;
  };
  gate: {
    done: boolean;
  };
  invoice: {
    paid: boolean;
  };
  createdAt: number;
}

export type TabType = 'entry' | 'consolidation' | 'exit' | 'lab' | 'reports';

export type MainTabType = 'entry' | 'exit' | 'reports';
export type EntrySubTab = 'docs' | 'consolidation';
export type ExitSubTab = 'docs' | 'lab';

export type EntryFilterType = 'all' | '1' | '23' | '4' | '5' | '6';

export type ExitFilterType = 'all' | 'progress' | 'gate' | 'done';
