const BridgeGlossary = (() => {
  const entries = [
    ["Aftroeven", "Het bijspelen van een troef als je niet kunt bekennen, met de bedoeling de slag daarmee te winnen.", ["introeven"]],
    ["Afgooien", "Een kaart van een andere kleur spelen omdat je niet kunt bekennen. Afgooien wint de slag meestal niet, maar kan wel helpen om een verliezer kwijt te raken.", ["weggooien", "weggooien van een verliezer"]],
    ["Azenvragen", "Een conventioneel bod van 4SA waarmee je partner vraagt hoeveel azen hij heeft. In deze app gebruikt partner klassiek 5 klaveren voor 0 of 4 azen, 5 ruiten voor 1 aas, 5 harten voor 2 azen en 5 schoppen voor 3 azen.", ["Blackwood", "4SA azenvragen"]],
    ["Bijbod", "Een bod van de partner van de openaar. Er wordt onderscheid gemaakt tussen het eerste bijbod en het tweede bijbod."],
    ["Biedplicht", "Een afspraak waarbij je niet mag passen. Na een informatiedoublet van partner moet je een bod doen zolang de rechtertegenstander na dat doublet geen contractbod heeft gedaan.", ["verplicht bieden"]],
    ["Bijkleur", "Een andere kleur dan de troefkleur of de hoofdkleur waar het plan om draait. Een hoge bijkleur kan soms helpen om verliezers weg te gooien."],
    ["Blokkade", "Een situatie waarin hoge kaarten in een kleur elkaar in de weg zitten, doordat je niet meer naar de juiste hand kunt oversteken.", ["geblokkeerde kleur"]],
    ["Blokkeren", "Een kleur zo spelen dat de hoge kaarten in de ene hand vast komen te zitten omdat je geen entree meer hebt naar die hand.", ["geblokkeerde kleur", "geblokkeerd"]],
    ["Conventioneel bod", "Een bod met een afgesproken betekenis die niet letterlijk dezelfde kleur of speelsoort hoeft te beloven als het biedkaartje.", ["conventioneel", "kunstmatig bod"]],
    ["Cross ruff", "Een speelwijze waarbij leider en dummy om de beurt in verschillende handen aftroeven.", ["crossruff", "over en weer aftroeven"]],
    ["Deblokkeren", "Een hoge kaart in de korte hand eerst spelen, zodat de lange hand daarna zijn slagen in die kleur achter elkaar kan maken.", ["deblokkeer", "deblokkeert", "gedeblokkeerd"]],
    ["Contract", "Het aantal slagen dat de leider moet maken in een bepaalde speelsoort. Bij 2 schoppen moeten er bijvoorbeeld acht slagen worden gemaakt met schoppen als troef."],
    ["Contractpunten", "De punten voor de geboden en gemaakte contractslagen, nog zonder overslagen, onderslagen of bonussen. Ze bepalen onder andere of een contract een manche is."],
    ["Deler", "De speler die de kaarten deelt. In de app bepaalt de deler ook wie als eerste mag bieden.", ["gever"]],
    ["Doublet", "Een biedactie waarmee je zegt dat je denkt dat de tegenpartij het contract niet haalt, of in sommige biedsituaties juist een speciale vraag aan partner stelt. In de score maakt een doublet gemaakte en downslagen duurder.", ["doubletten", "gedoubleerd"]],
    ["Doubleton", "Het bezitten van precies twee kaarten in een kleur."],
    ["Dummy", "Partner van de leider. De dummy legt zijn kaarten na de uitkomst open op tafel."],
    ["Eenkleurenspel", "Een hand waarbij je in een kleur minstens zes kaarten hebt.", ["éénkleurenspel"]],
    ["Entree", "Een hoge kaart waarmee je in een bepaalde hand aan slag kunt komen."],
    ["Evenwichtige verdeling", "Een hand die verdeeld is als 4-3-3-3, 4-4-3-2 of 5-3-3-2; de volgorde van de kleuren is hierbij niet van belang.", ["gebalanceerde hand", "gebalanceerd", "SA-verdeling"]],
    ["Fit", "Het samen met je partner hebben van minstens acht kaarten in een kleur."],
    ["Fitpunten", "Punten waarbij je na een gevonden fit ook verdelingswaarde meetelt, bijvoorbeeld extra waarde voor korte kleuren of extra troeven.", ["fit points"]],
    ["Forcing", "Een bod waarop partner volgens de afspraak niet mag passen. Mancheforcing betekent dat het paar doorbiedt tot minstens de manche.", ["mancheforcing", "game-forcing"]],
    ["Gebroken serie", "Een serie waarbij je de derde kaart mist, maar wel de vierde hebt, zoals HV104 of VB95."],
    ["Gevaarlijke hand", "De tegenstander die je liever niet aan slag laat komen, bijvoorbeeld omdat hij vrije kaarten kan incasseren of door jouw stopper heen kan spelen."],
    ["Grootslem", "Een contract op zevenniveau. Je belooft daarmee alle dertien slagen te maken.", ["groot slem"]],
    ["Hoge kleuren", "De kleuren schoppen en harten.", ["hoge kleur"]],
    ["Honneur", "Aas, Heer, Vrouw, Boer en 10 worden honneurs genoemd.", ["honneurs", "honneurserie"]],
    ["punten", "Honneurpunten: Aas telt 4, Heer 3, Vrouw 2 en Boer 1. De 10 is wel een honneur, maar telt in deze puntentelling niet mee.", ["honneurpunten", "punten"]],
    ["Herbieding", "Een later bod van een speler die al eerder in de bieding iets heeft geboden, vaak om kracht of verdeling verder te verduidelijken.", ["herbieden"]],
    ["Herwaarderen", "Je hand opnieuw beoordelen zodra de bieding meer informatie geeft, bijvoorbeeld omdat korte kleuren of extra troeven meer waard worden na een fit."],
    ["Incasseren", "Een hoge kaart spelen waarvan je verwacht dat die nu een slag maakt, bijvoorbeeld een aas of een vrijgespeelde kaart.", ["incasseer"]],
    ["Informatiedoublet", "Een doublet dat partner om informatie vraagt in plaats van puur straf te beloven. Meestal toont het openingskracht en steun voor de ongeboden kleuren.", ["takeout double", "informatiedoubletten"]],
    ["Interne serie", "Een reeks opeenvolgende kaarten met daarboven nog een losse hogere kaart in dezelfde kleur, zoals HB10 of V109."],
    ["Invite", "Een uitnodigend bod: je vraagt partner om naar de manche te gaan met een maximum, maar te stoppen met een minimum.", ["inviteren", "uitnodiging", "uitnodigend bod"]],
    ["Jacoby-transfer", "Afspraak na een SA-opening: 2 ruiten vraagt partner harten te bieden en 2 harten vraagt partner schoppen te bieden. Je gebruikt dit met minstens een vijfkaart hoog; zo zoek je een hoge-kleurfit en blijft de sterke SA-hand leider.", ["transfer", "Jacobytransfer", "Jacoby-transfer naar harten", "Jacoby-transfer naar schoppen"]],
    ["Kanskaart", "Een kaart die je een kans geeft op een extra slag, bijvoorbeeld door te snijden met de vrouw."],
    ["Kleinslem", "Een contract op zesniveau. Je belooft daarmee twaalf van de dertien slagen te maken.", ["klein slem"]],
    ["Kleur bekennen", "Het moeten bijspelen van een kaart van dezelfde kleur als de eerste kaart in deze slag, als je zo'n kaart hebt.", ["Bekennen", "bekennen"]],
    ["Kleurcontract", "Een contract met klaveren, ruiten, harten of schoppen als troef. Dat is anders dan sans-atout, waar geen troef is.", ["kleurcontracten"]],
    ["Korte kant", "De hand waarin je van een bepaalde kleur het geringste aantal kaarten hebt."],
    ["Kwetsbaarheid", "Een score-afspraak per bord. Als je kwetsbaar bent, leveren manches en slems meer bonus op, maar down gaan kost ook meer punten."],
    ["Lage kleuren", "De kleuren ruiten en klaveren.", ["lage kleur"]],
    ["Leider", "De speler van het contractpaar die de speelsoort als eerste bood. De leider probeert het contract te maken en speelt tijdens het spel ook de kaarten van de dummy."],
    ["Lengteslagen", "Slagen die je kunt maken met een lange kleur nadat de hogere kaarten in die kleur zijn weggespeeld."],
    ["Manche", "Een contract dat minstens 100 contractpunten waard is en daardoor een manchebonus krijgt. Voorbeelden zijn 3SA, 4 harten, 4 schoppen en 5 klaveren of 5 ruiten.", ["manchebonus", "lage-kleurmanche", "SA-manche"]],
    ["Maximum", "Een hand aan de bovenkant van de puntenrange die je eerdere bieding heeft beloofd. Met een maximum bied je vaker nog een keer door of accepteer je een invite.", ["maximumhand"]],
    ["Minimum", "Een hand aan de onderkant van de puntenrange die je eerdere bieding heeft beloofd. Met een minimum stop je vaker laag of wijs je een invite af.", ["minimumhand"]],
    ["Onderslag", "Een slag die de leider tekort komt om het contract te halen. Een contract dat twee slagen tekort komt, gaat twee onderslagen down.", ["Onderslagen", "downslagen"]],
    ["Openaar", "De speler die als eerste in een bepaald spel een bod doet."],
    ["Opening", "Het eerste bod van een spel wordt de opening genoemd."],
    ["Openingskracht", "Een hand die sterk genoeg is om volgens het biedsysteem met een openingsbod te beginnen. In deze app is dat meestal vanaf ongeveer 12 punten, of met een sterke lange kleur volgens de Vijfkaart-Hoog-regels."],
    ["Ophouden", "Een slag bewust nog niet nemen terwijl dat wel kan, vaak om de communicatie tussen de tegenstanders lastiger te maken.", ["duiken", "hold-up"]],
    ["Overslag", "Een slag die extra wordt behaald boven het aantal dat nodig was voor het contract.", ["Overslagen", "overslagpunten"]],
    ["Preëmptief bod", "Een hoog bod met een lange kleur, vooral bedoeld om het de tegenpartij moeilijker te maken om hun beste contract te vinden.", ["preemptief bod", "preempt", "preëmptief"]],
    ["Redoublet", "Een biedactie na een doublet van de tegenpartij. In de score maakt een redoublet gemaakte en downslagen nog duurder dan een doublet.", ["redoubletten", "geredoubleerd"]],
    ["Regel van 20", "Een vuistregel voor lichte openingen: tel je punten op bij de lengte van je twee langste kleuren. Kom je op minstens 20 en zitten de meeste punten in die lange kleuren, dan mag je met minder dan 12 punten toch openen.", ["rule of 20", "regel-van-20"]],
    ["Renonce", "Het hebben van nul kaarten in een kleur."],
    ["Sans-atout", "De speelsoort waarbij er geen troef is.", ["SA", "sans-atouttrek"]],
    ["Serie", "Twee of meer opeenvolgende kaarten in een kleur, zoals AHV5, AH8, HV32, VB1096 of B1084."],
    ["Singleton", "Het bezitten van precies een kaart in een kleur."],
    ["Slag", "Een ronde waarin elke speler een kaart speelt. De hoogste kaart in de voorgespeelde kleur wint, behalve als er met troef wordt gewonnen.", ["slagen"]],
    ["Slem", "Een contract op zes- of zevenniveau. Klein slem vraagt twaalf slagen; groot slem vraagt alle dertien slagen.", ["slembonus"]],
    ["Snijden", "Proberen een slag te maken met een kaart die niet de hoogste is, bijvoorbeeld naar Vrouw-Aas spelen in de hoop dat Heer ervoor zit.", ["snit"]],
    ["Stayman", "Afspraak na een SA-opening: 2 klaveren vraagt partner of hij een vierkaart harten of schoppen heeft. Je gebruikt dit om eerst een 4-4 fit in een hoge kleur te zoeken voordat je SA als eindcontract kiest.", ["Staymanconventie", "Stayman-conventie"]],
    ["Stopper", "Een kaart of combinatie waarmee je voorkomt dat de tegenpartij meteen alle slagen in een kleur kan maken, vooral belangrijk in sans-atout.", ["dekking"]],
    ["Tegenspelers", "De twee spelers van het paar dat probeert te voorkomen dat de leider zijn contract maakt."],
    ["Tophonneur", "Een van de hoogste honneurs in een kleur: Aas, Heer of Vrouw. Voor sommige biedafspraken telt een goede kleur pas als je minstens twee tophonneurs hebt.", ["tophonneurs"]],
    ["Troef", "De kleur van de speelsoort. Als de speelsoort SA is, is er geen troef.", ["troeven", "troeft"]],
    ["Troef trekken", "Als leider troef spelen totdat de tegenpartij geen of weinig troeven meer heeft. Zo voorkom je vaak dat zij later jouw hoge kaarten kunnen aftroeven.", ["troeftrekken"]],
    ["Tweekleurenspel", "Een hand met twee lange kleuren, minstens een vijfkaart en een vierkaart."],
    ["Uitkomst", "De eerste kaart die in een spel wordt gespeeld."],
    ["Veilige hand", "De tegenstander die eventueel aan slag mag komen omdat dat naar verwachting weinig of geen schade oplevert."],
    ["Verliezers", "Slagen die je als leider verwacht te verliezen als je geen extra plan maakt, bijvoorbeeld door te troeven, een kleur vrij te spelen of een verliezer weg te gooien.", ["Verliezer", "verliezer"]],
    ["Verzaken", "Het spelen van een kaart van een andere kleur dan de voorgespeelde kleur terwijl je nog wel een kaart van die kleur in handen hebt."],
    ["Volgbod", "Een bod door de partij die niet het openingsbod heeft gedaan."],
    ["Vork", "Twee kaarten waarbij de tussenliggende kaart mist, zoals A-V, H-B of V-10."],
    ["Vierde-kleur-forcing", "Een kunstmatig bod in de vierde nog niet geboden kleur. Het vraagt partner om zijn hand verder te beschrijven en is in deze app mancheforcing.", ["vierde kleur forcing"]],
    ["Vuilnisbakkenbod", "Het 1SA-bijbod na partners opening in een kleur: meestal 6-9 punten, geen steun voor partners kleur en geen eigen kleur die je op eenhoogte kunt bieden. Het heet zo omdat handen die nergens anders goed passen hierin terechtkomen; het belooft dus niet per se een mooie sans-atouthand."],
    ["Vrijspelen", "Een kleur zo spelen dat de hogere kaarten van de tegenpartij eruit gaan en jouw lagere kaarten later slagen kunnen worden.", ["vrijgespeeld", "vrij te spelen"]],
    ["Werkkleur", "De kleur die het meest in aanmerking komt voor het ontwikkelen van extra slagen, vooral belangrijk in een SA-contract."],
    ["Zwakke twee", "Een opening van 2 ruiten, 2 harten of 2 schoppen die een zeskaart en beperkte kracht belooft.", ["zwakke 2", "weak two"]]
  ].map(([term, definition, aliases = []]) => ({ term, definition, aliases }));

  const aliasToEntry = new Map();
  const rawAliases = new Map();
  entries.forEach((entry) => {
    [entry.term, ...entry.aliases].forEach((alias) => {
      const key = normalize(alias);
      aliasToEntry.set(key, entry);
      rawAliases.set(key, alias);
    });
  });

  const aliases = [...rawAliases.values()]
    .map(escapeRegExp)
    .sort((a, b) => b.length - a.length);
  const linkPattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${aliases.join("|")})(?=$|[^\\p{L}\\p{N}])`, "giu");
  let nodes = {};
  let selectedTerm = entries[0].term;

  function init(nextNodes) {
    nodes = nextNodes;
    renderList();
    nodes.searchInput?.addEventListener("input", updateSearchResults);
    nodes.openButton?.addEventListener("click", () => open());
    nodes.closeButton?.addEventListener("click", close);
    nodes.dialog?.addEventListener("click", (event) => {
      if (event.target === nodes.dialog) close();
    });
    renderDetail(entryForTerm(selectedTerm));
  }

  function open(term = selectedTerm) {
    const requestedEntry = entryForTerm(term);
    const visibleEntries = matchingEntries();
    renderList(visibleEntries);
    renderDetail(requestedEntry || visibleEntries[0] || entries[0]);
    if (typeof nodes.dialog?.showModal === "function") {
      nodes.dialog.showModal();
    } else {
      nodes.dialog?.setAttribute("open", "");
    }
    nodes.searchInput?.focus();
  }

  function close() {
    if (typeof nodes.dialog?.close === "function") {
      nodes.dialog.close();
    } else {
      nodes.dialog?.removeAttribute("open");
    }
  }

  function renderList(nextEntries = matchingEntries()) {
    if (!nodes.list) return;
    nodes.list.innerHTML = "";
    if (!nextEntries.length) {
      const empty = document.createElement("p");
      empty.className = "glossary-empty";
      empty.textContent = "Geen begrippen gevonden.";
      nodes.list.appendChild(empty);
      return;
    }
    nextEntries.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "glossary-list-button";
      button.textContent = entry.term;
      button.addEventListener("click", () => renderDetail(entry));
      nodes.list.appendChild(button);
    });
  }

  function updateSearchResults() {
    const nextEntries = matchingEntries();
    renderList(nextEntries);
    const selectedEntry = entryForTerm(selectedTerm);
    const nextEntry = nextEntries.includes(selectedEntry) ? selectedEntry : nextEntries[0];
    if (nextEntry) {
      renderDetail(nextEntry);
      return;
    }
    selectedTerm = "";
    if (nodes.term) nodes.term.textContent = "Geen resultaat";
    if (nodes.definition) nodes.definition.textContent = "Probeer een ander begrip of zoekwoord.";
  }

  function renderDetail(entry) {
    if (!entry) return;
    selectedTerm = entry.term;
    if (nodes.term) nodes.term.textContent = entry.term;
    if (nodes.definition) {
      nodes.definition.replaceChildren(linkifyText(entry.definition, entry));
    }
    nodes.list?.querySelectorAll(".glossary-list-button").forEach((button) => {
      button.classList.toggle("active", button.textContent === entry.term);
    });
  }

  function linkifyText(text, currentEntry = null) {
    const fragment = document.createDocumentFragment();
    if (!text) return fragment;

    let index = 0;
    for (const match of text.matchAll(linkPattern)) {
      const prefix = match[1] || "";
      const matchedText = match[2];
      const prefixIndex = match.index;
      const termIndex = prefixIndex + prefix.length;
      const entry = entryForTerm(matchedText);

      fragment.append(document.createTextNode(text.slice(index, prefixIndex)));
      if (prefix) fragment.append(document.createTextNode(prefix));

      if (!entry || entry === currentEntry) {
        fragment.append(document.createTextNode(matchedText));
      } else {
        fragment.append(glossaryLink(matchedText, entry));
      }
      index = termIndex + matchedText.length;
    }
    fragment.append(document.createTextNode(text.slice(index)));
    return fragment;
  }

  function glossaryLink(label, entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "glossary-link";
    button.textContent = label;
    button.title = entry.definition;
    button.addEventListener("click", () => open(entry.term));
    return button;
  }

  function entryForTerm(term) {
    return aliasToEntry.get(normalize(term));
  }

  function matchingEntries() {
    const query = normalize(nodes.searchInput?.value || "").trim();
    if (!query) return entries;
    return entries.filter((entry) => searchableText(entry).includes(query));
  }

  function searchableText(entry) {
    return normalize([entry.term, entry.definition, ...entry.aliases].join(" "));
  }

  function normalize(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return { entries, init, open, linkifyText };
})();
