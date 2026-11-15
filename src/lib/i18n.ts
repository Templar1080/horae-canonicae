import type { CanonicalHourId, LanguageCode, LiturgicalColor, SoundProfile } from './types';

export interface HourTranslation {
  name: string;
  latinName: string;
  meaning: string;
}

export interface TranslationBundle {
  dir: 'ltr' | 'rtl';
  appTitle: string;
  openingVersicle: string;
  openingResponse: string;
  nav: {
    hours: string;
    calendar: string;
    log: string;
    permissions: string;
    settings: string;
  };
  actions: {
    testAlarm: string;
    prayNow: string;
    stopAlarm: string;
    snooze: string;
    skipToday: string;
    undoSkip: string;
    markPrayed: string;
    prayed: string;
    openDivinumHome: string;
    edit: string;
    done: string;
    exportBackup: string;
    importBackup: string;
    resetDefaults: string;
    requestPermission: string;
    previewSound: string;
  };
  labels: {
    nextHour: string;
    inMinutes: string;
    liturgicalDay: string;
    classLabel: string;
    rubrics1960: string;
    weekdayMode: string;
    weekendMode: string;
    solarEnabled: string;
    anticipatedTomorrow: string;
    quietNightMuted: string;
    skippedBadge: string;
    snoozedUntil: string;
    autoStopNote: string;
    sunrise: string;
    solarNoon: string;
    sunset: string;
    angelusTitle: string;
    reginaCaeliTitle: string;
    rosaryTitle: string;
    mysteryOfDay: string;
    widgetPreviewTitle: string;
    prayerHistory: string;
    hoursPrayedToday: string;
    totalLogged: string;
    currentStreak: string;
  };
  mysteries: {
    joyful: string;
    sorrowful: string;
    glorious: string;
  };
  colors: Record<LiturgicalColor, string>;
  sounds: Record<SoundProfile, string>;
  hours: Record<CanonicalHourId, HourTranslation>;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    dir: 'ltr',
    appTitle: 'Horæ Canonicæ',
    openingVersicle: 'Deus, in adjutórium meum inténde.',
    openingResponse: 'Dómine, ad adjuvándum me festína.',
    nav: {
      hours: 'Hours',
      calendar: 'Calendar',
      log: 'Prayer Log',
      permissions: 'Permissions',
      settings: 'Settings',
    },
    actions: {
      testAlarm: 'Test Alarm',
      prayNow: 'Open in Divinum Officium',
      stopAlarm: 'Stop Alarm',
      snooze: 'Snooze',
      skipToday: 'Skip Today',
      undoSkip: 'Undo Skip',
      markPrayed: 'Mark Prayed',
      prayed: 'Prayed',
      openDivinumHome: 'Divinum Officium Home',
      edit: 'Configure',
      done: 'Done',
      exportBackup: 'Export Backup (.json)',
      importBackup: 'Import Backup',
      resetDefaults: 'Reset Defaults',
      requestPermission: 'Enable Browser Notifications',
      previewSound: 'Test Tone',
    },
    labels: {
      nextHour: 'Next Canonical Hour',
      inMinutes: 'in',
      liturgicalDay: '1960 Roman Breviary',
      classLabel: 'Class',
      rubrics1960: '1960 Rubrics',
      weekdayMode: 'Weekday Schedule',
      weekendMode: 'Weekend Schedule',
      solarEnabled: 'Solar Astronomical Timing',
      anticipatedTomorrow: 'Anticipated for tomorrow’s Office',
      quietNightMuted: 'Muted by Quiet Night Matins',
      skippedBadge: 'Skipped today',
      snoozedUntil: 'Snoozed until',
      autoStopNote: 'Alarm automatically silences after 10 minutes',
      sunrise: 'Sunrise',
      solarNoon: 'Solar Noon',
      sunset: 'Sunset',
      angelusTitle: 'The Angelus',
      reginaCaeliTitle: 'Regina Cæli (Paschaltide)',
      rosaryTitle: 'Daily Rosary',
      mysteryOfDay: 'Mysteries of the Day',
      widgetPreviewTitle: 'Android Home-Screen Widget Preview',
      prayerHistory: 'Canonical Prayer History',
      hoursPrayedToday: 'Prayed Today',
      totalLogged: 'Total Logged',
      currentStreak: 'Day Streak',
    },
    mysteries: {
      joyful: 'Joyful Mysteries',
      sorrowful: 'Sorrowful Mysteries',
      glorious: 'Glorious Mysteries',
    },
    colors: {
      white: 'White',
      red: 'Red',
      violet: 'Violet',
      green: 'Green',
      rose: 'Rose',
      black: 'Black',
    },
    sounds: {
      monastic_bell: 'Monastic Bronze Bell',
      sanctus_chime: 'Sanctus Altar Chime',
      gregorian_tone: 'Gregorian Two-Tone',
      cloister_bell: 'Cloister Bell',
      cathedral_peal: 'Cathedral Peal',
      angelus_cathedral: 'Cathedral Bourdon Bell (Real Recording)',
    },
    hours: {
      matins: {
        name: 'Matins',
        latinName: 'Matutinum',
        meaning: 'Night watch of psalms and Scripture awaiting the Lord’s coming.',
      },
      lauds: {
        name: 'Lauds',
        latinName: 'Laudes',
        meaning: 'Morning praise at first light celebrating the Resurrection.',
      },
      prime: {
        name: 'Prime',
        latinName: 'Prima',
        meaning: 'Consecration of the day’s first hour and labor at sunrise.',
      },
      terce: {
        name: 'Terce',
        latinName: 'Tertia',
        meaning: 'Third hour recalling the descent of the Holy Ghost at Pentecost.',
      },
      sext: {
        name: 'Sext',
        latinName: 'Sexta',
        meaning: 'Midday prayer recalling Our Lord’s Crucifixion at the sixth hour.',
      },
      none: {
        name: 'None',
        latinName: 'Nona',
        meaning: 'Ninth hour commemorating Christ’s death on the Cross and perseverance.',
      },
      vespers: {
        name: 'Vespers',
        latinName: 'Vesperæ',
        meaning: 'Evening sacrifice of praise as the sun sets and lamps are lit.',
      },
      compline: {
        name: 'Compline',
        latinName: 'Completorium',
        meaning: 'Final night prayer entrusting soul and body to God’s protection.',
      },
    },
  },
  la: {
    dir: 'ltr',
    appTitle: 'Horæ Canonicæ',
    openingVersicle: 'Deus, in adjutórium meum inténde.',
    openingResponse: 'Dómine, ad adjuvándum me festína.',
    nav: {
      hours: 'Horæ',
      calendar: 'Kalendarium',
      log: 'Acta Precum',
      permissions: 'Licentiæ',
      settings: 'Ratio',
    },
    actions: {
      testAlarm: 'Proba Signum',
      prayNow: 'Aperi Divinum Officium',
      stopAlarm: 'Siste Signum',
      snooze: 'Procrastina',
      skipToday: 'Omitte Hodie',
      undoSkip: 'Restitue',
      markPrayed: 'Signa Recitatam',
      prayed: 'Recitata',
      openDivinumHome: 'Divinum Officium',
      edit: 'Mutare',
      done: 'Finitum',
      exportBackup: 'Serva Exemplar (.json)',
      importBackup: 'Restitue Exemplar',
      resetDefaults: 'Redde Pristina',
      requestPermission: 'Permitte Nuntios',
      previewSound: 'Audire Sonum',
    },
    labels: {
      nextHour: 'Proxima Hora Canonica',
      inMinutes: 'post',
      liturgicalDay: 'Breviarium Romanum 1960',
      classLabel: 'Classis',
      rubrics1960: 'Rubricæ 1960',
      weekdayMode: 'Ordo Ferialis',
      weekendMode: 'Ordo Sabbati et Dominicæ',
      solarEnabled: 'Computatio Solaris',
      anticipatedTomorrow: 'Anticipata pro Officio crastino',
      quietNightMuted: 'Silens propter quietem noctis',
      skippedBadge: 'Omissa hodie',
      snoozedUntil: 'Dilata usque ad',
      autoStopNote: 'Signum sponte cessat post decem minuta',
      sunrise: 'Ortus Solis',
      solarNoon: 'Meridies Solaris',
      sunset: 'Occasus Solis',
      angelusTitle: 'Angelus Domini',
      reginaCaeliTitle: 'Regina Cæli (Tempore Paschali)',
      rosaryTitle: 'Rosarium Cotidianum',
      mysteryOfDay: 'Mysteria Diei',
      widgetPreviewTitle: 'Specimen Tabulæ Android',
      prayerHistory: 'Tabula Horarum Recitatarum',
      hoursPrayedToday: 'Hodie Recitatæ',
      totalLogged: 'Summa Totius',
      currentStreak: 'Dies Continui',
    },
    mysteries: {
      joyful: 'Mysteria Gaudiosa',
      sorrowful: 'Mysteria Dolorosa',
      glorious: 'Mysteria Gloriosa',
    },
    colors: {
      white: 'Albus',
      red: 'Ruber',
      violet: 'Violaceus',
      green: 'Viridis',
      rose: 'Rosaceus',
      black: 'Niger',
    },
    sounds: {
      monastic_bell: 'Campana Monastica',
      sanctus_chime: 'Tintinnabulum Sanctus',
      gregorian_tone: 'Tonus Gregorianus',
      cloister_bell: 'Signum Claustri',
      cathedral_peal: 'Campanæ Cathedralis',
      angelus_cathedral: 'Campana Magna Cathedralis (Sonus Verus)',
    },
    hours: {
      matins: {
        name: 'Matutinum',
        latinName: 'Matutinum',
        meaning: 'Vigilia nocturna psalmorum et lectionum Dominum exspectans.',
      },
      lauds: {
        name: 'Laudes',
        latinName: 'Laudes Matutinæ',
        meaning: 'Laus matutina in aurora Resurrectionem celebrans.',
      },
      prime: {
        name: 'Prima',
        latinName: 'Ad Primam',
        meaning: 'Consecratio primæ horæ diei et operum.',
      },
      terce: {
        name: 'Tertia',
        latinName: 'Ad Tertiam',
        meaning: 'Memoria adventus Spiritus Sancti in Pentecoste.',
      },
      sext: {
        name: 'Sexta',
        latinName: 'Ad Sextam',
        meaning: 'Oratio meridiana in memoriam Crucifixionis Christi.',
      },
      none: {
        name: 'Nona',
        latinName: 'Ad Nonam',
        meaning: 'Hora nona mortem Domini in Cruce recolens.',
      },
      vespers: {
        name: 'Vesperæ',
        latinName: 'Ad Vesperas',
        meaning: 'Sacrificium vespertinum laudis in occasu solis.',
      },
      compline: {
        name: 'Completorium',
        latinName: 'Ad Completorium',
        meaning: 'Ultima oratio noctis animam Deo commendans.',
      },
    },
  },
  fa: {
    dir: 'rtl',
    appTitle: 'ساعات شرعی کلیسا',
    openingVersicle: 'خدایا به یاری من بشتاب.',
    openingResponse: 'ای خداوند در مددکاری من تعجیل فرما.',
    nav: {
      hours: 'ساعات',
      calendar: 'تقویم',
      log: 'گزارش نماز',
      permissions: 'مجوزها',
      settings: 'تنظیمات',
    },
    actions: {
      testAlarm: 'آزمایش زنگ',
      prayNow: 'گشودن در Divinum Officium',
      stopAlarm: 'توقف زنگ',
      snooze: 'تعویق',
      skipToday: 'رد کردن امروز',
      undoSkip: 'بازگردانی',
      markPrayed: 'ثبت به‌عنوان خوانده‌شده',
      prayed: 'خوانده شد',
      openDivinumHome: 'صفحه اصلی Divinum Officium',
      edit: 'تنظیم',
      done: 'تایید',
      exportBackup: 'ذخیره پشتیبان (.json)',
      importBackup: 'بازیابی پشتیبان',
      resetDefaults: 'بازنشانی پیش‌فرض',
      requestPermission: 'فعال‌سازی اعلان مرورگر',
      previewSound: 'پخش نمونه',
    },
    labels: {
      nextHour: 'ساعت شرعی بعدی',
      inMinutes: 'تا',
      liturgicalDay: 'دعای ساعات رومی ۱۹۶۰',
      classLabel: 'رتبه',
      rubrics1960: 'قواعد ۱۹۶۰',
      weekdayMode: 'برنامه روزهای هفته',
      weekendMode: 'برنامه آخر هفته',
      solarEnabled: 'محاسبه نجومی طلوع و غروب',
      anticipatedTomorrow: 'پیش‌خوانی شبانه برای دعای فردا',
      quietNightMuted: 'خاموش در شب‌های استراحت',
      skippedBadge: 'امروز رد شد',
      snoozedUntil: 'تعویق تا',
      autoStopNote: 'زنگ پس از ۱۰ دقیقه به‌صورت خودکار متوقف می‌شود',
      sunrise: 'طلوع آفتاب',
      solarNoon: 'ظهر شرعی',
      sunset: 'غروب آفتاب',
      angelusTitle: 'دعای فرشته خداوند (آنجلوس)',
      reginaCaeliTitle: 'ملکه آسمان (ایام عید پاک)',
      rosaryTitle: 'تسبیح روزانه',
      mysteryOfDay: 'اسرار امروز',
      widgetPreviewTitle: 'پیش‌نمایش ویجت صفحه اصلی اندروید',
      prayerHistory: 'تاریخچه ساعات خوانده‌شده',
      hoursPrayedToday: 'امروز خوانده‌شده',
      totalLogged: 'کل ثبت‌شده',
      currentStreak: 'روزهای پیاپی',
    },
    mysteries: {
      joyful: 'اسرار شادی‌بخش',
      sorrowful: 'اسرار اندوه‌ناک',
      glorious: 'اسرار پرجلال',
    },
    colors: {
      white: 'سفید',
      red: 'سرخ',
      violet: 'بنفش',
      green: 'سبز',
      rose: 'صورتی',
      black: 'سیاه',
    },
    sounds: {
      monastic_bell: 'ناقوس برنزی صومعه',
      sanctus_chime: 'زنگ محراب',
      gregorian_tone: 'آوای گریگوریایی',
      cloister_bell: 'زنگ صومعه',
      cathedral_peal: 'ناقوس کلیسای جامع',
      angelus_cathedral: 'ناقوس بزرگ کلیسای جامع (صدای واقعی)',
    },
    hours: {
      matins: {
        name: 'نماز شب (ماتینز)',
        latinName: 'Matutinum',
        meaning: 'شب‌زنده‌داری با مزامیر و قرائات در انتظار آمدن خداوند.',
      },
      lauds: {
        name: 'نماز سپیده‌دم (لودز)',
        latinName: 'Laudes',
        meaning: 'ستایش بامداد در نخستین روشنایی روز به یاد قیام مسیح.',
      },
      prime: {
        name: 'نماز ساعت نخست (پرایم)',
        latinName: 'Prima',
        meaning: 'تقدیس نخستین ساعت روز و کار روزانه هنگام طلوع خورشید.',
      },
      terce: {
        name: 'نماز ساعت سوم (ترس)',
        latinName: 'Tertia',
        meaning: 'یادبود نزول روح‌القدس در روز پنتیکاست.',
      },
      sext: {
        name: 'نماز نیمروز (سکست)',
        latinName: 'Sexta',
        meaning: 'دعای ظهر به یاد مصلوب شدن عیسی مسیح در ساعت ششم.',
      },
      none: {
        name: 'نماز عصر (نون)',
        latinName: 'Nona',
        meaning: 'یادبود وفات مسیح بر صلیب در ساعت نهم و پایداری در ایمان.',
      },
      vespers: {
        name: 'نماز شامگاه (وسپرز)',
        latinName: 'Vesperæ',
        meaning: 'قربانی ستایش شامگاهی هنگام غروب آفتاب.',
      },
      compline: {
        name: 'نماز خفتن (کامپلاین)',
        latinName: 'Completorium',
        meaning: 'آخرین دعای شب برای سپردن جان و تن به پناه خداوند.',
      },
    },
  },
};
