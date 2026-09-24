export type MediaCredit = {
  src: string;
  title: string;
  license: string;
  source: string;
};

const commons = (filename: string, width = 900) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}?width=${width}`;

export const HERO_MEDIA: MediaCredit = {
  src: commons('Brihadeshwara Temple, Thanjavur, Tamil Nadu, India.jpg', 1600),
  title: 'Brihadeshwara Temple, Thanjavur',
  license: 'CC BY-SA 3.0',
  source: 'Wikimedia Commons',
};

export const SAINT_MEDIA: Record<string, MediaCredit> = {
  'tirumurai8.manikkavacakar': {
    src: commons('Manikkavacakar, India, Tamil Nadu, Chola period, 11th-12th century AD, bronze - Linden-Museum - Stuttgart, Germany - DSC03795.jpg', 760),
    title: 'Manikkavacakar bronze, Chola period, Linden-Museum',
    license: 'CC0 / Daderot',
    source: 'Wikimedia Commons',
  },
  'nayanmar.20': {
    src: commons('Appar, Chola period bronze, 12th century, Government Museum, Chennai (1) (37405562076).jpg', 760),
    title: 'Appar, Chola-period bronze, Government Museum Chennai',
    license: 'CC BY 2.0',
    source: 'Wikimedia Commons',
  },
  'nayanmar.27': {
    src: commons('Sambandar, India, Tamil Nadu, Chola period, bronze - Linden-Museum - Stuttgart, Germany - DSC03787.jpg', 760),
    title: 'Sambandar bronze, Chola period',
    license: 'CC0',
    source: 'Wikimedia Commons',
  },
  'nayanmar.63': {
    src: commons('Sundaramoorthinayanar (165) (Raja Raja Chola Art Gallery)-WUS02842.jpg', 760),
    title: 'Sundaramoorthinayanar bronze, Raja Raja Chola Art Gallery',
    license: 'Public Domain / CC0',
    source: 'Wikimedia Commons',
  },
};

export const TEMPLE_MEDIA: Record<string, MediaCredit> = {
  'tevaram_site.KV01': {
    src: commons('A view of Nataraja Shiva Temple at Chidambaram, Tamil Nadu (10).jpg', 1100),
    title: 'Gopuram of the Nataraja Temple, Chidambaram',
    license: 'CC BY 2.0 · Richard Mortel',
    source: 'Wikimedia Commons',
  },
};


export const DISCOVERY_MEDIA: Record<'story' | 'saint' | 'sthalam' | 'trail', MediaCredit> = {
  story: {
    src: commons('Kannapa Nayanar (174) (Raja Raja Chola Art Gallery)-WUS02852.jpg', 760),
    title: 'Kannappa Nayanar bronze, Raja Raja Chola Art Gallery',
    license: 'CC BY-SA 4.0',
    source: 'Wikimedia Commons',
  },
  saint: {
    src: commons('Karaikal Ammaiyar temple karaikkal JEG2488 .jpg', 900),
    title: 'Karaikal Ammaiyar Temple, Karaikal',
    license: 'CC BY-SA 3.0',
    source: 'Wikimedia Commons',
  },
  sthalam: {
    src: commons('Sattainathar temple (14).jpg', 900),
    title: 'Sirkazhi Sattanathar Temple',
    license: 'CC BY-SA 4.0',
    source: 'Wikimedia Commons',
  },
  trail: HERO_MEDIA,
};
