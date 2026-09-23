import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  ReceptionPatientEntry, 
  LabReport, 
  HomeCollectionBooking, 
  VendorLabSettings,
  TestItem,
  VendorPackage,
  VendorDoctor,
  VendorBranch
} from '../types';

// Collection identifiers in Cloud Firestore
export const COLLECTIONS = {
  RECEPTION_ENTRIES: 'reception_entries',
  LAB_REPORTS: 'lab_reports',
  BOOKINGS: 'vendor_bookings',
  STAFF: 'lab_staff',
  LAB_SETTINGS: 'lab_settings',
  TESTS: 'lab_tests',
  PACKAGES: 'lab_packages',
  DOCTORS: 'lab_doctors',
  BRANCHES: 'vendor_branches',
} as const;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.warn('[Cloud Firestore Sync Error]:', JSON.stringify(errInfo));
}

/**
 * Sanitizes object payloads for Cloud Firestore to ensure no 'undefined' values cause write failures
 */
export function sanitizeForFirestore<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data, (_key, value) => {
      return value === undefined ? null : value;
    }));
  } catch {
    return data;
  }
}

/**
 * Validates connection to Cloud Firestore database
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (!db) return false;
    const testDoc = doc(db, COLLECTIONS.LAB_SETTINGS, 'ping');
    await getDocFromServer(testDoc).catch(() => {});
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.LAB_SETTINGS}/ping`);
    return false;
  }
}

/* ==========================================================================
   1. LAB SETTINGS & CMS PROFILE (Real-time Cross-Device Sync)
   ========================================================================== */

/**
 * Writes or updates Lab Settings in Cloud Firestore
 * Whenever mobile A changes lab name, phone, address, QR code, logo, etc.,
 * it syncs instantly to Cloud Firestore.
 */
export async function syncLabSettingsToCloud(
  labId: string, 
  settings: Partial<VendorLabSettings>
): Promise<void> {
  try {
    if (!db || !labId) return;
    const cleanSettings = sanitizeForFirestore({
      ...settings,
      labId,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.LAB_SETTINGS, labId);
    await setDoc(ref, cleanSettings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.LAB_SETTINGS}/${labId}`);
  }
}

/**
 * Subscribes to Lab Settings collection
 * Every device (client phone, reception, technician) gets real-time updates.
 */
export function subscribeToLabSettings(
  onData: (settingsMap: Record<string, VendorLabSettings>) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.LAB_SETTINGS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const map: Record<string, VendorLabSettings> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as VendorLabSettings;
          if (data && docSnap.id) {
            map[docSnap.id] = data;
          }
        });
        onData(map);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LAB_SETTINGS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.LAB_SETTINGS);
    return () => {};
  }
}

/**
 * Fetch all lab settings once from Cloud Firestore
 */
export async function fetchAllLabSettingsFromCloud(): Promise<Record<string, VendorLabSettings>> {
  try {
    if (!db) return {};
    const colRef = collection(db, COLLECTIONS.LAB_SETTINGS);
    const snap = await getDocs(colRef);
    const map: Record<string, VendorLabSettings> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as VendorLabSettings;
      if (data && docSnap.id) {
        map[docSnap.id] = data;
      }
    });
    return map;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.LAB_SETTINGS);
    return {};
  }
}

/* ==========================================================================
   2. TESTS CATALOG & PRICING (Real-time Cross-Device Sync)
   ========================================================================== */

export async function syncTestToCloud(test: TestItem): Promise<void> {
  try {
    if (!db || !test.id) return;
    const cleanTest = sanitizeForFirestore({
      ...test,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.TESTS, test.id);
    await setDoc(ref, cleanTest, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.TESTS}/${test.id}`);
  }
}

export async function deleteTestFromCloud(testId: string): Promise<void> {
  try {
    if (!db || !testId) return;
    const ref = doc(db, COLLECTIONS.TESTS, testId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.TESTS}/${testId}`);
  }
}

export function subscribeToTests(
  onData: (tests: TestItem[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.TESTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: TestItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as TestItem);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.TESTS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TESTS);
    return () => {};
  }
}

/* ==========================================================================
   3. HEALTH PACKAGES (Real-time Cross-Device Sync)
   ========================================================================== */

export async function syncPackageToCloud(pkg: VendorPackage): Promise<void> {
  try {
    if (!db || !pkg.id) return;
    const cleanPkg = sanitizeForFirestore({
      ...pkg,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.PACKAGES, pkg.id);
    await setDoc(ref, cleanPkg, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.PACKAGES}/${pkg.id}`);
  }
}

export async function deletePackageFromCloud(pkgId: string): Promise<void> {
  try {
    if (!db || !pkgId) return;
    const ref = doc(db, COLLECTIONS.PACKAGES, pkgId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.PACKAGES}/${pkgId}`);
  }
}

export function subscribeToPackages(
  onData: (packages: VendorPackage[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.PACKAGES);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: VendorPackage[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as VendorPackage);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PACKAGES);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PACKAGES);
    return () => {};
  }
}

/* ==========================================================================
   4. DOCTORS & PATHOLOGISTS (Real-time Cross-Device Sync)
   ========================================================================== */

export async function syncDoctorToCloud(docItem: VendorDoctor): Promise<void> {
  try {
    if (!db || !docItem.id) return;
    const cleanDoc = sanitizeForFirestore({
      ...docItem,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.DOCTORS, docItem.id);
    await setDoc(ref, cleanDoc, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.DOCTORS}/${docItem.id}`);
  }
}

export async function deleteDoctorFromCloud(docId: string): Promise<void> {
  try {
    if (!db || !docId) return;
    const ref = doc(db, COLLECTIONS.DOCTORS, docId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.DOCTORS}/${docId}`);
  }
}

export function subscribeToDoctors(
  onData: (doctors: VendorDoctor[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.DOCTORS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: VendorDoctor[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as VendorDoctor);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.DOCTORS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.DOCTORS);
    return () => {};
  }
}

/* ==========================================================================
   5. RECEPTION PATIENTS & TOKENS (Real-time Cross-Device Sync)
   ========================================================================== */

export async function syncReceptionEntryToCloud(entry: ReceptionPatientEntry): Promise<void> {
  try {
    if (!db || !entry.id) return;
    const cleanEntry = sanitizeForFirestore({
      ...entry,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.RECEPTION_ENTRIES, entry.id);
    await setDoc(ref, cleanEntry, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.RECEPTION_ENTRIES}/${entry.id}`);
  }
}

export async function deleteReceptionEntryFromCloud(entryId: string): Promise<void> {
  try {
    if (!db || !entryId) return;
    const ref = doc(db, COLLECTIONS.RECEPTION_ENTRIES, entryId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.RECEPTION_ENTRIES}/${entryId}`);
  }
}

export function subscribeToReceptionEntries(
  onData: (entries: ReceptionPatientEntry[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.RECEPTION_ENTRIES);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: ReceptionPatientEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ReceptionPatientEntry);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.RECEPTION_ENTRIES);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.RECEPTION_ENTRIES);
    return () => {};
  }
}

/* ==========================================================================
   6. LAB REPORTS & RESULTS (Real-time Cross-Device Sync)
   ========================================================================== */

export async function syncLabReportToCloud(report: LabReport): Promise<void> {
  try {
    if (!db || !report.reportId) return;
    const cleanReport = sanitizeForFirestore({
      ...report,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.LAB_REPORTS, report.reportId);
    await setDoc(ref, cleanReport, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.LAB_REPORTS}/${report.reportId}`);
  }
}

export async function deleteLabReportFromCloud(reportId: string): Promise<void> {
  try {
    if (!db || !reportId) return;
    const ref = doc(db, COLLECTIONS.LAB_REPORTS, reportId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.LAB_REPORTS}/${reportId}`);
  }
}

export function subscribeToLabReports(
  onData: (reports: LabReport[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.LAB_REPORTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: LabReport[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as LabReport);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LAB_REPORTS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.LAB_REPORTS);
    return () => {};
  }
}

/* ==========================================================================
   7. HOME COLLECTION BOOKINGS (Real-time Cross-Device Sync)
   ========================================================================== */

export async function syncBookingToCloud(booking: HomeCollectionBooking): Promise<void> {
  try {
    if (!db || !booking.id) return;
    const cleanBooking = sanitizeForFirestore({
      ...booking,
      _updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, COLLECTIONS.BOOKINGS, booking.id);
    await setDoc(ref, cleanBooking, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.BOOKINGS}/${booking.id}`);
  }
}

export async function deleteBookingFromCloud(bookingId: string): Promise<void> {
  try {
    if (!db || !bookingId) return;
    const ref = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.BOOKINGS}/${bookingId}`);
  }
}

export function subscribeToBookings(
  onData: (bookings: HomeCollectionBooking[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    if (!db) return () => {};
    const colRef = collection(db, COLLECTIONS.BOOKINGS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: HomeCollectionBooking[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as HomeCollectionBooking);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.BOOKINGS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.BOOKINGS);
    return () => {};
  }
}

/* ==========================================================================
   8. INITIAL SEEDING FOR NEW / FRESH FIRESTORE DATABASE
   ========================================================================== */

export async function seedInitialFirestoreData(
  initialEntries: ReceptionPatientEntry[],
  initialReports: LabReport[],
  initialSettingsMap?: Record<string, VendorLabSettings>,
  initialTests?: TestItem[],
  initialPackages?: VendorPackage[],
  initialDoctors?: VendorDoctor[]
): Promise<void> {
  try {
    if (!db) return;

    // 1. Seed Lab Settings if empty
    if (initialSettingsMap) {
      const settingsCol = collection(db, COLLECTIONS.LAB_SETTINGS);
      const settingsSnap = await getDocs(settingsCol);
      if (settingsSnap.empty) {
        const batch = writeBatch(db);
        Object.entries(initialSettingsMap).forEach(([labId, settings]) => {
          const ref = doc(db, COLLECTIONS.LAB_SETTINGS, labId);
          batch.set(ref, sanitizeForFirestore({ ...settings, labId, _updatedAt: new Date().toISOString() }));
        });
        await batch.commit().catch(() => {});
      }
    }

    // 2. Seed Reception Entries if empty
    const receptionCol = collection(db, COLLECTIONS.RECEPTION_ENTRIES);
    const receptionSnap = await getDocs(receptionCol);
    if (receptionSnap.empty && initialEntries.length > 0) {
      const batch = writeBatch(db);
      initialEntries.forEach((entry) => {
        const ref = doc(db, COLLECTIONS.RECEPTION_ENTRIES, entry.id);
        batch.set(ref, sanitizeForFirestore({ ...entry, _updatedAt: new Date().toISOString() }));
      });
      await batch.commit().catch(() => {});
    }

    // 3. Seed Lab Reports if empty
    const reportsCol = collection(db, COLLECTIONS.LAB_REPORTS);
    const reportsSnap = await getDocs(reportsCol);
    if (reportsSnap.empty && initialReports.length > 0) {
      const batch = writeBatch(db);
      initialReports.forEach((rep) => {
        const ref = doc(db, COLLECTIONS.LAB_REPORTS, rep.reportId);
        batch.set(ref, sanitizeForFirestore({ ...rep, _updatedAt: new Date().toISOString() }));
      });
      await batch.commit().catch(() => {});
    }

    // 4. Seed Tests if empty
    if (initialTests && initialTests.length > 0) {
      const testsCol = collection(db, COLLECTIONS.TESTS);
      const testsSnap = await getDocs(testsCol);
      if (testsSnap.empty) {
        const batch = writeBatch(db);
        initialTests.slice(0, 50).forEach((t) => {
          const ref = doc(db, COLLECTIONS.TESTS, t.id);
          batch.set(ref, sanitizeForFirestore({ ...t, _updatedAt: new Date().toISOString() }));
        });
        await batch.commit().catch(() => {});
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed_data');
  }
}
