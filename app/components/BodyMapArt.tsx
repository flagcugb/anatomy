import type { BodyLandmarkId } from "../lib/body-map";
import type { OrganId } from "../lib/anatomy-data";

/** Anterior silhouette — picture-left is anatomical right. */
export const BODY_SILHOUETTE =
  "M234 116 C230 128 214 138 186 146 C148 156 118 170 108 198 C96 236 90 286 88 338 C86 380 92 418 106 448 C114 462 132 464 142 450 C150 434 152 396 156 352 C160 306 166 262 176 226 C180 250 182 308 184 368 C186 430 178 492 168 540 C156 592 150 640 162 682 C172 710 202 716 226 704 C246 694 254 658 256 616 C258 576 259 546 260 536 C261 546 262 576 264 616 C266 658 274 694 294 704 C318 716 348 710 358 682 C370 640 364 592 352 540 C342 492 334 430 336 368 C338 308 340 250 344 226 C354 262 360 306 364 352 C368 396 370 434 378 450 C388 464 406 462 414 448 C428 418 434 380 432 338 C430 286 424 236 412 198 C402 170 372 156 334 146 C306 138 290 128 286 116 C278 108 270 112 260 112 C250 112 242 108 234 116 Z";

type ArtProps = {
  clipId: string;
  currentId: OrganId;
  selectedId: BodyLandmarkId;
  hoveredId: BodyLandmarkId | null;
  onActivate: (id: BodyLandmarkId) => void;
  onHover: (id: BodyLandmarkId | null) => void;
};

function markClass(
  id: BodyLandmarkId,
  organId: OrganId | undefined,
  currentId: OrganId,
  selectedId: BodyLandmarkId,
  hoveredId: BodyLandmarkId | null,
) {
  const current = organId === currentId;
  const selected = id === selectedId;
  const dim = hoveredId !== null && hoveredId !== id && !selected && !current;
  return `body-map-mark${current ? " is-current" : ""}${selected ? " is-selected" : ""}${dim ? " is-dim" : ""}`;
}

export function BodyMapArt({
  clipId,
  currentId,
  selectedId,
  hoveredId,
  onActivate,
  onHover,
}: ArtProps) {
  const bind = (id: BodyLandmarkId, organId?: OrganId) => ({
    className: markClass(id, organId, currentId, selectedId, hoveredId),
    onClick: () => onActivate(id),
    onPointerEnter: () => onHover(id),
    onPointerLeave: () => onHover(null),
  });

  const skinOn = selectedId === "skin" || currentId === "skin";

  return (
    <>
      <defs>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7dcc4" />
          <stop offset="45%" stopColor="#e8c2a4" />
          <stop offset="100%" stopColor="#d9ae90" />
        </linearGradient>
        <radialGradient id="lungGrad" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#f0b5a6" />
          <stop offset="55%" stopColor="#de8f80" />
          <stop offset="100%" stopColor="#c56f64" />
        </radialGradient>
        <radialGradient id="heartGrad" cx="42%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e06a5c" />
          <stop offset="50%" stopColor="#c4453c" />
          <stop offset="100%" stopColor="#9e2f2c" />
        </radialGradient>
        <radialGradient id="liverGrad" cx="30%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#c07a68" />
          <stop offset="50%" stopColor="#a05646" />
          <stop offset="100%" stopColor="#7e3e36" />
        </radialGradient>
        <radialGradient id="stomachGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ebb5a6" />
          <stop offset="60%" stopColor="#d49282" />
          <stop offset="100%" stopColor="#bc7a6c" />
        </radialGradient>
        <radialGradient id="colonGrad" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ddc09a" />
          <stop offset="55%" stopColor="#c4a07a" />
          <stop offset="100%" stopColor="#a88462" />
        </radialGradient>
        <radialGradient id="gutGrad" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f0c4b4" />
          <stop offset="60%" stopColor="#e0a494" />
          <stop offset="100%" stopColor="#cc8a7c" />
        </radialGradient>
        <radialGradient id="brainGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e8b8be" />
          <stop offset="100%" stopColor="#c48a96" />
        </radialGradient>
        <radialGradient id="kidneyGrad" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#d08078" />
          <stop offset="100%" stopColor="#a85852" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d={BODY_SILHOUETTE} />
        </clipPath>
        <clipPath id={`${clipId}-skull`}>
          <path d="M222 22 C228 8 244 4 260 4 C276 4 292 8 298 22 C306 40 302 62 292 70 L228 70 C218 62 214 40 222 22 Z" />
        </clipPath>
      </defs>

      <g className={`body-map-figure-skin${skinOn ? " is-selected" : ""}`}>
        <path className="body-map-hair" d="M216 50 C206 16 228 2 260 4 C292 2 314 16 304 50 C312 72 304 96 290 106 L278 92 C288 84 294 66 288 46 C280 22 270 16 260 16 C250 16 240 22 232 46 C226 66 232 84 242 92 L230 106 C216 96 208 72 216 50 Z" />
        <ellipse className="body-map-ear" cx="216" cy="78" rx="8" ry="12" />
        <ellipse className="body-map-ear" cx="304" cy="78" rx="8" ry="12" />
        <ellipse className="body-map-face" cx="260" cy="72" rx="42" ry="52" />
        <path className="body-map-skin-fill" d={BODY_SILHOUETTE} />
        <path className="body-map-neck-shade" d="M244 112 C246 128 248 140 250 148 L270 148 C272 140 274 128 276 112 C270 110 250 110 244 112 Z" />
        <path className="body-map-clavicle" d="M186 156 C210 150 238 148 258 154" />
        <path className="body-map-clavicle" d="M334 156 C310 150 282 148 262 154" />
      </g>

      <g clipPath={`url(#${clipId})`} className="body-map-organs">
        <g {...bind("skin", "skin")}>
          <path d="M112 186 C104 210 102 240 108 268 C118 252 126 228 132 204 C128 190 120 180 112 186 Z" fill="#e0b090" opacity=".55" />
        </g>

        <g {...bind("right-kidney", "kidneys")}>
          <path fill="url(#kidneyGrad)" d="M158 338 C144 346 140 366 150 384 C160 400 182 402 192 388 C202 374 198 352 186 340 C176 330 166 330 158 338 Z" />
        </g>
        <g {...bind("left-kidney", "kidneys")}>
          <path fill="url(#kidneyGrad)" d="M362 338 C354 330 344 330 334 340 C322 352 318 374 328 388 C338 402 360 400 370 384 C380 366 376 346 362 338 Z" />
        </g>

        <g {...bind("pancreas", "pancreas")}>
          <path fill="#d9c48a" stroke="#b89a62" strokeWidth="1" d="M214 348 C232 338 258 336 284 340 C310 344 332 352 346 348 C352 346 352 356 342 360 C318 368 286 360 256 356 C232 354 214 358 214 348 Z" />
        </g>

        <g {...bind("liver", "liver")}>
          <path fill="url(#liverGrad)" d="M158 270 C146 282 146 308 160 330 C176 354 214 368 262 358 C292 350 318 336 322 314 C320 296 300 282 270 274 C238 264 198 262 172 266 C164 268 158 270 158 270 Z" />
          <path className="body-map-fissure" d="M200 276 C210 300 224 326 246 344" />
          <ellipse className="body-map-gloss" cx="192" cy="298" rx="24" ry="12" />
        </g>

        <g {...bind("gallbladder")}>
          <path fill="#7a9a42" d="M178 332 C168 338 168 354 180 366 C192 376 208 372 210 356 C212 344 202 332 192 328 C188 320 182 324 178 332 Z" />
          <path fill="#8aaa52" d="M188 324 C184 318 180 324 184 330 L194 334 C198 326 194 318 188 324 Z" />
        </g>

        <g {...bind("stomach")}>
          <path fill="url(#stomachGrad)" d="M276 272 C258 268 250 284 256 302 C264 322 286 342 318 346 C344 348 360 332 356 310 C352 288 336 274 316 272 C304 260 288 260 276 272 Z" />
          <path className="body-map-fissure" d="M286 288 C302 298 322 310 340 318" />
          <ellipse className="body-map-gloss" cx="318" cy="292" rx="18" ry="10" />
        </g>

        <path className="body-map-diaphragm" d="M168 286 C198 268 230 262 260 272 C290 262 322 268 352 286" />

        <g {...bind("right-lung", "lungs")}>
          <path fill="url(#lungGrad)" d="M194 152 C172 168 160 198 162 232 C164 264 174 290 196 298 C218 300 238 282 242 248 C246 214 236 176 218 156 C208 146 200 146 194 152 Z" />
          <path className="body-map-fissure" d="M176 230 C196 226 218 232 236 248" />
          <path className="body-map-fissure" d="M188 198 C200 210 214 228 224 248" />
          <ellipse className="body-map-gloss" cx="196" cy="190" rx="14" ry="18" />
        </g>
        <g {...bind("left-lung", "lungs")}>
          <path fill="url(#lungGrad)" d="M326 152 C348 168 360 198 358 232 C356 264 346 290 324 298 C302 300 284 278 286 248 C288 228 298 216 290 204 C282 188 288 168 300 156 C310 146 318 146 326 152 Z" />
          <path className="body-map-fissure" d="M344 228 C324 224 304 232 292 250" />
          <ellipse className="body-map-gloss" cx="332" cy="190" rx="14" ry="18" />
        </g>

        <g {...bind("heart", "heart")}>
          <path fill="#8c3a48" d="M262 168 C258 168 256 178 258 188 L270 190 C272 178 270 168 266 168 C264 160 270 158 276 162 C280 164 278 170 272 170 C268 168 264 168 262 168 Z" />
          <path fill="#6a6ea8" d="M248 176 L256 176 L256 194 L248 194 Z" opacity=".8" />
          <path fill="url(#heartGrad)" d="M248 196 C238 204 236 222 246 244 C256 264 272 274 284 268 C300 260 308 238 302 218 C296 200 284 190 270 190 C260 190 252 192 248 196 Z" />
          <path fill="#b03c38" d="M242 198 C232 200 228 212 234 222 C240 230 252 226 256 216 C258 206 252 196 242 198 Z" />
          <ellipse className="body-map-gloss" cx="268" cy="214" rx="10" ry="8" />
        </g>

        <g {...bind("transverse-colon", "intestine")}>
          <ellipse fill="url(#colonGrad)" cx="202" cy="364" rx="20" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="228" cy="356" rx="18" ry="15" />
          <ellipse fill="url(#colonGrad)" cx="254" cy="354" rx="18" ry="15" />
          <ellipse fill="url(#colonGrad)" cx="280" cy="354" rx="18" ry="15" />
          <ellipse fill="url(#colonGrad)" cx="306" cy="356" rx="18" ry="15" />
          <ellipse fill="url(#colonGrad)" cx="330" cy="364" rx="19" ry="16" />
        </g>
        <g {...bind("ascending-colon", "intestine")}>
          <ellipse fill="url(#colonGrad)" cx="188" cy="382" rx="18" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="186" cy="404" rx="18" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="185" cy="426" rx="18" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="188" cy="448" rx="17" ry="15" />
          <ellipse fill="url(#colonGrad)" cx="198" cy="466" rx="16" ry="14" />
        </g>
        <g {...bind("descending-colon", "intestine")}>
          <ellipse fill="url(#colonGrad)" cx="340" cy="382" rx="17" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="344" cy="404" rx="17" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="342" cy="426" rx="17" ry="16" />
          <ellipse fill="url(#colonGrad)" cx="336" cy="448" rx="16" ry="15" />
          <ellipse fill="url(#colonGrad)" cx="324" cy="466" rx="16" ry="14" />
        </g>

        <g {...bind("small-intestine", "intestine")}>
          <path fill="url(#gutGrad)" d="M218 384 C200 388 196 408 210 420 C200 432 206 454 226 464 C244 474 272 470 288 454 C310 462 328 446 324 426 C338 412 330 392 312 386 C308 370 284 362 264 372 C248 364 230 370 218 384 Z" />
          <path fill="#e8b8a8" d="M226 400 C216 404 218 420 232 424 C244 428 256 418 252 406 C248 396 236 396 226 400 Z" />
          <path fill="#e0a898" d="M258 412 C248 416 250 434 266 438 C280 442 292 430 286 418 C282 408 268 408 258 412 Z" />
          <path fill="#ebbdb0" d="M232 436 C222 440 226 456 242 458 C256 460 266 448 260 438 C256 430 242 430 232 436 Z" />
          <path className="body-map-coil" d="M228 408 C238 400 252 406 250 418" />
          <path className="body-map-coil" d="M262 420 C274 414 286 424 280 436" />
        </g>

        <g {...bind("bladder")}>
          <ellipse fill="#e8d4b6" stroke="#c8b090" strokeWidth="1" cx="260" cy="518" rx="32" ry="22" />
          <ellipse className="body-map-gloss" cx="250" cy="512" rx="12" ry="7" />
        </g>

      </g>

      <g clipPath={`url(#${clipId}-skull)`} {...bind("brain", "brain")}>
        <ellipse fill="url(#brainGrad)" cx="242" cy="44" rx="24" ry="26" />
        <ellipse fill="url(#brainGrad)" cx="278" cy="44" rx="24" ry="26" />
        <path className="body-map-fissure" d="M260 20 L260 68" />
        <path className="body-map-coil" d="M230 38 C238 32 246 40 240 48" />
        <path className="body-map-coil" d="M290 38 C282 32 274 40 280 48" />
      </g>
      <g {...bind("eyeball", "eyeball")}>
        <ellipse fill="#f4eee6" stroke="#c4b09c" strokeWidth="1" cx="242" cy="78" rx="9" ry="6" />
        <circle fill="#6a8aaa" cx="242" cy="78" r="3.4" />
        <circle className="body-map-pupil" cx="242" cy="78" r="1.6" />
        <ellipse fill="#f4eee6" stroke="#c4b09c" strokeWidth="1" cx="278" cy="78" rx="9" ry="6" />
        <circle fill="#6a8aaa" cx="278" cy="78" r="3.4" />
        <circle className="body-map-pupil" cx="278" cy="78" r="1.6" />
      </g>

      <path className="body-map-feature" d="M256 82 C258 88 262 88 264 82" />
      <path className="body-map-feature" d="M252 96 C258 100 262 100 268 96" />
    </>
  );
}
