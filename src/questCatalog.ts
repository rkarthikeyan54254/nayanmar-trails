export type QuestLocale = 'en' | 'ta';

export type Localized = { en: string; ta: string };
export type QuestChoice = { id: string; label: Localized };
export type QuestClaim = { id: string; claim: Localized; safe: boolean; explanation: Localized };

export type QuestDefinition = {
  key: string;
  id: string;
  version: string;
  saintId: string;
  ordinal: number | null;
  registryKind: 'nayanmar' | 'naalvar_companion';
  group: 'naalvar' | 'featured';
  name: Localized;
  title: Localized;
  subtitle: Localized;
  badge: Localized;
  source: {
    work: string;
    authorityScope: string;
    storySourceCommit: string;
    graphSourceCommit: string;
    scope: Localized;
  };
  story: Localized;
  prediction: {
    prompt: Localized;
    choices: QuestChoice[];
  };
  memory: {
    prompt: Localized;
    choices: QuestChoice[];
    correctId: string;
    correct: Localized;
    wrong: Localized;
  };
  geography: {
    intro: Localized;
    leftLabel: Localized;
    leftValue: Localized;
    rightLabel: Localized;
    rightValue: Localized;
    question: Localized;
    choices: QuestChoice[];
    correctId: string;
    correct: Localized;
    wrong: Localized;
    scope: Localized;
  };
  detective: {
    intro: Localized;
    claims: QuestClaim[];
  };
  who: {
    clues: Localized[];
    choices: QuestChoice[];
    correctId: string;
    correct: Localized;
    wrong: Localized;
  };
  reflection: QuestChoice[];
  recap: {
    story: Localized;
    places: Localized;
    source: Localized;
  };
};

const C = (id: string, en: string, ta: string): QuestChoice => ({ id, label: { en, ta } });
const L = (en: string, ta: string): Localized => ({ en, ta });

const COMMON_REFLECTION = {
  sincerity: C('sincerity', 'Sincerity', 'மனமார்ந்த அன்பு'),
  courage: C('courage', 'Courage', 'துணிவு'),
  service: C('service', 'Service', 'தொண்டு'),
  resilience: C('resilience', 'Resilience', 'மீண்டு நிற்கும் மனம்'),
  learning: C('learning', 'I want to understand the tradition more deeply', 'இந்த மரபை இன்னும் ஆழமாக அறிய வேண்டும்'),
  humility: C('humility', 'Humility', 'தாழ்மை'),
  discipline: C('discipline', 'Steadiness', 'நிலைத்த ஒழுக்கு'),
  inward: C('inward', 'Inner devotion', 'உள்ளார்ந்த பக்தி'),
};

const TRADITION_SCOPE = L(
  'Periya Puranam traditional narrative · not independently verified biography',
  'பெரியபுராண மரபுக் கதை · தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்ட வாழ்க்கை வரலாறு அல்ல',
);

const TRADITION_BADGE = L('TRADITIONAL REFERENCE', 'மரபுக் குறிப்பு');

const SOURCE_STORY_COMMIT = '0f01a1db8f94db489125df8c57cebb294b7529d6';
const SOURCE_GRAPH_COMMIT = '1f2cec34c5b4412fe3178884a38a51dbca6eb452';

export const QUESTS: QuestDefinition[] = [
  {
    key: 'kannappar',
    id: 'kannappar-v1',
    version: '0.2.0',
    saintId: 'nayanmar.09',
    ordinal: 9,
    registryKind: 'nayanmar',
    group: 'featured',
    name: L('Kannappar', 'கண்ணப்பர்'),
    title: L('Kannappar — devotion without a script', 'கண்ணப்பர் — முறையைத் தாண்டிய முழு அன்பு'),
    subtitle: L(
      'A memory-first quest about a striking traditional story, place associations and careful source reading.',
      'மரபுக் கதை, தலச் செய்தி, ஆதாரத்தின் தன்மை—மூன்றையும் நினைவில் பதியச் செய்யும் சிறு பயணம்.',
    ),
    badge: TRADITION_BADGE,
    source: {
      work: 'Periya Puranam',
      authorityScope: 'traditional_reference',
      storySourceCommit: SOURCE_STORY_COMMIT,
      graphSourceCommit: SOURCE_GRAPH_COMMIT,
      scope: TRADITION_SCOPE,
    },
    story: L(
      'In the Periya Puranam tradition, Kannappar is remembered as a hunter whose worship ignores formal ritual. He offers meat, brings water in his mouth, and the story finally reaches the extraordinary act of offering his own eyes to Shiva. The narrative presents these acts as signs of absolute devotion.',
      'பெரியபுராண மரபில் கண்ணப்பர் ஒரு வேடராக நினைவுகூரப்படுகிறார். ஆகம முறைப்படி அல்லாமல் அவர் சிவனை வழிபட்டதாகக் கதை சொல்கிறது. வேட்டையாடிய இறைச்சியைப் படைத்ததும், வாயில் நீர் கொண்டு வந்ததும், இறுதியில் தன் கண்களையே அர்ப்பணிக்கத் துணிந்ததும் அவரது முழுமையான பக்தியின் அடையாளங்களாகக் கூறப்படுகின்றன.',
    ),
    prediction: {
      prompt: L(
        'A hunter worships Shiva without following formal ritual. What do you think the story will make you notice most?',
        'ஆகம முறைகளைப் பின்பற்றாமல் ஒரு வேடர் சிவனை வழிபடுகிறார். இந்தக் கதை எதை அதிகமாக உணரச் செய்யும் என்று நினைக்கிறாய்?',
      ),
      choices: [
        C('precision', 'Perfect ritual technique', 'சடங்கு முறையின் துல்லியம்'),
        C('sincerity', 'The intensity of devotion', 'பக்தியின் தீவிரம்'),
        C('status', 'Social status and learning', 'பிறப்பும் கல்வியும்'),
        C('surprise', 'I want the story to surprise me', 'கதை என்ன சொல்கிறது என்று பார்க்கிறேன்'),
      ],
    },
    memory: {
      prompt: L(
        'Which act comes at the end as the story’s most extreme offering?',
        'கதையின் இறுதியில் மிகத் தீவிரமான அர்ப்பணிப்பாக எது வருகிறது?',
      ),
      choices: [
        C('water', 'Bringing water in his mouth', 'வாயில் நீர் கொண்டு வருவது'),
        C('meat', 'Offering meat', 'இறைச்சியைப் படைப்பது'),
        C('eyes', 'Offering his own eyes', 'தன் கண்களையே அர்ப்பணிப்பது'),
        C('temple', 'Building a temple', 'கோயில் கட்டுவது'),
      ],
      correctId: 'eyes',
      correct: L(
        'Yes. The Pramana story summary identifies the offering of his own eyes as the final act.',
        'ஆம். பிரமாண கதைச் சுருக்கத்தில் இறுதி நிகழ்வாகக் கூறப்படுவது தன் கண்களையே அர்ப்பணிக்கத் துணிவதே.',
      ),
      wrong: L(
        'Look again at the climax of the traditional account.',
        'மரபுக் கதையின் உச்ச நிகழ்வை இன்னொரு முறை நினைத்துப் பார்.',
      ),
    },
    geography: {
      intro: L(
        'Pramana records two traditional-place associations for Kannappar.',
        'கண்ணப்பருடன் தொடர்புடைய இரண்டு மரபுத் தலச் செய்திகளை பிரமாணம் பதிவு செய்கிறது.',
      ),
      leftLabel: L('Birthplace tradition', 'பிறந்த தலம் — மரபுக் குறிப்பு'),
      leftValue: L('Uduppur · உடுப்பூர்', 'உடுப்பூர்'),
      rightLabel: L('Mukti-place tradition', 'முக்தித் தலம் — மரபுக் குறிப்பு'),
      rightValue: L('Tirukkalatti · திருக்காளத்தி', 'திருக்காளத்தி'),
      question: L(
        'Which traditional place is recorded as Kannappar’s mukti-place?',
        'கண்ணப்பரின் முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டிருப்பது எது?',
      ),
      choices: [C('uduppur', 'Uduppur', 'உடுப்பூர்'), C('tirukkalatti', 'Tirukkalatti', 'திருக்காளத்தி')],
      correctId: 'tirukkalatti',
      correct: L(
        'Tirukkalatti is the mukti-place tradition; Uduppur is the birthplace tradition.',
        'திருக்காளத்தி முக்தித் தலமாகவும், உடுப்பூர் பிறந்த தலமாகவும் மரபில் பதிவு செய்யப்பட்டுள்ளது.',
      ),
      wrong: L('Uduppur is the birthplace tradition.', 'உடுப்பூர் பிறந்த தலமாக வரும் மரபுக் குறிப்பு.'),
      scope: L(
        'These are traditional-place associations. They are not automatically precise modern temple identifications.',
        'இவை மரபில் வரும் தலத் தொடர்புகள். இன்றைய எந்தக் கோயிலும் துல்லியமாக உறுதி செய்யப்பட்டது என்று இதனால் மட்டும் கொள்ள முடியாது.',
      ),
    },
    detective: {
      intro: L(
        'Decide what Pramana supports — and what goes beyond the evidence.',
        'பிரமாணம் எதை ஆதரிக்கிறது, எதை ஆதரிக்கவில்லை என்று பிரித்துப் பார்.',
      ),
      claims: [
        {
          id: 'story',
          claim: L(
            'The Periya Puranam tradition portrays Kannappar’s worship as outside formal ritual and culminates in the offering of his eyes.',
            'பெரியபுராண மரபில் கண்ணப்பரின் வழிபாடு ஆகம முறைக்கு வெளியே இருப்பதாகவும், கதை கண்களை அர்ப்பணிக்கும் நிகழ்வில் உச்சத்தை அடைவதாகவும் சொல்லப்படுகிறது.',
          ),
          safe: true,
          explanation: L('Supported as traditional narrative.', 'மரபுக் கதைச் சுருக்கமாக இது ஆதரிக்கப்படுகிறது.'),
        },
        {
          id: 'history',
          claim: L(
            'Because the story appears in the graph, every narrated detail is independently verified history.',
            'இந்தக் கதை பிரமாணத்தில் இருப்பதால் அதிலுள்ள ஒவ்வொரு நிகழ்வும் தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்டுள்ளது.',
          ),
          safe: false,
          explanation: L(
            'Not established. The source class is traditional_reference.',
            'அப்படி கூற முடியாது. இது traditional_reference என்ற மரபுக் குறிப்பாகவே வகைப்படுத்தப்பட்டுள்ளது.',
          ),
        },
        {
          id: 'places',
          claim: L(
            'Pramana records Uduppur and Tirukkalatti as traditional place associations for Kannappar.',
            'உடுப்பூரும் திருக்காளத்தியும் கண்ணப்பருடன் தொடர்புடைய மரபுத் தலங்களாக பிரமாணத்தில் பதிவு செய்யப்பட்டுள்ளன.',
          ),
          safe: true,
          explanation: L(
            'Supported as traditional-place references; historical_verified is false.',
            'மரபுத் தலக் குறிப்பாக இது ஆதரிக்கப்படுகிறது; historical_verified என்பது false.',
          ),
        },
      ],
    },
    who: {
      clues: [
        L('I am remembered in this tradition as a hunter.', 'மரபுக் கதையில் நான் ஒரு வேடராக நினைவுகூரப்படுகிறேன்.'),
        L('My worship is described as outside formal ritual.', 'என் வழிபாடு ஆகம முறைக்கு வெளியே இருப்பதாகக் கதை சொல்கிறது.'),
        L('The story culminates in the offering of my own eyes.', 'என் கண்களையே அர்ப்பணிக்கத் துணியும் நிகழ்வில் கதை உச்சத்தை அடைகிறது.'),
      ],
      choices: [
        C('kannappar', 'Kannappar', 'கண்ணப்பர்'),
        C('appar', 'Appar', 'அப்பர்'),
        C('karaikkal', 'Karaikkal Ammaiyar', 'காரைக்கால் அம்மையார்'),
        C('sundarar', 'Sundarar', 'சுந்தரர்'),
      ],
      correctId: 'kannappar',
      correct: L('Kannappar. You recognised the defining clues.', 'கண்ணப்பர். கதையின் முக்கிய அடையாளங்களிலிருந்தே அவரை கண்டுபிடித்துவிட்டாய்.'),
      wrong: L('Reveal another clue and try again.', 'இன்னொரு குறிப்பைத் திறந்து மீண்டும் முயற்சி செய்.'),
    },
    reflection: [COMMON_REFLECTION.sincerity, COMMON_REFLECTION.courage, COMMON_REFLECTION.learning],
    recap: {
      story: L(
        'Traditional story: worship outside formal ritual; the narrative culminates in the offering of his eyes.',
        'மரபுக் கதை: வழக்கமான சடங்கு முறைக்கு வெளியான வழிபாடு; கண்களை அர்ப்பணிக்கும் நிகழ்வில் கதை உச்சத்தை அடைகிறது.',
      ),
      places: L('Traditional places: Uduppur · Tirukkalatti', 'மரபுத் தலங்கள்: உடுப்பூர் · திருக்காளத்தி'),
      source: L('Periya Puranam · traditional_reference', 'பெரியபுராணம் · மரபுக் குறிப்பு'),
    },
  },
  {
    key: 'appar',
    id: 'appar-v1',
    version: '0.2.0',
    saintId: 'nayanmar.20',
    ordinal: 20,
    registryKind: 'nayanmar',
    group: 'naalvar',
    name: L('Appar · Tirunavukkarasar', 'அப்பர் · திருநாவுக்கரசர்'),
    title: L('Appar — when devotion becomes service', 'அப்பர் — பக்தி தொண்டாக மாறும் போது'),
    subtitle: L(
      'Transformation, Tēvāram, uzhavāram service and a large sacred geography.',
      'வாழ்க்கைத் திருப்பம், தேவாரம், உழவாரத் தொண்டு, திருத்தலப் பயணம்—அப்பரை நினைவில் கொள்ளும் தேடல்.',
    ),
    badge: TRADITION_BADGE,
    source: {
      work: 'Periya Puranam + Tēvāram edition metadata',
      authorityScope: 'traditional_reference + edition_metadata',
      storySourceCommit: SOURCE_STORY_COMMIT,
      graphSourceCommit: SOURCE_GRAPH_COMMIT,
      scope: L(
        'Periya Puranam story layer stays traditional_reference; Tēvāram counts and sthalam links are edition_metadata.',
        'பெரியபுராணக் கதை மரபுக் குறிப்பாகவே உள்ளது; தேவாரப் பதிக எண்ணிக்கையும் திருத்தலத் தொடர்புகளும் பதிப்பு சார்ந்த edition_metadata.',
      ),
    },
    story: L(
      'The traditional story remembers Appar’s dramatic turn from Jain monk to Tēvāram saint. Among its best-known episodes are his survival after being cast into the sea with a stone tied to him and his tireless temple-cleaning service with the uzhavāram. Pramana separately carries 312 Appar Tēvāram pathigams in the pinned edition metadata, linked across 125 sthalams.',
      'சமணத் துறவியிலிருந்து சிவபக்தரான அப்பரின் வாழ்க்கை முழுவதும் திருப்பம் நிறைந்ததாக பெரியபுராண மரபு சொல்கிறது. கல்லோடு கடலில் வீசப்பட்டும் உயிர் தப்பியது முதல், உழவாரத்தால் கோயில்களைச் சுத்தம் செய்த தொண்டு வரை—அவரது பாதை பாடலும் பணியும் சேர்ந்த ஒன்று. பிரமாணத்தின் தேவாரப் பதிப்பு தரவில் அப்பருக்குச் சேர்ந்த 312 பதிகங்கள், 125 திருத்தலங்களுடன் இணைக்கப்பட்டுள்ளன.',
    ),
    prediction: {
      prompt: L(
        'Appar’s story combines a major life-turn with physical service in temples. Which idea do you expect to stay with you?',
        'அப்பரின் கதையில் வாழ்க்கைத் திருப்பமும் கோயில் தொண்டும் ஒன்றாக வருகின்றன. இதில் எது உன் மனதில் அதிகம் நிற்கும் என்று நினைக்கிறாய்?',
      ),
      choices: [
        C('turn', 'A person can change direction deeply', 'ஒரு வாழ்க்கை முழுவதும் புதிய திசை பெறலாம்'),
        C('service', 'Devotion can become practical service', 'பக்தி செயலில் தொண்டாக மாறலாம்'),
        C('poetry', 'Song can carry devotion across places', 'பாடல் திருத்தலங்களை இணைக்கலாம்'),
        C('surprise', 'I want the story to decide', 'கதை என்ன சொல்கிறது என்று பார்க்கிறேன்'),
      ],
    },
    memory: {
      prompt: L(
        'Which tool is strongly associated with Appar’s temple-cleaning service in the traditional story?',
        'அப்பரின் கோயில் சுத்தப்படுத்தும் தொண்டோடு அதிகமாக நினைவுகூரப்படும் கருவி எது?',
      ),
      choices: [
        C('uzhavaram', 'Uzhavāram', 'உழவாரம்'),
        C('veena', 'Vīṇā', 'வீணை'),
        C('conch', 'Conch', 'சங்கு'),
        C('lamp', 'Temple lamp', 'திருவிளக்கு'),
      ],
      correctId: 'uzhavaram',
      correct: L('Yes. The uzhavāram is a defining image of Appar’s service.', 'ஆம். அப்பரின் திருத்தொண்டை நினைவூட்டும் முக்கிய அடையாளம் உழவாரம்.'),
      wrong: L('Think of the tool used in his temple-cleaning service.', 'கோயில் சுத்தப்படுத்தும் தொண்டில் பயன்படுத்திய கருவியை நினைத்துப் பார்.'),
    },
    geography: {
      intro: L(
        'Pramana records Aamur as Appar’s birthplace tradition and Tiruppugalur as his mukti-place tradition.',
        'அப்பரின் பிறந்த தலமாக ஆமூரையும், முக்தித் தலமாக திருப்புகலூரையும் பிரமாணம் மரபுக் குறிப்பாக பதிவு செய்கிறது.',
      ),
      leftLabel: L('Birthplace tradition', 'பிறந்த தலம் — மரபுக் குறிப்பு'),
      leftValue: L('Aamur · ஆமூர்', 'ஆமூர்'),
      rightLabel: L('Mukti-place tradition', 'முக்தித் தலம் — மரபுக் குறிப்பு'),
      rightValue: L('Tiruppugalur · திருப்புகலூர்', 'திருப்புகலூர்'),
      question: L('Which place is the mukti-place tradition?', 'முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டிருப்பது எது?'),
      choices: [C('aamur', 'Aamur', 'ஆமூர்'), C('tiruppugalur', 'Tiruppugalur', 'திருப்புகலூர்')],
      correctId: 'tiruppugalur',
      correct: L('Tiruppugalur is the mukti-place tradition.', 'திருப்புகலூர் முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டுள்ளது.'),
      wrong: L('Aamur is the birthplace tradition.', 'ஆமூர் பிறந்த தலமாக வரும் மரபுக் குறிப்பு.'),
      scope: L(
        'These place roles are traditional references. Appar’s Tēvāram sthalam links are a separate edition-metadata layer.',
        'இந்தப் பிறப்பு/முக்தித் தலச் செய்திகள் மரபுக் குறிப்புகள். அப்பரின் தேவாரத் திருத்தலத் தொடர்புகள் தனியான பதிப்பு-தரவு அடுக்கு.',
      ),
    },
    detective: {
      intro: L(
        'Appar is a good test of keeping story, hymn metadata and historical proof separate.',
        'அப்பரைப் புரிந்துகொள்ள கதை, தேவாரப் பதிப்பு தரவு, வரலாற்றுச் சான்று—மூன்றையும் தனித்தனியாகப் படிக்க வேண்டும்.',
      ),
      claims: [
        {
          id: 'count',
          claim: L(
            'The pinned Tēvāram export carries 312 Appar pathigams linked across 125 sthalams.',
            'பிரமாணத்தின் நிலைப்படுத்தப்பட்ட தேவாரப் பதிப்பு தரவில் அப்பருக்குச் சேர்ந்த 312 பதிகங்கள் 125 திருத்தலங்களுடன் இணைக்கப்பட்டுள்ளன.',
          ),
          safe: true,
          explanation: L('Supported as edition_metadata.', 'இது edition_metadata என்ற பதிப்பு சார்ந்த தரவாக ஆதரிக்கப்படுகிறது.'),
        },
        {
          id: 'route',
          claim: L(
            'Those 125 sthalam links prove the exact historical order in which Appar travelled.',
            'அந்த 125 திருத்தலத் தொடர்புகள் அப்பர் பயணித்த துல்லியமான வரலாற்று வரிசையை நிரூபிக்கின்றன.',
          ),
          safe: false,
          explanation: L(
            'Not established. The route display is product inference unless a chronology source explicitly asserts it.',
            'அப்படி கூற முடியாது. தனி காலவரிசைச் சான்று இல்லாமல் பயணக் கோடு product_inference மட்டுமே.',
          ),
        },
        {
          id: 'story',
          claim: L(
            'The stone-at-sea episode and uzhavāram service are presented as part of the Periya Puranam traditional narrative.',
            'கல்லோடு கடலில் வீசப்பட்ட சம்பவமும் உழவாரத் தொண்டும் பெரியபுராண மரபுக் கதையின் பகுதிகளாகக் காட்டப்படுகின்றன.',
          ),
          safe: true,
          explanation: L('Supported as traditional_reference.', 'traditional_reference என்ற மரபுக் குறிப்பாக இது ஆதரிக்கப்படுகிறது.'),
        },
      ],
    },
    who: {
      clues: [
        L('My life is remembered as a major turn from Jain monk to Shaiva saint.', 'சமணத் துறவியிலிருந்து சிவபக்தராக மாறிய வாழ்க்கைத் திருப்பத்தால் நான் நினைவுகூரப்படுகிறேன்.'),
        L('Temple service with the uzhavāram is one of my strongest visual symbols.', 'உழவாரத் திருத்தொண்டு என்னுடன் நெருக்கமாக நினைவுகூரப்படுகிறது.'),
        L('The pinned Tēvāram export carries 312 pathigams under my authorship.', 'பிரமாணத்தின் தேவாரப் பதிப்பில் எனக்குச் சேர்ந்த 312 பதிகங்கள் உள்ளன.'),
      ],
      choices: [
        C('appar', 'Appar', 'அப்பர்'),
        C('sambandar', 'Sambandar', 'சம்பந்தர்'),
        C('sundarar', 'Sundarar', 'சுந்தரர்'),
        C('manikkavasakar', 'Manikkavasakar', 'மாணிக்கவாசகர்'),
      ],
      correctId: 'appar',
      correct: L('Appar · Tirunavukkarasar.', 'அப்பர் · திருநாவுக்கரசர்.'),
      wrong: L('Use the uzhavāram clue.', 'உழவாரம் என்ற குறிப்பை நினைவில் கொள்.'),
    },
    reflection: [COMMON_REFLECTION.service, COMMON_REFLECTION.resilience, COMMON_REFLECTION.discipline, COMMON_REFLECTION.learning],
    recap: {
      story: L('Transformation, song and uzhavāram service.', 'வாழ்க்கைத் திருப்பம், தேவாரம், உழவாரத் தொண்டு.'),
      places: L('Traditional places: Aamur · Tiruppugalur', 'மரபுத் தலங்கள்: ஆமூர் · திருப்புகலூர்'),
      source: L('Periya Puranam + Tēvāram edition metadata', 'பெரியபுராணம் + தேவாரப் பதிப்பு தரவு'),
    },
  },
  {
    key: 'sambandar',
    id: 'sambandar-v1',
    version: '0.2.0',
    saintId: 'nayanmar.27',
    ordinal: 27,
    registryKind: 'nayanmar',
    group: 'naalvar',
    name: L('Sambandar', 'சம்பந்தர்'),
    title: L('Sambandar — grace becomes song', 'சம்பந்தர் — அருள் பாடலாக மலரும் தருணம்'),
    subtitle: L(
      'A child-saint, the jñāna-pāl tradition and the opening of a vast Tēvāram landscape.',
      'ஞானப்பால் மரபு, முதல் பாடல், பரந்த தேவாரத் திருத்தல உலகம்—சம்பந்தரை நினைவில் கொள்ளும் தேடல்.',
    ),
    badge: TRADITION_BADGE,
    source: {
      work: 'Periya Puranam + Tēvāram edition metadata',
      authorityScope: 'traditional_reference + edition_metadata',
      storySourceCommit: SOURCE_STORY_COMMIT,
      graphSourceCommit: SOURCE_GRAPH_COMMIT,
      scope: L(
        'The divine-milk episode is traditional_reference; pathigam and sthalam counts are edition_metadata.',
        'ஞானப்பால் சம்பவம் மரபுக் குறிப்பாகவும், பதிக/திருத்தல எண்ணிக்கைகள் edition_metadata என்ற பதிப்பு தரவாகவும் தனித்தனியாகக் காட்டப்படுகின்றன.',
      ),
    },
    story: L(
      'Sambandar enters the traditional narrative as a small child at Sirkali, fed divine milk by Uma. His first hymn follows immediately, making poetry itself the sign of grace in the story. In the pinned Tēvāram export, 385 pathigams are carried under Sambandar’s authorship, linked across 221 sthalams.',
      'சீர்காழியில் உமையம்மை ஊட்டிய ஞானப்பால்—அதிலிருந்தே சிறுவன் சம்பந்தரின் தேவாரப் பயணம் தொடங்குகிறது என்று மரபு சொல்கிறது. முதல் பாடலே அந்த அருளின் பதிலாக மலர்ந்ததாகக் கூறப்படுகிறது. பிரமாணத்தின் தேவாரப் பதிப்பு தரவில் சம்பந்தருக்குச் சேர்ந்த 385 பதிகங்கள் 221 திருத்தலங்களுடன் இணைக்கப்பட்டுள்ளன.',
    ),
    prediction: {
      prompt: L(
        'A child receives grace and immediately answers in song. What do you expect this story to emphasise?',
        'ஒரு சிறுவனுக்கு அருள் கிடைக்கிறது; அதற்குப் பதில் உடனே பாடலாக மலர்கிறது. இந்தக் கதை எதை வலியுறுத்தும் என்று நினைக்கிறாய்?',
      ),
      choices: [
        C('age', 'Age is the most important thing', 'வயதுதான் முக்கியம்'),
        C('grace', 'Grace expressed through song', 'அருள் பாடலாக வெளிப்படுவது'),
        C('travel', 'Only the number of places', 'திருத்தல எண்ணிக்கை மட்டும்'),
        C('surprise', 'I want to find out', 'கதை சொல்லட்டும்'),
      ],
    },
    memory: {
      prompt: L('What immediately follows the jñāna-pāl episode in the traditional summary?', 'ஞானப்பால் சம்பவத்துக்குப் பிறகு மரபுக் கதைச் சுருக்கத்தில் உடனே என்ன நிகழ்கிறது?'),
      choices: [
        C('first-hymn', 'His first hymn', 'அவரது முதல் பாடல்'),
        C('coronation', 'A coronation', 'முடிசூட்டு விழா'),
        C('temple-build', 'He builds a temple', 'கோயில் கட்டுகிறார்'),
        C('silence', 'He takes a vow of silence', 'மௌன விரதம் எடுக்கிறார்'),
      ],
      correctId: 'first-hymn',
      correct: L('Yes. The story makes the first hymn the immediate response to grace.', 'ஆம். அருளுக்கான உடனடி பதிலாக முதல் பாடல் மலர்கிறது என்று மரபு கூறுகிறது.'),
      wrong: L('Think of how the story connects grace and poetry.', 'அருளையும் பாடலையும் கதை எப்படி இணைக்கிறது என்று நினைத்துப் பார்.'),
    },
    geography: {
      intro: L(
        'Pramana records Kāzhi as Sambandar’s birthplace tradition and Nallur Perumanam as his mukti-place tradition.',
        'சம்பந்தரின் பிறந்த தலமாக காழியையும், முக்தித் தலமாக நல்லூர்ப் பெருமணத்தையும் பிரமாணம் மரபுக் குறிப்பாக பதிவு செய்கிறது.',
      ),
      leftLabel: L('Birthplace tradition', 'பிறந்த தலம் — மரபுக் குறிப்பு'),
      leftValue: L('Kāzhi · காழி', 'காழி'),
      rightLabel: L('Mukti-place tradition', 'முக்தித் தலம் — மரபுக் குறிப்பு'),
      rightValue: L('Nallur Perumanam · நல்லூர்ப் பெருமணம்', 'நல்லூர்ப் பெருமணம்'),
      question: L('Which place is the mukti-place tradition?', 'முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டிருப்பது எது?'),
      choices: [C('kazhi', 'Kāzhi', 'காழி'), C('nallur', 'Nallur Perumanam', 'நல்லூர்ப் பெருமணம்')],
      correctId: 'nallur',
      correct: L('Nallur Perumanam is the mukti-place tradition.', 'நல்லூர்ப் பெருமணம் முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டுள்ளது.'),
      wrong: L('Kāzhi is the birthplace tradition.', 'காழி பிறந்த தலமாக வரும் மரபுக் குறிப்பு.'),
      scope: L(
        'Traditional place roles and Tēvāram sthalam links are separate evidence layers.',
        'மரபில் வரும் பிறப்பு/முக்தித் தலச் செய்தியும், தேவாரப் பதிப்பு தரவில் வரும் திருத்தலத் தொடர்புகளும் இரண்டு தனி ஆதார அடுக்குகள்.',
      ),
    },
    detective: {
      intro: L('Sambandar’s quest separates a powerful traditional story from edition-qualified hymn metadata.', 'சம்பந்தரின் தேடலில் மரபுக் கதையையும் தேவாரப் பதிப்பு தரவையும் கலக்காமல் படிப்பதே முக்கியம்.'),
      claims: [
        {
          id: 'count',
          claim: L(
            'The pinned Tēvāram export carries 385 Sambandar pathigams linked across 221 sthalams.',
            'நிலைப்படுத்தப்பட்ட தேவாரப் பதிப்பு தரவில் சம்பந்தருக்குச் சேர்ந்த 385 பதிகங்கள் 221 திருத்தலங்களுடன் இணைக்கப்பட்டுள்ளன.',
          ),
          safe: true,
          explanation: L('Supported as edition_metadata.', 'edition_metadata என்ற பதிப்பு தரவாக இது ஆதரிக்கப்படுகிறது.'),
        },
        {
          id: 'milk-history',
          claim: L(
            'The divine-milk episode is independently verified history because Sambandar also has Tēvāram metadata.',
            'சம்பந்தருக்கு தேவாரப் பதிப்பு தரவு இருப்பதால் ஞானப்பால் சம்பவமும் தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்டதாகிவிடுகிறது.',
          ),
          safe: false,
          explanation: L(
            'No. The story episode remains traditional_reference.',
            'இல்லை. அந்தக் கதைச் சம்பவம் traditional_reference என்ற மரபுக் குறிப்பாகவே உள்ளது.',
          ),
        },
        {
          id: 'story',
          claim: L(
            'The traditional summary links the jñāna-pāl episode directly with Sambandar’s first hymn.',
            'ஞானப்பால் சம்பவத்துக்குப் பின் சம்பந்தரின் முதல் பாடல் மலர்ந்ததாக மரபுக் கதைச் சுருக்கம் கூறுகிறது.',
          ),
          safe: true,
          explanation: L('Supported as traditional narrative.', 'மரபுக் கதைச் சுருக்கமாக இது ஆதரிக்கப்படுகிறது.'),
        },
      ],
    },
    who: {
      clues: [
        L('I enter the traditional story as a very young child.', 'மரபுக் கதையில் நான் சிறு குழந்தையாகவே அறிமுகமாகிறேன்.'),
        L('Uma’s divine milk is a defining episode in my story.', 'உமையம்மையின் ஞானப்பால் என் கதையின் முக்கிய அடையாளம்.'),
        L('The pinned Tēvāram export carries 385 pathigams under my authorship.', 'பிரமாணத்தின் தேவாரப் பதிப்பில் எனக்குச் சேர்ந்த 385 பதிகங்கள் உள்ளன.'),
      ],
      choices: [
        C('sambandar', 'Sambandar', 'சம்பந்தர்'),
        C('appar', 'Appar', 'அப்பர்'),
        C('sundarar', 'Sundarar', 'சுந்தரர்'),
        C('manikkavasakar', 'Manikkavasakar', 'மாணிக்கவாசகர்'),
      ],
      correctId: 'sambandar',
      correct: L('Sambandar.', 'சம்பந்தர்.'),
      wrong: L('Use the divine-milk clue.', 'ஞானப்பால் என்ற குறிப்பை நினைவில் கொள்.'),
    },
    reflection: [COMMON_REFLECTION.sincerity, COMMON_REFLECTION.learning, C('wonder', 'Wonder', 'வியப்பு')],
    recap: {
      story: L('The jñāna-pāl tradition and a first hymn born from grace.', 'ஞானப்பால் மரபும், அருளுக்குப் பதிலாக மலரும் முதல் பாடலும்.'),
      places: L('Traditional places: Kāzhi · Nallur Perumanam', 'மரபுத் தலங்கள்: காழி · நல்லூர்ப் பெருமணம்'),
      source: L('Periya Puranam + Tēvāram edition metadata', 'பெரியபுராணம் + தேவாரப் பதிப்பு தரவு'),
    },
  },
  {
    key: 'sundarar',
    id: 'sundarar-v1',
    version: '0.2.0',
    saintId: 'nayanmar.63',
    ordinal: 63,
    registryKind: 'nayanmar',
    group: 'naalvar',
    name: L('Sundarar · Arurar', 'சுந்தரர் · ஆரூரர்'),
    title: L('Sundarar — devotion as relationship', 'சுந்தரர் — இறைவனோடு உரிமை கொண்ட உறவு'),
    subtitle: L(
      'A wedding interrupted, an old palm-leaf claim and one of bhakti’s most intimate voices.',
      'திருமண மேடையில் தொடங்கும் திருப்பம், பழைய ஓலை, இறைவனோடு உரிமை கொண்ட உரையாடல்—சுந்தரரை நினைவில் கொள்ளும் தேடல்.',
    ),
    badge: TRADITION_BADGE,
    source: {
      work: 'Periya Puranam + Tēvāram edition metadata',
      authorityScope: 'traditional_reference + edition_metadata',
      storySourceCommit: SOURCE_STORY_COMMIT,
      graphSourceCommit: SOURCE_GRAPH_COMMIT,
      scope: L(
        'The wedding episode is traditional_reference; the 101 pathigams and 83 linked sthalams are edition_metadata.',
        'திருமண மேடை சம்பவம் மரபுக் குறிப்பாகவும், 101 பதிகங்களும் 83 திருத்தலத் தொடர்புகளும் edition_metadata என்ற பதிப்பு தரவாகவும் தனித்தனியாக உள்ளன.',
      ),
    },
    story: L(
      'In the Periya Puranam tradition, Sundarar’s saintly journey begins when Shiva, appearing as an old man, interrupts his wedding and produces a palm-leaf claim that Sundarar is already his servant. The relationship that follows is remembered for its striking intimacy and conversational quality. The pinned Tēvāram export carries 101 Sundarar pathigams linked across 83 sthalams.',
      'திருமண மேடையில் இருந்த சுந்தரரை, முதியவர் வேடத்தில் வந்த சிவன் ஒரு பழைய ஓலையைக் காட்டி “இவன் என் அடியான்” என்று உரிமை கொண்டாடுகிறார்—அங்கிருந்தே சுந்தரரின் பக்திப் பயணம் தொடங்குகிறது என்று பெரியபுராணம் கூறுகிறது. பின்னர் இறைவனோடு அவருக்குள்ள உறவு மிக நெருக்கமான உரையாடலாக நினைவுகூரப்படுகிறது. பிரமாணத்தின் தேவாரப் பதிப்பு தரவில் சுந்தரருக்குச் சேர்ந்த 101 பதிகங்கள் 83 திருத்தலங்களுடன் இணைக்கப்பட்டுள்ளன.',
    ),
    prediction: {
      prompt: L(
        'A wedding is interrupted by a claim of an older relationship. What might make this story memorable?',
        'திருமண மேடையில் ஒரு பழைய உறவின் உரிமை முன்வைக்கப்படுகிறது. இந்தக் கதையை நினைவில் நிற்கச் செய்வது எது என்று நினைக்கிறாய்?',
      ),
      choices: [
        C('distance', 'A distant, formal relationship', 'தொலைவான, முறையான உறவு'),
        C('intimacy', 'An intimate, conversational relationship with Shiva', 'சிவனோடு நெருக்கமான உரிமை கொண்ட உறவு'),
        C('wealth', 'Wealth and status', 'செல்வமும் பதவியும்'),
        C('surprise', 'I want to discover it', 'கதை சொல்லட்டும்'),
      ],
    },
    memory: {
      prompt: L('What object is central to the wedding-interruption episode?', 'திருமணத்தை நிறுத்தும் மரபுக் கதையில் முக்கியமான பொருள் எது?'),
      choices: [
        C('palm', 'An old palm-leaf claim', 'பழைய ஓலை'),
        C('sword', 'A sword', 'வாள்'),
        C('crown', 'A crown', 'முடி'),
        C('lamp', 'A lamp', 'விளக்கு'),
      ],
      correctId: 'palm',
      correct: L('Yes. The old palm-leaf claim is the story’s turning point.', 'ஆம். பழைய ஓலைதான் கதையின் திருப்புமுனை.'),
      wrong: L('Think of what the old man produces at the wedding.', 'முதியவர் திருமண மேடையில் காட்டியது என்ன என்று நினைத்துப் பார்.'),
    },
    geography: {
      intro: L(
        'Pramana records Tirunavalur as Sundarar’s birthplace tradition and Tiruvanjaikkalam as his mukti-place tradition.',
        'சுந்தரரின் பிறந்த தலமாக திருநாவலூரையும், முக்தித் தலமாக திருவஞ்சைக்களத்தையும் பிரமாணம் மரபுக் குறிப்பாக பதிவு செய்கிறது.',
      ),
      leftLabel: L('Birthplace tradition', 'பிறந்த தலம் — மரபுக் குறிப்பு'),
      leftValue: L('Tirunavalur · திருநாவலூர்', 'திருநாவலூர்'),
      rightLabel: L('Mukti-place tradition', 'முக்தித் தலம் — மரபுக் குறிப்பு'),
      rightValue: L('Tiruvanjaikkalam · திருவஞ்சைக்களம்', 'திருவஞ்சைக்களம்'),
      question: L('Which place is the mukti-place tradition?', 'முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டிருப்பது எது?'),
      choices: [C('navalur', 'Tirunavalur', 'திருநாவலூர்'), C('vanjaikkalam', 'Tiruvanjaikkalam', 'திருவஞ்சைக்களம்')],
      correctId: 'vanjaikkalam',
      correct: L('Tiruvanjaikkalam is the mukti-place tradition.', 'திருவஞ்சைக்களம் முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டுள்ளது.'),
      wrong: L('Tirunavalur is the birthplace tradition.', 'திருநாவலூர் பிறந்த தலமாக வரும் மரபுக் குறிப்பு.'),
      scope: L(
        'These are traditional place roles; Tēvāram links remain a separate edition-metadata layer.',
        'இவை மரபில் வரும் தலச் செய்திகள்; தேவாரத் திருத்தலத் தொடர்புகள் தனியான பதிப்பு தரவு.',
      ),
    },
    detective: {
      intro: L('Sundarar’s story and hymn catalogue sit in different evidence classes.', 'சுந்தரரின் மரபுக் கதையும் தேவாரப் பதிப்பு தரவும் இரண்டு வெவ்வேறு ஆதார வகைகள்.'),
      claims: [
        {
          id: 'count',
          claim: L(
            'The pinned Tēvāram export carries 101 Sundarar pathigams linked across 83 sthalams.',
            'நிலைப்படுத்தப்பட்ட தேவாரப் பதிப்பு தரவில் சுந்தரருக்குச் சேர்ந்த 101 பதிகங்கள் 83 திருத்தலங்களுடன் இணைக்கப்பட்டுள்ளன.',
          ),
          safe: true,
          explanation: L('Supported as edition_metadata.', 'edition_metadata என்ற பதிப்பு தரவாக இது ஆதரிக்கப்படுகிறது.'),
        },
        {
          id: 'wedding',
          claim: L(
            'The wedding-interruption episode is presented as independently verified biography.',
            'திருமண மேடை சம்பவம் தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்ட வாழ்க்கை வரலாறாகக் காட்டப்படுகிறது.',
          ),
          safe: false,
          explanation: L('No. It remains traditional_reference.', 'இல்லை. அது traditional_reference என்ற மரபுக் குறிப்பாகவே உள்ளது.'),
        },
        {
          id: 'relationship',
          claim: L(
            'The traditional summary emphasises an unusually intimate, conversational relationship with Shiva.',
            'சிவனோடு மிக நெருக்கமான உரிமை கொண்ட உரையாடல் சுந்தரரின் மரபுக் கதையின் தனிச்சிறப்பாகக் காட்டப்படுகிறது.',
          ),
          safe: true,
          explanation: L('Supported by the curated traditional story summary.', 'தொகுக்கப்பட்ட மரபுக் கதைச் சுருக்கம் இதை ஆதரிக்கிறது.'),
        },
      ],
    },
    who: {
      clues: [
        L('My saintly journey begins, in tradition, at a wedding.', 'மரபுக் கதையில் என் பக்திப் பயணம் திருமண மேடையில் தொடங்குகிறது.'),
        L('An old palm-leaf claim changes the direction of my life.', 'ஒரு பழைய ஓலை என் வாழ்க்கையின் திசையை மாற்றுகிறது.'),
        L('My relationship with Shiva is remembered as unusually intimate and conversational.', 'சிவனோடு உரிமை கொண்ட நெருக்கமான உரையாடலால் நான் நினைவுகூரப்படுகிறேன்.'),
      ],
      choices: [
        C('sundarar', 'Sundarar', 'சுந்தரர்'),
        C('appar', 'Appar', 'அப்பர்'),
        C('sambandar', 'Sambandar', 'சம்பந்தர்'),
        C('poosalar', 'Poosalar', 'பூசலார்'),
      ],
      correctId: 'sundarar',
      correct: L('Sundarar · Arurar.', 'சுந்தரர் · ஆரூரர்.'),
      wrong: L('Use the wedding and palm-leaf clues.', 'திருமண மேடை, பழைய ஓலை—இந்த இரண்டு குறிப்புகளையும் நினைவில் கொள்.'),
    },
    reflection: [C('relationship', 'Relationship', 'உறவு'), COMMON_REFLECTION.sincerity, COMMON_REFLECTION.learning],
    recap: {
      story: L('A wedding interrupted by Shiva’s palm-leaf claim; devotion becomes intimate relationship.', 'சிவனின் பழைய ஓலை உரிமையால் நின்ற திருமணம்; உரிமை கொண்ட பக்தி உறவாக மாறுகிறது.'),
      places: L('Traditional places: Tirunavalur · Tiruvanjaikkalam', 'மரபுத் தலங்கள்: திருநாவலூர் · திருவஞ்சைக்களம்'),
      source: L('Periya Puranam + Tēvāram edition metadata', 'பெரியபுராணம் + தேவாரப் பதிப்பு தரவு'),
    },
  },
  {
    key: 'manikkavasakar',
    id: 'manikkavasakar-v1',
    version: '0.2.0',
    saintId: 'tirumurai8.manikkavacakar',
    ordinal: null,
    registryKind: 'naalvar_companion',
    group: 'naalvar',
    name: L('Manikkavasakar', 'மாணிக்கவாசகர்'),
    title: L('Manikkavasakar — read the text, not an invented journey', 'மாணிக்கவாசகர் — உரையை வாசி; ஊகப் பயணத்தை உருவாக்காதே'),
    subtitle: L(
      'A Tirumurai 8 quest about textual loci, Naalvar identity and one of Pramana’s most important evidence boundaries.',
      'திருமுறை 8 உரைக் குறிப்புகள், நால்வர் அடையாளம், ஆதார வரம்பு—மாணிக்கவாசகரை வேறுவிதமாக அறியும் தேடல்.',
    ),
    badge: L('TIRUMURAI 8 TEXTUAL LOCI', 'திருமுறை 8 உரைக் குறிப்புகள்'),
    source: {
      work: 'Tiruvācakam + Tirukkōvaiyār product metadata',
      authorityScope: 'primary_text_metadata + edition metadata + qualified product mapping',
      storySourceCommit: SOURCE_GRAPH_COMMIT,
      graphSourceCommit: SOURCE_STORY_COMMIT,
      scope: L(
        'Manikkavasakar is a Naalvar companion, not a 64th Nayanmar. Textual loci are not automatically historical visits or travel chronology.',
        'மாணிக்கவாசகர் நால்வரில் ஒருவர்; 64-ஆவது நாயன்மார் அல்ல. உரையில் வரும் தலக் குறிப்புகள் தானாகவே வரலாற்றுப் பயணச் சான்றாக மாறுவதில்லை.',
      ),
    },
    story: L(
      'Pramana carries Manikkavasakar through a separate Tirumurai 8 lane. The pinned Project Madurai headings explicitly place Tiruvempavai at Tiruvannamalai and Tiruppalliyezhuchi at Tirupperunturai; they are preserved as two distinct source-header composition loci. The snapshot also carries qualified loci such as Kōyil/Chidambaram and Tirukkazhukkunram, while refusing to turn section order into a biographical journey. Manikkavasakar remains one of the Naalvar and is not inserted into the numbered 63 Nayanmars.',
      'மாணிக்கவாசகரை பிரமாணம் திருமுறை 8-க்கான தனி அடுக்கில் வைத்திருக்கிறது. நிலைப்படுத்தப்பட்ட Project Madurai பதிப்பின் மூலத் தலைப்பில் திருவெம்பாவை “திருவண்ணாமலையில் அருளியது” என்றும், திருப்பள்ளியெழுச்சி “திருப்பெருந்துறையில் அருளியது” என்றும் தனித்தனியாகப் பதிவு செய்யப்பட்டுள்ளது. இவை இரண்டு வேறு source-header composition loci ஆகவே பாதுகாக்கப்படுகின்றன. “கோயில்”/சிதம்பரம், திருக்கழுக்குன்றம் போன்ற பிற தலத் தொடர்புகளும் தனித்த ஆதார வரம்புடன் காட்டப்படுகின்றன. ஆனால் பகுதி வரிசையை மாணிக்கவாசகரின் வரலாற்றுப் பயணமாக மாற்றுவதில்லை. அவர் நால்வரில் ஒருவர்; அறுபத்து மூவரின் எண்ணிக்கைக்குள் சேர்க்கப்படவில்லை.',
    ),
    prediction: {
      prompt: L(
        'This quest is less about one dramatic episode and more about learning to read a sacred text carefully. What do you expect to practise?',
        'இந்தத் தேடல் ஒரு அதிசயக் கதையை விட, புனித உரையை எப்படி கவனமாக வாசிப்பது என்பதைக் கற்றுக்கொடுக்கிறது. எதைப் பயிற்சி செய்வோம் என்று நினைக்கிறாய்?',
      ),
      choices: [
        C('route', 'Inventing a travel route from section order', 'பகுதி வரிசையிலிருந்து பயணப் பாதையை ஊகிப்பது'),
        C('evidence', 'Separating textual reference from historical claim', 'உரைக் குறிப்பையும் வரலாற்றுக் கூற்றையும் பிரித்துப் பார்ப்பது'),
        C('rank', 'Calling him the 64th Nayanmar', 'அவரை 64-ஆவது நாயன்மார் என்று அழைப்பது'),
        C('surprise', 'I want to discover it', 'பார்த்து அறிந்துகொள்கிறேன்'),
      ],
    },
    memory: {
      prompt: L('How does Nayanmar Trails classify Manikkavasakar in this product?', 'இந்தத் தளத்தில் மாணிக்கவாசகர் எப்படிக் காட்டப்படுகிறார்?'),
      choices: [
        C('64th', 'The 64th Nayanmar', '64-ஆவது நாயன்மார்'),
        C('naalvar', 'Naalvar / Tirumurai 8 companion, outside the numbered 63', 'நால்வர் / திருமுறை 8 துணை; அறுபத்து மூவரின் எண்ணிக்கைக்கு வெளியே'),
        C('tevaram3', 'One of the three Tēvāram authors', 'மூவர் தேவார ஆசிரியர்களில் ஒருவர்'),
        C('historian', 'A modern historian', 'நவீன வரலாற்றாசிரியர்'),
      ],
      correctId: 'naalvar',
      correct: L(
        'Correct. He is one of the Naalvar, carried separately from the numbered 63 Nayanmars.',
        'சரி. மாணிக்கவாசகர் நால்வரில் ஒருவர்; அறுபத்து மூவர் எண்ணிக்கையில் சேர்க்கப்படவில்லை.',
      ),
      wrong: L(
        'The product deliberately avoids turning the Naalvar companion into a 64th Nayanmar.',
        'நால்வர் துணையாக இருக்கும் மாணிக்கவாசகரை 64-ஆவது நாயன்மாராக மாற்றாததே இந்தத் தளத்தின் தெளிவான விதி.',
      ),
    },
    geography: {
      intro: L(
        'Two source headings in the pinned Tiruvācakam edition give two different composition loci: Tiruvempavai → Tiruvannamalai; Tiruppalliyezhuchi → Tirupperunturai.',
        'நிலைப்படுத்தப்பட்ட திருவாசகப் பதிப்பின் இரண்டு மூலத் தலைப்புகள் இரண்டு வேறு தலங்களைச் சொல்கின்றன: திருவெம்பாவை → திருவண்ணாமலை; திருப்பள்ளியெழுச்சி → திருப்பெருந்துறை.',
      ),
      leftLabel: L('Tiruvempavai · source-header locus', 'திருவெம்பாவை · மூலத் தலைப்புத் தலம்'),
      leftValue: L('Tiruvannamalai · திருவண்ணாமலை', 'திருவண்ணாமலை'),
      rightLabel: L('Tiruppalliyezhuchi · source-header locus', 'திருப்பள்ளியெழுச்சி · மூலத் தலைப்புத் தலம்'),
      rightValue: L('Tirupperunturai · திருப்பெருந்துறை', 'திருப்பெருந்துறை'),
      question: L(
        'Which place does the pinned source header attach to Tiruppalliyezhuchi?',
        'நிலைப்படுத்தப்பட்ட மூலத் தலைப்பில் திருப்பள்ளியெழுச்சியுடன் இணைக்கப்படும் தலம் எது?',
      ),
      choices: [C('tiruvannamalai', 'Tiruvannamalai', 'திருவண்ணாமலை'), C('tirupperunturai', 'Tirupperunturai', 'திருப்பெருந்துறை')],
      correctId: 'tirupperunturai',
      correct: L(
        'Tiruppalliyezhuchi is headed “at Tirupperunturai”; Tiruvempavai is separately headed “at Tiruvannamalai.”',
        'திருப்பள்ளியெழுச்சியின் மூலத் தலைப்பு “திருப்பெருந்துறையில் அருளியது” என்று கூறுகிறது; திருவெம்பாவை தனியாக “திருவண்ணாமலையில் அருளியது” என்று பதிவு செய்யப்பட்டுள்ளது.',
      ),
      wrong: L(
        'Tiruvannamalai belongs to the Tiruvempavai source heading. Tiruppalliyezhuchi is attached to Tirupperunturai.',
        'திருவண்ணாமலை என்பது திருவெம்பாவையின் மூலத் தலைப்புத் தலம். திருப்பள்ளியெழுச்சி திருப்பெருந்துறையுடன் இணைக்கப்படுகிறது.',
      ),
      scope: L(
        'These are source-header composition loci in the pinned edition. They are not independently verified historical travel events.',
        'இவை நிலைப்படுத்தப்பட்ட பதிப்பின் மூலத் தலைப்பில் வரும் composition loci. தனித்த வரலாற்றுப் பயணச் சான்றாக இவை காட்டப்படவில்லை.',
      ),
    },
    detective: {
      intro: L(
        'Manikkavasakar’s lane exists specifically to teach careful textual provenance.',
        'மாணிக்கவாசகர் அடுக்கு உரைச் சான்றை மிகத் துல்லியமாகப் படிக்கச் செய்வதற்காகவே தனியாக அமைக்கப்பட்டுள்ளது.',
      ),
      claims: [
        {
          id: 'registry',
          claim: L(
            'Manikkavasakar is one of the Naalvar but is not inserted into the numbered 63 Nayanmars.',
            'மாணிக்கவாசகர் நால்வரில் ஒருவர்; அறுபத்து மூவர் எண்ணிக்கைக்குள் சேர்க்கப்படவில்லை.',
          ),
          safe: true,
          explanation: L('This is an explicit product/evidence rule.', 'இது தளத்தின் தெளிவான ஆதார விதி.'),
        },
        {
          id: 'two-loci',
          claim: L(
            'The pinned source headings place Tiruvempavai at Tiruvannamalai and Tiruppalliyezhuchi at Tirupperunturai.',
            'நிலைப்படுத்தப்பட்ட மூலத் தலைப்புகள் திருவெம்பாவையை திருவண்ணாமலையிலும், திருப்பள்ளியெழுச்சியை திருப்பெருந்துறையிலும் தனித்தனியாகக் குறிப்பிடுகின்றன.',
          ),
          safe: true,
          explanation: L(
            'Supported as primary_text_metadata from the two source headings.',
            'இரண்டு மூலத் தலைப்புகளிலிருந்தும் primary_text_metadata ஆக இது ஆதரிக்கப்படுகிறது.',
          ),
        },
        {
          id: 'route',
          claim: L(
            'The order of Tiruvācakam sections proves Manikkavasakar’s historical travel itinerary.',
            'திருவாசகப் பகுதிகளின் வரிசை மாணிக்கவாசகரின் வரலாற்றுப் பயண வரிசையை நிரூபிக்கிறது.',
          ),
          safe: false,
          explanation: L(
            'No. The playback policy explicitly says section-order presentation is not biography or historical chronology.',
            'இல்லை. பகுதி வரிசைக் காட்சி வாழ்க்கை வரலாறோ வரலாற்றுக் காலவரிசையோ அல்ல என்று playback policy தெளிவாகச் சொல்கிறது.',
          ),
        },
        {
          id: 'uttara',
          claim: L(
            'Tiruvācakam textually references Uttarakosamangai, but that does not promote it into the formal 276-site Tēvāram catalogue.',
            'திருவாசகத்தில் திருஉத்தரகோசமங்கை உரையாக வருகிறது; அதனால் அது தேவாரத்தின் அதிகாரப்பூர்வ 276 திருத்தலப் பட்டியலில் சேர்க்கப்படுவதில்லை.',
          ),
          safe: true,
          explanation: L(
            'Supported. The literary-place layer keeps it separate from formal Tēvāram membership.',
            'ஆதரிக்கப்படுகிறது. இலக்கியத் தல அடுக்கு இதை தேவாரப் பட்டியல் உறுப்பினர் என மாற்றாமல் தனியாக வைத்திருக்கிறது.',
          ),
        },
      ],
    },
    who: {
      clues: [
        L('I belong to the Naalvar, but I am not numbered among the 63 Nayanmars.', 'நான் நால்வரில் ஒருவர்; ஆனால் அறுபத்து மூவர் எண்ணிக்கைக்குள் இல்லை.'),
        L('My product lane centres on Tirumurai 8.', 'என் தள அடுக்கு திருமுறை 8-ஐ மையமாகக் கொண்டது.'),
        L('Tiruvācakam and Tirukkōvaiyār are carried in my separate snapshot.', 'திருவாசகமும் திருக்கோவையாரும் எனக்கான தனி தரவுத் தொகுப்பில் உள்ளன.'),
      ],
      choices: [
        C('manikkavasakar', 'Manikkavasakar', 'மாணிக்கவாசகர்'),
        C('appar', 'Appar', 'அப்பர்'),
        C('sambandar', 'Sambandar', 'சம்பந்தர்'),
        C('sundarar', 'Sundarar', 'சுந்தரர்'),
      ],
      correctId: 'manikkavasakar',
      correct: L('Manikkavasakar — Naalvar, Tirumurai 8 companion.', 'மாணிக்கவாசகர் — நால்வர், திருமுறை 8 துணை.'),
      wrong: L('Remember: Tirumurai 8, but not a 64th Nayanmar.', 'நினைவில் கொள்: திருமுறை 8; ஆனால் 64-ஆவது நாயன்மார் அல்ல.'),
    },
    reflection: [COMMON_REFLECTION.learning, C('care', 'Careful reading', 'கவனமான வாசிப்பு'), COMMON_REFLECTION.inward],
    recap: {
      story: L('Naalvar identity; Tirumurai 8 textual loci without an invented biography route.', 'நால்வர் அடையாளம்; ஊகப் பயணமில்லாத திருமுறை 8 உரைக் தலக் குறிப்புகள்.'),
      places: L('Source-header loci: Tiruvempavai → Tiruvannamalai · Tiruppalliyezhuchi → Tirupperunturai. Other qualified loci include Chidambaram/Kōyil and Tirukkazhukkunram; Uttarakosamangai remains literary, not a formal Tēvāram site.', 'மூலத் தலைப்புத் தலங்கள்: திருவெம்பாவை → திருவண்ணாமலை · திருப்பள்ளியெழுச்சி → திருப்பெருந்துறை. பிற தகுதிப்படுத்தப்பட்ட தலங்களில் சிதம்பரம்/கோயில், திருக்கழுக்குன்றம் உள்ளன; திருஉத்தரகோசமங்கை இலக்கியத் தொடர்பாகவே உள்ளது, தேவாரத் திருத்தலப் பட்டியலில் அல்ல.'),
      source: L('Tirumurai 8 product metadata + Saiva literary-place layer', 'திருமுறை 8 பதிப்பு தரவு + சைவ இலக்கியத் தல அடுக்கு'),
    },
  },
  {
    key: 'karaikkal',
    id: 'karaikkal-ammaiyar-v1',
    version: '0.2.0',
    saintId: 'nayanmar.23',
    ordinal: 23,
    registryKind: 'nayanmar',
    group: 'featured',
    name: L('Karaikkal Ammaiyar', 'காரைக்கால் அம்மையார்'),
    title: L('Karaikkal Ammaiyar — when renunciation changes the image of a saint', 'காரைக்கால் அம்மையார் — துறவு ஒரு புனித உருவத்தை மாற்றும் போது'),
    subtitle: L(
      'A visually unforgettable quest about renunciation, Kailasa and the difference between traditional narrative and historical claim.',
      'துறவு, கயிலை, தனித்துவமான உருவம்—மரபுக் கதையையும் ஆதார வரம்பையும் நினைவில் கொள்ளும் தேடல்.',
    ),
    badge: TRADITION_BADGE,
    source: {
      work: 'Periya Puranam',
      authorityScope: 'traditional_reference',
      storySourceCommit: SOURCE_STORY_COMMIT,
      graphSourceCommit: SOURCE_GRAPH_COMMIT,
      scope: TRADITION_SCOPE,
    },
    story: L(
      'The traditional story remembers Karaikkal Ammaiyar as asking Shiva not for beauty but for a form suited to total renunciation. The same tradition famously pictures her travelling to Kailasa on her head rather than placing her feet on the sacred mountain. Pramana records Karaikkal as birthplace tradition, Tiruvālangādu as mukti-place tradition, and additional traditional related-place references including Kailasa.',
      'அழகான உடல் வேண்டாம்; முழுத் துறவுக்கேற்ற பேயுருவே வேண்டும் என்று சிவனை வேண்டியவர் காரைக்கால் அம்மையார் என்று மரபு கூறுகிறது. கைலாச மண்ணை காலால் மிதிக்காமல் தலையால் நடந்துச் சென்றார் என்ற புகழ்பெற்ற காட்சியும் அவரது கதையின் தீவிரத்தை நினைவூட்டுகிறது. பிரமாணம் காரைக்காலை பிறந்த தலமாகவும், திருவாலங்காட்டை முக்தித் தலமாகவும், கயிலை உள்ளிட்ட சில இடங்களை தொடர்புடைய மரபுத் தலங்களாகவும் பதிவு செய்கிறது.',
    ),
    prediction: {
      prompt: L(
        'What makes Karaikkal Ammaiyar visually and spiritually unusual in the traditional story?',
        'காரைக்கால் அம்மையாரின் மரபுக் கதையை மற்ற பல புனிதர் கதைகளிலிருந்து வித்தியாசப்படுத்துவது எது என்று நினைக்கிறாய்?',
      ),
      choices: [
        C('beauty', 'Seeking conventional beauty', 'வழக்கமான அழகை நாடுவது'),
        C('renunciation', 'Radical renunciation', 'முழுமையான துறவு'),
        C('power', 'Political power', 'அரசியல் அதிகாரம்'),
        C('surprise', 'I want to discover it', 'கதை சொல்லட்டும்'),
      ],
    },
    memory: {
      prompt: L('How does the tradition famously picture her approaching Kailasa?', 'கயிலையை அணுகும்போது அம்மையாரை மரபுக் கதை எப்படி புகழ்பெற்ற வகையில் வர்ணிக்கிறது?'),
      choices: [
        C('head', 'Travelling on her head', 'தலையால் நடந்து செல்வது'),
        C('chariot', 'In a royal chariot', 'அரச ரதத்தில் செல்வது'),
        C('horse', 'On horseback', 'குதிரையில் செல்வது'),
        C('boat', 'By boat', 'படகில் செல்வது'),
      ],
      correctId: 'head',
      correct: L('Yes. The tradition says she would not place her feet on the sacred mountain.', 'ஆம். புனித மலை மீது கால்வைக்காமல் தலையால் சென்றார் என்று மரபு கூறுகிறது.'),
      wrong: L('Think of the unusual gesture of reverence associated with Kailasa.', 'கயிலைக்கு மரியாதை செலுத்தும் அந்த அபூர்வமான முறையை நினைத்துப் பார்.'),
    },
    geography: {
      intro: L(
        'Pramana records Karaikkal as birthplace tradition and Tiruvālangādu as mukti-place tradition.',
        'காரைக்காலை பிறந்த தலமாகவும், திருவாலங்காட்டை முக்தித் தலமாகவும் பிரமாணம் மரபுக் குறிப்பாக பதிவு செய்கிறது.',
      ),
      leftLabel: L('Birthplace tradition', 'பிறந்த தலம் — மரபுக் குறிப்பு'),
      leftValue: L('Karaikkal · காரைக்கால்', 'காரைக்கால்'),
      rightLabel: L('Mukti-place tradition', 'முக்தித் தலம் — மரபுக் குறிப்பு'),
      rightValue: L('Tiruvālangādu · திருவாலங்காடு', 'திருவாலங்காடு'),
      question: L('Which place is the mukti-place tradition?', 'முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டிருப்பது எது?'),
      choices: [C('karaikkal', 'Karaikkal', 'காரைக்கால்'), C('alangadu', 'Tiruvālangādu', 'திருவாலங்காடு')],
      correctId: 'alangadu',
      correct: L('Tiruvālangādu is the mukti-place tradition.', 'திருவாலங்காடு முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டுள்ளது.'),
      wrong: L('Karaikkal is the birthplace tradition.', 'காரைக்கால் பிறந்த தலமாக வரும் மரபுக் குறிப்பு.'),
      scope: L(
        'Kailasa and other related places also occur as traditional associations; none is automatically a precise modern historical-location claim.',
        'கயிலை உள்ளிட்ட தொடர்புடைய இடங்களும் மரபுத் தலங்களாக வருகின்றன; அவற்றை துல்லியமான வரலாற்று இடக் கூற்றாக மாற்ற முடியாது.',
      ),
    },
    detective: {
      intro: L('Her memorable iconography makes evidence labels especially important.', 'அம்மையாரின் மறக்கமுடியாத உருவம் காரணமாக மரபுக் கதையும் வரலாற்றுச் சான்றும் கலந்துவிடாதபடி வாசிப்பது முக்கியம்.'),
      claims: [
        {
          id: 'renunciation',
          claim: L(
            'The Periya Puranam traditional summary remembers Karaikkal Ammaiyar as asking for a form suited to total renunciation.',
            'பெரியபுராண மரபில் காரைக்கால் அம்மையார் முழுத் துறவுக்கேற்ற உருவத்தை வேண்டியதாகக் கூறப்படுகிறது.',
          ),
          safe: true,
          explanation: L('Supported as traditional_reference.', 'traditional_reference என்ற மரபுக் குறிப்பாக இது ஆதரிக்கப்படுகிறது.'),
        },
        {
          id: 'kailasa-history',
          claim: L(
            'The Kailasa episode is independently verified travel history.',
            'கயிலைச் சம்பவம் தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்ட பயண வரலாறு.',
          ),
          safe: false,
          explanation: L('Not established. It is a traditional narrative/association.', 'அப்படி கூற முடியாது. இது மரபுக் கதை/தலத் தொடர்பு.'),
        },
        {
          id: 'places',
          claim: L(
            'Pramana records Karaikkal, Tiruvālangādu and additional related places as traditional associations.',
            'காரைக்கால், திருவாலங்காடு மற்றும் மேலும் சில இடங்கள் அம்மையாருடன் தொடர்புடைய மரபுத் தலங்களாக பிரமாணத்தில் பதிவு செய்யப்பட்டுள்ளன.',
          ),
          safe: true,
          explanation: L('Supported as traditional-place references.', 'மரபுத் தலக் குறிப்புகளாக இது ஆதரிக்கப்படுகிறது.'),
        },
      ],
    },
    who: {
      clues: [
        L('I asked not for conventional beauty but for a form suited to renunciation.', 'வழக்கமான அழகை அல்ல, முழுத் துறவுக்கேற்ற உருவத்தையே வேண்டினேன் என்று மரபு சொல்கிறது.'),
        L('Kailasa is central to one of my most memorable traditional images.', 'கயிலை என் கதையின் மறக்கமுடியாத காட்சிகளில் ஒன்று.'),
        L('Tradition pictures me moving on my head rather than placing my feet on the sacred mountain.', 'புனித மலையில் கால்வைக்காமல் தலையால் சென்றதாக மரபு வர்ணிக்கிறது.'),
      ],
      choices: [
        C('karaikkal', 'Karaikkal Ammaiyar', 'காரைக்கால் அம்மையார்'),
        C('kannappar', 'Kannappar', 'கண்ணப்பர்'),
        C('poosalar', 'Poosalar', 'பூசலார்'),
        C('mangai', 'Mangayarkkarasiyar', 'மங்கையர்க்கரசியார்'),
      ],
      correctId: 'karaikkal',
      correct: L('Karaikkal Ammaiyar.', 'காரைக்கால் அம்மையார்.'),
      wrong: L('Use the renunciation and Kailasa clues.', 'துறவும் கயிலையும் என்ற இரண்டு குறிப்புகளை நினைவில் கொள்.'),
    },
    reflection: [C('renunciation', 'Renunciation', 'துறவு'), COMMON_REFLECTION.courage, COMMON_REFLECTION.learning],
    recap: {
      story: L('Renunciation, an unusual sacred form and the Kailasa tradition.', 'துறவு, தனித்துவமான புனித உருவம், கயிலை மரபுக் காட்சி.'),
      places: L('Traditional places: Karaikkal · Tiruvālangādu · related Kailasa tradition', 'மரபுத் தலங்கள்: காரைக்கால் · திருவாலங்காடு · தொடர்புடைய கயிலை மரபு'),
      source: L('Periya Puranam · traditional_reference', 'பெரியபுராணம் · மரபுக் குறிப்பு'),
    },
  },
  {
    key: 'poosalar',
    id: 'poosalar-v1',
    version: '0.2.0',
    saintId: 'nayanmar.56',
    ordinal: 56,
    registryKind: 'nayanmar',
    group: 'featured',
    name: L('Poosalar', 'பூசலார்'),
    title: L('Poosalar — the temple built where no stone was needed', 'பூசலார் — கல் இல்லாமல் மனதில் எழுந்த கோயில்'),
    subtitle: L(
      'A quest about inward devotion, imagination and one of the most memorable temple stories in the Nayanmar tradition.',
      'உள்ளார்ந்த பக்தி, மனக்கோயில், குடமுழுக்கு—பூசலாரின் கதையை மறக்காமல் வைத்துக்கொள்ளும் தேடல்.',
    ),
    badge: TRADITION_BADGE,
    source: {
      work: 'Periya Puranam',
      authorityScope: 'traditional_reference',
      storySourceCommit: SOURCE_STORY_COMMIT,
      graphSourceCommit: SOURCE_GRAPH_COMMIT,
      scope: TRADITION_SCOPE,
    },
    story: L(
      'The traditional story says Poosalar had no wealth to raise a stone temple, so he designed and consecrated one completely in his mind. He chose a day for the consecration there, and the story says Shiva gave that inward temple priority over a king’s grand ceremony. Pramana records Tiruninravur as both his birthplace and mukti-place tradition.',
      'கோயில் கட்டப் பணமில்லை; ஆனால் பூசலார் மனத்தில் ஒரு ஆலயத்தை எழுப்பினார் என்று பெரியபுராண மரபு கூறுகிறது. நாள் பார்த்து குடமுழுக்கையும் மனத்திலேயே நடத்தத் திட்டமிட்டார்; மன்னனின் பிரமாண்ட விழாவை விட இந்த மனக்கோயிலுக்கே சிவன் முன்னுரிமை தந்தார் என்று கதை சொல்கிறது. பிரமாணம் திருநின்றவூரை பூசலாரின் பிறந்த தலமாகவும் முக்தித் தலமாகவும் மரபுக் குறிப்பாக பதிவு செய்கிறது.',
    ),
    prediction: {
      prompt: L(
        'If someone has no money to build a temple, what could devotion still build?',
        'கோயில் கட்டப் பணம் இல்லையென்றால் பக்தி இன்னும் எதை கட்ட முடியும்?',
      ),
      choices: [
        C('nothing', 'Nothing at all', 'எதுவும் முடியாது'),
        C('inner', 'An inward temple held in the mind', 'மனத்தில் எழும் ஒரு ஆலயம்'),
        C('palace', 'A royal palace', 'அரண்மனை'),
        C('surprise', 'I want the story to answer', 'கதை சொல்லட்டும்'),
      ],
    },
    memory: {
      prompt: L('Where does Poosalar build the temple in the traditional story?', 'பெரியபுராண மரபில் பூசலார் கோயிலை எங்கே கட்டுகிறார்?'),
      choices: [
        C('mind', 'In his mind', 'தன் மனத்தில்'),
        C('forest', 'In a forest', 'காட்டில்'),
        C('palace', 'Inside a palace', 'அரண்மனையில்'),
        C('island', 'On an island', 'தீவில்'),
      ],
      correctId: 'mind',
      correct: L('Yes. The whole temple is imagined, designed and consecrated inwardly.', 'ஆம். ஆலயமும் அதன் குடமுழுக்கும் முழுவதும் மனத்திலேயே உருவாகிறது என்று மரபு கூறுகிறது.'),
      wrong: L('The defining idea is the “temple of the mind.”', 'இந்தக் கதையின் மையம் “மனக்கோயில்”.'),
    },
    geography: {
      intro: L(
        'Pramana records the same traditional place — Tiruninravur — for both birthplace and mukti-place.',
        'பூசலாரின் பிறந்த தலமும் முக்தித் தலமும் ஒரே இடமாக—திருநின்றவூர்—மரபில் பதிவு செய்யப்பட்டுள்ளது.',
      ),
      leftLabel: L('Birthplace tradition', 'பிறந்த தலம் — மரபுக் குறிப்பு'),
      leftValue: L('Tiruninravur · திருநின்றவூர்', 'திருநின்றவூர்'),
      rightLabel: L('Mukti-place tradition', 'முக்தித் தலம் — மரபுக் குறிப்பு'),
      rightValue: L('Tiruninravur · திருநின்றவூர்', 'திருநின்றவூர்'),
      question: L('Which place appears in both traditional roles?', 'இரண்டு மரபுத் தலச் செய்திகளிலும் வரும் இடம் எது?'),
      choices: [C('tiruninravur', 'Tiruninravur', 'திருநின்றவூர்'), C('karaikkal', 'Karaikkal', 'காரைக்கால்')],
      correctId: 'tiruninravur',
      correct: L('Tiruninravur appears in both roles.', 'திருநின்றவூரே பிறந்த தலமாகவும் முக்தித் தலமாகவும் வருகிறது.'),
      wrong: L('Both traditional edges point to Tiruninravur.', 'இரண்டு மரபுக் குறிப்புகளும் திருநின்றவூரையே சுட்டுகின்றன.'),
      scope: L(
        'The duplicated place role is a traditional-reference fact in the graph, not independent historical verification.',
        'ஒரே தலம் இரண்டு பங்கிலும் வருவது graph-இல் உள்ள மரபுக் குறிப்பு; தனித்த வரலாற்றுச் சான்று அல்ல.',
      ),
    },
    detective: {
      intro: L('Poosalar’s story is ideal for learning that a memorable narrative can still have a precise evidence label.', 'மிகவும் நினைவில் நிற்கும் கதையாயினும் அதன் ஆதார வகையைத் தெளிவாகக் காட்டலாம் என்பதற்கு பூசலாரின் கதை நல்ல உதாரணம்.'),
      claims: [
        {
          id: 'mental',
          claim: L(
            'The Periya Puranam traditional summary says Poosalar builds and consecrates a temple in his mind.',
            'பூசலார் மனத்தில் கோயிலை எழுப்பி குடமுழுக்கு நடத்துகிறார் என்று பெரியபுராண மரபுக் கதைச் சுருக்கம் கூறுகிறது.',
          ),
          safe: true,
          explanation: L('Supported as traditional_reference.', 'traditional_reference என்ற மரபுக் குறிப்பாக இது ஆதரிக்கப்படுகிறது.'),
        },
        {
          id: 'archaeology',
          claim: L(
            'Because the story is important, Pramana treats the mental temple as an archaeologically verified stone structure.',
            'கதை முக்கியமானது என்பதால் அந்த மனக்கோயிலை தொல்லியல் சான்றுள்ள கற்கோயிலாக பிரமாணம் கருதுகிறது.',
          ),
          safe: false,
          explanation: L('No. That would change the type of claim entirely.', 'இல்லை. அது ஆதாரத்தின் தன்மையையே மாற்றிவிடும்.'),
        },
        {
          id: 'place',
          claim: L(
            'Tiruninravur is recorded as both birthplace and mukti-place tradition for Poosalar.',
            'திருநின்றவூர் பூசலாரின் பிறந்த தலமாகவும் முக்தித் தலமாகவும் மரபில் பதிவு செய்யப்பட்டுள்ளது.',
          ),
          safe: true,
          explanation: L('Supported by two traditional-reference edges.', 'இரண்டு traditional_reference தலத் தொடர்புகளால் இது ஆதரிக்கப்படுகிறது.'),
        },
      ],
    },
    who: {
      clues: [
        L('I could not afford to build the temple I wanted.', 'நான் நினைத்த கோயிலை கல்லால் கட்டத் தேவையான செல்வம் எனக்கு இல்லை.'),
        L('So I designed the whole temple inwardly.', 'அதனால் முழு ஆலயத்தையும் மனத்திலேயே எழுப்பினேன் என்று மரபு சொல்கிறது.'),
        L('The story says Shiva gave that inward consecration priority over a king’s grand ceremony.', 'மன்னனின் பிரமாண்ட விழாவை விட என் மனக்கோயிலின் குடமுழுக்குக்கே சிவன் முன்னுரிமை தந்தார் என்று கதை சொல்கிறது.'),
      ],
      choices: [
        C('poosalar', 'Poosalar', 'பூசலார்'),
        C('kannappar', 'Kannappar', 'கண்ணப்பர்'),
        C('appar', 'Appar', 'அப்பர்'),
        C('karaikkal', 'Karaikkal Ammaiyar', 'காரைக்கால் அம்மையார்'),
      ],
      correctId: 'poosalar',
      correct: L('Poosalar.', 'பூசலார்.'),
      wrong: L('Remember the temple built entirely in the mind.', 'மனத்திலேயே கட்டப்பட்ட கோயிலை நினைவில் கொள்.'),
    },
    reflection: [COMMON_REFLECTION.inward, COMMON_REFLECTION.sincerity, C('imagination', 'Sacred imagination', 'புனிதமான கற்பனை'), COMMON_REFLECTION.learning],
    recap: {
      story: L('The mental temple and an inward consecration.', 'மனக்கோயிலும் மனத்திலேயே நடைபெறும் குடமுழுக்கும்.'),
      places: L('Traditional place: Tiruninravur in both birthplace and mukti roles', 'மரபுத் தலம்: பிறந்த தலமும் முக்தித் தலமும் திருநின்றவூர்'),
      source: L('Periya Puranam · traditional_reference', 'பெரியபுராணம் · மரபுக் குறிப்பு'),
    },
  },
];

export const QUEST_BY_KEY = Object.fromEntries(QUESTS.map((quest) => [quest.key, quest])) as Record<string, QuestDefinition>;
export const DEFAULT_QUEST_KEY = 'kannappar';

export const QUEST_UI: Record<QuestLocale, Record<string, string>> = {
  en: {
    hubEyebrow: 'NAYANMAR TRAILS · QUESTS',
    hubTitle: 'Seven stories. Seven ways to remember.',
    hubBody: 'Choose a quest. Each one combines story, memory, place and Pramana source-reading. No bhakti score. No leaderboard.',
    naalvar: 'Naalvar',
    featured: 'Featured Nayanmars',
    completed: 'Completed',
    notStarted: 'Not started',
    continueQuest: 'Continue',
    beginQuest: 'Begin',
    backToQuests: 'All quests',
    exit: 'Exit quest',
    progress: 'Quest progress',
    duration: 'About 8–15 minutes',
    prediction: 'PREDICTION',
    predictionTitle: 'Before the story',
    predictionNote: 'This is a prediction, not a test of belief. Your choice is not graded.',
    story: 'STORY',
    storyTitle: 'Read the source-scoped story',
    memory: 'MEMORY',
    memoryTitle: 'What stayed with you?',
    geography: 'SACRED GEOGRAPHY',
    geographyTitle: 'Place it carefully',
    detective: 'SOURCE LITERACY',
    detectiveTitle: 'Pramana Detective',
    detectivePrompt: 'For each statement, decide whether Pramana supports it as stated.',
    supported: 'Supported',
    notEstablished: 'Not established',
    who: 'WHO AM I?',
    whoTitle: 'Who am I?',
    whoBody: 'Try to identify the saint before revealing every clue.',
    moreClue: 'Reveal another clue',
    reflection: 'CARRY IT WITH YOU',
    reflectionTitle: 'What do you want to remember?',
    reflectionBody: 'There is no scored answer here. Choose the idea you want to carry into the next encounter with this saint.',
    localOnly: 'Your reflection is stored only in this browser.',
    reveal: 'Reveal',
    continue: 'Continue',
    correct: 'That’s it.',
    notQuite: 'Look again.',
    shrine: 'MEMORY SHRINE UNLOCKED',
    shrineBody: 'No points were awarded. The reward is recognition: saint, story, place and source.',
    replay: 'Replay quest',
    backExplorer: 'Return to Explorer',
    nayanmarProgress: 'Nayanmars discovered',
    companionProgress: 'Naalvar companion',
    source: 'PRAMANA GROUNDING',
    openHub: 'Explore 7 quests',
    inviteTitle: 'Build a memory of the Nayanmars — one quest at a time',
    inviteBody: 'Naalvar + Kannappar + Karaikkal Ammaiyar + Poosalar are ready in English and Tamil.',
    ready: '7 quests ready',
  },
  ta: {
    hubEyebrow: 'நாயன்மார் ட்ரெயில்ஸ் · தேடல்கள்',
    hubTitle: 'ஏழு கதைகள். நினைவில் நிற்க ஏழு வேறு பாதைகள்.',
    hubBody: 'ஒரு தேடலைத் தேர்வு செய். கதை, நினைவு, தலச் செய்தி, பிரமாண ஆதார வாசிப்பு—நான்கும் ஒன்றாக வரும். பக்திக்கு மதிப்பெண் இல்லை; தரவரிசையும் இல்லை.',
    naalvar: 'நால்வர்',
    featured: 'தேர்ந்த நாயன்மார்கள்',
    completed: 'முடிந்தது',
    notStarted: 'தொடங்கவில்லை',
    continueQuest: 'தொடர்ந்து விளையாடு',
    beginQuest: 'தொடங்கு',
    backToQuests: 'அனைத்து தேடல்கள்',
    exit: 'வெளியேறு',
    progress: 'தேடல் முன்னேற்றம்',
    duration: 'சுமார் 8–15 நிமிடங்கள்',
    prediction: 'முன்னுணர்வு',
    predictionTitle: 'கதைக்கு முன் ஒரு எண்ணம்',
    predictionNote: 'இது நம்பிக்கையைச் சோதிக்கும் கேள்வி அல்ல. உன் தேர்வுக்கு மதிப்பெண் இல்லை.',
    story: 'கதை',
    storyTitle: 'ஆதார வரம்புடன் கதையை வாசி',
    memory: 'நினைவு',
    memoryTitle: 'எது மனதில் நின்றது?',
    geography: 'திருத்தல நினைவு',
    geographyTitle: 'தலத்தை சரியான ஆதாரத்துடன் இணை',
    detective: 'ஆதார வாசிப்பு',
    detectiveTitle: 'பிரமாண விசாரணை',
    detectivePrompt: 'ஒவ்வொரு கூற்றுக்கும்—பிரமாணம் இதை இந்த வடிவில் ஆதரிக்கிறதா என்று தேர்வு செய்.',
    supported: 'ஆதரிக்கப்படுகிறது',
    notEstablished: 'உறுதி செய்யப்படவில்லை',
    who: 'நான் யார்?',
    whoTitle: 'நான் யார்?',
    whoBody: 'அனைத்து குறிப்புகளையும் திறக்காமல் நாயன்மாரை கண்டுபிடிக்க முடியுமா?',
    moreClue: 'இன்னொரு குறிப்பைத் திற',
    reflection: 'நினைவில் எடுத்து செல்',
    reflectionTitle: 'உனக்கு எது மனதில் நிற்க வேண்டும்?',
    reflectionBody: 'இதற்கு சரி–தவறு இல்லை. அடுத்த முறை இந்த நாயன்மாரை பார்க்கும்போது நினைவுக்கு வரவேண்டிய எண்ணத்தைத் தேர்வு செய்.',
    localOnly: 'உன் தேர்வு இந்த உலாவியிலேயே மட்டும் சேமிக்கப்படும்.',
    reveal: 'விடையைப் பார்',
    continue: 'தொடரலாம்',
    correct: 'சரி.',
    notQuite: 'இன்னொரு முறை யோசி.',
    shrine: 'நினைவுச் சன்னதி திறந்தது',
    shrineBody: 'மதிப்பெண் கிடையாது. கிடைத்தது நினைவு—நாயன்மார், கதை, தலம், ஆதாரம்.',
    replay: 'மீண்டும் விளையாடு',
    backExplorer: 'முதன்மை தளத்திற்குத் திரும்பு',
    nayanmarProgress: 'அறிந்த நாயன்மார்கள்',
    companionProgress: 'நால்வர் துணை',
    source: 'பிரமாண ஆதாரம்',
    openHub: '7 தேடல்களைத் திற',
    inviteTitle: 'ஒவ்வொரு தேடலாக நாயன்மார்களை நினைவில் பதியச் செய்',
    inviteBody: 'நால்வர் + கண்ணப்பர் + காரைக்கால் அம்மையார் + பூசலார் — ஆங்கிலமும் தமிழும் தயாராக உள்ளன.',
    ready: '7 தேடல்கள் தயாராக உள்ளன',
  },
};

export function ql(locale: QuestLocale, value: Localized) {
  return value[locale];
}
