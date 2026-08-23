// Minimal, dependency-free EXIF reader for JPEG files.
// Extracts GPS latitude/longitude and DateTimeOriginal so plantation photos
// carry real, camera-recorded proof instead of manually typed numbers.

export interface ExifGpsResult {
  latitude: number | null;
  longitude: number | null;
  takenAt: string | null; // ISO string
}

const TAG_GPS_IFD = 0x8825;
const TAG_EXIF_IFD = 0x8769;
const TAG_DATETIME_ORIGINAL = 0x9003;
const TAG_DATETIME = 0x0132;

const GPS_LAT_REF = 0x0001;
const GPS_LAT = 0x0002;
const GPS_LON_REF = 0x0003;
const GPS_LON = 0x0004;

function readTiffIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  little: boolean,
): Record<number, { type: number; count: number; valueOffset: number }> {
  const entries: Record<number, { type: number; count: number; valueOffset: number }> = {};
  const base = tiffStart + ifdOffset;
  if (base + 2 > view.byteLength) return entries;
  const count = view.getUint16(base, little);
  for (let i = 0; i < count; i++) {
    const entry = base + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = view.getUint16(entry, little);
    const type = view.getUint16(entry + 2, little);
    const num = view.getUint32(entry + 4, little);
    entries[tag] = { type, count: num, valueOffset: entry + 8 };
  }
  return entries;
}

function typeSize(type: number): number {
  switch (type) {
    case 1:
    case 2:
    case 6:
    case 7:
      return 1;
    case 3:
    case 8:
      return 2;
    case 4:
    case 9:
    case 11:
      return 4;
    case 5:
    case 10:
    case 12:
      return 8;
    default:
      return 1;
  }
}

function dataOffset(
  view: DataView,
  tiffStart: number,
  entry: { type: number; count: number; valueOffset: number },
  little: boolean,
): number {
  const total = typeSize(entry.type) * entry.count;
  if (total <= 4) return entry.valueOffset;
  return tiffStart + view.getUint32(entry.valueOffset, little);
}

function readRationals(
  view: DataView,
  offset: number,
  count: number,
  little: boolean,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const o = offset + i * 8;
    if (o + 8 > view.byteLength) break;
    const numerator = view.getUint32(o, little);
    const denominator = view.getUint32(o + 4, little);
    out.push(denominator === 0 ? 0 : numerator / denominator);
  }
  return out;
}

function readAscii(view: DataView, offset: number, count: number): string {
  let s = "";
  for (let i = 0; i < count; i++) {
    if (offset + i >= view.byteLength) break;
    const c = view.getUint8(offset + i);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}

function dmsToDecimal(dms: number[], ref: string): number | null {
  if (dms.length < 3) return null;
  const [d, m, s] = dms;
  let dec = d + m / 60 + s / 3600;
  if (!Number.isFinite(dec)) return null;
  if (ref === "S" || ref === "W") dec = -dec;
  return dec;
}

/** Parses "YYYY:MM:DD HH:MM:SS" (EXIF) into an ISO string. */
function exifDateToIso(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
  );
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Reads GPS coordinates + capture time out of a JPEG's EXIF block.
 * Returns nulls when the file has no EXIF/GPS (very common for
 * WhatsApp-forwarded or screenshot images — those strip metadata).
 */
export async function readExifGps(file: File): Promise<ExifGpsResult> {
  const empty: ExifGpsResult = { latitude: null, longitude: null, takenAt: null };
  try {
    // EXIF lives in the first APP1 segment; 512KB is plenty.
    const head = await file.slice(0, 512 * 1024).arrayBuffer();
    const view = new DataView(head);
    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return empty; // not a JPEG

    let offset = 2;
    let tiffStart = -1;
    while (offset + 4 < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) {
        offset++;
        continue;
      }
      const marker = view.getUint8(offset + 1);
      const size = view.getUint16(offset + 2);
      if (marker === 0xe1) {
        // "Exif\0\0"
        if (view.getUint32(offset + 4) === 0x45786966) {
          tiffStart = offset + 10;
          break;
        }
      }
      if (marker === 0xda) break; // start of scan
      offset += 2 + size;
    }
    if (tiffStart < 0 || tiffStart + 8 > view.byteLength) return empty;

    const byteOrder = view.getUint16(tiffStart);
    const little = byteOrder === 0x4949;
    if (!little && byteOrder !== 0x4d4d) return empty;

    const ifd0Offset = view.getUint32(tiffStart + 4, little);
    const ifd0 = readTiffIfd(view, tiffStart, ifd0Offset, little);

    let takenAt: string | null = null;
    const exifPtr = ifd0[TAG_EXIF_IFD];
    if (exifPtr) {
      const exifIfd = readTiffIfd(
        view,
        tiffStart,
        view.getUint32(exifPtr.valueOffset, little),
        little,
      );
      const dto = exifIfd[TAG_DATETIME_ORIGINAL];
      if (dto) {
        takenAt = exifDateToIso(
          readAscii(view, dataOffset(view, tiffStart, dto, little), dto.count),
        );
      }
    }
    if (!takenAt && ifd0[TAG_DATETIME]) {
      const dt = ifd0[TAG_DATETIME];
      takenAt = exifDateToIso(
        readAscii(view, dataOffset(view, tiffStart, dt, little), dt.count),
      );
    }

    const gpsPtr = ifd0[TAG_GPS_IFD];
    if (!gpsPtr) return { ...empty, takenAt };

    const gps = readTiffIfd(
      view,
      tiffStart,
      view.getUint32(gpsPtr.valueOffset, little),
      little,
    );

    const latEntry = gps[GPS_LAT];
    const lonEntry = gps[GPS_LON];
    const latRefEntry = gps[GPS_LAT_REF];
    const lonRefEntry = gps[GPS_LON_REF];
    if (!latEntry || !lonEntry) return { ...empty, takenAt };

    const lat = dmsToDecimal(
      readRationals(view, dataOffset(view, tiffStart, latEntry, little), 3, little),
      latRefEntry
        ? readAscii(view, dataOffset(view, tiffStart, latRefEntry, little), 2)
        : "N",
    );
    const lon = dmsToDecimal(
      readRationals(view, dataOffset(view, tiffStart, lonEntry, little), 3, little),
      lonRefEntry
        ? readAscii(view, dataOffset(view, tiffStart, lonRefEntry, little), 2)
        : "E",
    );

    if (lat === null || lon === null) return { ...empty, takenAt };
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return { ...empty, takenAt };
    if (lat === 0 && lon === 0) return { ...empty, takenAt };

    return { latitude: lat, longitude: lon, takenAt };
  } catch {
    return empty;
  }
}

/** Browser geolocation fallback when a photo has no EXIF GPS. */
export function getDeviceLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("This device does not support location access."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message || "Could not read location.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export const GOOGLE_MAPS_LINK = (lat: number, lon: number) =>
  `https://www.google.com/maps?q=${lat},${lon}`;
