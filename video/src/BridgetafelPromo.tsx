import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const suits = {
  spades: "\u2660",
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
};

const colors = {
  bg: "#171816",
  ink: "#f7f4e8",
  muted: "#b7c5bc",
  panel: "#242824",
  panel2: "#1f342b",
  felt: "#236548",
  feltDark: "#174430",
  accent: "#e0c25f",
  accent2: "#60c5b9",
  danger: "#e76161",
  card: "#fbf8ef",
  cardInk: "#171717",
  red: "#c93434",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

type CardProps = {
  rank: string;
  suit: keyof typeof suits;
  small?: boolean;
  delay?: number;
};

const Card: React.FC<CardProps> = ({rank, suit, small = false, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const red = suit === "hearts" || suit === "diamonds";
  const enter = spring({
    frame: frame - delay * fps,
    fps,
    config: {damping: 18, stiffness: 110},
  });

  const width = small ? 74 : 104;
  const height = small ? 104 : 146;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        background: colors.card,
        color: red ? colors.red : colors.cardInk,
        boxShadow: "0 18px 28px rgba(0,0,0,0.28)",
        border: "1px solid rgba(0,0,0,0.22)",
        padding: small ? 8 : 11,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 28}px) rotate(${(1 - enter) * -3}deg)`,
      }}
    >
      <strong style={{fontSize: small ? 22 : 28, lineHeight: 1}}>{rank}</strong>
      <span
        style={{
          alignSelf: "center",
          justifySelf: "center",
          fontSize: small ? 42 : 58,
          lineHeight: 1,
        }}
      >
        {suits[suit]}
      </span>
      <strong
        style={{
          justifySelf: "end",
          fontSize: small ? 18 : 24,
          lineHeight: 1,
          transform: "rotate(180deg)",
        }}
      >
        {rank}
      </strong>
    </div>
  );
};

const CardBack: React.FC<{delay?: number}> = ({delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay * fps,
    fps,
    config: {damping: 18, stiffness: 110},
  });

  return (
    <div
      style={{
        width: 74,
        height: 104,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.2)",
        background:
          "linear-gradient(135deg, #143b2b, #25684b), repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 2px, transparent 2px 9px)",
        boxShadow: "0 15px 24px rgba(0,0,0,0.28)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
      }}
    />
  );
};

const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 14,
      background: "rgba(36,40,36,0.92)",
      boxShadow: "0 28px 64px rgba(0,0,0,0.28)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{children: React.ReactNode; tone?: "accent" | "teal"}> = ({
  children,
  tone = "accent",
}) => (
  <span
    style={{
      color: tone === "accent" ? colors.accent : colors.accent2,
      fontSize: 24,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: 0,
    }}
  >
    {children}
  </span>
);

const Caption: React.FC<{start: number; end: number; children: React.ReactNode}> = ({
  start,
  end,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 18, end - 18, end], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });
  const y = interpolate(frame, [start, start + 18], [24, 0], {...clamp, easing: ease});

  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        bottom: 58,
        right: 90,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          borderRadius: 14,
          border: "1px solid rgba(224,194,95,0.42)",
          background: "rgba(22,35,28,0.9)",
          padding: "18px 28px",
          color: colors.ink,
          fontSize: 38,
          fontWeight: 850,
          lineHeight: 1.16,
          textAlign: "center",
          boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const AppFrame: React.FC<{phase: "auction" | "play" | "review"}> = ({phase}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.45, 1],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 64,
        display: "grid",
        gridTemplateRows: "120px 1fr",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 20}}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 20,
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${colors.accent2}, ${colors.felt})`,
              color: colors.ink,
              fontWeight: 950,
              fontSize: 42,
              boxShadow: "0 18px 34px rgba(0,0,0,0.24)",
            }}
          >
            B
          </div>
          <div>
            <Label tone="teal">Bridgetafel</Label>
            <h1 style={{margin: "8px 0 0", fontSize: 54, lineHeight: 1.02}}>
              Speel Vijfkaart Hoog met een AI-partner
            </h1>
          </div>
        </div>
        <div style={{display: "flex", gap: 12}}>
          {["Feedback", "Menu"].map((text) => (
            <div
              key={text}
              style={{
                minWidth: 126,
                minHeight: 48,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#2f3932",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                fontWeight: 850,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 18,
          minHeight: 0,
        }}
      >
        <Panel style={{padding: 22, display: "grid", alignContent: "start", gap: 16}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h2 style={{margin: 0, fontSize: 30}}>Bieden</h2>
            <span style={{color: colors.muted, fontSize: 20}}>Deler: Zuid</span>
          </div>
          <Label>Contract</Label>
          <div style={{fontSize: 28, fontWeight: 900}}>
            {phase === "review" ? "4\u2665 door Zuid, gemaakt" : "NZ zoeken een fit"}
          </div>
          <Label>Biedverloop</Label>
          <AuctionGrid phase={phase} />
          {phase === "auction" && <BidBox />}
          {phase === "play" && <PlayPlan />}
          {phase === "review" && <ScoreReview />}
        </Panel>

        <BridgeTable phase={phase} pulse={pulse} />
      </div>
    </div>
  );
};

const AuctionGrid: React.FC<{phase: "auction" | "play" | "review"}> = ({phase}) => {
  const calls =
    phase === "auction"
      ? ["1\u2665", "pas", "2\u2665", "pas", "4\u2665", "", "", ""]
      : ["1\u2665", "pas", "2\u2665", "pas", "4\u2665", "pas", "pas", "pas"];

  return (
    <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8}}>
      {["Z", "W", "N", "O", ...calls].map((call, index) => (
        <div
          key={`${call}-${index}`}
          style={{
            minHeight: index < 4 ? 30 : 48,
            borderRadius: 9,
            background: index < 4 ? "transparent" : "rgba(255,255,255,0.07)",
            color: index < 4 ? colors.muted : colors.ink,
            display: "grid",
            placeItems: "center",
            fontSize: index < 4 ? 18 : 24,
            fontWeight: 900,
            border:
              phase === "auction" && index === 8
                ? `2px solid rgba(224,194,95,0.86)`
                : "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {call}
        </div>
      ))}
    </div>
  );
};

const BidBox: React.FC = () => (
  <div style={{display: "grid", gap: 10}}>
    <Label>Biedbox</Label>
    <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8}}>
      {["1SA", "2\u2660", "2\u2665", "2\u2666", "2\u2663", "pas", "stop", "alert", "x", "xx"].map(
        (bid) => (
          <div
            key={bid}
            style={{
              minHeight: 44,
              borderRadius: 9,
              background: bid === "4\u2665" ? "rgba(224,194,95,0.18)" : "#2f3932",
              display: "grid",
              placeItems: "center",
              fontSize: 19,
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {bid}
          </div>
        ),
      )}
    </div>
    <div
      style={{
        border: "1px solid rgba(224,194,95,0.36)",
        borderRadius: 10,
        background: "rgba(224,194,95,0.1)",
        padding: 12,
        fontSize: 20,
        color: colors.muted,
        lineHeight: 1.28,
      }}
    >
      <strong style={{color: colors.ink}}>Suggestie: 4\u2665.</strong> Genoeg punten en hartenfit.
    </div>
  </div>
);

const PlayPlan: React.FC = () => (
  <div
    style={{
      border: "1px solid rgba(96,197,185,0.32)",
      borderRadius: 10,
      background: "rgba(96,197,185,0.08)",
      padding: 14,
      display: "grid",
      gap: 8,
    }}
  >
    <Label tone="teal">Speelplan</Label>
    {["Troef trekken zodra het kan", "Eerst vaste slagen tellen", "Daarna extra harten ontwikkelen"].map(
      (line) => (
        <div key={line} style={{fontSize: 20, color: colors.muted, fontWeight: 750}}>
          {line}
        </div>
      ),
    )}
  </div>
);

const ScoreReview: React.FC = () => (
  <div style={{display: "grid", gap: 9}}>
    <Label>Handoverzicht</Label>
    {[
      ["Contract", "4\u2665"],
      ["Resultaat", "10 slagen"],
      ["Score", "+420 NZ"],
    ].map(([label, value]) => (
      <div
        key={label}
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.09)",
          paddingBottom: 8,
          color: colors.muted,
          fontSize: 21,
          fontWeight: 800,
        }}
      >
        <span>{label}</span>
        <strong style={{color: colors.ink}}>{value}</strong>
      </div>
    ))}
  </div>
);

const BridgeTable: React.FC<{phase: "auction" | "play" | "review"; pulse: number}> = ({
  phase,
  pulse,
}) => {
  const played = phase !== "auction";
  const review = phase === "review";

  return (
    <Panel
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(140deg, #236548, #174430)",
        backgroundSize: "46px 46px, 46px 46px, auto",
        padding: 24,
        display: "grid",
        gridTemplateRows: "150px 1fr 180px",
        gap: 18,
      }}
    >
      <Seat label={played ? "Noord - Dummy" : "Noord - Partner"} top>
        {played ? (
          <Hand cards={[["A", "spades"], ["9", "spades"], ["K", "hearts"], ["8", "hearts"], ["Q", "clubs"]]} />
        ) : (
          <HiddenHand count={5} />
        )}
      </Seat>

      <div style={{display: "grid", gridTemplateColumns: "170px 1fr 170px", gap: 20}}>
        <Seat label="West">
          <HiddenHand vertical count={4} />
        </Seat>
        <div
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            minHeight: 420,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "11% 15%",
              borderRadius: 24,
              border: `3px solid rgba(224,194,95,${played ? 0.34 + pulse * 0.28 : 0.08})`,
            }}
          />
          {played ? (
            <div
              style={{
                width: 520,
                height: 350,
                position: "relative",
              }}
            >
              <div style={{position: "absolute", left: 208, top: 16}}>
                <Card rank="K" suit="hearts" small delay={0.1} />
              </div>
              <div style={{position: "absolute", left: 72, top: 128}}>
                <Card rank="7" suit="hearts" small delay={0.2} />
              </div>
              <div style={{position: "absolute", right: 72, top: 128}}>
                <Card rank="J" suit="hearts" small delay={0.3} />
              </div>
              <div style={{position: "absolute", left: 208, bottom: 16}}>
                <Card rank="A" suit="hearts" small delay={0.4} />
              </div>
            </div>
          ) : (
            <div style={{textAlign: "center"}}>
              <div
                style={{
                  color: colors.ink,
                  fontSize: 34,
                  fontWeight: 900,
                  marginBottom: 12,
                }}
              >
                Zuid is aan de beurt
              </div>
              <div style={{color: colors.muted, fontSize: 22, fontWeight: 750}}>
                Legale keuzes zijn visueel beschikbaar.
              </div>
            </div>
          )}
        </div>
        <Seat label="Oost">
          <HiddenHand vertical count={4} />
        </Seat>
      </div>

      <Seat label={review ? "Zuid - resultaat bekend" : "Zuid - Jij"}>
        <Hand
          cards={[
            ["A", "hearts"],
            ["Q", "hearts"],
            ["10", "hearts"],
            ["A", "diamonds"],
            ["K", "clubs"],
            ["9", "clubs"],
          ]}
          highlight={played}
        />
      </Seat>
    </Panel>
  );
};

const Seat: React.FC<{label: string; children: React.ReactNode; top?: boolean}> = ({
  label,
  children,
}) => (
  <div
    style={{
      minWidth: 0,
      minHeight: 0,
      display: "grid",
      alignContent: "center",
      justifyItems: "center",
      gap: 10,
    }}
  >
    <div style={{color: colors.muted, fontSize: 21, fontWeight: 800}}>{label}</div>
    {children}
  </div>
);

const Hand: React.FC<{
  cards: Array<[string, keyof typeof suits]>;
  highlight?: boolean;
}> = ({cards, highlight = false}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      filter: highlight ? "none" : "saturate(0.94)",
    }}
  >
    {cards.map(([rank, suit], index) => (
      <div
        key={`${rank}-${suit}-${index}`}
        style={{
          marginLeft: index === 0 ? 0 : -42,
          outline: highlight && index === 1 ? `3px solid ${colors.accent}` : "none",
          outlineOffset: 5,
          borderRadius: 13,
        }}
      >
        <Card rank={rank} suit={suit} delay={index * 0.05} />
      </div>
    ))}
  </div>
);

const HiddenHand: React.FC<{count: number; vertical?: boolean}> = ({count, vertical = false}) => (
  <div
    style={{
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: vertical ? 360 : 112,
    }}
  >
    {Array.from({length: count}).map((_, index) => (
      <div
        key={index}
        style={{
          marginLeft: !vertical && index > 0 ? -38 : 0,
          marginTop: vertical && index > 0 ? -70 : 0,
        }}
      >
        <CardBack delay={index * 0.04} />
      </div>
    ))}
  </div>
);

const FloatingCards: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drift = (offset: number) => Math.sin((frame / fps + offset) * 1.5) * 12;

  return (
    <>
      <div style={{position: "absolute", left: 74, top: 152, transform: `rotate(-10deg) translateY(${drift(0)}px)`}}>
        <Card rank="A" suit="spades" delay={0.2} />
      </div>
      <div style={{position: "absolute", right: 120, top: 96, transform: `rotate(8deg) translateY(${drift(1)}px)`}}>
        <Card rank="K" suit="hearts" delay={0.35} />
      </div>
      <div style={{position: "absolute", right: 170, bottom: 128, transform: `rotate(-6deg) translateY(${drift(2)}px)`}}>
        <Card rank="Q" suit="diamonds" delay={0.5} />
      </div>
    </>
  );
};

export const BridgetafelPromo: React.FC = () => {
  const frame = useCurrentFrame();

  const appScale = interpolate(frame, [0, 80, 950, 1080], [0.88, 0.88, 0.88, 0.94], {
    ...clamp,
    easing: ease,
  });
  const appY = interpolate(frame, [0, 80], [50, 0], {...clamp, easing: ease});

  const phase = frame < 360 ? "auction" : frame < 760 ? "play" : "review";
  const heroOpacity = interpolate(frame, [0, 24, 150, 210], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });
  const appOpacity = interpolate(frame, [150, 210], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 24% 12%, rgba(96,197,185,0.16), transparent 30%), linear-gradient(135deg, #171816 0%, #21241f 52%, #101614 100%)",
        color: colors.ink,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: "hidden",
      }}
    >
      <div style={{opacity: heroOpacity}}>
        <FloatingCards />
        <div style={{position: "absolute", left: 240, top: 300, width: 1040}}>
          <Label tone="teal">Bridge leren door te spelen</Label>
          <h1 style={{fontSize: 104, lineHeight: 0.96, margin: "18px 0 24px", maxWidth: 980}}>
            Bridgetafel
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 880,
              color: colors.muted,
              fontSize: 42,
              lineHeight: 1.18,
              fontWeight: 760,
            }}
          >
            Een rustige oefenapp voor bieden, spelen en reviewen met een AI-partner.
          </p>
        </div>
      </div>

      <div
        style={{
          opacity: appOpacity,
          transform: `translateY(${appY}px) scale(${appScale})`,
          transformOrigin: "center center",
        }}
      >
        <AppFrame phase={phase} />
      </div>

      <Caption start={210} end={360}>
        Bied met compacte AI-suggesties, zonder de beginnersflow vol uitleg te zetten.
      </Caption>
      <Caption start={420} end={610}>
        Na de uitkomst verschijnt dummy en ziet Zuid meteen het zichtbare speelplan.
      </Caption>
      <Caption start={650} end={800}>
        De tafel maakt duidelijk wie aan slag is en welke kaart logisch speelbaar is.
      </Caption>
      <Caption start={830} end={1020}>
        Na afloop review je contract, slagen en score, klaar om dezelfde hand opnieuw te oefenen.
      </Caption>
    </AbsoluteFill>
  );
};
