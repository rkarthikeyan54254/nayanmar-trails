import { useEffect, useMemo, useState, type ReactNode } from 'react';
import GopuramIcon from './GopuramIcon';
import { DISCOVERY_MEDIA } from './media';
import { track } from './analytics';
import { KANNAPPAR_QUEST, type QuestLocale } from './questData';

type QuestStage =
  | 'intro'
  | 'prediction'
  | 'story'
  | 'memory'
  | 'geography'
  | 'detective'
  | 'who'
  | 'reflection'
  | 'complete';

const STAGES: QuestStage[] = [
  'intro',
  'prediction',
  'story',
  'memory',
  'geography',
  'detective',
  'who',
  'reflection',
  'complete',
];

const STORAGE_KEY = 'nayanmar-trails:quest:kannappar-v1';

type PersistedQuest = {
  completed?: boolean;
  step?: number;
  reflection?: string;
};

function readPersisted(): PersistedQuest {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as PersistedQuest;
  } catch {
    return {};
  }
}

function writePersisted(value: PersistedQuest) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Local persistence is optional. Quest remains fully usable without it.
  }
}

export function QuestInvitation({
  locale,
  onOpen,
}: {
  locale: QuestLocale;
  onOpen: () => void;
}) {
  const persisted = readPersisted();
  const completed = Boolean(persisted.completed);

  return (
    <section className="quest-invite" aria-label={locale === 'ta' ? 'நாயன்மார் தேடல்' : 'Nayanmar Quest'}>
      <div className="quest-invite-mark" aria-hidden="true">
        <span className="quest-deepam">✦</span>
        <GopuramIcon />
      </div>
      <div className="quest-invite-copy">
        <small>{locale === 'ta' ? 'புதிய அனுபவம் · நினைவில் நிற்கும் பக்திப் பயணம்' : 'NEW · A MEMORY-FIRST DEVOTIONAL QUEST'}</small>
        <h2>{locale === 'ta' ? 'கண்ணப்பரை நீ எவ்வளவு சீக்கிரம் அறிந்துகொள்வாய்?' : 'How quickly can you recognise Kannappar?'}</h2>
        <p>
          {locale === 'ta'
            ? 'கதை, தலச் செய்தி, ஆதார வாசிப்பு, “நான் யார்?” — புள்ளிகள் சேர்க்க அல்ல; நினைவில் நிற்க விளையாடு.'
            : 'Story, sacred geography, source detective and “Who am I?” — designed for memory, not points.'}
        </p>
      </div>
      <div className="quest-invite-action">
        <span>{completed ? (locale === 'ta' ? 'முடித்துவிட்டாய்' : 'Completed') : (locale === 'ta' ? 'சுமார் 10–15 நிமிடங்கள்' : 'About 10–15 min')}</span>
        <button onClick={onOpen}>
          {completed
            ? locale === 'ta' ? 'மீண்டும் திற' : 'Open again'
            : locale === 'ta' ? 'தேடலைத் தொடங்கு' : 'Begin quest'}
          <i>→</i>
        </button>
      </div>
    </section>
  );
}

function ChoiceGrid({
  choices,
  selected,
  onSelect,
  disabled = false,
}: {
  choices: Array<{ id: string; label: string }>;
  selected: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="quest-choice-grid">
      {choices.map((choice) => (
        <button
          key={choice.id}
          className={selected === choice.id ? 'selected' : ''}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
        >
          <span>{choice.label}</span>
          <i>{selected === choice.id ? '✓' : '→'}</i>
        </button>
      ))}
    </div>
  );
}

function EvidenceBadge({ locale }: { locale: QuestLocale }) {
  return (
    <span className="quest-evidence-badge">
      <i>◇</i>
      {locale === 'ta' ? 'மரபுக் குறிப்பு' : 'TRADITIONAL REFERENCE'}
    </span>
  );
}

function QuestShell({
  children,
  locale,
  stageIndex,
  onClose,
  onBack,
}: {
  children: ReactNode;
  locale: QuestLocale;
  stageIndex: number;
  onClose: () => void;
  onBack: () => void;
}) {
  const copy = KANNAPPAR_QUEST.copy[locale];
  const progress = Math.round((Math.max(stageIndex, 0) / (STAGES.length - 1)) * 100);

  return (
    <div className="quest-backdrop" role="presentation">
      <section className="quest-shell" role="dialog" aria-modal="true" aria-label={copy.title}>
        <header className="quest-topbar">
          <button
            className="quest-back"
            onClick={onBack}
            disabled={stageIndex === 0}
            aria-label={copy.back}
          >
            ←
          </button>
          <div className="quest-brand">
            <GopuramIcon />
            <div>
              <b>Nayanmar Trails</b>
              <span>{copy.eyebrow}</span>
            </div>
          </div>
          <button className="quest-close" onClick={onClose}>{copy.exit} ×</button>
        </header>
        <div className="quest-progress-wrap">
          <span>{copy.progressLabel}</span>
          <div className="quest-progress"><i style={{ width: `${progress}%` }} /></div>
          <b>{Math.min(stageIndex + 1, STAGES.length)} / {STAGES.length}</b>
        </div>
        <main className="quest-stage">{children}</main>
      </section>
    </div>
  );
}

export default function QuestMode({
  locale,
  open,
  onClose,
  initialStep = 0,
}: {
  locale: QuestLocale;
  open: boolean;
  onClose: () => void;
  initialStep?: number;
}) {
  const quest = KANNAPPAR_QUEST;
  const copy = quest.copy[locale];
  const persisted = useMemo(() => readPersisted(), [open]);
  const [stageIndex, setStageIndex] = useState(() => Math.min(Math.max(initialStep, 0), STAGES.length - 1));
  const [prediction, setPrediction] = useState<string | null>(null);
  const [memoryAnswer, setMemoryAnswer] = useState<string | null>(null);
  const [memoryChecked, setMemoryChecked] = useState(false);
  const [geoAnswer, setGeoAnswer] = useState<string | null>(null);
  const [geoChecked, setGeoChecked] = useState(false);
  const [detectiveAnswers, setDetectiveAnswers] = useState<Record<string, boolean>>({});
  const [revealedClues, setRevealedClues] = useState(1);
  const [whoAnswer, setWhoAnswer] = useState<string | null>(null);
  const [whoChecked, setWhoChecked] = useState(false);
  const [reflection, setReflection] = useState<string | null>(persisted.reflection ?? null);

  useEffect(() => {
    if (!open) return;
    const queryStep = Math.min(Math.max(initialStep, 0), STAGES.length - 1);
    setStageIndex(queryStep);
    track('quest_open', { quest: quest.id, locale, step: queryStep });
  }, [initialStep, locale, open, quest.id]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, open]);

  if (!open) return null;

  const stage = STAGES[stageIndex];
  const next = () => {
    const nextStep = Math.min(stageIndex + 1, STAGES.length - 1);
    setStageIndex(nextStep);
    writePersisted({ ...readPersisted(), step: nextStep, reflection: reflection ?? undefined });
    track('quest_step', { quest: quest.id, locale, step: nextStep, stage: STAGES[nextStep] });
  };
  const back = () => setStageIndex((current) => Math.max(0, current - 1));

  const memoryCorrect = memoryAnswer === 'eyes';
  const geoCorrect = geoAnswer === 'tirukkalatti';
  const detectiveComplete = copy.detectiveClaims.every((claim) => detectiveAnswers[claim.id] === claim.safe);
  const whoCorrect = whoAnswer === 'kannappar';

  const finish = () => {
    writePersisted({ completed: true, step: STAGES.length - 1, reflection: reflection ?? undefined });
    track('quest_complete', { quest: quest.id, locale, reflection: reflection ?? 'none' });
    next();
  };

  return (
    <QuestShell
      locale={locale}
      stageIndex={stageIndex}
      onClose={onClose}
      onBack={back}
    >
      {stage === 'intro' && (
        <article className="quest-intro">
          <div className="quest-intro-art">
            <img src={DISCOVERY_MEDIA.story.src} alt="" />
            <div className="quest-intro-shade" />
            <div className="quest-intro-number">09</div>
            <div className="quest-intro-deepam" aria-hidden="true">✦</div>
            <small>{DISCOVERY_MEDIA.story.source} · {DISCOVERY_MEDIA.story.license}</small>
          </div>
          <div className="quest-intro-copy">
            <EvidenceBadge locale={locale} />
            <span className="quest-kicker">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
            <div className="quest-source-note">
              <b>{copy.sourceLabel}</b>
              <span>{copy.sourceScope}</span>
            </div>
            <div className="quest-intro-actions">
              <button className="quest-primary" onClick={() => {
                track('quest_start', { quest: quest.id, locale });
                next();
              }}>{persisted.completed ? copy.replay : copy.start} <i>→</i></button>
              <span>{copy.duration}</span>
            </div>
          </div>
        </article>
      )}

      {stage === 'prediction' && (
        <article className="quest-card-stage">
          <span className="quest-kicker">01 · {locale === 'ta' ? 'முன்னுணர்வு' : 'PREDICTION'}</span>
          <h2>{copy.predictionTitle}</h2>
          <p className="quest-lead">{copy.predictionBody}</p>
          <ChoiceGrid choices={copy.predictionChoices} selected={prediction} onSelect={(id) => {
            setPrediction(id);
            track('quest_answer', { quest: quest.id, stage: 'prediction', answer: id });
          }} />
          <p className="quest-gentle-note">{copy.predictionNote}</p>
          <button className="quest-primary" disabled={!prediction} onClick={next}>{copy.continue} <i>→</i></button>
        </article>
      )}

      {stage === 'story' && (
        <article className="quest-story-stage">
          <div className="quest-story-art">
            <img src={DISCOVERY_MEDIA.story.src} alt="" />
            <div />
          </div>
          <div className="quest-story-copy">
            <EvidenceBadge locale={locale} />
            <span className="quest-kicker">02 · {locale === 'ta' ? 'கதை' : 'STORY'}</span>
            <h2>{copy.storyTitle}</h2>
            <p className="quest-story-text">{copy.storyBody}</p>
            <div className="quest-scope-box">
              <GopuramIcon />
              <p>{copy.storyScope}</p>
            </div>
            <button className="quest-primary" onClick={next}>{copy.continue} <i>→</i></button>
          </div>
        </article>
      )}

      {stage === 'memory' && (
        <article className="quest-card-stage">
          <span className="quest-kicker">03 · {locale === 'ta' ? 'நினைவு' : 'MEMORY'}</span>
          <h2>{copy.memoryTitle}</h2>
          <p className="quest-lead">{copy.memoryBody}</p>
          <h3 className="quest-question">{copy.memoryQuestion}</h3>
          <ChoiceGrid
            choices={copy.memoryChoices}
            selected={memoryAnswer}
            onSelect={(id) => {
              setMemoryAnswer(id);
              setMemoryChecked(false);
            }}
            disabled={memoryChecked && memoryCorrect}
          />
          {memoryChecked && (
            <div className={`quest-feedback ${memoryCorrect ? 'correct' : 'retry'}`}>
              <b>{memoryCorrect ? copy.correct : copy.notQuite}</b>
              <p>{memoryCorrect ? copy.memoryCorrect : copy.memoryWrong}</p>
            </div>
          )}
          {!memoryChecked || !memoryCorrect ? (
            <button className="quest-primary" disabled={!memoryAnswer} onClick={() => {
              setMemoryChecked(true);
              track('quest_answer', { quest: quest.id, stage: 'memory', answer: memoryAnswer, correct: memoryCorrect });
            }}>{copy.reveal}</button>
          ) : (
            <button className="quest-primary" onClick={next}>{copy.continue} <i>→</i></button>
          )}
        </article>
      )}

      {stage === 'geography' && (
        <article className="quest-card-stage">
          <span className="quest-kicker">04 · {locale === 'ta' ? 'தலச் செய்தி' : 'SACRED GEOGRAPHY'}</span>
          <h2>{copy.geographyTitle}</h2>
          <p className="quest-lead">{copy.geographyBody}</p>
          <div className="quest-place-pair">
            <div>
              <GopuramIcon />
              <small>{copy.birthplaceLabel}</small>
              <b>{locale === 'ta' ? quest.places[0].labelTa : quest.places[0].labelEn}</b>
            </div>
            <span>↔</span>
            <div>
              <GopuramIcon />
              <small>{copy.muktiLabel}</small>
              <b>?</b>
            </div>
          </div>
          <h3 className="quest-question">{copy.geographyQuestion}</h3>
          <ChoiceGrid
            choices={copy.geographyChoices}
            selected={geoAnswer}
            onSelect={(id) => {
              setGeoAnswer(id);
              setGeoChecked(false);
            }}
            disabled={geoChecked && geoCorrect}
          />
          {geoChecked && (
            <div className={`quest-feedback ${geoCorrect ? 'correct' : 'retry'}`}>
              <b>{geoCorrect ? copy.correct : copy.notQuite}</b>
              <p>{geoCorrect ? copy.geographyCorrect : copy.geographyWrong}</p>
            </div>
          )}
          <p className="quest-gentle-note">{copy.geographyScope}</p>
          {!geoChecked || !geoCorrect ? (
            <button className="quest-primary" disabled={!geoAnswer} onClick={() => {
              setGeoChecked(true);
              track('quest_answer', { quest: quest.id, stage: 'geography', answer: geoAnswer, correct: geoCorrect });
            }}>{copy.reveal}</button>
          ) : (
            <button className="quest-primary" onClick={next}>{copy.continue} <i>→</i></button>
          )}
        </article>
      )}

      {stage === 'detective' && (
        <article className="quest-card-stage detective">
          <span className="quest-kicker">05 · {locale === 'ta' ? 'ஆதார வாசிப்பு' : 'SOURCE LITERACY'}</span>
          <h2>{copy.detectiveTitle}</h2>
          <p className="quest-lead">{copy.detectiveBody}</p>
          <h3 className="quest-question">{copy.detectivePrompt}</h3>
          <div className="detective-claims">
            {copy.detectiveClaims.map((claim, index) => {
              const answer = detectiveAnswers[claim.id];
              const isCorrect = answer === claim.safe;
              return (
                <div key={claim.id} className={`detective-claim ${answer === undefined ? '' : isCorrect ? 'correct' : 'wrong'}`}>
                  <span className="detective-index">{String(index + 1).padStart(2, '0')}</span>
                  <p>{claim.claim}</p>
                  <div>
                    <button
                      className={answer === true ? 'selected' : ''}
                      onClick={() => {
                        setDetectiveAnswers((current) => ({ ...current, [claim.id]: true }));
                        track('quest_answer', { quest: quest.id, stage: 'detective', claim: claim.id, answer: true, correct: claim.safe === true });
                      }}
                    >{copy.detectiveSafe}</button>
                    <button
                      className={answer === false ? 'selected' : ''}
                      onClick={() => {
                        setDetectiveAnswers((current) => ({ ...current, [claim.id]: false }));
                        track('quest_answer', { quest: quest.id, stage: 'detective', claim: claim.id, answer: false, correct: claim.safe === false });
                      }}
                    >{copy.detectiveNotEstablished}</button>
                  </div>
                  {answer !== undefined && <small>{isCorrect ? '✓ ' : '↺ '}{claim.explanation}</small>}
                </div>
              );
            })}
          </div>
          <button className="quest-primary" disabled={!detectiveComplete} onClick={next}>{copy.continue} <i>→</i></button>
        </article>
      )}

      {stage === 'who' && (
        <article className="quest-card-stage who-stage">
          <span className="quest-kicker">06 · {locale === 'ta' ? 'அடையாளம் காண்' : 'WHO AM I?'}</span>
          <h2>{copy.whoTitle}</h2>
          <p className="quest-lead">{copy.whoBody}</p>
          <div className="who-clues">
            {copy.whoClues.slice(0, revealedClues).map((clue, index) => (
              <div key={clue}><span>{index + 1}</span><p>{clue}</p></div>
            ))}
          </div>
          {revealedClues < copy.whoClues.length && !whoCorrect && (
            <button className="quest-secondary" onClick={() => setRevealedClues((value) => Math.min(value + 1, copy.whoClues.length))}>
              {locale === 'ta' ? 'இன்னொரு குறிப்பைத் திற' : 'Reveal another clue'} +
            </button>
          )}
          <ChoiceGrid
            choices={copy.whoChoices}
            selected={whoAnswer}
            onSelect={(id) => {
              setWhoAnswer(id);
              setWhoChecked(false);
            }}
            disabled={whoChecked && whoCorrect}
          />
          {whoChecked && (
            <div className={`quest-feedback ${whoCorrect ? 'correct' : 'retry'}`}>
              <b>{whoCorrect ? copy.correct : copy.notQuite}</b>
              <p>{whoCorrect ? copy.whoCorrect : copy.whoWrong}</p>
            </div>
          )}
          {!whoChecked || !whoCorrect ? (
            <button className="quest-primary" disabled={!whoAnswer} onClick={() => {
              setWhoChecked(true);
              track('quest_answer', { quest: quest.id, stage: 'who', answer: whoAnswer, correct: whoCorrect, clues: revealedClues });
            }}>{copy.reveal}</button>
          ) : (
            <button className="quest-primary" onClick={next}>{copy.continue} <i>→</i></button>
          )}
        </article>
      )}

      {stage === 'reflection' && (
        <article className="quest-card-stage reflection-stage">
          <span className="quest-kicker">07 · {locale === 'ta' ? 'நினைவில் எடுத்து செல்' : 'CARRY IT WITH YOU'}</span>
          <h2>{copy.reflectionTitle}</h2>
          <p className="quest-lead">{copy.reflectionBody}</p>
          <ChoiceGrid choices={copy.reflectionChoices} selected={reflection} onSelect={(id) => {
            setReflection(id);
            writePersisted({ ...readPersisted(), reflection: id });
          }} />
          <p className="quest-gentle-note">{copy.reflectionNote}</p>
          <button className="quest-primary" disabled={!reflection} onClick={finish}>{locale === 'ta' ? 'நினைவுச் சன்னதியைத் திற' : 'Unlock Memory Shrine'} <i>✦</i></button>
        </article>
      )}

      {stage === 'complete' && (
        <article className="quest-complete">
          <div className="quest-deepam-large" aria-hidden="true">
            <span>✦</span>
            <i />
          </div>
          <span className="quest-kicker">{copy.completeEyebrow}</span>
          <h2>{copy.completeTitle}</h2>
          <p className="quest-lead">{copy.completeBody}</p>
          <div className="memory-shrine-card">
            <div className="memory-shrine-art">
              <img src={DISCOVERY_MEDIA.story.src} alt="" />
              <span>09</span>
            </div>
            <div className="memory-shrine-copy">
              <small>{copy.memoryShrine}</small>
              <h3>{copy.memorySaint}</h3>
              <p>{copy.memoryStory}</p>
              <dl>
                <div><dt>{locale === 'ta' ? 'தலச் செய்தி' : 'Places'}</dt><dd>{copy.memoryPlaces}</dd></div>
                <div><dt>{locale === 'ta' ? 'ஆதாரம்' : 'Source'}</dt><dd>{copy.memorySource}</dd></div>
              </dl>
            </div>
          </div>
          <div className="quest-discovered">
            <b>{copy.discovered}</b>
            <span>{copy.deepamLabel}</span>
          </div>
          <div className="quest-complete-actions">
            <button className="quest-secondary" onClick={() => {
              setPrediction(null);
              setMemoryAnswer(null);
              setMemoryChecked(false);
              setGeoAnswer(null);
              setGeoChecked(false);
              setDetectiveAnswers({});
              setRevealedClues(1);
              setWhoAnswer(null);
              setWhoChecked(false);
              setStageIndex(0);
              track('quest_replay', { quest: quest.id, locale });
            }}>{copy.replay}</button>
            <button className="quest-primary" onClick={onClose}>{copy.returnToExplore} <i>→</i></button>
          </div>
        </article>
      )}
    </QuestShell>
  );
}
