"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Compass,
  FileText,
  Globe,
  Heart,
  LibraryBig,
  Microscope,
  Play,
  Search,
  Share2,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { OrganViewer } from "./OrganViewer";
import type { OrganId } from "../lib/anatomy-data";
import type { LocaleConfig } from "../i18n/config";
import { locales } from "../i18n/config";
import { buildOrgans, indexOrgans, type Organ } from "../i18n/merge";
import { format, type Dictionary, type UiDictionary } from "../i18n/types";
import { basePath, withBasePath } from "../lib/base-path";

type Panel = "systems" | "library" | null;

function fallbackCompare(id: OrganId): OrganId {
  return id === "heart" ? "brain" : "heart";
}

function organHaystack(item: Organ) {
  return [
    item.name,
    item.system,
    item.poetic,
    item.description,
    item.function,
    item.tissue,
    item.location,
    item.medical,
    item.funFact,
    ...item.conditions,
    ...item.hotspots.flatMap((hotspot) => [hotspot.label, hotspot.detail]),
  ].join(" ");
}

function groupBySystem(organs: Organ[]) {
  const groups: { system: string; organs: Organ[] }[] = [];
  const index = new Map<string, Organ[]>();
  for (const organ of organs) {
    let list = index.get(organ.system);
    if (!list) {
      list = [];
      index.set(organ.system, list);
      groups.push({ system: organ.system, organs: list });
    }
    list.push(organ);
  }
  return groups;
}

/**
 * Renders an organ illustration, or its accent glyph for organs that ship as a
 * 3D model without the painted asset set. Keeps every image slot filled instead
 * of leaving a broken `<img>` behind.
 */
function OrganArt({
  organ,
  asset,
  alt,
  size,
}: {
  organ: Organ;
  asset: "thumb" | "organ" | "microscopic" | "compare" | "location";
  alt: string;
  size?: number;
}) {
  if (!organ.illustrated) {
    // An empty alt means a surrounding control already names this, so the
    // glyph should be skipped rather than announced with no label.
    const labelling = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
    return (
      <span className="art-fallback" style={{ "--art-accent": organ.accent } as React.CSSProperties} {...labelling}>
        {organ.icon}
      </span>
    );
  }
  return (
    <img
      key={`${organ.id}-${asset}`}
      src={withBasePath(`/anatomy/${organ.id}/${asset}.webp`)}
      alt={alt}
      width={size}
      height={size}
      loading={asset === "thumb" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}


/**
 * Measurements like "250–350 g" begin with a digit, which Unicode treats as
 * neutral — inside an RTL paragraph the range gets visually reversed. Digits
 * are not "strong" characters, so `unicode-bidi: plaintext` cannot rescue it;
 * the run has to be isolated as LTR explicitly.
 */
function Measure({ children }: { children: string }) {
  return <bdi dir={/^[\d(]/.test(children.trim()) ? "ltr" : "auto"}>{children}</bdi>;
}

/**
 * Switches language by swapping the leading path segment, so the current
 * document is preserved rather than bouncing through the root redirect.
 *
 * The native <select> is stretched transparently over the whole pill rather
 * than sitting inline. A <label> only *focuses* a select when clicked — it does
 * not open it — so anything outside the select's own box (the globe, the
 * chevron, the padding) would otherwise be a dead zone. Overlaying it means a
 * click anywhere on the control opens the picker, while the visible row
 * underneath stays fully styleable.
 */
function LanguageSwitcher({ locale, t }: { locale: LocaleConfig; t: UiDictionary }) {
  return (
    <div className="language-switcher" title={t.language.label}>
      <Globe size={16} aria-hidden />
      <span className="language-current">{locale.nativeName}</span>
      <ChevronDown size={14} aria-hidden />
      <select
        aria-label={t.language.choose}
        value={locale.code}
        onChange={(event) => {
          window.location.pathname = withBasePath(
            `/${event.target.value}${basePath ? "/" : ""}`,
          );
        }}
      >
        {locales.map((entry) => (
          <option key={entry.code} value={entry.code} lang={entry.code}>
            {entry.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AnatomyApp({ locale, dictionary }: { locale: LocaleConfig; dictionary: Dictionary }) {
  const t = dictionary.ui;
  const organs = useMemo(() => buildOrgans(dictionary.organs), [dictionary.organs]);
  const organById = useMemo(() => indexOrgans(organs), [organs]);

  const [organId, setOrganId] = useState<OrganId>("heart");
  const [autoRotate, setAutoRotate] = useState(true);
  const [compareId, setCompareId] = useState<OrganId | null>(null);
  const [pickingCompare, setPickingCompare] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [mobileLibrary, setMobileLibrary] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [lessonActive, setLessonActive] = useState(false);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefetched = useRef(new Set<OrganId>());
  const organ = organById[organId];
  const reference = compareId && compareId !== organId ? organById[compareId] : null;
  const filteredOrgans = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale.code);
    if (!needle) return organs;
    return organs.filter((item) => organHaystack(item).toLocaleLowerCase(locale.code).includes(needle));
  }, [organs, query, locale.code]);
  const allSystemGroups = useMemo(() => groupBySystem(organs), [organs]);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(contentRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.48, stagger: 0.035, ease: "power2.out", overwrite: true },
    );
  }, [organId]);

  const selectOrgan = (id: OrganId) => {
    if (organById[id].illustrated) {
      ["organ", "microscopic", "compare", "location"].forEach((asset) => {
        const image = new Image();
        image.src = withBasePath(`/anatomy/${id}/${asset}.webp`);
      });
    }
    setOrganId(id);
    setMobileLibrary(false);
    setPanel(null);
    setQuizActive(false);
    setLessonActive(false);
    setAnimating(false);
    setPickingCompare(false);
    if (compareId === id) setCompareId(fallbackCompare(id));
  };

  // Warms the model in the HTTP cache while the pointer is still travelling,
  // so the switch usually renders without a visible loading pass.
  const prefetchOrgan = (id: OrganId) => {
    if (id === organId || prefetched.current.has(id)) return;
    prefetched.current.add(id);
    void fetch(withBasePath(organById[id].model), { priority: "low" } as RequestInit).catch(() => {});
  };

  const openExplore = () => {
    setPanel(null);
    setLessonActive(false);
    setAnimating(false);
  };

  const startLesson = () => {
    setPanel(null);
    setQuizActive(false);
    setAnimating(false);
    setLessonActive(true);
  };

  const startQuiz = () => {
    setPanel(null);
    setLessonActive(false);
    setAnimating(false);
    setQuizActive(true);
  };

  const startAnimation = () => {
    setPanel(null);
    setQuizActive(false);
    setLessonActive(false);
    setAnimating(true);
  };

  const toggleCompare = () => {
    setPickingCompare(false);
    setCompareId((current) => (current ? null : fallbackCompare(organId)));
  };

  const nav = panel === "systems" ? "systems" : panel === "library" ? "library" : lessonActive ? "lessons" : "explore";

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => { selectOrgan("heart"); openExplore(); }} aria-label={t.brand.home}>
          <strong>Anatomy Atelier<sup>✦</sup></strong>
          <em>{t.brand.tagline}</em>
        </button>
        <nav className="main-nav" aria-label="Primary navigation">
          <button type="button" className={nav === "explore" ? "active" : ""} onClick={openExplore}>
            <Compass size={17} /> {t.nav.explore}
          </button>
          <button type="button" className={nav === "systems" ? "active" : ""} onClick={() => setPanel(panel === "systems" ? null : "systems")}>
            <BrainCircuit size={17} /> {t.nav.systems}
          </button>
          <button type="button" className={nav === "lessons" ? "active" : ""} onClick={startLesson}>
            <BookOpen size={17} /> {t.nav.lessons}
          </button>
          <button type="button" className={nav === "library" ? "active" : ""} onClick={() => setPanel(panel === "library" ? null : "library")}>
            <LibraryBig size={17} /> {t.nav.library}
          </button>
        </nav>
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search.placeholder} />
        </label>
        <LanguageSwitcher locale={locale} t={t} />
        <button className="mobile-library-trigger" onClick={() => setMobileLibrary(true)} aria-label={t.library.open}><LibraryBig size={20} /></button>
      </header>

      <div className="workspace">
        <aside className={`organ-library ${mobileLibrary ? "open" : ""}`}>
          <div className="panel-heading">
            <span>{t.library.title}</span>
            <button aria-label={t.library.close} className="mobile-close" onClick={() => setMobileLibrary(false)}><X size={17} /></button>
          </div>
          <div className="organ-list">
            {filteredOrgans.length === 0 && <p className="search-empty">{t.search.empty}</p>}
            {filteredOrgans.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`organ-item ${organId === item.id ? "active" : ""}`}
                onClick={() => selectOrgan(item.id)}
                onPointerEnter={() => prefetchOrgan(item.id)}
                onFocus={() => prefetchOrgan(item.id)}
                style={{ "--item-accent": item.accent } as React.CSSProperties}
              >
                <span className="organ-glyph">
                  <OrganArt organ={item} asset="thumb" alt="" size={47} />
                </span>
                <span><b>{item.name}</b><small>{item.system}</small></span>
              </button>
            ))}
          </div>
          <button className="view-all" onClick={() => { setQuery(""); setPanel("library"); }}>{t.library.viewAll} <ArrowRight size={14} /></button>
          <blockquote>
            <Sparkles size={18} />
            <p>{t.library.quoteLine1}<br />{t.library.quoteLine2}</p>
            <em>{t.library.quoteSign}</em>
          </blockquote>
        </aside>

        <OrganViewer
          organ={organ}
          t={t}
          autoRotate={autoRotate}
          onAutoRotate={setAutoRotate}
          compare={Boolean(reference)}
          onCompare={toggleCompare}
          quizActive={quizActive}
          onQuizExit={() => setQuizActive(false)}
          lessonActive={lessonActive}
          onLessonExit={() => setLessonActive(false)}
          animating={animating}
          onAnimateStop={() => setAnimating(false)}
        />

        <aside className="info-panel" ref={contentRef}>
          <div className="info-kicker" data-reveal><Heart size={13} fill="currentColor" /> {format(t.info.kicker, { organ: organ.name })}</div>
          <div className="info-title-row" data-reveal>
            <div><h1>{organ.name}</h1><em>{organ.poetic}</em></div>
            <span className="specimen-stamp">
              <OrganArt organ={organ} asset="organ" alt="" size={92} />
            </span>
          </div>
          <p className="description" data-reveal>{organ.description}</p>
          <div className="rule" />
          <h2 data-reveal>{t.info.keyFacts}</h2>
          <dl className="key-facts">
            <div data-reveal><dt><span>◇</span> {t.info.size}</dt><dd><Measure>{organ.size}</Measure></dd></div>
            <div data-reveal><dt><span>♙</span> {t.info.weight}</dt><dd><Measure>{organ.weight}</Measure></dd></div>
            <div data-reveal><dt><span>⌁</span> {t.info.daily}</dt><dd><Measure>{organ.dailyFact}</Measure></dd></div>
            <div data-reveal><dt><span>⌖</span> {t.info.location}</dt><dd><Measure>{organ.location}</Measure></dd></div>
            <div data-reveal><dt><span>❋</span> {t.info.bloodSupply}</dt><dd><Measure>{organ.bloodSupply}</Measure></dd></div>
            <div data-reveal><dt><span>◈</span> {t.info.function}</dt><dd><Measure>{organ.function}</Measure></dd></div>
          </dl>
          <div className="medical-note" data-reveal><Stethoscope size={16} /><p><b>{t.info.medical}</b>{organ.medical}</p></div>
          <div className="fun-note" data-reveal><Sparkles size={15} /><p><b>{t.info.didYouKnow}</b>{organ.funFact}</p></div>
          <button className="lesson-button" data-reveal onClick={startLesson}>{t.info.viewLesson} <ArrowRight size={16} /></button>
          <div className="action-grid" data-reveal>
            <button onClick={startAnimation} className={animating ? "active" : ""}><Play size={15} /> {t.info.animate}</button>
            <button onClick={startQuiz} className={quizActive ? "active" : ""}><CircleHelp size={15} /> {t.info.quiz}</button>
            <button onClick={toggleCompare} className={reference ? "active" : ""}><Share2 size={15} /> {t.info.compare}</button>
          </div>
        </aside>
      </div>

      {reference && (
        <section className="compare-strip" aria-label={t.compare.title}>
          <div className="compare-organ">
            <OrganArt organ={organ} asset="thumb" alt="" />
            <span>{t.compare.comparing}</span>
            <strong>{organ.name}</strong>
            <small>{organ.system}</small>
          </div>
          <b>{t.compare.vs}</b>
          <div className="compare-organ compare-reference">
            <button type="button" className="compare-pick" onClick={() => setPickingCompare((open) => !open)} aria-expanded={pickingCompare} aria-haspopup="listbox">
              <OrganArt organ={reference} asset="thumb" alt="" />
              <span>{t.compare.reference}</span>
              <strong>{reference.name}</strong>
              <small>{t.compare.pick}</small>
            </button>
            {pickingCompare && (
              <ul className="compare-picker" role="listbox" aria-label={t.compare.choose}>
                {organs.filter((item) => item.id !== organId).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={item.id === reference.id ? "active" : ""}
                      onClick={() => { setCompareId(item.id); setPickingCompare(false); }}
                    >
                      <OrganArt organ={item} asset="thumb" alt="" size={28} />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <dl>
            <div><dt>{organ.name}</dt><dd><Measure>{organ.function}</Measure></dd></div>
            <div><dt>{reference.name}</dt><dd><Measure>{reference.function}</Measure></dd></div>
          </dl>
          <button onClick={() => { setCompareId(null); setPickingCompare(false); }} aria-label={t.compare.close}><X size={16} /></button>
        </section>
      )}

      <section className="learning-cards" aria-label={format(t.cards.resources, { organ: organ.name })}>
        <article className="curiosity-card">
          <span>✿</span><p>{t.library.quoteLine1}<br />{t.library.quoteLine2}</p><em>{t.library.quoteSign}</em>
        </article>
        <article>
          <header><div><em>{t.cards.microscopic}</em><h3>{organ.tissue}</h3></div><Microscope size={17} /></header>
          <div className="microscope-visual organ-card-image"><OrganArt organ={organ} asset="microscopic" alt="" /></div>
          <button onClick={startLesson}>{t.cards.exploreTissue} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t.cards.compareOrgans}</em><h3>{organ.comparison}</h3></div><Share2 size={17} /></header>
          <div className="comparison-visual organ-card-image"><OrganArt organ={organ} asset="compare" alt="" /></div>
          <button onClick={() => setCompareId(fallbackCompare(organId))}>{t.cards.openComparison} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t.cards.functionAnimation}</em><h3>{organ.function}</h3></div><Play size={17} /></header>
          {/* The artwork itself is the control, so the play badge inside it is
              decorative rather than a nested button. */}
          <button
            type="button"
            className="function-visual organ-card-image"
            onClick={startAnimation}
            aria-label={format(t.cards.playAria, { organ: organ.name })}
          >
            <OrganArt organ={organ} asset="organ" alt="" />
            <i className="function-pulse" />
            <span className="play-badge"><Play size={18} fill="currentColor" /></span>
          </button>
          <button onClick={startAnimation}>{t.cards.playAnimation} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t.cards.clinicalNotes}</em><h3>{t.cards.commonConditions}</h3></div><FileText size={17} /></header>
          <ul>{organ.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
          <button onClick={startLesson}>{t.cards.seeAll} <ArrowRight size={14} /></button>
        </article>
        <article className="system-card">
          <header><div><em>{t.cards.whereItWorks}</em><h3>{organ.system}</h3></div><BrainCircuit size={17} /></header>
          <button
            type="button"
            className="system-visual organ-card-image"
            onClick={() => setPanel("systems")}
            aria-label={format(t.cards.systemAria, { organ: organ.name })}
          >
            <OrganArt organ={organ} asset="location" alt="" />
          </button>
          <button onClick={() => setPanel("systems")}>{t.cards.seeSystem} <ArrowRight size={14} /></button>
        </article>
      </section>

      {panel && (
        <BrowseOverlay
          kind={panel}
          t={t}
          organ={organ}
          groups={allSystemGroups}
          organs={organs}
          empty={false}
          onSelect={selectOrgan}
          onPrefetch={prefetchOrgan}
          onClose={() => setPanel(null)}
        />
      )}
      {mobileLibrary && <button className="drawer-backdrop" aria-label={t.library.close} onClick={() => setMobileLibrary(false)} />}
    </main>
  );
}

function BrowseOverlay({
  kind, t, organ, groups, organs, empty, onSelect, onPrefetch, onClose,
}: {
  kind: Exclude<Panel, null>;
  t: UiDictionary;
  organ: Organ;
  groups: { system: string; organs: Organ[] }[];
  organs: Organ[];
  empty: boolean;
  onSelect: (id: OrganId) => void;
  onPrefetch: (id: OrganId) => void;
  onClose: () => void;
}) {
  const title = kind === "systems" ? t.nav.systems : t.nav.library;
  const lead = kind === "systems" ? t.browse.systemsLead : t.browse.libraryLead;

  return (
    <div className="modal-backdrop browse-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="browse-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="browse-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t.modal.close}><X size={18} /></button>
        <em>{t.modal.guided}</em>
        <h2 id="browse-title">{title}</h2>
        <p>{lead}</p>
        {empty && <p className="search-empty">{t.search.empty}</p>}
        {kind === "systems" ? groups.map((group) => {
          const featured = group.organs.find((item) => item.id === organ.id);
          return (
            <section key={group.system} className="system-group">
              <header>
                <div>
                  <h3>{group.system}</h3>
                  {featured && <p>{featured.location}</p>}
                </div>
                {featured && (
                  <span className="system-group-art">
                    <OrganArt organ={featured} asset="location" alt="" />
                  </span>
                )}
              </header>
              <div className="catalog-grid">
                {group.organs.map((item) => (
                  <CatalogCard
                    key={item.id}
                    organ={item}
                    active={item.id === organ.id}
                    onSelect={onSelect}
                    onPrefetch={onPrefetch}
                  />
                ))}
              </div>
            </section>
          );
        }) : (
          <div className="catalog-grid">
            {organs.map((item) => (
              <CatalogCard
                key={item.id}
                organ={item}
                active={item.id === organ.id}
                onSelect={onSelect}
                onPrefetch={onPrefetch}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CatalogCard({
  organ, active, onSelect, onPrefetch,
}: {
  organ: Organ;
  active: boolean;
  onSelect: (id: OrganId) => void;
  onPrefetch: (id: OrganId) => void;
}) {
  return (
    <button
      type="button"
      className={`catalog-card ${active ? "active" : ""}`}
      onClick={() => onSelect(organ.id)}
      onPointerEnter={() => onPrefetch(organ.id)}
      onFocus={() => onPrefetch(organ.id)}
      style={{ "--item-accent": organ.accent } as React.CSSProperties}
    >
      <span className="catalog-art">
        <OrganArt organ={organ} asset="thumb" alt="" />
      </span>
      <b>{organ.name}</b>
      <small>{organ.system}</small>
    </button>
  );
}
