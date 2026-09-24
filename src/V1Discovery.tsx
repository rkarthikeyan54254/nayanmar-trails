import { useEffect, type CSSProperties } from 'react';
import GopuramIcon from './GopuramIcon';
import type { Saint, Site } from './types';
import type { Locale } from './i18n';
import { absoluteUrl, saintPath, sitePath, storyPath } from './publicRoutes';
import { track } from './analytics';
import { DISCOVERY_MEDIA } from './media';

type StoryItem = {
  saint: Saint;
  name: string;
  hook: string;
};

type SiteItem = {
  site: Site;
  name: string;
};

function cardMediaStyle(kind: keyof typeof DISCOVERY_MEDIA): CSSProperties {
  return { '--start-card-image': `url("${DISCOVERY_MEDIA[kind].src}")` } as CSSProperties;
}

function CardMediaCredit({ kind }: { kind: keyof typeof DISCOVERY_MEDIA }) {
  const media = DISCOVERY_MEDIA[kind];
  return <span className="start-card-credit">{media.source} · {media.license}</span>;
}

export function ShareButton({
  label,
  title,
  path,
  kind,
}: {
  label: string;
  title: string;
  path: string;
  kind: 'saint' | 'story' | 'sthalam';
}) {
  const share = async () => {
    const url = absoluteUrl(path);
    track('share', { kind });
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancellation or unsupported target: clipboard fallback below.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <button className="share-action" onClick={share} type="button">
      {label}
    </button>
  );
}

export function StartHere({
  locale,
  stories,
  sites,
  onSaint,
  onStory,
  onSite,
  onTrail,
}: {
  locale: Locale;
  stories: StoryItem[];
  sites: SiteItem[];
  onSaint: (saint: Saint) => void;
  onStory: (saint: Saint) => void;
  onSite: (site: Site) => void;
  onTrail: () => void;
}) {
  const leadStory = stories[0];
  const leadSaint = stories[1] ?? stories[0];
  const leadSite = sites[0];

  useEffect(() => {
    track('start_here_view');
  }, []);

  return (
    <section className="start-here" aria-label={locale === 'ta' ? 'இங்கிருந்து தொடங்குங்கள்' : 'Start here'}>
      <header className="start-here-head">
        <div>
          <small>{locale === 'ta' ? 'முதல் முறையா?' : 'NEW TO THE NAYANMARS?'}</small>
          <h2>{locale === 'ta' ? 'இங்கிருந்து தொடங்குங்கள்' : 'Start with a story, a saint, or a place'}</h2>
        </div>
        <p>
          {locale === 'ta'
            ? 'ஒரு கதையிலிருந்து தொடங்கலாம். அங்கிருந்து திருத்தலம், பாடல், ஆதாரம் என்று விரியட்டும்.'
            : 'Begin with one memorable story. From there, follow the places, hymns and evidence.'}
        </p>
      </header>

      <div className="start-here-grid">
        {leadStory && (
          <button
            className="start-card story with-media media-story"
            style={cardMediaStyle('story')}
            onClick={() => {
              track('start_here_action', { action: 'story', saint: leadStory.saint.id });
              onStory(leadStory.saint);
            }}
          >
            <span className="start-card-icon">✦</span>
            <small>{locale === 'ta' ? 'ஒரு கதையுடன் தொடங்கு' : 'START WITH A STORY'}</small>
            <b>{leadStory.name}</b>
            <p>{leadStory.hook}</p>
            <em>{locale === 'ta' ? 'கதையை வாசிக்க →' : 'Read the story →'}</em>
            <CardMediaCredit kind="story" />
          </button>
        )}

        {leadSaint && (
          <button
            className="start-card with-media media-saint"
            style={cardMediaStyle('saint')}
            onClick={() => {
              track('start_here_action', { action: 'saint', saint: leadSaint.saint.id });
              onSaint(leadSaint.saint);
            }}
          >
            <span className="start-card-icon"><GopuramIcon /></span>
            <small>{locale === 'ta' ? 'ஒரு நாயன்மாரை அறிந்து கொள்' : 'MEET A NAYANMAR'}</small>
            <b>{leadSaint.name}</b>
            <p>
              {locale === 'ta'
                ? 'கதை, தொடர்புடைய திருத்தலங்கள், தேவாரச் சான்றுகள்—அனைத்தையும் ஒரே இடத்தில் பாருங்கள்.'
                : 'See the story, connected sthalams and the evidence trail together.'}
            </p>
            <em>{locale === 'ta' ? 'அறிந்து கொள் →' : 'Meet the saint →'}</em>
            <CardMediaCredit kind="saint" />
          </button>
        )}

        {leadSite && (
          <button
            className="start-card with-media media-sthalam"
            style={cardMediaStyle('sthalam')}
            onClick={() => {
              track('start_here_action', { action: 'sthalam', site: leadSite.site.site_id });
              onSite(leadSite.site);
            }}
          >
            <span className="start-card-icon"><GopuramIcon /></span>
            <small>{locale === 'ta' ? 'ஒரு திருத்தலத்தைத் திற' : 'EXPLORE A STHALAM'}</small>
            <b>{leadSite.name}</b>
            <p>
              {locale === 'ta'
                ? 'இந்தத் தலத்தை யார் பாடினர்? எத்தனை பதிகங்கள்? எந்த ஆதாரம்? நேராகத் தலத்திற்குச் செல்லுங்கள்.'
                : 'Who sang here? Which pathigams are linked? Open the place and follow the sources.'}
            </p>
            <em>{locale === 'ta' ? 'திருத்தலத்தைப் பார்க்க →' : 'Open the sthalam →'}</em>
            <CardMediaCredit kind="sthalam" />
          </button>
        )}

        <button
          className="start-card trail with-media media-trail"
          style={cardMediaStyle('trail')}
          onClick={() => {
            track('start_here_action', { action: 'trail' });
            onTrail();
          }}
        >
          <span className="start-card-icon">⌁</span>
          <small>{locale === 'ta' ? 'ஒரு பாதையைப் பின்தொடர்' : 'FOLLOW A TRAIL'}</small>
          <b>{locale === 'ta' ? 'அப்பருடன் தொடங்குங்கள்' : 'Begin with Appar'}</b>
          <p>
            {locale === 'ta'
              ? 'பாடல் பெற்ற திருத்தலங்கள் வரைபடத்தில் எப்படி இணைகின்றன என்பதைப் பாருங்கள்.'
              : 'Move through the mapped Tēvāram-linked sthalams and see how the sacred geography connects.'}
          </p>
          <em>{locale === 'ta' ? 'பாதையைத் திற →' : 'Open the trail →'}</em>
          <CardMediaCredit kind="trail" />
        </button>
      </div>
    </section>
  );
}

export function StoryFocus({
  locale,
  saint,
  englishName,
  displayName,
  hook,
  sites,
  onClose,
  onExploreSaint,
  onOpenSite,
}: {
  locale: Locale;
  saint: Saint;
  englishName: string;
  displayName: string;
  hook: string;
  sites: SiteItem[];
  onClose: () => void;
  onExploreSaint: () => void;
  onOpenSite: (site: Site) => void;
}) {
  useEffect(() => {
    track('story_open', { saint: saint.id });
  }, [saint.id]);

  return (
    <div className="story-focus-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <article className="story-focus" role="dialog" aria-modal="true" aria-label={displayName}>
        <button className="story-focus-close" onClick={onClose} aria-label={locale === 'ta' ? 'மூடு' : 'Close'}>×</button>
        <div className="story-focus-kicker">
          <GopuramIcon />
          <span>{locale === 'ta' ? 'பெரியபுராண மரபிலிருந்து' : 'A story from Periya Puranam tradition'}</span>
        </div>
        <h1>{displayName}</h1>
        <p className="story-focus-hook">{hook}</p>
        <div className="story-focus-scope">
          {locale === 'ta'
            ? 'இது பெரியபுராண மரபில் வரும் கதை. தனித்த வரலாற்றுச் சான்றாக இதைக் கொள்ள வேண்டாம்.'
            : 'Traditional narrative. It is not presented as independently verified historical biography.'}
        </div>

        {sites.length > 0 && (
          <section className="story-focus-sites">
            <small>{locale === 'ta' ? 'தொடர்புடைய திருத்தலங்கள்' : 'PLACES TO EXPLORE NEXT'}</small>
            <div>
              {sites.slice(0, 3).map(({ site, name }) => (
                <button key={site.id} onClick={() => onOpenSite(site)}>
                  <GopuramIcon />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <footer>
          <button className="story-primary" onClick={onExploreSaint}>
            {locale === 'ta' ? 'இந்த நாயன்மாரின் முழுப் பாதையைப் பாருங்கள்' : 'Explore this Nayanmar'}
          </button>
          <ShareButton
            label={locale === 'ta' ? 'பகிர்' : 'Share'}
            title={displayName}
            path={storyPath(locale, saint, englishName)}
            kind="story"
          />
          <a className="story-canonical-link" href={saintPath(locale, saint, englishName)}>
            {locale === 'ta' ? 'நாயன்மார் பக்கம்' : 'Saint page'}
          </a>
        </footer>
      </article>
    </div>
  );
}

export function SaintShare({
  locale,
  saint,
  englishName,
  displayName,
}: {
  locale: Locale;
  saint: Saint;
  englishName: string;
  displayName: string;
}) {
  return (
    <ShareButton
      label={locale === 'ta' ? 'இந்தப் பக்கத்தைப் பகிர்' : 'Share saint'}
      title={displayName}
      path={saintPath(locale, saint, englishName)}
      kind="saint"
    />
  );
}

export function SiteShare({
  locale,
  site,
  displayName,
}: {
  locale: Locale;
  site: Site;
  displayName: string;
}) {
  return (
    <ShareButton
      label={locale === 'ta' ? 'திருத்தலத்தைப் பகிர்' : 'Share sthalam'}
      title={displayName}
      path={sitePath(locale, site)}
      kind="sthalam"
    />
  );
}
