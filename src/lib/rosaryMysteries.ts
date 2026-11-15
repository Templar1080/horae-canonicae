export type RosaryMysterySet = 'joyful' | 'sorrowful' | 'glorious';

export interface RosaryDecade {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  latinTitle: string;
  scriptureRef: string;
  scriptureReading: string;
  fruit: string;
}

export const ROSARY_MYSTERIES: Record<
  RosaryMysterySet,
  {
    name: string;
    latinName: string;
    daysNote: string;
    decades: RosaryDecade[];
  }
> = {
  joyful: {
    name: 'The Joyful Mysteries',
    latinName: 'Mysteria Gaudiosa',
    daysNote: 'Mondays & Thursdays (and Sundays of Advent & after Epiphany)',
    decades: [
      {
        number: 1,
        title: '1st Joyful Mystery: The Annunciation',
        latinTitle: 'Annuntiatio Beatæ Mariæ Virginis',
        scriptureRef: 'Luke 1:28, 31, 38',
        scriptureReading:
          'And the angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women... Behold thou shalt conceive in thy womb, and shalt bring forth a son; and thou shalt call his name Jesus. And Mary said: Behold the handmaid of the Lord; be it done to me according to thy word.',
        fruit: 'Humility',
      },
      {
        number: 2,
        title: '2nd Joyful Mystery: The Visitation',
        latinTitle: 'Visitatio Beatæ Mariæ Virginis',
        scriptureRef: 'Luke 1:39–42',
        scriptureReading:
          'And Mary rising up in those days, went into the hill country with haste into a city of Juda. And she entered into the house of Zachary, and saluted Elizabeth. And it came to pass, that when Elizabeth heard the salutation of Mary, the infant leaped in her womb. And Elizabeth was filled with the Holy Ghost.',
        fruit: 'Love of Neighbor',
      },
      {
        number: 3,
        title: '3rd Joyful Mystery: The Nativity',
        latinTitle: 'Nativitas Domini Nostri Jesu Christi',
        scriptureRef: 'Luke 2:6–7, 11',
        scriptureReading:
          'And it came to pass, that when they were there, her days were accomplished, that she should be delivered. And she brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn. For, this day, is born to you a Saviour, who is Christ the Lord.',
        fruit: 'Poverty of Spirit & Detachment',
      },
      {
        number: 4,
        title: '4th Joyful Mystery: The Presentation',
        latinTitle: 'Præsentatio Pueri Jesu in Templo',
        scriptureRef: 'Luke 2:22, 29–32',
        scriptureReading:
          'And after the days of her purification, according to the law of Moses, were accomplished, they carried him to Jerusalem, to present him to the Lord... Now thou dost dismiss thy servant, O Lord, according to thy word in peace; because my eyes have seen thy salvation, a light to the revelation of the Gentiles.',
        fruit: 'Obedience & Purity of Heart',
      },
      {
        number: 5,
        title: '5th Joyful Mystery: Finding Jesus in the Temple',
        latinTitle: 'Inventio Pueri Jesu in Templo',
        scriptureRef: 'Luke 2:46, 49',
        scriptureReading:
          'And it came to pass, that, after three days, they found him in the temple, sitting in the midst of the doctors, hearing them, and asking them questions... And he said to them: How is it that you sought me? Did you not know, that I must be about my Father’s business?',
        fruit: 'Joy in Finding Jesus & Zeal for His House',
      },
    ],
  },
  sorrowful: {
    name: 'The Sorrowful Mysteries',
    latinName: 'Mysteria Dolorosa',
    daysNote: 'Tuesdays & Fridays (and Sundays of Lent)',
    decades: [
      {
        number: 1,
        title: '1st Sorrowful Mystery: The Agony in the Garden',
        latinTitle: 'Agonia Domini Nostri in Horto',
        scriptureRef: 'Luke 22:41–44',
        scriptureReading:
          'And he was withdrawn away from them a stone’s cast; and kneeling down, he prayed, saying: Father, if thou wilt, remove this chalice from me: but yet not my will, but thine be done. And being in an agony, he prayed the longer. And his sweat became as drops of blood, trickling down upon the ground.',
        fruit: 'Sorrow for Sin & Conformity to God’s Will',
      },
      {
        number: 2,
        title: '2nd Sorrowful Mystery: The Scourging at the Pillar',
        latinTitle: 'Flagellatio Domini Nostri Jesu Christi',
        scriptureRef: 'Isaiah 53:5 & John 19:1',
        scriptureReading:
          'Then therefore Pilate took Jesus, and scourged him. But he was wounded for our iniquities, he was bruised for our sins: the chastisement of our peace was upon him, and by his bruises we are healed.',
        fruit: 'Purity & Mortification of the Senses',
      },
      {
        number: 3,
        title: '3rd Sorrowful Mystery: The Crowning with Thorns',
        latinTitle: 'Coronatio Spinis Domini Nostri',
        scriptureRef: 'Matthew 27:28–29',
        scriptureReading:
          'And stripping him, they put a scarlet cloak about him. And platting a crown of thorns, they put it upon his head, and a reed in his right hand. And bowing the knee before him, they mocked him, saying: Hail, king of the Jews.',
        fruit: 'Moral Courage & Reign of Christ in the Mind',
      },
      {
        number: 4,
        title: '4th Sorrowful Mystery: Carrying of the Cross',
        latinTitle: 'Bajulationis Crucis',
        scriptureRef: 'John 19:17 & Luke 9:23',
        scriptureReading:
          'And bearing his own cross, he went forth to that place which is called Calvary, but in Hebrew Golgotha. And he said to all: If any man will come after me, let him deny himself, and take up his cross daily, and follow me.',
        fruit: 'Patience in Trials',
      },
      {
        number: 5,
        title: '5th Sorrowful Mystery: The Crucifixion',
        latinTitle: 'Crucifixio et Mors Domini Nostri',
        scriptureRef: 'Luke 23:33–34, 46',
        scriptureReading:
          'And when they were come to the place which is called Calvary, they crucified him there... And Jesus said: Father, forgive them, for they know not what they do. And crying out with a loud voice, Jesus said: Father, into thy hands I commend my spirit. And saying this, he gave up the ghost.',
        fruit: 'Perseverance, Forgiveness & Salvation of Souls',
      },
    ],
  },
  glorious: {
    name: 'The Glorious Mysteries',
    latinName: 'Mysteria Gloriosa',
    daysNote: 'Wednesdays, Saturdays & Sundays (and Paschaltide)',
    decades: [
      {
        number: 1,
        title: '1st Glorious Mystery: The Resurrection',
        latinTitle: 'Resurrectio Domini Nostri Jesu Christi',
        scriptureRef: 'Mark 16:6',
        scriptureReading:
          'Who saith to them: Be not affrighted; you seek Jesus of Nazareth, who was crucified: he is risen, he is not here, behold the place where they laid him.',
        fruit: 'Faith',
      },
      {
        number: 2,
        title: '2nd Glorious Mystery: The Ascension',
        latinTitle: 'Ascensio Domini Nostri in Cælum',
        scriptureRef: 'Acts 1:9–11',
        scriptureReading:
          'And when he had said these things, while they looked on, he was raised up: and a cloud received him out of their sight. This Jesus who is taken up from you into heaven, shall so come, as you have seen him going into heaven.',
        fruit: 'Hope & Desire for Heaven',
      },
      {
        number: 3,
        title: '3rd Glorious Mystery: Descent of the Holy Ghost',
        latinTitle: 'Missio Spiritus Sancti',
        scriptureRef: 'Acts 2:2–4',
        scriptureReading:
          'And suddenly there came a sound from heaven, as of a mighty wind coming, and it filled the whole house where they were sitting. And there appeared to them parted tongues as it were of fire, and it sat upon every one of them: and they were all filled with the Holy Ghost.',
        fruit: 'Charity & Wisdom of the Holy Ghost',
      },
      {
        number: 4,
        title: '4th Glorious Mystery: The Assumption',
        latinTitle: 'Assumptio Beatæ Mariæ Virginis in Cælum',
        scriptureRef: 'Judith 13:18 & Psalm 44:10',
        scriptureReading:
          'Blessed art thou, O daughter, by the Lord the most high God, above all women upon the earth. The queen stood on thy right hand, in gilded clothing; surrounded with variety.',
        fruit: 'Grace of a Happy Death & Devotion to Mary',
      },
      {
        number: 5,
        title: '5th Glorious Mystery: The Coronation of Mary',
        latinTitle: 'Coronatio Beatæ Mariæ Virginis Reginæ Cæli',
        scriptureRef: 'Apocalypse 12:1',
        scriptureReading:
          'And a great sign appeared in heaven: A woman clothed with the sun, and the moon under her feet, and on her head a crown of twelve stars.',
        fruit: 'Trust in Mary’s Intercession & Final Perseverance',
      },
    ],
  },
};
