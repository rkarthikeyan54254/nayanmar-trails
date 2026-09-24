export type QuestLocale = 'en' | 'ta';

export type QuestChoice = {
  id: string;
  label: string;
};

export type QuestCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  duration: string;
  start: string;
  resume: string;
  exit: string;
  next: string;
  back: string;
  reveal: string;
  continue: string;
  tryAgain: string;
  correct: string;
  notQuite: string;
  sourceLabel: string;
  sourceScope: string;
  progressLabel: string;
  predictionTitle: string;
  predictionBody: string;
  predictionChoices: QuestChoice[];
  predictionNote: string;
  storyTitle: string;
  storyBody: string;
  storyScope: string;
  memoryTitle: string;
  memoryBody: string;
  memoryQuestion: string;
  memoryChoices: QuestChoice[];
  memoryCorrect: string;
  memoryWrong: string;
  geographyTitle: string;
  geographyBody: string;
  birthplaceLabel: string;
  muktiLabel: string;
  geographyQuestion: string;
  geographyChoices: QuestChoice[];
  geographyCorrect: string;
  geographyWrong: string;
  geographyScope: string;
  detectiveTitle: string;
  detectiveBody: string;
  detectivePrompt: string;
  detectiveClaims: Array<{
    id: string;
    claim: string;
    safe: boolean;
    explanation: string;
  }>;
  detectiveSafe: string;
  detectiveNotEstablished: string;
  whoTitle: string;
  whoBody: string;
  whoClues: string[];
  whoChoices: QuestChoice[];
  whoCorrect: string;
  whoWrong: string;
  reflectionTitle: string;
  reflectionBody: string;
  reflectionChoices: QuestChoice[];
  reflectionNote: string;
  completeEyebrow: string;
  completeTitle: string;
  completeBody: string;
  discovered: string;
  replay: string;
  returnToExplore: string;
  memoryShrine: string;
  memorySaint: string;
  memoryStory: string;
  memoryPlaces: string;
  memorySource: string;
  deepamLabel: string;
};

export type QuestDefinition = {
  id: string;
  version: string;
  saintId: string;
  ordinal: number;
  titleEn: string;
  titleTa: string;
  source: {
    work: string;
    authorityScope: 'traditional_reference';
    storySourceCommit: string;
    graphSourceCommit: string;
    presentationPolicy: string;
  };
  places: Array<{
    id: string;
    role: 'birthplace_tradition' | 'mukti_place_tradition';
    labelEn: string;
    labelTa: string;
    authorityScope: 'traditional_reference';
    historicalVerified: false;
  }>;
  copy: Record<QuestLocale, QuestCopy>;
};

export const KANNAPPAR_QUEST: QuestDefinition = {
  id: 'kannappar-v1',
  version: '0.1.0',
  saintId: 'nayanmar.09',
  ordinal: 9,
  titleEn: 'Kannappar',
  titleTa: 'கண்ணப்பர்',
  source: {
    work: 'Periya Puranam',
    authorityScope: 'traditional_reference',
    storySourceCommit: '0f01a1db8f94db489125df8c57cebb294b7529d6',
    graphSourceCommit: '1f2cec34c5b4412fe3178884a38a51dbca6eb452',
    presentationPolicy: 'Traditional narrative; not independently verified biography.',
  },
  places: [
    {
      id: 'traditional_place.shaivam.95291070bb06',
      role: 'birthplace_tradition',
      labelEn: 'Uduppur',
      labelTa: 'உடுப்பூர்',
      authorityScope: 'traditional_reference',
      historicalVerified: false,
    },
    {
      id: 'traditional_place.shaivam.1da256717d81',
      role: 'mukti_place_tradition',
      labelEn: 'Tirukkalatti',
      labelTa: 'திருக்காளத்தி',
      authorityScope: 'traditional_reference',
      historicalVerified: false,
    },
  ],
  copy: {
    en: {
      eyebrow: 'QUEST 01 OF 63',
      title: 'Kannappar — devotion without a script',
      subtitle: 'A short story quest about memory, place and how to read tradition carefully.',
      duration: 'About 10–15 minutes',
      start: 'Begin quest',
      resume: 'Continue quest',
      exit: 'Exit quest',
      next: 'Next',
      back: 'Back',
      reveal: 'Reveal',
      continue: 'Continue',
      tryAgain: 'Try again',
      correct: 'That’s it.',
      notQuite: 'Look again.',
      sourceLabel: 'PRAMANA GROUNDING',
      sourceScope: 'Periya Puranam traditional narrative · not independently verified biography',
      progressLabel: 'Quest progress',
      predictionTitle: 'Before the story',
      predictionBody: 'You are about to meet a hunter whose worship does not follow formal ritual. What do you think this story will make you notice most?',
      predictionChoices: [
        { id: 'precision', label: 'Perfect ritual technique' },
        { id: 'sincerity', label: 'The intensity of someone’s devotion' },
        { id: 'status', label: 'Social status and learning' },
        { id: 'unknown', label: 'I want the story to surprise me' },
      ],
      predictionNote: 'This is a prediction, not a test of belief. Your choice is not graded.',
      storyTitle: 'The traditional story',
      storyBody: 'In the Periya Puranam tradition, Kannappar is remembered as a hunter whose worship ignores formal ritual. He offers meat, brings water in his mouth, and the story finally reaches the extraordinary act of offering his own eyes to Shiva. The narrative presents these acts as signs of absolute devotion.',
      storyScope: 'Nayanmar Trails presents this as traditional narrative. It is not labelled as independently verified historical biography.',
      memoryTitle: 'Story memory',
      memoryBody: 'One detail is the climax of the traditional account.',
      memoryQuestion: 'Which act comes at the end as the story’s most extreme offering?',
      memoryChoices: [
        { id: 'water', label: 'Bringing water in his mouth' },
        { id: 'meat', label: 'Offering meat' },
        { id: 'eyes', label: 'Offering his own eyes' },
        { id: 'temple', label: 'Building a temple' },
      ],
      memoryCorrect: 'Yes. The Pramana story summary explicitly describes the offering of his own eyes as the final act.',
      memoryWrong: 'Those details may belong to the story, but the Pramana summary identifies the offering of his eyes as the final act.',
      geographyTitle: 'Sacred geography',
      geographyBody: 'Pramana records two place associations for Kannappar. Both are traditional references, not independently verified modern-location claims.',
      birthplaceLabel: 'Birthplace tradition',
      muktiLabel: 'Mukti-place tradition',
      geographyQuestion: 'Which traditional place is recorded as Kannappar’s mukti-place?',
      geographyChoices: [
        { id: 'uduppur', label: 'Uduppur' },
        { id: 'tirukkalatti', label: 'Tirukkalatti' },
      ],
      geographyCorrect: 'Correct. Tirukkalatti is recorded as the mukti-place tradition; Uduppur is the birthplace tradition.',
      geographyWrong: 'Uduppur is the birthplace tradition. Tirukkalatti is the mukti-place tradition.',
      geographyScope: 'These are traditional-place associations. This quest does not turn them into a precise modern temple identification.',
      detectiveTitle: 'Pramana Detective',
      detectiveBody: 'Good source reading means knowing what a record supports — and what it does not.',
      detectivePrompt: 'For each statement, decide whether Pramana supports it as stated.',
      detectiveClaims: [
        {
          id: 'story',
          claim: 'The Periya Puranam tradition portrays Kannappar’s worship as outside formal ritual and culminates in the offering of his eyes.',
          safe: true,
          explanation: 'Supported as a traditional narrative summary.',
        },
        {
          id: 'history',
          claim: 'The presence of the story in the graph proves that every narrated detail is independently verified history.',
          safe: false,
          explanation: 'Not established. Pramana marks the story as traditional_reference, not independently verified biography.',
        },
        {
          id: 'places',
          claim: 'Pramana records Uduppur and Tirukkalatti as traditional place associations for Kannappar.',
          safe: true,
          explanation: 'Supported as traditional place references; historical_verified is false.',
        },
      ],
      detectiveSafe: 'Supported',
      detectiveNotEstablished: 'Not established',
      whoTitle: 'Who am I?',
      whoBody: 'Try to identify the saint before revealing every clue.',
      whoClues: [
        'I am remembered in this traditional account as a hunter.',
        'My worship is described as outside formal ritual.',
        'The story culminates in the offering of my own eyes.',
      ],
      whoChoices: [
        { id: 'kannappar', label: 'Kannappar' },
        { id: 'appar', label: 'Appar' },
        { id: 'karaikkal', label: 'Karaikkal Ammaiyar' },
        { id: 'sundarar', label: 'Sundarar' },
      ],
      whoCorrect: 'Kannappar. You recognised the story from its defining clues.',
      whoWrong: 'Not this time. Reveal another clue and try again.',
      reflectionTitle: 'What stayed with you?',
      reflectionBody: 'There is no scored answer here. Choose the idea you want to remember when you see Kannappar again.',
      reflectionChoices: [
        { id: 'sincerity', label: 'Sincerity' },
        { id: 'courage', label: 'Courage' },
        { id: 'wholehearted', label: 'Wholehearted commitment' },
        { id: 'curiosity', label: 'I want to understand the tradition more deeply' },
      ],
      reflectionNote: 'Your reflection is stored only in this browser in v0.1.',
      completeEyebrow: 'MEMORY SHRINE UNLOCKED',
      completeTitle: 'Kannappar discovered',
      completeBody: 'You have finished the first Nayanmar Trails quest. The goal is not to collect points — it is to recognise the saint, remember the story, and know how the source is being presented.',
      discovered: '1 of 63 discovered',
      replay: 'Replay quest',
      returnToExplore: 'Return to Explorer',
      memoryShrine: 'Memory Shrine',
      memorySaint: 'Kannappar · Nayanmar 09',
      memoryStory: 'Traditional story: worship outside formal ritual; the narrative culminates in the offering of his eyes.',
      memoryPlaces: 'Traditional places: Uduppur · Tirukkalatti',
      memorySource: 'Source layer: Periya Puranam · traditional_reference',
      deepamLabel: 'A deepam is lit for a story remembered.',
    },
    ta: {
      eyebrow: '63 நாயன்மார்களில் · தேடல் 01',
      title: 'கண்ணப்பர் — முறையைத் தாண்டிய முழு அன்பு',
      subtitle: 'ஒரு கதையை நினைவில் வைத்துக்கொண்டு, தலச் செய்தியையும் ஆதாரத்தின் தன்மையையும் புரிந்துகொள்ளும் சிறு பயணம்.',
      duration: 'சுமார் 10–15 நிமிடங்கள்',
      start: 'தேடலைத் தொடங்கு',
      resume: 'தொடர்ந்து விளையாடு',
      exit: 'தேடலிலிருந்து வெளியேறு',
      next: 'அடுத்து',
      back: 'முந்தையது',
      reveal: 'விடையைப் பார்',
      continue: 'தொடரலாம்',
      tryAgain: 'மீண்டும் முயற்சி செய்',
      correct: 'சரி.',
      notQuite: 'இன்னொரு முறை யோசி.',
      sourceLabel: 'பிரமாண ஆதாரம்',
      sourceScope: 'பெரியபுராண மரபுக் கதை · தனித்த வரலாற்று வாழ்க்கைச்சான்றாகக் காட்டப்படவில்லை',
      progressLabel: 'தேடல் முன்னேற்றம்',
      predictionTitle: 'கதைக்கு முன் ஒரு எண்ணம்',
      predictionBody: 'ஆகம முறைகளைப் பின்பற்றாத ஒரு வேடரின் வழிபாட்டைப் பற்றிய கதையைப் பார்க்கப் போகிறாய். இந்தக் கதை எதை நம்மிடம் கவனிக்கச் செய்யும் என்று நினைக்கிறாய்?',
      predictionChoices: [
        { id: 'precision', label: 'சடங்கு முறையைத் துல்லியமாகப் பின்பற்றுவது' },
        { id: 'sincerity', label: 'ஒருவரின் பக்தியின் தீவிரம்' },
        { id: 'status', label: 'பிறப்பும் கல்வியும்' },
        { id: 'unknown', label: 'கதை என்ன சொல்கிறது என்று முதலில் பார்க்கிறேன்' },
      ],
      predictionNote: 'இது நம்பிக்கையைச் சோதிக்கும் கேள்வி அல்ல. நீ தேர்ந்தெடுப்பதற்கு மதிப்பெண் இல்லை.',
      storyTitle: 'மரபில் சொல்லப்படும் கதை',
      storyBody: 'பெரியபுராண மரபில் கண்ணப்பர் ஒரு வேடராக நினைவுகூரப்படுகிறார். ஆகம முறைப்படி அல்லாமல் அவர் சிவனை வழிபட்டதாகக் கதை சொல்கிறது. வேட்டையாடிய இறைச்சியைப் படைத்ததும், வாயில் நீர் கொண்டு வந்ததும், இறுதியில் தன் கண்களையே அர்ப்பணிக்கத் துணிந்ததும் அவரது முழுமையான பக்தியின் அடையாளங்களாகக் கூறப்படுகின்றன.',
      storyScope: 'நாயன்மார் ட்ரெயில்ஸ் இதை மரபுக் கதையாகவே காட்டுகிறது. தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்ட வாழ்க்கை வரலாறு என்று கூறுவதில்லை.',
      memoryTitle: 'கதை நினைவில் உள்ளதா?',
      memoryBody: 'மரபுக் கதையின் உச்சமாக ஒரு செயல் வருகிறது.',
      memoryQuestion: 'கதையின் இறுதியில் மிகத் தீவிரமான அர்ப்பணிப்பாக எது சொல்லப்படுகிறது?',
      memoryChoices: [
        { id: 'water', label: 'வாயில் நீர் கொண்டு வருவது' },
        { id: 'meat', label: 'இறைச்சியைப் படைப்பது' },
        { id: 'eyes', label: 'தன் கண்களையே அர்ப்பணிப்பது' },
        { id: 'temple', label: 'கோயில் கட்டுவது' },
      ],
      memoryCorrect: 'ஆம். பிரமாணத்தில் உள்ள கதைச் சுருக்கம், தன் கண்களையே அர்ப்பணிக்கத் துணிந்ததை இறுதி நிகழ்வாகச் சொல்கிறது.',
      memoryWrong: 'அவை கதையில் வரும் அம்சங்களாக இருக்கலாம். ஆனால் பிரமாண கதைச் சுருக்கத்தில் இறுதி நிகழ்வாகக் கூறப்படுவது கண்களை அர்ப்பணிப்பதே.',
      geographyTitle: 'திருத்தல நினைவுப் பயணம்',
      geographyBody: 'கண்ணப்பருடன் தொடர்புடைய இரண்டு தலச் செய்திகளை பிரமாணம் பதிவு செய்கிறது. இரண்டும் மரபுக் குறிப்புகள்; தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்ட இன்றைய துல்லிய இடங்கள் என்று இங்கே கூறப்படவில்லை.',
      birthplaceLabel: 'பிறந்த தலம் — மரபுக் குறிப்பு',
      muktiLabel: 'முக்தித் தலம் — மரபுக் குறிப்பு',
      geographyQuestion: 'கண்ணப்பரின் முக்தித் தலமாக மரபில் பதிவு செய்யப்பட்டிருப்பது எது?',
      geographyChoices: [
        { id: 'uduppur', label: 'உடுப்பூர்' },
        { id: 'tirukkalatti', label: 'திருக்காளத்தி' },
      ],
      geographyCorrect: 'சரி. திருக்காளத்தி முக்தித் தலமாகவும், உடுப்பூர் பிறந்த தலமாகவும் மரபில் பதிவு செய்யப்பட்டுள்ளது.',
      geographyWrong: 'உடுப்பூர் பிறந்த தலமாக வரும் மரபுக் குறிப்பு. திருக்காளத்திதான் முக்தித் தலமாகப் பதிவு செய்யப்பட்டுள்ளது.',
      geographyScope: 'இவை மரபில் வரும் தலத் தொடர்புகள். இதிலிருந்து எந்த இன்றைய கோயிலையும் துல்லியமாக அடையாளப்படுத்தி விடவில்லை.',
      detectiveTitle: 'பிரமாண விசாரணை',
      detectiveBody: 'ஒரு ஆதாரம் என்ன சொல்கிறது என்பதையும், அது என்ன சொல்லவில்லை என்பதையும் பிரித்துப் படிப்பதுதான் இங்குள்ள சவால்.',
      detectivePrompt: 'ஒவ்வொரு கூற்றுக்கும் — பிரமாணம் இதை இந்த வடிவில் ஆதரிக்கிறதா என்று தேர்வு செய்.',
      detectiveClaims: [
        {
          id: 'story',
          claim: 'பெரியபுராண மரபில் கண்ணப்பரின் வழிபாடு ஆகம முறைக்கு வெளியே இருப்பதாகவும், கதை தன் கண்களை அர்ப்பணிக்கும் நிகழ்வில் உச்சத்தை அடைவதாகவும் சொல்லப்படுகிறது.',
          safe: true,
          explanation: 'மரபுக் கதைச் சுருக்கமாக இது ஆதரிக்கப்படுகிறது.',
        },
        {
          id: 'history',
          claim: 'இந்தக் கதை பிரமாணத்தில் இருப்பதால், அதிலுள்ள ஒவ்வொரு நிகழ்வும் தனித்த வரலாற்றுச் சான்றால் உறுதி செய்யப்பட்டதாக ஆகிவிடுகிறது.',
          safe: false,
          explanation: 'அப்படி கூற முடியாது. பிரமாணம் இதை traditional_reference என்ற மரபுக் குறிப்பாகவே வகைப்படுத்துகிறது.',
        },
        {
          id: 'places',
          claim: 'உடுப்பூரும் திருக்காளத்தியும் கண்ணப்பருடன் தொடர்புடைய மரபுத் தலங்களாக பிரமாணத்தில் பதிவு செய்யப்பட்டுள்ளன.',
          safe: true,
          explanation: 'மரபுத் தலக் குறிப்பாக இது ஆதரிக்கப்படுகிறது; historical_verified என்பது false.',
        },
      ],
      detectiveSafe: 'ஆதரிக்கப்படுகிறது',
      detectiveNotEstablished: 'உறுதி செய்யப்படவில்லை',
      whoTitle: 'நான் யார்?',
      whoBody: 'அனைத்து குறிப்புகளையும் திறக்காமல் நாயன்மாரை கண்டுபிடிக்க முடியுமா?',
      whoClues: [
        'மரபுக் கதையில் நான் ஒரு வேடராக நினைவுகூரப்படுகிறேன்.',
        'என் வழிபாடு ஆகம முறைக்கு வெளியே இருப்பதாகக் கதை சொல்கிறது.',
        'என் கண்களையே அர்ப்பணிக்கத் துணியும் நிகழ்வில் கதை உச்சத்தை அடைகிறது.',
      ],
      whoChoices: [
        { id: 'kannappar', label: 'கண்ணப்பர்' },
        { id: 'appar', label: 'அப்பர்' },
        { id: 'karaikkal', label: 'காரைக்கால் அம்மையார்' },
        { id: 'sundarar', label: 'சுந்தரர்' },
      ],
      whoCorrect: 'கண்ணப்பர். கதையின் முக்கிய அடையாளங்களிலிருந்தே அவரை நினைவுகூர்ந்துவிட்டாய்.',
      whoWrong: 'இம்முறை இல்லை. இன்னொரு குறிப்பைத் திறந்து மீண்டும் முயற்சி செய்.',
      reflectionTitle: 'உனக்கு எது மனதில் நின்றது?',
      reflectionBody: 'இதற்கு சரி–தவறு இல்லை. அடுத்த முறை கண்ணப்பரைப் பார்க்கும்போது நினைவுக்கு வரவேண்டிய எண்ணத்தைத் தேர்வு செய்.',
      reflectionChoices: [
        { id: 'sincerity', label: 'மனமார்ந்த அன்பு' },
        { id: 'courage', label: 'துணிவு' },
        { id: 'wholehearted', label: 'முழு மனதுடன் ஈடுபடுதல்' },
        { id: 'curiosity', label: 'இந்த மரபை இன்னும் ஆழமாக அறிய வேண்டும்' },
      ],
      reflectionNote: 'v0.1-ல் உன் தேர்வு இந்த உலாவியிலேயே மட்டும் சேமிக்கப்படும்.',
      completeEyebrow: 'நினைவுச் சன்னதி திறந்தது',
      completeTitle: 'கண்ணப்பரை அறிந்துகொண்டாய்',
      completeBody: 'நாயன்மார் ட்ரெயில்ஸின் முதல் தேடலை முடித்துவிட்டாய். புள்ளிகள் சேர்ப்பது இலக்கு அல்ல; நாயன்மாரை அடையாளம் காணவும், கதையை நினைவில் கொள்ளவும், ஆதாரம் எப்படிக் காட்டப்படுகிறது என்பதைப் புரிந்துகொள்ளவும் செய்வதே இலக்கு.',
      discovered: '63 பேரில் 1 நாயன்மார் அறிமுகம்',
      replay: 'மீண்டும் விளையாடு',
      returnToExplore: 'முதன்மை தளத்திற்குத் திரும்பு',
      memoryShrine: 'நினைவுச் சன்னதி',
      memorySaint: 'கண்ணப்பர் · நாயன்மார் 09',
      memoryStory: 'மரபுக் கதை: ஆகம முறைக்கு வெளியான வழிபாடு; கண்களை அர்ப்பணிக்கும் நிகழ்வில் கதை உச்சத்தை அடைகிறது.',
      memoryPlaces: 'மரபுத் தலங்கள்: உடுப்பூர் · திருக்காளத்தி',
      memorySource: 'ஆதார அடுக்கு: பெரியபுராணம் · மரபுக் குறிப்பு',
      deepamLabel: 'நினைவில் நின்ற கதைக்காக ஒரு தீபம் ஏற்றப்பட்டுள்ளது.',
    },
  },
};
