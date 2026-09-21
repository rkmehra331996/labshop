import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { ReceptionPatientEntry, LabReport, HomeCollectionBooking, LabStaffAccount } from '../types';

// Collection identifiers in Firestore
export const COLLECTIONS = {
  RECEPTION_ENTRIES: 'reception_entries',
  LAB_REPORTS: 'lab_reports',
  BOOKINGS: 'vendor_bookings',
  STAFF: 'lab_staff',
} as const;

/**
 * Sync helper for writing a Reception Patient Entry to Cloud Firestore
 */
export async function syncReceptionEntryToCloud(entry: ReceptionPatientEntry): Promise<void> {
  try {
    if (!db || !entry.id) return;
    const ref = doc(db, COLLECTIONS.RECEPTION_ENTRIES, entry.id);
    await setDoc(ref, {
      ...entry,
      _updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to sync reception entry to cloud:', err);
  }
}

/**
 * Delete a Reception Patient Entry from Cloud Firestore
 */
export async function deleteReceptionEntryFromCloud(entryId: string): Promise<void> {
  try {
    if (!db || !entryId) return;
    const ref = doc(db, COLLECTIONS.RECEPTION_ENTRIES, entryId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('[Firestore] Failed to delete reception entry from cloud:', err);
  }
}

/**
 * Sync helper for writing a Lab Report to Cloud Firestore
 */
export async function syncLabReportToCloud(report: LabReport): Promise<void> {
  try {
    if (!db || !report.reportId) return;
    const ref = doc(db, COLLECTIONS.LAB_REPORTS, report.reportId);
    await setDoc(ref, {
      ...report,
      _updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to sync lab report to cloud:', err);
  }
}

/**
 * Delete a Lab Report from Cloud Firestore
 */
export async function deleteLabReportFromCloud(reportId: string): Promise<void> {
  try {
    if (!db || !reportId) return;
    const ref = doc(db, COLLECTIONS.LAB_REPORTS, reportId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('[Firestore] Failed to delete lab report from cloud:', err);
  }
}

/**
 * Sync helper for Home Collection Bookings
 */
export async function syncBookingToCloud(booking: HomeCollectionBooking): Promise<void> {
  try {
    if (!db || !booking.id) return;
    const ref = doc(db, COLLECTIONS.BOOKINGS, booking.id);
    await setDoc(ref, {
      ...booking,
      _updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to sync booking to cloud:', err);
  }
}

/**
 * Real-time listener for Reception Entries (Cross-Computer Sync)
 * Automatically notifies callback whenever any computer updates a patient.
 */
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
        console.warn('[Firestore] Realtime subscription error (reception):', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('[Firestore] subscribeToReceptionEntries setup error:', err);
    return () => {};
  }
}

/**
 * Real-time listener for Lab Reports (Cross-Computer Sync)
 * Automatically notifies callback whenever technician or pathologist updates reports.
 */
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
        console.warn('[Firestore] Realtime subscription error (reports):', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('[Firestore] subscribeToLabReports setup error:', err);
    return () => {};
  }
}

/**
 * Real-time listener for Home Collection Bookings
 */
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
        console.warn('[Firestore] Realtime subscription error (bookings):', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('[Firestore] subscribeToBookings setup error:', err);
    return () => {};
  }
}

/**
 * Seed initial mock data to Cloud Firestore if the collections are currently empty
 */
export async function seedInitialFirestoreData(
  initialEntries: ReceptionPatientEntry[],
  initialReports: LabReport[]
): Promise<void> {
  try {
    if (!db) return;
    const receptionCol = collection(db, COLLECTIONS.RECEPTION_ENTRIES);
    const receptionSnap = await getDocs(receptionCol);

    if (receptionSnap.empty && initialEntries.length > 0) {
      console.log('[Firestore] Seeding initial reception entries to cloud...');
      const batch = writeBatch(db);
      initialEntries.forEach((entry) => {
        const ref = doc(db, COLLECTIONS.RECEPTION_ENTRIES, entry.id);
        batch.set(ref, { ...entry, _updatedAt: new Date().toISOString() });
      });
      await batch.commit();
    }

    const reportsCol = collection(db, COLLECTIONS.LAB_REPORTS);
    const reportsSnap = await getDocs(reportsCol);

    if (reportsSnap.empty && initialReports.length > 0) {
      console.log('[Firestore] Seeding initial lab reports to cloud...');
      const batch = writeBatch(db);
      initialReports.forEach((rep) => {
        const ref = doc(db, COLLECTIONS.LAB_REPORTS, rep.reportId);
        batch.set(ref, { ...rep, _updatedAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firestore] Seeding initial data error:', err);
  }
}
