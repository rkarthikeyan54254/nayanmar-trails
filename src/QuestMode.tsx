import { useEffect, useMemo, useState, type ReactNode } from 'react';
import GopuramIcon from './GopuramIcon';
import { DISCOVERY_MEDIA, HERO_MEDIA, SAINT_MEDIA, type MediaCredit } from './media';
import { track } from './analytics';
import {
  DEFAULT_QUEST_KEY,
  QUEST_BY_KEY,
  QUEST_UI,
  QUESTS,
  ql,
  type QuestDefinition,
  type QuestLocale,
} from './questCatalog';

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

type PersistedQuest = {
  completed?: boolean;
  step?: number;
  reflection?: string;
};

const storageKey = (quest: QuestDefinition) => `nayanmar-trails:quest:${quest.id}`;

function readPersisted(quest: QuestDefinition): PersistedQuest {
  try {
    return JSON.parse(localStorage.getItem(storageKey(quest)) || '{}') as PersistedQuest;
  } catch {
    return {};
  }
}

function writePersisted(quest: QuestDefinition, value: PersistedQuest) {
  try {
    localStorage.setItem(storageKey(quest), JSON.stringify(value));
  } catch {
    // Local persistence is optional. Quest remains fully usable without it.
  }
}

function questMedia(quest: QuestDefinition): MediaCredit | null {
  if (SAINT_MEDIA[quest.saintId]) return SAINT_MEDIA[quest.saintId];
  if (quest.key === 'kannappar') return DISCOVERY_MEDIA.story;
  if (quest.key === 'karaikkal') return DISCOVERY_MEDIA.saint;
  return null;
}

function completedState() {
  return QUESTS.map((quest) => ({ quest, state: readPersisted(quest) }));
}

function nayanmarCompletedCount() {
  return completedState().filter(({ quest, state }) => quest.registryKind === 'nayanmar' && state.completed).length;
}

function manikkavasakarCompleted() {
  return Boolean(readPersisted(QUEST_BY_KEY.manikkavasakar).completed);
}

export function QuestInvitation({
  locale,
  onOpen,
}: {
  locale: QuestLocale;
  onOpen: () => void;
}) {
  const ui = QUEST_UI[locale];
  const completed = nayanmarCompletedCount();
  const companion = manikkavasakarCompleted();

  return (
    <section className="quest-invite" aria-label={locale === 'ta' ? 'நாயன்மார் தேடல்கள்' : 'Nayanmar Quests'}>
      <div className="quest-invite-mark" aria-hidden="true">
        <span className="quest-deepam">✦</span>
        <GopuramIcon />
      </div>
      <div className="quest-invite-copy">
        <small>{ui.ready} · {locale === 'ta' ? 'நினைவில் நிற்கும் பக்திப் பயணம்' : 'MEMORY-FIRST DEVOTIONAL LEARNING'}</small>
        <h2>{ui.inviteTitle}</h2>
        <p>{ui.inviteBody}</p>
      </div>
      <div className="quest-invite-action">
        <span>
          {locale === 'ta'
            ? `${completed}/63 நாயன்மார்கள்${companion ? ' · மாணிக்கவாசகர் ✓' : ''}`
            : `${completed}/63 Nayanmars${companion ? ' · Manikkavasakar ✓' : ''}`}
        </span>
        <button onClick={onOpen}>
          {ui.openHub}
          <i>→</i>
        </button>
      </div>
    </section>
  );
}

function ChoiceGrid({
  choices,
  locale,
  selected,
  onSelect,
  disabled = false,
}: {
  choices: QuestDefinition['memory']['choices'];
  locale: QuestLocale;
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
          <span>{ql(locale, choice.label)}</span>
          <i>{selected === choice.id ? '✓' : '→'}</i>
        </button>
      ))}
    </div>
  );
}

function EvidenceBadge({
  locale,
  quest,
}: {
  locale: QuestLocale;
  quest: QuestDefinition;
}) {
  return (
    <span className="quest-evidence-badge">
      <i>◇</i>
      {ql(locale, quest.badge)}
    </span>
  );
}

function QuestShell({
  children,
  locale,
  quest,
  stageIndex,
  onClose,
  onBack,
  onHub,
}: {
  children: ReactNode;
  locale: QuestLocale;
  quest: QuestDefinition | null;
  stageIndex: number;
  onClose: () => void;
  onBack: () => void;
  onHub: () => void;
}) {
  const ui = QUEST_UI[locale];
  const progress = quest
    ? Math.round((Math.max(stageIndex, 0) / (STAGES.length - 1)) * 100)
    : 0;

  return (
    <div className="quest-backdrop" role="presentation">
      <section className="quest-shell" role="dialog" aria-modal="true" aria-label={quest ? ql(locale, quest.title) : ui.hubTitle}>
        <header className="quest-topbar">
          <button
            className="quest-back"
            onClick={quest && stageIndex > 0 ? onBack : onHub}
            disabled={!quest}
            aria-label={quest && stageIndex > 0 ? (locale === 'ta' ? 'முந்தையது' : 'Back') : ui.backToQuests}
          >
            ←
          </button>
          <div className="quest-brand">
            <GopuramIcon />
            <div>
              <b>Nayanmar Trails</b>
              <span>{quest ? ql(locale, quest.name) : ui.hubEyebrow}</span>
            </div>
          </div>
          <button className="quest-close" onClick={onClose}>{ui.exit} ×</button>
        </header>
        {quest && (
          <div className="quest-progress-wrap">
            <button className="quest-hub-link" onClick={onHub}>{ui.backToQuests}</button>
            <div className="quest-progress"><i style={{ width: `${progress}%` }} /></div>
            <b>{Math.min(stageIndex + 1, STAGES.length)} / {STAGES.length}</b>
          </div>
        )}
        <main className={`quest-stage ${quest ? '' : 'quest-stage-hub'}`}>{children}</main>
      </section>
    </div>
  );
}

function QuestHub({
  locale,
  onSelect,
}: {
  locale: QuestLocale;
  onSelect: (key: string) => void;
}) {
  const ui = QUEST_UI[locale];
  const state = completedState();
  const nayanmarCount = state.filter(({ quest, state: item }) => quest.registryKind === 'nayanmar' && item.completed).length;
  const companion = state.find(({ quest }) => quest.registryKind === 'naalvar_companion')?.state.completed;

  const renderGroup = (group: 'naalvar' | 'featured', label: string) => (
    <section className="quest-hub-group">
      <div className="quest-hub-group-head">
        <h3>{label}</h3>
        <span>{QUESTS.filter((quest) => quest.group === group).length}</span>
      </div>
      <div className="quest-hub-grid">
        {QUESTS.filter((quest) => quest.group === group).map((quest) => {
          const persisted = readPersisted(quest);
          const media = questMedia(quest);
          return (
            <button
              className={`quest-hub-card ${persisted.completed ? 'completed' : ''}`}
              key={quest.id}
              onClick={() => onSelect(quest.key)}
            >
              <div className="quest-hub-art">
                {media ? (
                  <img src={media.src} alt="" />
                ) : (
                  <div className="quest-hub-art-fallback"><GopuramIcon /><span>✦</span></div>
                )}
                {quest.ordinal !== null ? <i>{String(quest.ordinal).padStart(2, '0')}</i> : <i>8</i>}
                {persisted.completed && <b>✓</b>}
              </div>
              <div className="quest-hub-card-copy">
                <small>
                  {quest.registryKind === 'naalvar_companion'
                    ? (locale === 'ta' ? 'நால்வர் · திருமுறை 8 துணை' : 'NAALVAR · TIRUMURAI 8 COMPANION')
                    : (locale === 'ta' ? `நாயன்மார் ${quest.ordinal}` : `NAYANMAR ${String(quest.ordinal).padStart(2, '0')}`)}
                </small>
                <h4>{ql(locale, quest.name)}</h4>
                <p>{ql(locale, quest.subtitle)}</p>
                <span>{persisted.completed ? ui.completed : (persisted.step ? ui.continueQuest : ui.beginQuest)} →</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <article className="quest-hub">
      <span className="quest-kicker">{ui.hubEyebrow}</span>
      <h1>{ui.hubTitle}</h1>
      <p>{ui.hubBody}</p>
      <div className="quest-hub-progress">
        <div>
          <b>{nayanmarCount}</b>
          <span>{ui.nayanmarProgress} · /63</span>
        </div>
        <div>
          <b>{companion ? '✓' : '—'}</b>
          <span>{ui.companionProgress} · {locale === 'ta' ? 'மாணிக்கவாசகர்' : 'Manikkavasakar'}</span>
        </div>
        <div>
          <b>{state.filter(({ state: item }) => item.completed).length}/7</b>
          <span>{locale === 'ta' ? 'இந்தத் தொகுப்பில் முடிந்தவை' : 'Cohort complete'}</span>
        </div>
      </div>
      {renderGroup('naalvar', ui.naalvar)}
      {renderGroup('featured', ui.featured)}
    </article>
  );
}

export default function QuestMode({
  locale,
  open,
  onClose,
  initialStep = 0,
  initialQuestKey = null,
}: {
  locale: QuestLocale;
  open: boolean;
  onClose: () => void;
  initialStep?: number;
  initialQuestKey?: string | null;
}) {
  const ui = QUEST_UI[locale];
  const validInitialKey = initialQuestKey && QUEST_BY_KEY[initialQuestKey] ? initialQuestKey : null;
  const [selectedKey, setSelectedKey] = useState<string | null>(validInitialKey);
  const quest = selectedKey ? QUEST_BY_KEY[selectedKey] : null;
  const [stageIndex, setStageIndex] = useState(() => Math.min(Math.max(initialStep, 0), STAGES.length - 1));

  const persisted = useMemo(() => quest ? readPersisted(quest) : {}, [open, quest?.id]);

  const [prediction, setPrediction] = useState<string | null>(null);
  const [memoryAnswer, setMemoryAnswer] = useState<string | null>(null);
  const [memoryChecked, setMemoryChecked] = useState(false);
  const [geoAnswer, setGeoAnswer] = useState<string | null>(null);
  const [geoChecked, setGeoChecked] = useState(false);
  const [detectiveAnswers, setDetectiveAnswers] = useState<Record<string, boolean>>({});
  const [revealedClues, setRevealedClues] = useState(1);
  const [whoAnswer, setWhoAnswer] = useState<string | null>(null);
  const [whoChecked, setWhoChecked] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);

  const resetInteraction = (selectedQuest: QuestDefinition) => {
    setPrediction(null);
    setMemoryAnswer(null);
    setMemoryChecked(false);
    setGeoAnswer(null);
    setGeoChecked(false);
    setDetectiveAnswers({});
    setRevealedClues(1);
    setWhoAnswer(null);
    setWhoChecked(false);
    setReflection(readPersisted(selectedQuest).reflection ?? null);
  };

  useEffect(() => {
    if (!open) return;
    if (validInitialKey) {
      const selectedQuest = QUEST_BY_KEY[validInitialKey];
      setSelectedKey(validInitialKey);
      setStageIndex(Math.min(Math.max(initialStep, 0), STAGES.length - 1));
      resetInteraction(selectedQuest);
      track('quest_open', { quest: selectedQuest.id, locale, step: initialStep });
    } else {
      setSelectedKey(null);
      setStageIndex(0);
      track('quest_open', { quest: 'hub', locale, step: 0 });
    }
  }, [initialQuestKey, initialStep, locale, open]);

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

  const openQuest = (key: string) => {
    const selectedQuest = QUEST_BY_KEY[key] ?? QUEST_BY_KEY[DEFAULT_QUEST_KEY];
    const saved = readPersisted(selectedQuest);
    resetInteraction(selectedQuest);
    setSelectedKey(selectedQuest.key);
    setStageIndex(saved.completed ? 0 : Math.min(saved.step ?? 0, STAGES.length - 2));
    track('quest_open', { quest: selectedQuest.id, locale, source: 'hub' });
  };

  const goHub = () => {
    setSelectedKey(null);
    setStageIndex(0);
    setPrediction(null);
    setMemoryAnswer(null);
    setGeoAnswer(null);
    setDetectiveAnswers({});
    setWhoAnswer(null);
  };

  if (!quest) {
    return (
      <QuestShell locale={locale} quest={null} stageIndex={0} onClose={onClose} onBack={goHub} onHub={goHub}>
        <QuestHub locale={locale} onSelect={openQuest} />
      </QuestShell>
    );
  }

  const stage = STAGES[stageIndex];
  const media = questMedia(quest);

  const next = () => {
    const nextStep = Math.min(stageIndex + 1, STAGES.length - 1);
    setStageIndex(nextStep);
    writePersisted(quest, { ...readPersisted(quest), step: nextStep, reflection: reflection ?? undefined });
    track('quest_step', { quest: quest.id, locale, step: nextStep, stage: STAGES[nextStep] });
  };

  const back = () => setStageIndex((current) => Math.max(0, current - 1));
  const memoryCorrect = memoryAnswer === quest.memory.correctId;
  const geoCorrect = geoAnswer === quest.geography.correctId;
  const detectiveComplete = quest.detective.claims.every((claim) => detectiveAnswers[claim.id] === claim.safe);
  const whoCorrect = whoAnswer === quest.who.correctId;

  const finish = () => {
    writePersisted(quest, { completed: true, step: STAGES.length - 1, reflection: reflection ?? undefined });
    track('quest_complete', { quest: quest.id, locale, reflection: reflection ?? 'none' });
    next();
  };

  return (
    <QuestShell
      locale={locale}
      quest={quest}
      stageIndex={stageIndex}
      onClose={onClose}
      onBack={back}
      onHub={goHub}
    >
      {stage === 'intro' && (
        <article className="quest-intro">
          <div className={`quest-intro-art ${media ? '' : 'quest-intro-art-fallback'}`}>
            {media ? (
              <>
                <img src={media.src} alt="" />
                <div className="quest-intro-shade" />
                <small>{media.source} · {media.license}</small>
              </>
            ) : (
              <div className="quest-symbolic-art">
                <GopuramIcon />
                <span>✦</span>
                <p>{locale === 'ta' ? 'நினைவின் வழியே ஒரு திருத்தலப் பயணம்' : 'A sacred journey through memory'}</p>
              </div>
            )}
            <div className="quest-intro-number">{quest.ordinal !== null ? String(quest.ordinal).padStart(2, '0') : '8'}</div>
            <div className="quest-intro-deepam" aria-hidden="true">✦</div>
          </div>
          <div className="quest-intro-copy">
            <EvidenceBadge locale={locale} quest={quest} />
            <span className="quest-kicker">
              {quest.registryKind === 'naalvar_companion'
                ? (locale === 'ta' ? 'நால்வர் · திருமுறை 8 துணை' : 'NAALVAR · TIRUMURAI 8 COMPANION')
                : (locale === 'ta' ? `நாயன்மார் ${quest.ordinal}` : `NAYANMAR ${String(quest.ordinal).padStart(2, '0')}`)}
            </span>
            <h1>{ql(locale, quest.title)}</h1>
            <p>{ql(locale, quest.subtitle)}</p>
            <div className="quest-source-note">
              <b>{ui.source}</b>
              <span>{ql(locale, quest.source.scope)}</span>
            </div>
            <div className="quest-intro-actions">
              <button className="quest-primary" onClick={() => {
                track('quest_start', { quest: quest.id, locale });
                next();
              }}>{persisted.completed ? ui.replay : ui.beginQuest} <i>→</i></button>
              <span>{ui.duration}</span>
            </div>
          </div>
        </article>
      )}

      {stage === 'prediction' && (
        <article className="quest-card-stage">
          <span className="quest-kicker">01 · {ui.prediction}</span>
          <h2>{ui.predictionTitle}</h2>
          <p className="quest-lead">{ql(locale, quest.prediction.prompt)}</p>
          <ChoiceGrid
            choices={quest.prediction.choices}
            locale={locale}
            selected={prediction}
            onSelect={(id) => {
              setPrediction(id);
              track('quest_answer', { quest: quest.id, stage: 'prediction', answer: id });
            }}
          />
          <p className="quest-gentle-note">{ui.predictionNote}</p>
          <button className="quest-primary" disabled={!prediction} onClick={next}>{ui.continue} <i>→</i></button>
        </article>
      )}

      {stage === 'story' && (
        <article className="quest-story-stage">
          <div className={`quest-story-art ${media ? '' : 'quest-story-art-fallback'}`}>
            {media ? (
              <>
                <img src={media.src} alt="" />
                <div />
              </>
            ) : (
              <div className="quest-symbolic-art">
                <GopuramIcon />
                <span>✦</span>
              </div>
            )}
          </div>
          <div className="quest-story-copy">
            <EvidenceBadge locale={locale} quest={quest} />
            <span className="quest-kicker">02 · {ui.story}</span>
            <h2>{ui.storyTitle}</h2>
            <p className="quest-story-text">{ql(locale, quest.story)}</p>
            <div className="quest-scope-box">
              <GopuramIcon />
              <p>{ql(locale, quest.source.scope)}</p>
            </div>
            <button className="quest-primary" onClick={next}>{ui.continue} <i>→</i></button>
          </div>
        </article>
      )}

      {stage === 'memory' && (
        <article className="quest-card-stage">
          <span className="quest-kicker">03 · {ui.memory}</span>
          <h2>{ui.memoryTitle}</h2>
          <h3 className="quest-question">{ql(locale, quest.memory.prompt)}</h3>
          <ChoiceGrid
            choices={quest.memory.choices}
            locale={locale}
            selected={memoryAnswer}
            onSelect={(id) => {
              setMemoryAnswer(id);
              setMemoryChecked(false);
            }}
            disabled={memoryChecked && memoryCorrect}
          />
          {memoryChecked && (
            <div className={`quest-feedback ${memoryCorrect ? 'correct' : 'retry'}`}>
              <b>{memoryCorrect ? ui.correct : ui.notQuite}</b>
              <p>{ql(locale, memoryCorrect ? quest.memory.correct : quest.memory.wrong)}</p>
            </div>
          )}
          {!memoryChecked || !memoryCorrect ? (
            <button className="quest-primary" disabled={!memoryAnswer} onClick={() => {
              setMemoryChecked(true);
              track('quest_answer', { quest: quest.id, stage: 'memory', answer: memoryAnswer, correct: memoryCorrect });
            }}>{ui.reveal}</button>
          ) : (
            <button className="quest-primary" onClick={next}>{ui.continue} <i>→</i></button>
          )}
        </article>
      )}

      {stage === 'geography' && (
        <article className="quest-card-stage">
          <span className="quest-kicker">04 · {ui.geography}</span>
          <h2>{ui.geographyTitle}</h2>
          <p className="quest-lead">{ql(locale, quest.geography.intro)}</p>
          <div className="quest-place-pair">
            <div>
              <GopuramIcon />
              <small>{ql(locale, quest.geography.leftLabel)}</small>
              <b>{ql(locale, quest.geography.leftValue)}</b>
            </div>
            <span>↔</span>
            <div>
              <GopuramIcon />
              <small>{ql(locale, quest.geography.rightLabel)}</small>
              <b>?</b>
            </div>
          </div>
          <h3 className="quest-question">{ql(locale, quest.geography.question)}</h3>
          <ChoiceGrid
            choices={quest.geography.choices}
            locale={locale}
            selected={geoAnswer}
            onSelect={(id) => {
              setGeoAnswer(id);
              setGeoChecked(false);
            }}
            disabled={geoChecked && geoCorrect}
          />
          {geoChecked && (
            <div className={`quest-feedback ${geoCorrect ? 'correct' : 'retry'}`}>
              <b>{geoCorrect ? ui.correct : ui.notQuite}</b>
              <p>{ql(locale, geoCorrect ? quest.geography.correct : quest.geography.wrong)}</p>
            </div>
          )}
          <p className="quest-gentle-note">{ql(locale, quest.geography.scope)}</p>
          {!geoChecked || !geoCorrect ? (
            <button className="quest-primary" disabled={!geoAnswer} onClick={() => {
              setGeoChecked(true);
              track('quest_answer', { quest: quest.id, stage: 'geography', answer: geoAnswer, correct: geoCorrect });
            }}>{ui.reveal}</button>
          ) : (
            <button className="quest-primary" onClick={next}>{ui.continue} <i>→</i></button>
          )}
        </article>
      )}

      {stage === 'detective' && (
        <article className="quest-card-stage detective">
          <span className="quest-kicker">05 · {ui.detective}</span>
          <h2>{ui.detectiveTitle}</h2>
          <p className="quest-lead">{ql(locale, quest.detective.intro)}</p>
          <h3 className="quest-question">{ui.detectivePrompt}</h3>
          <div className="detective-claims">
            {quest.detective.claims.map((claim, index) => {
              const answer = detectiveAnswers[claim.id];
              const isCorrect = answer === claim.safe;
              return (
                <div key={claim.id} className={`detective-claim ${answer === undefined ? '' : isCorrect ? 'correct' : 'wrong'}`}>
                  <span className="detective-index">{String(index + 1).padStart(2, '0')}</span>
                  <p>{ql(locale, claim.claim)}</p>
                  <div>
                    <button
                      className={answer === true ? 'selected' : ''}
                      onClick={() => {
                        setDetectiveAnswers((current) => ({ ...current, [claim.id]: true }));
                        track('quest_answer', { quest: quest.id, stage: 'detective', claim: claim.id, answer: true, correct: claim.safe === true });
                      }}
                    >{ui.supported}</button>
                    <button
                      className={answer === false ? 'selected' : ''}
                      onClick={() => {
                        setDetectiveAnswers((current) => ({ ...current, [claim.id]: false }));
                        track('quest_answer', { quest: quest.id, stage: 'detective', claim: claim.id, answer: false, correct: claim.safe === false });
                      }}
                    >{ui.notEstablished}</button>
                  </div>
                  {answer !== undefined && <small>{isCorrect ? '✓ ' : '↺ '}{ql(locale, claim.explanation)}</small>}
                </div>
              );
            })}
          </div>
          <button className="quest-primary" disabled={!detectiveComplete} onClick={next}>{ui.continue} <i>→</i></button>
        </article>
      )}

      {stage === 'who' && (
        <article className="quest-card-stage who-stage">
          <span className="quest-kicker">06 · {ui.who}</span>
          <h2>{ui.whoTitle}</h2>
          <p className="quest-lead">{ui.whoBody}</p>
          <div className="who-clues">
            {quest.who.clues.slice(0, revealedClues).map((clue, index) => (
              <div key={index}><span>{index + 1}</span><p>{ql(locale, clue)}</p></div>
            ))}
          </div>
          {revealedClues < quest.who.clues.length && !whoCorrect && (
            <button className="quest-secondary" onClick={() => setRevealedClues((value) => Math.min(value + 1, quest.who.clues.length))}>
              {ui.moreClue} +
            </button>
          )}
          <ChoiceGrid
            choices={quest.who.choices}
            locale={locale}
            selected={whoAnswer}
            onSelect={(id) => {
              setWhoAnswer(id);
              setWhoChecked(false);
            }}
            disabled={whoChecked && whoCorrect}
          />
          {whoChecked && (
            <div className={`quest-feedback ${whoCorrect ? 'correct' : 'retry'}`}>
              <b>{whoCorrect ? ui.correct : ui.notQuite}</b>
              <p>{ql(locale, whoCorrect ? quest.who.correct : quest.who.wrong)}</p>
            </div>
          )}
          {!whoChecked || !whoCorrect ? (
            <button className="quest-primary" disabled={!whoAnswer} onClick={() => {
              setWhoChecked(true);
              track('quest_answer', { quest: quest.id, stage: 'who', answer: whoAnswer, correct: whoCorrect, clues: revealedClues });
            }}>{ui.reveal}</button>
          ) : (
            <button className="quest-primary" onClick={next}>{ui.continue} <i>→</i></button>
          )}
        </article>
      )}

      {stage === 'reflection' && (
        <article className="quest-card-stage reflection-stage">
          <span className="quest-kicker">07 · {ui.reflection}</span>
          <h2>{ui.reflectionTitle}</h2>
          <p className="quest-lead">{ui.reflectionBody}</p>
          <ChoiceGrid
            choices={quest.reflection}
            locale={locale}
            selected={reflection}
            onSelect={(id) => {
              setReflection(id);
              writePersisted(quest, { ...readPersisted(quest), reflection: id });
            }}
          />
          <p className="quest-gentle-note">{ui.localOnly}</p>
          <button className="quest-primary" disabled={!reflection} onClick={finish}>
            {locale === 'ta' ? 'நினைவுச் சன்னதியைத் திற' : 'Unlock Memory Shrine'} <i>✦</i>
          </button>
        </article>
      )}

      {stage === 'complete' && (
        <article className="quest-complete">
          <div className="quest-deepam-large" aria-hidden="true">
            <span>✦</span>
            <i />
          </div>
          <span className="quest-kicker">{ui.shrine}</span>
          <h2>{ql(locale, quest.name)} · {locale === 'ta' ? 'நினைவில் பதிந்தது' : 'remembered'}</h2>
          <p className="quest-lead">{ui.shrineBody}</p>
          <div className="memory-shrine-card">
            <div className={`memory-shrine-art ${media ? '' : 'memory-shrine-art-fallback'}`}>
              {media ? <img src={media.src} alt="" /> : <div className="quest-symbolic-art"><GopuramIcon /><span>✦</span></div>}
              <span>{quest.ordinal !== null ? String(quest.ordinal).padStart(2, '0') : '8'}</span>
            </div>
            <div className="memory-shrine-copy">
              <small>{locale === 'ta' ? 'நினைவுச் சன்னதி' : 'MEMORY SHRINE'}</small>
              <h3>{ql(locale, quest.name)}</h3>
              <p>{ql(locale, quest.recap.story)}</p>
              <dl>
                <div><dt>{locale === 'ta' ? 'தலச் செய்தி' : 'Places / loci'}</dt><dd>{ql(locale, quest.recap.places)}</dd></div>
                <div><dt>{locale === 'ta' ? 'ஆதாரம்' : 'Source'}</dt><dd>{ql(locale, quest.recap.source)}</dd></div>
              </dl>
            </div>
          </div>
          <div className="quest-discovered">
            <b>
              {locale === 'ta'
                ? `63 நாயன்மார்களில் ${nayanmarCompletedCount()} பேரை அறிந்துகொண்டாய்`
                : `${nayanmarCompletedCount()} of 63 Nayanmars discovered`}
            </b>
            {manikkavasakarCompleted() && (
              <span>{locale === 'ta' ? 'மாணிக்கவாசகர் · நால்வர் துணை ✓' : 'Manikkavasakar · Naalvar companion ✓'}</span>
            )}
          </div>
          <div className="quest-complete-actions">
            <button className="quest-secondary" onClick={() => {
              resetInteraction(quest);
              setStageIndex(0);
              track('quest_replay', { quest: quest.id, locale });
            }}>{ui.replay}</button>
            <button className="quest-secondary" onClick={goHub}>{ui.backToQuests}</button>
            <button className="quest-primary" onClick={onClose}>{ui.backExplorer} <i>→</i></button>
          </div>
        </article>
      )}
    </QuestShell>
  );
}
