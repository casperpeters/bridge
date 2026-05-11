(function initBridgeLessonCatalog(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLessonCatalog = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonCatalog() {
  "use strict";

  const lessonDefinitions = [
    {
      id: "les-01-wat-is-bridge",
      number: 1,
      title: "Wat is bridge?",
      challenge: "Win slagen samen met partner en ontdek hoe bieden, spelen en dummy bij elkaar horen.",
      summary: "Je leert het doel van bridge, de twee fasen van een hand, slagen winnen, kleur bekennen, troef en sans-atout, leider en dummy.",
      learningGoals: [
        "Je herkent Noord, Oost, Zuid en West en weet wie partners zijn.",
        "Je begrijpt dat een slag uit vier kaarten bestaat.",
        "Je weet dat het contract vertelt hoeveel slagen de leider moet maken.",
        "Je ziet wat troef doet en wat sans-atout betekent.",
        "Je weet wanneer dummy open komt en wie de kaarten van dummy speelt."
      ],
      focus: ["Spelen", "Bieden", "Dummy"],
      handIds: ["draw-trumps-001"],
      pageHref: "01-cards.html",
      startMode: "play",
      enableGuidance: true,
      intro: "Je hoeft nog niets te bieden. Deze missie start meteen bij het spelen: kijk wie uitkomt, wie dummy is en hoeveel slagen jullie samen pakken.",
      chapters: [
        {
          id: "kaarten-van-spelers",
          title: "De kaarten van de spelers",
          summary: "Iedere speler krijgt 13 kaarten; samen met je partner probeer je slagen te winnen.",
          pageHref: "01-cards.html",
          blocks: [
            { type: "paragraph", text: "Bridge speel je met vier spelers. Jij zit Zuid, je partner zit Noord, en Oost/West zijn de tegenstanders." },
            { type: "paragraph", text: "Iedere speler krijgt 13 kaarten. De kaarten blijven eerst verborgen, behalve dummy: die verschijnt pas na de eerste kaart van het spelen." }
          ]
        },
        {
          id: "windrichtingen",
          title: "Noord, Oost, Zuid en West",
          summary: "De tafel gebruikt windrichtingen om partners en beurten duidelijk te houden.",
          blocks: [
            { type: "paragraph", text: "Noord en Zuid vormen samen een paar. Oost en West vormen het andere paar." },
            { type: "list", items: ["Zuid ben jij.", "Noord is je partner.", "Links van Zuid zit West; rechts van Zuid zit Oost."] }
          ]
        },
        {
          id: "bieden-en-spelen",
          title: "De twee fasen",
          summary: "Een bridgehand heeft eerst bieden en daarna spelen.",
          blocks: [
            { type: "paragraph", text: "Fase 1 is bieden. De spelers zoeken uit welke speelsoort en hoeveel slagen haalbaar lijken." },
            { type: "paragraph", text: "Fase 2 is spelen. Dan probeer je met de kaarten zoveel slagen te winnen als nodig is." },
            { type: "callout", text: "Het laatste bod wordt het contract: de afspraak over speelsoort en aantal benodigde slagen." }
          ]
        },
        {
          id: "doel-van-bridge",
          title: "Het doel",
          summary: "Je paar probeert het contract te maken of juist te verslaan.",
          blocks: [
            { type: "paragraph", text: "Noord/Zuid spelen samen tegen Oost/West. Een paar probeert genoeg slagen te winnen voor het contract." },
            { type: "paragraph", text: "Ben je leider, dan probeer je het contract te maken. Ben je tegenspeler, dan probeer je te zorgen dat de leider te weinig slagen haalt." }
          ]
        },
        {
          id: "een-slag",
          title: "Een slag",
          summary: "Een slag is een rondje waarin iedere speler precies een kaart speelt.",
          blocks: [
            { type: "paragraph", text: "De speler die de slag begint, bepaalt de gevraagde kleur. Daarna spelen de andere spelers met de klok mee een kaart." },
            { type: "paragraph", text: "Wie de slag wint, begint de volgende slag. Er zijn 13 slagen, omdat iedere speler 13 kaarten heeft." }
          ],
          quiz: [
            {
              question: "Wat probeer je in bridge te winnen?",
              answer: "Slagen",
              options: ["Slagen", "Losse punten", "Alle harten"],
              feedback: "Ja. Een slag is een rondje waarin iedere speler precies een kaart speelt."
            },
            {
              question: "Wanneer komt dummy open op tafel?",
              answer: "Na de uitkomst",
              options: ["Voor het bieden", "Na de uitkomst", "Pas na slag 13"],
              feedback: "Precies. Eerst komt links van de leider uit; daarna zie je dummy."
            },
            {
              question: "Wie speelt de kaarten van dummy?",
              answer: "De leider",
              options: ["De leider", "Dummy zelf", "De speler links"],
              feedback: "Klopt. Dummy legt de kaarten open; de leider kiest de kaarten uit beide handen."
            }
          ]
        },
        {
          id: "speelsoorten",
          title: "Troef en SA",
          summary: "Een contract is met troef of zonder troef: sans-atout, ook NT genoemd.",
          blocks: [
            { type: "paragraph", text: "Bij een troefcontract is een van de vier kleuren troef. Als je geen gevraagde kleur meer hebt, mag je met troef de slag proberen te winnen." },
            { type: "paragraph", text: "Bij SA, sans-atout of NT, is er geen troef. Dan wint gewoon de hoogste kaart van de gevraagde kleur." },
            { type: "callout", text: "SA en NT betekenen hetzelfde: zonder troef." }
          ]
        },
        {
          id: "leider-en-dummy",
          title: "Leider en dummy",
          summary: "Na de uitkomst komt dummy open en speelt de leider twee handen.",
          blocks: [
            { type: "paragraph", text: "De speler die het contract voor zijn paar gaat spelen heet de leider. De partner van de leider heet dummy." },
            { type: "paragraph", text: "Eerst komt de speler links van de leider uit. Daarna legt dummy alle kaarten open op tafel." },
            { type: "paragraph", text: "Dummy kiest zelf geen kaarten. De leider kiest de kaarten uit de eigen hand en uit dummy." }
          ]
        },
        {
          id: "spelverloop",
          title: "Het spelverloop",
          summary: "Na elke slag begint de winnaar de volgende slag, tot alle 13 slagen gespeeld zijn.",
          blocks: [
            { type: "list", items: ["De uitkomer speelt de eerste kaart.", "Dummy komt open.", "Iedere speler speelt een kaart en moet kleur bekennen als dat kan.", "De hoogste kaart van de gevraagde kleur wint, behalve als iemand troeft.", "De winnaar begint de volgende slag.", "Na 13 slagen zie je contract, resultaat en score."] }
          ]
        },
        {
          id: "bekennen-moet",
          title: "Bekennen moet",
          summary: "Als de gevraagde kleur in je hand zit, moet je een kaart van die kleur spelen.",
          handId: "draw-trumps-001",
          tableTask: {
            type: "card",
            completion: "northSouthCard",
            expectedAction: {
              type: "card",
              seat: "North",
              cardIds: ["5D"],
              retryTitle: "Bijna",
              retryBody: "Die kaart bekent wel ruiten, maar deze oefening zoekt de rustige lage ruiten. Probeer 5 ruiten.",
              hint: "Kies 5 ruiten om laag te bekennen."
            },
            doneTitle: "Kaart gekozen",
            doneBody: "Je hebt aan tafel een kaart gespeeld terwijl de gevraagde kleur zichtbaar was. Dat is precies het lesmoment.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          blocks: [
            { type: "paragraph", text: "Als iemand bijvoorbeeld harten vraagt en jij hebt harten, dan moet je harten spelen. Alleen als je die kleur niet hebt, mag je een andere kleur spelen." },
            { type: "callout", text: "De oefening start meteen in het spelen, zodat je beurten, dummy en kleur bekennen in een echt bord ziet." }
          ]
        }
      ],
      reviewFeedback: [
        "Je speelde een echt bord vanaf de uitkomst: vier spelers, vier kaarten per slag, dertien slagen totaal.",
        "Let vooral op het moment na de eerste kaart: dan verschijnt dummy en wordt de leider verantwoordelijk voor twee handen.",
        "De score is nu minder belangrijk dan het ritme: volgen van kleur, slagwinnaar zien, volgende slag starten."
      ],
      boardGuidance: [
        {
          id: "contractIntro",
          title: "Je speelt 4 schoppen",
          body: "Het contract is 4 schoppen door Zuid. Schoppen is troef en Noord/Zuid probeert genoeg slagen te maken.",
          badge: "Contract en troef",
          target: "contract",
          buttonLabel: "Start aan tafel",
          gate: "releaseAutoPlay"
        },
        {
          id: "openingLeadIntro",
          title: "Eerst komt West uit",
          body: "West zit links van de leider en speelt straks de eerste kaart. Die eerste kaart heet de uitkomst.",
          badge: "Uitkomst",
          target: "openingLead",
          buttonLabel: "Laat West uitkomen",
          gate: "releaseAutoPlay"
        },
        {
          id: "dummyReveal",
          title: "Dummy komt open",
          body: "Na de uitkomst komt Noord open op tafel. Noord is dummy.",
          badge: "Dummy",
          target: "dummy",
          buttonLabel: "Bekijk dummy",
          gate: "releaseAutoPlay"
        },
        {
          id: "declarerControlsDummy",
          title: "Jij speelt twee handen",
          body: "Zuid is leider. Jij kiest de kaarten uit Zuid en uit dummy Noord.",
          badge: "Leider en dummy",
          target: "declarerAndDummy",
          buttonLabel: "Ik speel beide handen",
          gate: "releaseAutoPlay"
        },
        {
          id: "trickMeaning",
          title: "Vier kaarten maken een slag",
          body: "Iedere speler speelt precies een kaart. Samen vormen die vier kaarten een slag.",
          badge: "Slag",
          target: "trickArea",
          buttonLabel: "Verder",
          gate: "releaseAutoPlay"
        },
        {
          id: "followSuit",
          title: "Bekennen moet",
          body: "Er is een kleur gevraagd. Als je die kleur hebt, moet je een kaart van die kleur spelen.",
          badge: "Bekennen",
          target: "legalCards",
          buttonLabel: "Ik ga bekennen",
          gate: "allowHumanPlay"
        },
        {
          id: "trumpMeaning",
          title: "Schoppen is troef",
          body: "Schoppenkaarten zijn troeven. Troef kan winnen als je de gevraagde kleur niet kunt bekennen.",
          badge: "Troef",
          target: "trumpCards",
          buttonLabel: "Verder spelen",
          gate: "allowHumanPlay"
        },
        {
          id: "trickWinner",
          title: "Wie wint de slag?",
          body: "De gemarkeerde speler won deze slag. De winnaar begint de volgende slag.",
          badge: "Slagwinnaar",
          target: "trickWinner",
          buttonLabel: "Volgende slag",
          gate: "advanceTrick"
        },
        {
          id: "reviewResult",
          title: "Terugkijken",
          body: "In de review zie je contract, leider, dummy, slagen, resultaat en score terug.",
          badge: "Review",
          target: "review",
          gate: "none"
        }
      ],
      teachingPoints: [
        "Een bridgebord bestaat uit 13 slagen; in elke slag speelt iedere speler precies een kaart.",
        "Als Noord/Zuid leider zijn, speel jij als Zuid ook de kaarten van dummy.",
        "Als een kleur gevraagd wordt en je hebt die kleur, moet je bekennen."
      ]
    },
    {
      id: "les-02-punten-en-handtypen",
      number: 2,
      title: "Kaarten waarderen",
      challenge: "Tel HCP, herken verdeling en ontdek wanneer een fit je hand later meer waard maakt.",
      summary: "Je leert HCP tellen, basisverdelingen herkennen, evenwichtige en onevenwichtige handen onderscheiden en begrijpen waarom een fit waardevol is.",
      learningGoals: [
        "Je telt HCP met Aas 4, Heer 3, Vrouw 2 en Boer 1.",
        "Je herkent een evenwichtige verdeling.",
        "Je ziet waarom lengte in een kleur belangrijk is.",
        "Je begrijpt fit als samen minstens acht kaarten in een kleur.",
        "Je maakt een eerste simpele keuze: pas, 1SA of een kleur openen."
      ],
      focus: ["Bieden", "HCP", "Fit"],
      handIds: ["one-nt-opening-001", "opening-pass-001", "one-heart-opening-001"],
      pageHref: "02-card-valuation.html",
      intro: "Deze les is een handpaspoort voor Zuid: eerst HCP, dan verdeling, langste kleur en pas daarna herwaarderen zodra een fit in beeld komt.",
      chapters: [
        {
          id: "hcp-tellen",
          title: "HCP tellen",
          summary: "Aas telt 4, Heer 3, Vrouw 2, Boer 1; de 10 is wel een honneur maar telt niet mee.",
          pageHref: "02-card-valuation.html",
          blocks: [
            { type: "paragraph", text: "HCP is de eerste snelle krachtmeter voordat je gaat bieden." },
            { type: "paragraph", text: "De losse lespagina bevat interactieve handen en feedback per antwoord." }
          ]
        },
        {
          id: "verdeling-en-fit",
          title: "Verdeling en fit",
          summary: "Je herkent 4-3-3-3, 4-4-3-2 en 5-3-3-2 als evenwichtig en ziet waarom korte kleuren later tellen.",
          pageHref: "02-card-valuation.html",
          blocks: [
            { type: "paragraph", text: "Een fit is samen minstens acht kaarten in een kleur." },
            { type: "callout", text: "Tel eerst HCP; herwaardeer pas wanneer een fit waarschijnlijk is." }
          ]
        },
        {
          id: "een-sa-opening-herkennen",
          title: "1SA-hand herkennen",
          summary: "15-17 HCP met een evenwichtige verdeling maakt 1SA de eerste kandidaat.",
          handId: "one-nt-opening-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["1NT"],
              retryTitle: "Nog niet",
              retryBody: "Deze hand heeft 15 HCP en is evenwichtig. In deze les zoek je daarom de 1SA-opening.",
              hint: "Kies 1SA."
            },
            doneTitle: "Bod gedaan",
            doneBody: "Zuid heeft de hand gewaardeerd en het eerste bod gekozen. Ga terug naar de les om dit handpaspoort naast de uitleg te leggen.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "valueThenBid",
              title: "Waardeer eerst Zuid",
              body: "Tel HCP, kijk of de verdeling evenwichtig is en kies daarna het openingsbod.",
              badge: "Openingskeuze",
              target: "bidControls",
              buttonLabel: "Ik kies mijn bod",
              gate: "allowHumanBid"
            }
          ],
          blocks: [
            { type: "paragraph", text: "Start deze oefenhand en tel voor het eerste bod de HCP van Zuid." }
          ]
        },
        {
          id: "openingskracht-of-pas",
          title: "Openingskracht of pas",
          summary: "Niet elke hand heeft genoeg kracht om te openen; passen kan de juiste actie zijn.",
          handId: "opening-pass-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["PASS"],
              retryTitle: "Rustiger",
              retryBody: "Zuid heeft te weinig openingskracht. In deze oefening is passen de bedoelde keuze.",
              hint: "Kies Pas."
            },
            doneTitle: "Keuze gemaakt",
            doneBody: "Zuid heeft gekozen of deze hand genoeg openingskracht heeft. Terug in de les kun je de HCP en verdeling nog eens vergelijken.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "openingStrengthChoice",
              title: "Openen of passen?",
              body: "Kijk alleen naar Zuid: heeft deze hand genoeg kracht om te openen, of is passen rustiger?",
              badge: "Openingskracht",
              target: "bidControls",
              buttonLabel: "Ik maak mijn keuze",
              gate: "allowHumanBid"
            }
          ],
          blocks: [
            { type: "paragraph", text: "Vergelijk deze hand met de HCP- en verdelingsvragen uit de les." }
          ]
        }
      ]
    },
    {
      id: "les-03-eerste-openingen",
      number: 3,
      title: "Openen in Vijfkaart-Hoog",
      challenge: "Kies rustig het openingsbod dat bij Zuid past: pas, 1SA, een hoge kleur, een lage kleur of bonus zwakke twee.",
      summary: "Je leert de openingsvolgorde in Vijfkaart-Hoog: eerst 1SA herkennen, daarna vijfkaart hoog, daarna lage kleuren, met voorzichtige checks op Regel van 20 en zwakke twee.",
      learningGoals: [
        "Je kent de basisvolgorde voor een Opening in Vijfkaart-Hoog.",
        "Je opent 1SA met 15-17 HCP en een Evenwichtige verdeling.",
        "Je opent 1 harten of 1 schoppen met Openingskracht en minstens een vijfkaart hoog.",
        "Je gebruikt 1 klaveren of 1 ruiten wanneer er geen vijfkaart hoog en geen 1SA-hand is.",
        "Je herkent wanneer pas, Regel van 20 of bonus zwakke twee in beeld komt."
      ],
      focus: ["Bieden", "Opening", "Vijfkaart Hoog"],
      handIds: [
        "one-nt-opening-001",
        "lesson-03-one-nt-balanced-001",
        "lesson-03-one-nt-balanced-002",
        "lesson-03-one-nt-five-heart-001",
        "one-heart-opening-001",
        "one-spade-opening-001",
        "lesson-03-one-heart-opening-001",
        "lesson-03-one-heart-six-card-001",
        "lesson-03-one-spade-opening-001",
        "lesson-03-one-spade-six-card-001",
        "lesson-03-two-five-majors-001",
        "lesson-03-one-club-short-001",
        "lesson-03-one-club-long-001",
        "lesson-03-one-diamond-four-001",
        "lesson-03-one-diamond-long-001",
        "opening-pass-001",
        "lesson-03-pass-low-balanced-001",
        "lesson-03-pass-nine-flat-001",
        "lesson-03-pass-poor-six-spades-001",
        "lesson-03-pass-rule20-rejected-001",
        "lesson-03-rule20-one-spade-001",
        "lesson-03-rule20-one-heart-001",
        "lesson-03-rule20-one-club-001",
        "lesson-03-rule20-one-diamond-001",
        "lesson-03-weak-two-diamond-001",
        "lesson-03-weak-two-heart-001",
        "lesson-03-weak-two-spade-001",
        "lesson-03-weak-two-ugly-eleven-001"
      ],
      pageHref: "03-openings.html",
      intro: "Kijk alleen naar Zuid en kies een openingsbod. De korte tafelmomenten stoppen zodra jouw bod is gedaan, zodat je meteen terug kunt naar de lesfeedback.",
      chapters: [
        {
          id: "een-sa-gaat-voor",
          title: "1SA gaat voor",
          summary: "15-17 HCP met een Evenwichtige verdeling opent 1SA, zelfs als er een vijfkaart hoog in een 5-3-3-2 hand zit.",
          handId: "lesson-03-one-nt-five-heart-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["1NT"],
              retryTitle: "Niet deze keer",
              retryBody: "Niet 1 harten, want deze 15-17 HCP hand is evenwichtig. In deze oefening gaat 1SA voor.",
              hint: "Kies 1SA."
            },
            doneTitle: "1SA gekozen",
            doneBody: "Zuid heeft 1SA geopend. Terug in de les kun je zien waarom 15-17 HCP en een Evenwichtige verdeling voorgaan.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "oneNtPriority",
              title: "Check eerst 1SA",
              body: "Tel HCP, herken de Evenwichtige verdeling en kies daarna pas het openingsbod.",
              badge: "Openingsvolgorde",
              target: "bidControls",
              buttonLabel: "Ik kies mijn opening",
              gate: "allowHumanBid"
            }
          ]
        },
        {
          id: "vijfkaart-hoog-openen",
          title: "Vijfkaart hoog openen",
          summary: "Met Openingskracht en een vijfkaart harten of schoppen open je 1 harten of 1 schoppen.",
          handId: "lesson-03-one-spade-opening-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["1S"],
              retryTitle: "Kijk naar schoppen",
              retryBody: "Wel 1 schoppen, want je hebt Openingskracht en een vijfkaart schoppen.",
              hint: "Kies 1 schoppen."
            },
            doneTitle: "Hoge kleur geopend",
            doneBody: "Zuid heeft de vijfkaart hoog getoond. Partner weet nu dat schoppen een mogelijke troefkleur is.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "majorOpening",
              title: "Zoek de vijfkaart hoog",
              body: "Als 1SA niet past, kijk je of Zuid een vijfkaart harten of schoppen met Openingskracht heeft.",
              badge: "Hoge kleuren",
              target: "bidControls",
              buttonLabel: "Ik open de hoge kleur",
              gate: "allowHumanBid"
            }
          ]
        },
        {
          id: "lage-kleur-vangnet",
          title: "Lage kleur of vangnet",
          summary: "Zonder vijfkaart hoog en zonder 1SA-hand open je 1 klaveren of 1 ruiten.",
          handId: "lesson-03-one-club-short-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["1C"],
              retryTitle: "Klaveren is hier het vangnet",
              retryBody: "Niet 1 harten of 1 schoppen, want Vijfkaart-Hoog vraagt minimaal vijf kaarten. Hier past 1 klaveren.",
              hint: "Kies 1 klaveren."
            },
            doneTitle: "Lage kleur geopend",
            doneBody: "Zuid heeft 1 klaveren geopend. Dat kan in dit profiel een echte kleur zijn, maar soms ook de vangnetopening.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "minorFallback",
              title: "Geen vijfkaart hoog?",
              body: "Als 1SA niet past en er geen vijfkaart hoog is, kies je de passende lage kleur.",
              badge: "Lage kleuren",
              target: "bidControls",
              buttonLabel: "Ik kies de lage kleur",
              gate: "allowHumanBid"
            }
          ]
        },
        {
          id: "passen-zonder-kracht",
          title: "Passen zonder Openingskracht",
          summary: "Met te weinig HCP en zonder sterke verdeling is pas vaak de juiste openingstaal.",
          handId: "lesson-03-pass-low-balanced-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["PASS"],
              retryTitle: "Nog geen Opening",
              retryBody: "Pas, want 6 HCP zonder sterke verdeling is te weinig.",
              hint: "Kies Pas."
            },
            doneTitle: "Pas gekozen",
            doneBody: "Zuid heeft rustig gepast. Niet openen is ook informatie: deze hand belooft nu geen openingshand.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "passWithoutStrength",
              title: "Openen of passen?",
              body: "Kijk of Zuid genoeg Openingskracht heeft. Zonder kracht en zonder bijzondere lengte is passen normaal.",
              badge: "Pas",
              target: "bidControls",
              buttonLabel: "Ik maak mijn keuze",
              gate: "allowHumanBid"
            }
          ]
        },
        {
          id: "regel-van-20-voorzichtig",
          title: "Regel van 20 voorzichtig gebruiken",
          summary: "Bij 10-11 HCP tel je HCP plus de twee langste kleuren, maar alleen als de waarden bij die lengte passen.",
          handId: "lesson-03-rule20-one-spade-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["1S"],
              retryTitle: "Lichte opening",
              retryBody: "Wel 1 schoppen, want deze 11 HCP hand haalt de Regel van 20 en de punten zitten in de lange kleuren.",
              hint: "Kies 1 schoppen."
            },
            doneTitle: "Lichte opening gekozen",
            doneBody: "Zuid heeft via de Regel van 20 geopend. Terug in de les zie je waarom dit voorzichtig moet blijven.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "rule20Check",
              title: "10-11 HCP?",
              body: "Controleer bij lichte handen voorzichtig de Regel van 20: HCP plus de twee langste kleuren.",
              badge: "Regel van 20",
              target: "bidControls",
              buttonLabel: "Ik controleer en bied",
              gate: "allowHumanBid"
            }
          ]
        },
        {
          id: "zwakke-twee-bonus",
          title: "Bonus: zwakke twee herkennen",
          summary: "Een zeskaart met beperkte kracht kan een zwakke twee zijn; dit is een vooruitblik.",
          handId: "lesson-03-weak-two-heart-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["2H"],
              retryTitle: "Denk aan zwakke twee",
              retryBody: "Niet 1 harten, want deze hand heeft beperkte kracht. De zeskaart harten maakt 2 harten als zwakke twee herkenbaar.",
              hint: "Kies 2 harten."
            },
            doneTitle: "Zwakke twee herkend",
            doneBody: "Zuid heeft de zwakke twee gevonden. Dit is een bonusroute; de kern van Les 3 blijft de eenniveau-opening.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "weakTwoPreview",
              title: "Bonusvraag",
              body: "Heeft Zuid beperkte kracht maar wel een goede zeskaart? Dan komt zwakke twee als vooruitblik in beeld.",
              badge: "Zwakke twee",
              target: "bidControls",
              buttonLabel: "Ik kies mijn bonusbod",
              gate: "allowHumanBid"
            }
          ]
        }
      ]
    },
    {
      id: "les-04-fit-zoeken-na-hoog",
      number: 4,
      title: "Fit zoeken na 1 hoog",
      challenge: "Partner opent 1 schoppen. Ontdek of drie troeven genoeg steun zijn.",
      focus: ["Bieden", "Fit"],
      handIds: ["response-raise-after-1s-001"]
    },
    {
      id: "les-05-zonder-fit",
      number: 5,
      title: "Zonder fit: nieuwe kleur of SA",
      challenge: "Geen fit met partners harten? Toon je schoppen rustig op eenniveau.",
      focus: ["Bieden", "Antwoord"],
      handIds: ["response-new-suit-after-1h-001"]
    },
    {
      id: "les-06-lage-kleuren",
      number: 6,
      title: "Openingen in lage kleuren",
      challenge: "Na een lage-kleur opening kan een vierkaart hoog de volgende aanwijzing zijn.",
      focus: ["Bieden", "Hoge kleur"],
      handIds: ["minor-opening-find-major-001"]
    },
    {
      id: "les-07-contract-en-score",
      number: 7,
      title: "Contractdoelen en score",
      challenge: "Maak 4 harten en zie waarom kwetsbaar precies gemaakt 620 scoort.",
      focus: ["Score", "Manche"],
      handIds: ["game-bonus-vulnerable-001"]
    },
    {
      id: "les-08-leiderplan",
      number: 8,
      title: "Spelen als leider: maak een plan",
      challenge: "Maak het contract rustiger door eerst de troeven onder controle te krijgen.",
      focus: ["Speelplan", "Leider"],
      handIds: ["draw-trumps-001"]
    },
    {
      id: "les-09-dummy-en-tempo",
      number: 9,
      title: "Dummy en tempo",
      challenge: "Gebruik dummy op tijd voordat de kans verdwijnt.",
      focus: ["Speelplan", "Dummy"],
      handIds: ["discard-loser-on-winner-001"]
    },
    {
      id: "les-10-basis-tegenspel",
      number: 10,
      title: "Basis tegenspel",
      challenge: "Help partner door tegen een kleurcontract uit een honneurserie te starten.",
      focus: ["Verdediging", "Uitkomst"],
      handIds: ["lead-sequence-001"]
    },
    {
      id: "les-11-sa-vervolgen",
      number: 11,
      title: "1SA-vervolgen: Stayman en Jacoby",
      challenge: "Vraag naar een hoge kleur of draag je vijfkaart over.",
      focus: ["Bieden", "Conventie"],
      handIds: ["stayman-after-1nt-001"]
    },
    {
      id: "les-12-review-hele-spellen",
      number: 12,
      title: "Reviewles: hele spellen",
      challenge: "Speel een heel bord en gebruik de review om bieden, slagen en score terug te lezen.",
      focus: ["Review", "Hele hand"],
      handIds: ["game-bonus-vulnerable-001"]
    }
  ];

  return { lessonDefinitions };
});
