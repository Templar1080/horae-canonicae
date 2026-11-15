import type {
  LiturgicalClass,
  LiturgicalColor,
  LiturgicalDayInfo,
  LiturgicalSeason,
} from './types';

function toNoonDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function diffDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / 86400000);
}

/**
 * Gregorian Computus (Meeus/Jones/Butcher algorithm) returning Easter Sunday for `year`.
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toNoonDate(year, month, day);
}

/**
 * First Sunday of Advent (Sunday closest to Nov 30, i.e., Nov 27..Dec 3).
 */
export function getFirstSundayOfAdvent(year: number): Date {
  const nov30 = toNoonDate(year, 11, 30);
  const dow = nov30.getDay(); // 0=Sun..6=Sat
  const offset = dow <= 3 ? -dow : 7 - dow;
  return addDays(nov30, offset);
}

/**
 * Christ the King under the 1960/1962 calendar: Last Sunday of October.
 */
export function getChristTheKingSunday(year: number): Date {
  const oct31 = toNoonDate(year, 10, 31);
  return addDays(oct31, -oct31.getDay());
}

const ROMAN_NUMERALS = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII',
];

const FERIA_LATIN = [
  'Dominica',
  'Feria II',
  'Feria III',
  'Feria IV',
  'Feria V',
  'Feria VI',
  'Sabbato',
];

const FERIA_ENGLISH = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const FERIA_PERSIAN = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

interface FixedFeast {
  latin: string;
  english: string;
  persian: string;
  classRank: LiturgicalClass;
  color: LiturgicalColor;
  note?: string;
}

const FIXED_FEASTS: Record<string, FixedFeast> = {
  '01-01': { latin: 'Octava Nativitatis Domini', english: 'Octave Day of the Nativity (Circumcision)', persian: 'هشتمین روز میلاد مسیح', classRank: 'I', color: 'white' },
  '01-06': { latin: 'In Epiphania Domini', english: 'The Epiphany of Our Lord', persian: 'عید تجلی خداوند', classRank: 'I', color: 'white' },
  '01-13': { latin: 'Commemoratio Baptismatis Domini', english: 'Commemoration of the Baptism of Our Lord', persian: 'یادبود تعمید خداوند', classRank: 'II', color: 'white' },
  '02-02': { latin: 'In Purificatione B. Mariæ Virginis', english: 'Purification of the Blessed Virgin Mary', persian: 'تطهیر مریم باکره (شمع‌افروزی)', classRank: 'II', color: 'white' },
  '02-22': { latin: 'In Cathedra S. Petri Apostoli', english: 'Chair of St. Peter the Apostle', persian: 'کرسی پطرس رسول', classRank: 'II', color: 'white' },
  '02-24': { latin: 'S. Matthiæ Apostoli', english: 'St. Matthias, Apostle', persian: 'قدیس متیاس رسول', classRank: 'II', color: 'red' },
  '03-19': { latin: 'S. Joseph, Sponsi B.M.V.', english: 'St. Joseph, Spouse of the B.V.M.', persian: 'قدیس یوسف، همسر مریم مقدس', classRank: 'I', color: 'white' },
  '03-25': { latin: 'In Annuntiatione B. Mariæ Virginis', english: 'Annunciation of the Blessed Virgin Mary', persian: 'بشارت به مریم باکره', classRank: 'I', color: 'white' },
  '04-25': { latin: 'S. Marci Evangelistæ (Rogatio)', english: 'St. Mark, Evangelist (Greater Litanies)', persian: 'قدیس مرقس انجیل‌نگار', classRank: 'II', color: 'red', note: 'Greater Litanies (Rogation)' },
  '05-01': { latin: 'S. Joseph Opificis', english: 'St. Joseph the Worker', persian: 'قدیس یوسف کارگر', classRank: 'I', color: 'white' },
  '05-11': { latin: 'Ss. Philippi et Jacobi Apostolorum', english: 'Ss. Philip and James, Apostles', persian: 'قدیسان فیلیپ و یعقوب رسولان', classRank: 'II', color: 'red' },
  '05-31': { latin: 'B. Mariæ Virginis Reginæ', english: 'Queenship of the Blessed Virgin Mary', persian: 'ملکوت مریم باکره', classRank: 'II', color: 'white' },
  '06-24': { latin: 'In Nativitate S. Joannis Baptistæ', english: 'Nativity of St. John the Baptist', persian: 'میلاد یحیی تعمیددهنده', classRank: 'I', color: 'white' },
  '06-29': { latin: 'Ss. Petri et Pauli Apostolorum', english: 'Ss. Peter and Paul, Apostles', persian: 'قدیسان پطرس و پولس رسولان', classRank: 'I', color: 'red' },
  '07-01': { latin: 'Pretiosissimi Sanguinis D.N.J.C.', english: 'The Most Precious Blood of Our Lord', persian: 'خون گرانبهای عیسی مسیح', classRank: 'I', color: 'red' },
  '07-02': { latin: 'In Visitatione B. Mariæ Virginis', english: 'Visitation of the Blessed Virgin Mary', persian: 'دیدار مریم باکره', classRank: 'II', color: 'white' },
  '07-25': { latin: 'S. Jacobi Apostoli', english: 'St. James the Greater, Apostle', persian: 'قدیس یعقوب اکبر رسول', classRank: 'II', color: 'red' },
  '07-26': { latin: 'S. Annæ, Matris B.M.V.', english: 'St. Anne, Mother of the B.V.M.', persian: 'قدیسه حنا، مادر مریم مقدس', classRank: 'II', color: 'white' },
  '08-06': { latin: 'In Transfiguratione D.N.J.C.', english: 'Transfiguration of Our Lord', persian: 'تجلی چهره خداوند', classRank: 'II', color: 'white' },
  '08-10': { latin: 'S. Laurentii Martyris', english: 'St. Lawrence, Martyr', persian: 'قدیس لورنس شهید', classRank: 'II', color: 'red' },
  '08-15': { latin: 'In Assumptione B. Mariæ Virginis', english: 'Assumption of the Blessed Virgin Mary', persian: 'عروج مریم باکره', classRank: 'I', color: 'white' },
  '08-22': { latin: 'Immaculati Cordis B. Mariæ Virginis', english: 'Immaculate Heart of Mary', persian: 'قلب پاک مریم باکره', classRank: 'II', color: 'white' },
  '08-24': { latin: 'S. Bartholomæi Apostoli', english: 'St. Bartholomew, Apostle', persian: 'قدیس برتولما رسول', classRank: 'II', color: 'red' },
  '09-08': { latin: 'In Nativitate B. Mariæ Virginis', english: 'Nativity of the Blessed Virgin Mary', persian: 'میلاد مریم باکره', classRank: 'II', color: 'white' },
  '09-14': { latin: 'In Exaltatione Sanctæ Crucis', english: 'Exaltation of the Holy Cross', persian: 'تعالی صلیب مقدس', classRank: 'II', color: 'red' },
  '09-15': { latin: 'Septem Dolorum B. Mariæ Virginis', english: 'Seven Sorrows of the B.V.M.', persian: 'هفت غم مریم باکره', classRank: 'II', color: 'white' },
  '09-21': { latin: 'S. Matthæi Apostoli et Evang.', english: 'St. Matthew, Apostle & Evangelist', persian: 'قدیس متی رسول و انجیل‌نگار', classRank: 'II', color: 'red' },
  '09-29': { latin: 'In Dedicatione S. Michaëlis Archangeli', english: 'St. Michael the Archangel', persian: 'قدیس میکائیل فرشته مقرب', classRank: 'I', color: 'white' },
  '10-07': { latin: 'B. Mariæ Virginis a Rosario', english: 'Our Lady of the Rosary', persian: 'بانوی تسبیح مقدس', classRank: 'II', color: 'white' },
  '10-11': { latin: 'Maternitatis B. Mariæ Virginis', english: 'Motherhood of the Blessed Virgin Mary', persian: 'امومت مریم باکره', classRank: 'II', color: 'white' },
  '10-18': { latin: 'S. Lucæ Evangelistæ', english: 'St. Luke, Evangelist', persian: 'قدیس لوقا انجیل‌نگار', classRank: 'II', color: 'red' },
  '10-28': { latin: 'Ss. Simonis et Judæ Apostolorum', english: 'Ss. Simon and Jude, Apostles', persian: 'قدیسان شمعون و یهودا رسولان', classRank: 'II', color: 'red' },
  '11-01': { latin: 'In Festo Omnium Sanctorum', english: 'All Saints', persian: 'عید همه قدیسان', classRank: 'I', color: 'white' },
  '11-02': { latin: 'In Commemoratione Omnium Fidelium Defunctorum', english: 'All Souls’ Day', persian: 'یادبود همه درگذشتگان مؤمن', classRank: 'I', color: 'black', note: 'Office of the Dead recited with Matins & Lauds (1960 Rubrics)' },
  '11-09': { latin: 'In Dedicatione Archibasilicæ Ss. Salvatoris', english: 'Dedication of the Lateran Basilica', persian: 'تقدیس کلیسای جامع لاتران', classRank: 'II', color: 'white' },
  '11-21': { latin: 'In Præsentatione B. Mariæ Virginis', english: 'Presentation of the Blessed Virgin Mary', persian: 'معرفی مریم باکره در معبد', classRank: 'III', color: 'white' },
  '11-30': { latin: 'S. Andreæ Apostoli', english: 'St. Andrew, Apostle', persian: 'قدیس اندریاس رسول', classRank: 'II', color: 'red' },
  '12-08': { latin: 'In Conceptione Immaculata B.M.V.', english: 'Immaculate Conception of the B.V.M.', persian: 'لقاح پاک مریم باکره', classRank: 'I', color: 'white' },
  '12-21': { latin: 'S. Thomæ Apostoli', english: 'St. Thomas, Apostle', persian: 'قدیس توما رسول', classRank: 'II', color: 'red' },
  '12-25': { latin: 'In Nativitate Domini', english: 'The Nativity of Our Lord (Christmas)', persian: 'میلاد عیسی مسیح (کریسمس)', classRank: 'I', color: 'white' },
  '12-26': { latin: 'S. Stephani Protomartyris', english: 'St. Stephen, First Martyr', persian: 'قدیس استیفان نخستین شهید', classRank: 'II', color: 'red' },
  '12-27': { latin: 'S. Joannis Apostoli et Evang.', english: 'St. John, Apostle & Evangelist', persian: 'قدیس یوحنا رسول و انجیل‌نگار', classRank: 'II', color: 'white' },
  '12-28': { latin: 'Ss. Innocentium Martyrum', english: 'The Holy Innocents, Martyrs', persian: 'کودکان بی‌گناه شهید', classRank: 'II', color: 'red' },
};

function getRosaryMystery(dow: number): 'joyful' | 'sorrowful' | 'glorious' {
  // Traditional 1962 15-mystery cycle: Mon/Thu Joyful, Tue/Fri Sorrowful, Wed/Sat/Sun Glorious
  if (dow === 1 || dow === 4) return 'joyful';
  if (dow === 2 || dow === 5) return 'sorrowful';
  return 'glorious';
}

/**
 * Computes the 1960 Rubrics Roman Breviary / 1962 Missal liturgical day info for any date.
 */
export function getLiturgicalDay(inputDate: Date): LiturgicalDayInfo {
  const date = toNoonDate(inputDate.getFullYear(), inputDate.getMonth() + 1, inputDate.getDate());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = date.getDay(); // 0=Sun..6=Sat
  const isSunday = dow === 0;
  const dateKey = toDateKey(date);
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const rosaryMystery = getRosaryMystery(dow);

  const easter = getEasterSunday(year);
  const daysFromEaster = diffDays(date, easter);

  const advent1 = getFirstSundayOfAdvent(year);
  const daysFromAdvent = diffDays(date, advent1);
  const christmas = toNoonDate(year, 12, 25);
  const epiphany = toNoonDate(year, 1, 6);

  // Paschaltide in 1960 rubrics: Easter Sunday (0) through Saturday after Pentecost (55)
  const isPaschaltide = daysFromEaster >= 0 && daysFromEaster <= 55;

  // 1. Sacred Triduum & Holy Week (Highest Priority under 1960 Rubrics)
  if (daysFromEaster === -3) {
    return {
      dateKey,
      latinTitle: 'Feria V in Cena Domini',
      englishTitle: 'Maundy Thursday (Sacred Triduum)',
      persianTitle: 'پنج‌شنبه مقدس (سه‌روزه مقدس)',
      season: 'triduum',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: false,
      isTriduum: true,
      isPaschaltide: false,
      rubricNote:
        '1960 Rubrics: Omit "Deus, in adjutórium", hymns, and Gloria Patri. Hours open directly with antiphons; Tenebrae (Matins & Lauds) may be anticipated on Wednesday evening.',
      rosaryMystery,
    };
  }
  if (daysFromEaster === -2) {
    return {
      dateKey,
      latinTitle: 'Feria VI in Parasceve',
      englishTitle: 'Good Friday (Sacred Triduum)',
      persianTitle: 'جمعه نیک (سه‌روزه مقدس)',
      season: 'triduum',
      liturgicalClass: 'I',
      color: 'black',
      isSunday: false,
      isTriduum: true,
      isPaschaltide: false,
      rubricNote:
        '1960 Rubrics: Omit "Deus, in adjutórium" and Gloria Patri. Close every Hour with "Christus factus est" and silent Pater Noster.',
      rosaryMystery,
    };
  }
  if (daysFromEaster === -1) {
    return {
      dateKey,
      latinTitle: 'Sabbato Sancto',
      englishTitle: 'Holy Saturday (Sacred Triduum)',
      persianTitle: 'شنبه مقدس (سه‌روزه مقدس)',
      season: 'triduum',
      liturgicalClass: 'I',
      color: 'violet',
      isSunday: false,
      isTriduum: true,
      isPaschaltide: false,
      rubricNote:
        '1960 Rubrics: Compline is omitted if the Easter Vigil is attended; Matins & Lauds follow the Triduum Office without hymns.',
      rosaryMystery,
    };
  }
  if (daysFromEaster === 0) {
    return {
      dateKey,
      latinTitle: 'Dominica Resurrectionis',
      englishTitle: 'Easter Sunday of the Resurrection',
      persianTitle: 'یکشنبه قیام عیسی مسیح (عید پاک)',
      season: 'easter',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: true,
      isTriduum: false,
      isPaschaltide: true,
      rubricNote: '1960 Rubrics: Alleluia added to "Deus, in adjutórium"; Regina Cæli replaces Angelus.',
      rosaryMystery,
    };
  }

  // Easter Octave (days 1..6)
  if (daysFromEaster >= 1 && daysFromEaster <= 6) {
    return {
      dateKey,
      latinTitle: `${FERIA_LATIN[dow]} infra Octavam Paschæ`,
      englishTitle: `Easter ${FERIA_ENGLISH[dow]} (Octave of Easter)`,
      persianTitle: `${FERIA_PERSIAN[dow]} هفته عید پاک`,
      season: 'easter',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: true,
      rubricNote: '1960 Rubrics: Octave of Easter (Class I); double Alleluia at Benedicamus Domino in Lauds & Vespers.',
      rosaryMystery,
    };
  }
  if (daysFromEaster === 7) {
    return {
      dateKey,
      latinTitle: 'Dominica in Albis (Octava Paschæ)',
      englishTitle: 'Low Sunday (Octave Day of Easter)',
      persianTitle: 'یکشنبه اول پس از عید پاک',
      season: 'easter',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: true,
      isTriduum: false,
      isPaschaltide: true,
      rosaryMystery,
    };
  }

  // Ascension (39) & Pentecost (49) & Pentecost Octave (50..55) & Trinity (56) & Corpus Christi (60)
  if (daysFromEaster === 39) {
    return {
      dateKey,
      latinTitle: 'In Ascensione Domini',
      englishTitle: 'The Ascension of Our Lord',
      persianTitle: 'عید صعود خداوند',
      season: 'easter',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: true,
      rosaryMystery,
    };
  }
  if (daysFromEaster === 49) {
    return {
      dateKey,
      latinTitle: 'Dominica Pentecostes',
      englishTitle: 'Pentecost Sunday (Whitsunday)',
      persianTitle: 'یکشنبه پنتیکاست (نزول روح‌القدس)',
      season: 'pentecost',
      liturgicalClass: 'I',
      color: 'red',
      isSunday: true,
      isTriduum: false,
      isPaschaltide: true,
      rosaryMystery,
    };
  }
  if (daysFromEaster >= 50 && daysFromEaster <= 55) {
    const isEmber = dow === 3 || dow === 5 || dow === 6;
    return {
      dateKey,
      latinTitle: `${FERIA_LATIN[dow]} infra Octavam Pentecostes`,
      englishTitle: `Whit ${FERIA_ENGLISH[dow]} (Octave of Pentecost)`,
      persianTitle: `${FERIA_PERSIAN[dow]} هفته پنتیکاست`,
      season: 'pentecost',
      liturgicalClass: 'I',
      color: 'red',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: true,
      rubricNote: isEmber ? 'Pentecost Ember Day within the Octave.' : undefined,
      rosaryMystery,
    };
  }
  if (daysFromEaster === 56) {
    return {
      dateKey,
      latinTitle: 'Festum Sanctissimæ Trinitatis',
      englishTitle: 'Trinity Sunday',
      persianTitle: 'عید تثلیث اقدس',
      season: 'pentecost',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: true,
      isTriduum: false,
      isPaschaltide: false,
      rosaryMystery,
    };
  }
  if (daysFromEaster === 60) {
    return {
      dateKey,
      latinTitle: 'Festum Sanctissimi Corporis Christi',
      englishTitle: 'Corpus Christi',
      persianTitle: 'عید جسد مقدس مسیح',
      season: 'pentecost',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: false,
      rosaryMystery,
    };
  }
  if (daysFromEaster === 68) {
    return {
      dateKey,
      latinTitle: 'Sacratissimi Cordis Jesu',
      englishTitle: 'The Most Sacred Heart of Jesus',
      persianTitle: 'قلب مقدس عیسی',
      season: 'pentecost',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: false,
      rosaryMystery,
    };
  }

  // Ash Wednesday (-46) and Holy Week (-7..-4)
  if (daysFromEaster === -46) {
    return {
      dateKey,
      latinTitle: 'Feria IV Cinerum',
      englishTitle: 'Ash Wednesday',
      persianTitle: 'چهارشنبه خاکستر',
      season: 'lent',
      liturgicalClass: 'I',
      color: 'violet',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: false,
      rubricNote: '1960 Rubrics: Day of fast and abstinence; Lenten preces said at Lauds and Vespers on Wednesdays & Fridays.',
      rosaryMystery,
    };
  }
  if (daysFromEaster === -7) {
    return {
      dateKey,
      latinTitle: 'Dominica II Passionis seu in Palmis',
      englishTitle: 'Palm Sunday (2nd Sunday of Passiontide)',
      persianTitle: 'یکشنبه نخل‌ها',
      season: 'passiontide',
      liturgicalClass: 'I',
      color: 'violet',
      isSunday: true,
      isTriduum: false,
      isPaschaltide: false,
      rubricNote: '1960 Rubrics: Gloria Patri omitted at Venite and Introit in Passiontide.',
      rosaryMystery,
    };
  }
  if (daysFromEaster >= -6 && daysFromEaster <= -4) {
    return {
      dateKey,
      latinTitle: `${FERIA_LATIN[dow]} Hebdomadæ Sanctæ`,
      englishTitle: `${FERIA_ENGLISH[dow]} of Holy Week`,
      persianTitle: `${FERIA_PERSIAN[dow]} هفته مقدس`,
      season: 'passiontide',
      liturgicalClass: 'I',
      color: 'violet',
      isSunday: false,
      isTriduum: false,
      isPaschaltide: false,
      rubricNote: '1960 Rubrics: Holy Week Major Feria (Class I); takes precedence over all feasts.',
      rosaryMystery,
    };
  }

  // Check Fixed Feasts (unless superseded by Class I Sunday or Class I Feria)
  const fixed = FIXED_FEASTS[mmdd];

  // Determine temporal season & Sunday/Feria
  let season: LiturgicalSeason = 'pentecost';
  let temporalLatin = `${FERIA_LATIN[dow]} per annum`;
  let temporalEnglish = `${FERIA_ENGLISH[dow]}`;
  let temporalPersian = `${FERIA_PERSIAN[dow]}`;
  let temporalClass: LiturgicalClass = isSunday ? 'II' : 'IV';
  let temporalColor: LiturgicalColor = 'green';
  let rubricNote: string | undefined;

  // Christ the King (Last Sunday of October)
  const christKing = getChristTheKingSunday(year);
  if (diffDays(date, christKing) === 0) {
    return {
      dateKey,
      latinTitle: 'In Festo D.N.J.C. Regis',
      englishTitle: 'Christ the King',
      persianTitle: 'عید عیسی مسیح پادشاه',
      season: 'pentecost',
      liturgicalClass: 'I',
      color: 'white',
      isSunday: true,
      isTriduum: false,
      isPaschaltide: false,
      rubricNote: '1960/1962 Calendar: Celebrated on the last Sunday of October.',
      rosaryMystery,
    };
  }

  if (daysFromAdvent >= 0 && diffDays(date, christmas) < 0) {
    // Advent
    season = 'advent';
    temporalColor = 'violet';
    const week = Math.floor(daysFromAdvent / 7) + 1;
    if (isSunday) {
      temporalClass = 'I';
      const isGaudete = week === 3;
      temporalColor = isGaudete ? 'rose' : 'violet';
      temporalLatin = `Dominica ${ROMAN_NUMERALS[week]} Adventus`;
      temporalEnglish = `${week === 1 ? '1st' : week === 2 ? '2nd' : week === 3 ? '3rd (Gaudete)' : '4th'} Sunday of Advent`;
      temporalPersian = `یکشنبه ${week}م ظهور (ادونت)`;
    } else {
      temporalClass = (month === 12 && day >= 17) ? 'II' : 'III';
      temporalLatin = `${FERIA_LATIN[dow]} Hebd. ${ROMAN_NUMERALS[week]} Adventus`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} of Advent (Week ${week})`;
      temporalPersian = `${FERIA_PERSIAN[dow]} هفته ${week}م ظهور`;
      if (month === 12 && day >= 17 && day <= 23) {
        rubricNote = 'Great "O" Antiphon at Vespers tonight.';
      }
      if (week === 3 && (dow === 3 || dow === 5 || dow === 6)) {
        temporalClass = 'II';
        rubricNote = 'Ember Day of Advent (Class II).';
      }
    }
  } else if (diffDays(date, christmas) >= 0 || diffDays(date, epiphany) < 0) {
    // Christmastide (Dec 25 - Jan 5)
    season = 'christmas';
    temporalColor = 'white';
    temporalClass = isSunday ? 'II' : 'II';
    if (isSunday) {
      temporalLatin = 'Dominica infra Octavam Nativitatis';
      temporalEnglish = 'Sunday within the Octave of Christmas';
      temporalPersian = 'یکشنبه در هشت‌روزه میلاد';
    } else {
      temporalLatin = `${FERIA_LATIN[dow]} de Nativitate`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} in Christmastide`;
      temporalPersian = `${FERIA_PERSIAN[dow]} ایام میلاد`;
    }
  } else if (daysFromEaster < -63) {
    // Epiphanytide (Jan 6 .. Saturday before Septuagesima)
    season = 'epiphany';
    temporalColor = diffDays(date, toNoonDate(year, 1, 13)) <= 0 ? 'white' : 'green';
    const jan6Dow = epiphany.getDay();
    const firstSunAfterEpiphany = addDays(epiphany, jan6Dow === 0 ? 7 : 7 - jan6Dow);
    const daysSinceEpiphanySun = diffDays(date, firstSunAfterEpiphany);
    const week = daysSinceEpiphanySun < 0 ? 0 : Math.floor(daysSinceEpiphanySun / 7) + 1;
    if (isSunday) {
      temporalClass = 'II';
      if (week === 1) {
        temporalLatin = 'Festum Sanctæ Familiæ (Dom. I post Epiph.)';
        temporalEnglish = 'The Holy Family (1st Sunday after Epiphany)';
        temporalPersian = 'عید خانواده مقدس';
        temporalColor = 'white';
      } else {
        temporalLatin = `Dominica ${ROMAN_NUMERALS[week]} post Epiphaniam`;
        temporalEnglish = `${ordinal(week)} Sunday after Epiphany`;
        temporalPersian = `یکشنبه ${week}م پس از تجلی`;
      }
    } else {
      temporalLatin = week === 0 ? `${FERIA_LATIN[dow]} post Epiphaniam` : `${FERIA_LATIN[dow]} Hebd. ${ROMAN_NUMERALS[week]} post Epiph.`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} after Epiphany`;
      temporalPersian = `${FERIA_PERSIAN[dow]} پس از تجلی`;
    }
  } else if (daysFromEaster >= -63 && daysFromEaster < -46) {
    // Septuagesima (-63..-47)
    season = 'septuagesima';
    temporalColor = 'violet';
    const weekIdx = Math.floor((daysFromEaster + 63) / 7);
    const namesLat = ['Septuagesimæ', 'Sexagesimæ', 'Quinquagesimæ'];
    const namesEn = ['Septuagesima', 'Sexagesima', 'Quinquagesima'];
    const namesFa = ['سپتواگسیما', 'سکسواگسیما', 'کوئینکواگسیما'];
    if (isSunday) {
      temporalClass = 'II';
      temporalLatin = `Dominica in ${namesLat[weekIdx]}`;
      temporalEnglish = `${namesEn[weekIdx]} Sunday`;
      temporalPersian = `یکشنبه ${namesFa[weekIdx]}`;
    } else {
      temporalClass = 'IV';
      temporalLatin = `${FERIA_LATIN[dow]} post Dom. in ${namesLat[weekIdx]}`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} after ${namesEn[weekIdx]}`;
      temporalPersian = `${FERIA_PERSIAN[dow]} پس از ${namesFa[weekIdx]}`;
    }
  } else if (daysFromEaster >= -45 && daysFromEaster < -14) {
    // Lent (-45..-15)
    season = 'lent';
    temporalColor = 'violet';
    const lentWeek = Math.floor((daysFromEaster + 42) / 7) + 1;
    if (isSunday) {
      temporalClass = 'I';
      const isLaetare = lentWeek === 4;
      temporalColor = isLaetare ? 'rose' : 'violet';
      temporalLatin = `Dominica ${ROMAN_NUMERALS[lentWeek]} in Quadragesima`;
      temporalEnglish = `${lentWeek === 1 ? '1st' : lentWeek === 2 ? '2nd' : lentWeek === 3 ? '3rd' : '4th (Lætare)'} Sunday of Lent`;
      temporalPersian = `یکشنبه ${lentWeek}م روزه بزرگ`;
    } else {
      temporalClass = 'III';
      if (daysFromEaster <= -43) {
        temporalLatin = `${FERIA_LATIN[dow]} post Cineres`;
        temporalEnglish = `${FERIA_ENGLISH[dow]} after Ash Wednesday`;
        temporalPersian = `${FERIA_PERSIAN[dow]} پس از چهارشنبه خاکستر`;
      } else {
        temporalLatin = `${FERIA_LATIN[dow]} Hebd. ${ROMAN_NUMERALS[lentWeek]} in Quadragesima`;
        temporalEnglish = `${FERIA_ENGLISH[dow]} in Lent (Week ${lentWeek})`;
        temporalPersian = `${FERIA_PERSIAN[dow]} هفته ${lentWeek}م روزه`;
        if (lentWeek === 1 && (dow === 3 || dow === 5 || dow === 6)) {
          temporalClass = 'II';
          rubricNote = 'Lenten Ember Day (Class II).';
        }
      }
    }
  } else if (daysFromEaster >= -14 && daysFromEaster < -7) {
    // Passiontide week 1 (-14..-8)
    season = 'passiontide';
    temporalColor = 'violet';
    if (isSunday) {
      temporalClass = 'I';
      temporalLatin = 'Dominica I Passionis';
      temporalEnglish = 'Passion Sunday (1st Sunday of Passiontide)';
      temporalPersian = 'یکشنبه اول آلام';
      rubricNote = '1960 Rubrics: Crosses veiled; Gloria Patri omitted at Venite.';
    } else {
      temporalClass = 'III';
      temporalLatin = `${FERIA_LATIN[dow]} Hebd. Passionis`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} of Passion Week`;
      temporalPersian = `${FERIA_PERSIAN[dow]} هفته آلام`;
    }
  } else if (daysFromEaster > 0 && daysFromEaster < 49) {
    // Eastertide
    season = 'easter';
    temporalColor = 'white';
    const easterWeek = Math.floor(daysFromEaster / 7);
    if (isSunday) {
      temporalClass = 'II';
      temporalLatin = `Dominica ${ROMAN_NUMERALS[easterWeek]} post Pascha`;
      temporalEnglish = `${ordinal(easterWeek)} Sunday after Easter`;
      temporalPersian = `یکشنبه ${easterWeek}م پس از عید پاک`;
    } else {
      temporalClass = 'IV';
      temporalLatin = `${FERIA_LATIN[dow]} Hebd. ${ROMAN_NUMERALS[easterWeek]} post Pascha`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} after Easter (Week ${easterWeek})`;
      temporalPersian = `${FERIA_PERSIAN[dow]} پس از عید پاک`;
      if (daysFromEaster >= 36 && daysFromEaster <= 38) {
        rubricNote = 'Rogation Day (Minor Litanies before Ascension).';
      }
    }
  } else {
    // Time after Pentecost (daysFromEaster >= 57 up to day before Advent 1)
    season = 'pentecost';
    temporalColor = 'green';
    const trinitySunday = addDays(easter, 56);
    const weeksSinceTrinity = Math.floor(diffDays(date, trinitySunday) / 7);
    const pentecostWeek = weeksSinceTrinity + 1;
    const totalSundaysAfterPentecost = Math.floor(diffDays(advent1, trinitySunday) / 7);
    const isLastSunday = isSunday && pentecostWeek === totalSundaysAfterPentecost;

    if (isSunday) {
      temporalClass = 'II';
      if (isLastSunday) {
        temporalLatin = 'Dominica XXIV et Ultima post Pentecosten';
        temporalEnglish = '24th & Last Sunday after Pentecost';
        temporalPersian = 'یکشنبه آخر پس از پنتیکاست';
      } else if (pentecostWeek >= 24) {
        // Resumed Epiphany Sundays in November before the 24th/Last Sunday
        const resumedIndex = 6 - (totalSundaysAfterPentecost - pentecostWeek);
        temporalLatin = `Dominica ${ROMAN_NUMERALS[resumedIndex]} post Epiphaniam (Resumpta)`;
        temporalEnglish = `${ordinal(resumedIndex)} Sunday after Epiphany (Resumed)`;
        temporalPersian = `یکشنبه ${resumedIndex}م پس از تجلی (ادامه)`;
      } else {
        temporalLatin = `Dominica ${ROMAN_NUMERALS[pentecostWeek]} post Pentecosten`;
        temporalEnglish = `${ordinal(pentecostWeek)} Sunday after Pentecost`;
        temporalPersian = `یکشنبه ${pentecostWeek}م پس از پنتیکاست`;
      }
    } else {
      temporalClass = 'IV';
      temporalLatin = `${FERIA_LATIN[dow]} Hebd. ${ROMAN_NUMERALS[Math.min(pentecostWeek, 24)]} post Pentecosten`;
      temporalEnglish = `${FERIA_ENGLISH[dow]} after Pentecost (Week ${pentecostWeek})`;
      temporalPersian = `${FERIA_PERSIAN[dow]} هفته ${pentecostWeek}م پس از پنتیکاست`;
    }
  }

  // Apply 1960 Precedence: Fixed Feast vs Sunday/Feria
  if (fixed) {
    // Class I Fixed Feast always wins except over Class I Sundays (Advent I, Lent I-IV, Passiontide)
    const fixedWinsOverSunday = fixed.classRank === 'I' && temporalClass !== 'I';
    if (!isSunday || fixedWinsOverSunday) {
      return {
        dateKey,
        latinTitle: fixed.latin,
        englishTitle: fixed.english,
        persianTitle: fixed.persian,
        season,
        liturgicalClass: fixed.classRank,
        color: fixed.color,
        isSunday,
        isTriduum: false,
        isPaschaltide,
        rubricNote: fixed.note ?? rubricNote,
        rosaryMystery,
      };
    }
  }

  return {
    dateKey,
    latinTitle: temporalLatin,
    englishTitle: temporalEnglish,
    persianTitle: temporalPersian,
    season,
    liturgicalClass: temporalClass,
    color: temporalColor,
    isSunday,
    isTriduum: false,
    isPaschaltide,
    rubricNote,
    rosaryMystery,
  };
}
