import { mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'https://pulpo-azul.vercel.app';
const languages = {
  ca: {
    name: 'Català',
    replacements: [
      ['Pulpo Azul — Des sorties en mer pour les enfants', 'Pulpo Azul — Sortides al mar per a infants'],
      ["Pulpo Azul emmène des enfants de 8 à 12 ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger. Soutenez une sortie.", 'Pulpo Azul porta infants de 8 a 12 anys a la mar per descobrir la Mediterrània i aprendre a protegir-la. Dona suport a una sortida.'],
      ['Découvrez<br>la Méditerranée.', 'Descobreix<br>la Mediterrània.'],
      ["Nous emmenons des enfants de 8 à 12&nbsp;ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger.", 'Portem infants de 8 a 12&nbsp;anys a la mar per descobrir la Mediterrània i aprendre a protegir-la.'],
      ['Soutenir une sortie', 'Dona suport a una sortida'], ['Prendre une grande inspiration&nbsp;↓', 'Respira profundament&nbsp;↓'],
      ['— 6 m · Les sorties', '— 6 m · Les sortides'], ['Une journée à bord.', 'Un dia a bord.'],
      ['Naviguer', 'Navegar'], ['Observer', 'Observar'], ['Protéger', 'Protegir'],
      ["Monter à bord d'un vrai bateau, apprendre les gestes marins, la sécurité, le vent — et regarder la côte s'éloigner.", "Pujar a bord d'un vaixell de debò, aprendre les maniobres marineres, la seguretat, el vent i veure com la costa s'allunya."],
      ["Mettre la tête sous l'eau&nbsp;: les herbiers de posidonie, les poissons, la lumière. Un monde entier à quelques mètres du bord.", "Posar el cap sota l'aigua&nbsp;: les praderies de posidònia, els peixos, la llum. Tot un món a pocs metres de la costa."],
      ["Comprendre pourquoi cet écosystème est fragile, ramasser ce qui n'a rien à faire dans l'eau, et repartir avec l'envie d'en prendre soin.", "Entendre per què aquest ecosistema és fràgil, recollir allò que no hauria de ser a l'aigua i tornar amb ganes de cuidar-lo."],
      ['— 12 m · La mission', '— 12 m · La missió'], ["On protège ce que l'on connaît.", 'Protegim allò que coneixem.'],
      ["Chaque sortie en mer plante une graine&nbsp;: un enfant qui a nagé au-dessus d'un herbier ne le regardera plus jamais comme un simple fond.", "Cada sortida al mar planta una llavor&nbsp;: un infant que ha nedat sobre una praderia ja no la veurà mai més com un simple fons."],
      ['— 18 m · Soutenir', '— 18 m · Dona suport'], ['Chaque don finance<br>directement une sortie.', 'Cada donació finança<br>directament una sortida.'],
      ['un masque et un tuba pour un enfant', 'una màscara i un tub per a un infant'], ['une journée en mer pour un enfant', 'un dia al mar per a un infant'], ['une sortie complète pour un petit groupe', 'una sortida completa per a un grup petit'], ['Faire un don', 'Fes una donació'],
      ['— 24 m · L’équipe', "— 24 m · L'equip"], ['Qui sommes-nous&nbsp;?', 'Qui som&nbsp;?'], ['Enfants accueillis', 'Infants acollits'], ['Encadrement', 'Acompanyament'], ['Bénévoles formés', 'Voluntariat format'], ['Langues', 'Llengües'], ['Remonter à la surface', 'Torna a la superfície'],
      ['Sponsors — Pulpo Azul', 'Patrocinadors — Pulpo Azul'], ['Ils font flotter le projet.', 'Fan surar el projecte.'], ['Devenir sponsor', 'Fes-te patrocinador'], ['Votre nom navigue avec nous.', 'El teu nom navega amb nosaltres.'], ['Replonger&nbsp;↓', 'Torna a submergir-te&nbsp;↓']
    ]
  },
  es: {
    name: 'Español',
    replacements: [
      ['Pulpo Azul — Des sorties en mer pour les enfants', 'Pulpo Azul — Salidas al mar para niños'],
      ["Pulpo Azul emmène des enfants de 8 à 12 ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger. Soutenez une sortie.", 'Pulpo Azul lleva a niños de 8 a 12 años al mar para descubrir el Mediterráneo y aprender a protegerlo. Apoya una salida.'],
      ['Découvrez<br>la Méditerranée.', 'Descubre<br>el Mediterráneo.'], ["Nous emmenons des enfants de 8 à 12&nbsp;ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger.", 'Llevamos a niños de 8 a 12&nbsp;años al mar para descubrir el Mediterráneo y aprender a protegerlo.'],
      ['Soutenir une sortie', 'Apoya una salida'], ['Prendre une grande inspiration&nbsp;↓', 'Respira hondo&nbsp;↓'], ['— 6 m · Les sorties', '— 6 m · Las salidas'], ['Une journée à bord.', 'Un día a bordo.'], ['Naviguer', 'Navegar'], ['Observer', 'Observar'], ['Protéger', 'Proteger'],
      ["Monter à bord d'un vrai bateau, apprendre les gestes marins, la sécurité, le vent — et regarder la côte s'éloigner.", 'Subir a bordo de un barco de verdad, aprender maniobras marineras, seguridad y viento, y ver alejarse la costa.'],
      ["Mettre la tête sous l'eau&nbsp;: les herbiers de posidonie, les poissons, la lumière. Un monde entier à quelques mètres du bord.", 'Meter la cabeza bajo el agua: las praderas de posidonia, los peces, la luz. Un mundo entero a pocos metros de la orilla.'],
      ["Comprendre pourquoi cet écosystème est fragile, ramasser ce qui n'a rien à faire dans l'eau, et repartir avec l'envie d'en prendre soin.", 'Entender por qué este ecosistema es frágil, recoger lo que no debe estar en el agua y volver con ganas de cuidarlo.'],
      ['— 12 m · La mission', '— 12 m · La misión'], ["On protège ce que l'on connaît.", 'Protegemos lo que conocemos.'], ['— 18 m · Soutenir', '— 18 m · Apoyar'], ['Chaque don finance<br>directement une sortie.', 'Cada donación financia<br>directamente una salida.'], ['Faire un don', 'Donar'], ['un masque et un tuba pour un enfant', 'una máscara y un tubo para un niño'], ['une journée en mer pour un enfant', 'un día en el mar para un niño'], ['une sortie complète pour un petit groupe', 'una salida completa para un grupo pequeño'], ['Qui sommes-nous&nbsp;?', '¿Quiénes somos&nbsp;?'], ['Enfants accueillis', 'Niños acogidos'], ['Encadrement', 'Acompañamiento'], ['Bénévoles formés', 'Voluntariado formado'], ['Langues', 'Idiomas'], ['Remonter à la surface', 'Volver a la superficie'], ['Sponsors — Pulpo Azul', 'Patrocinadores — Pulpo Azul'], ['Ils font flotter le projet.', 'Ellos hacen flotar el proyecto.'], ['Devenir sponsor', 'Hazte patrocinador'], ['Votre nom navigue avec nous.', 'Tu nombre navega con nosotros.'], ['Replonger&nbsp;↓', 'Sumérgete de nuevo&nbsp;↓']
    ]
  },
  en: {
    name: 'English',
    replacements: [
      ['Pulpo Azul — Des sorties en mer pour les enfants', 'Pulpo Azul — Sea trips for children'], ["Pulpo Azul emmène des enfants de 8 à 12 ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger. Soutenez une sortie.", 'Pulpo Azul takes children aged 8 to 12 out to sea to discover the Mediterranean and learn how to protect it. Support a trip.'], ['Découvrez<br>la Méditerranée.', 'Discover<br>the Mediterranean.'], ["Nous emmenons des enfants de 8 à 12&nbsp;ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger.", 'We take children aged 8 to 12&nbsp;out to sea to discover the Mediterranean and learn how to protect it.'], ['Soutenir une sortie', 'Support a trip'], ['Prendre une grande inspiration&nbsp;↓', 'Take a deep breath&nbsp;↓'], ['— 6 m · Les sorties', '— 6 m · The trips'], ['Une journée à bord.', 'A day on board.'], ['Naviguer', 'Sail'], ['Observer', 'Observe'], ['Protéger', 'Protect'], ["Monter à bord d'un vrai bateau, apprendre les gestes marins, la sécurité, le vent — et regarder la côte s'éloigner.", 'Board a real boat, learn seamanship, safety and wind, and watch the coast drift away.'], ["Mettre la tête sous l'eau&nbsp;: les herbiers de posidonie, les poissons, la lumière. Un monde entier à quelques mètres du bord.", 'Put your head under water: seagrass meadows, fish and light. A whole world just metres from shore.'], ["Comprendre pourquoi cet écosystème est fragile, ramasser ce qui n'a rien à faire dans l'eau, et repartir avec l'envie d'en prendre soin.", 'Understand why this ecosystem is fragile, pick up what does not belong in the water, and leave wanting to care for it.'], ['— 12 m · La mission', '— 12 m · The mission'], ["On protège ce que l'on connaît.", 'We protect what we know.'], ['— 18 m · Soutenir', '— 18 m · Support'], ['Chaque don finance<br>directement une sortie.', 'Every donation directly<br>funds a trip.'], ['Faire un don', 'Donate'], ['un masque et un tuba pour un enfant', 'a mask and snorkel for one child'], ['une journée en mer pour un enfant', 'a day at sea for one child'], ['une sortie complète pour un petit groupe', 'a full trip for a small group'], ['Qui sommes-nous&nbsp;?', 'Who are we&nbsp;?'], ['Enfants accueillis', 'Children welcomed'], ['Encadrement', 'Supervision'], ['Bénévoles formés', 'Trained volunteers'], ['Langues', 'Languages'], ['Remonter à la surface', 'Return to the surface'], ['Sponsors — Pulpo Azul', 'Sponsors — Pulpo Azul'], ['Ils font flotter le projet.', 'They keep the project afloat.'], ['Devenir sponsor', 'Become a sponsor'], ['Votre nom navigue avec nous.', 'Your name sails with us.'], ['Replonger&nbsp;↓', 'Dive back in&nbsp;↓']
    ]
  }
};

const alternates = (path) => ['fr', 'ca', 'es', 'en'].map((code) => `<link rel="alternate" hreflang="${code}" href="${origin}${code === 'fr' ? path : `/${code}${path}`}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${origin}${path}">`;
const languageLabels = { fr: 'Choisir une langue', ca: 'Tria una llengua', es: 'Elegir idioma', en: 'Choose a language' };
const languageNames = { fr: 'Français', ca: 'Català', es: 'Español', en: 'English' };
const langHref = (page, code) => (code === 'fr' ? page : `/${code}${page}`);
const languageSwitch = (page, current) => `<nav class="lang-switch" aria-label="${languageLabels[current]}">` +
  Object.entries(languageNames).map(([code, name]) => `<a href="${langHref(page, code)}" lang="${code}" hreflang="${code}" title="${name}"${current === code ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('') + '</nav>';
const languageLinks = (page, current) => `<p class="fine language-links" aria-label="${languageLabels[current]}"><a href="${page}" lang="fr"${current === 'fr' ? ' aria-current="page"' : ''}>Français</a> · <a href="/ca${page}" lang="ca"${current === 'ca' ? ' aria-current="page"' : ''}>Català</a> · <a href="/es${page}" lang="es"${current === 'es' ? ' aria-current="page"' : ''}>Español</a> · <a href="/en${page}" lang="en"${current === 'en' ? ' aria-current="page"' : ''}>English</a></p>`;

// Strings missed by the first pass (issue #1: French text left at the bottom of the localized pages).
// Source strings use straight apostrophes — keep them straight here so they actually match.
const extra = {
  ca: [
    ["Siège&nbsp;: Calle Bisbe Pont, 4 – 07400 Alcúdia · NIF&nbsp;: G19754712 · Registre des associations des Baléares&nbsp;: n°&nbsp;311000011901, Section&nbsp;1", "Seu&nbsp;: Calle Bisbe Pont, 4 – 07400 Alcúdia · NIF&nbsp;: G19754712 · Registre d'associacions de les Illes Balears&nbsp;: núm.&nbsp;311000011901, Secció&nbsp;1"],
    ['<a href="#sponsors">Sponsors</a>', '<a href="#sponsors">Patrocinadors</a>'], ['— 29 m · Sponsors', '— 29 m · Patrocinadors'],
    ["Chaque sortie en mer plante une graine&nbsp;: un enfant qui a nagé au-dessus d'un herbier ne le regardera plus jamais comme un simple fond.", "Cada sortida al mar planta una llavor&nbsp;: un infant que ha nedat sobre una praderia ja no la veurà mai més com un simple fons."],
    ["Vous préférez donner autrement, ou en parler d'abord&nbsp;? Écrivez-nous&nbsp;:", "Prefereixes donar d'una altra manera o parlar-ne abans&nbsp;? Escriu-nos&nbsp;:"],
    ["Entreprises locales, clubs nautiques, commerces&nbsp;: votre soutien permet d'inviter plus d'enfants à bord — et votre nom navigue avec nous.", "Empreses locals, clubs nàutics, comerços&nbsp;: el vostre suport permet convidar més infants a bord, i el vostre nom navega amb nosaltres."],
    ['Voir nos sponsors&nbsp;→', 'Veure els patrocinadors&nbsp;→'],
    ['Pulpo Azul · Association', 'Pulpo Azul · Associació'],
    ["— 15 m · Pélagie passe — on l'admire de loin", "— 15 m · Passa una pelàgia — l'admirem de lluny"],
    ["— 21 m · Ici, on n'entend plus que soi", "— 21 m · Aquí ja només s'escolta un mateix"],
    ["« J'ai vu un poisson plus grand que mon bras ! » — Léo, 9 ans", "« He vist un peix més gran que el meu braç! » — Léo, 9 anys"],
    ['« En dessous, on entend juste son cœur. » — Mar, 11 ans', '« A sota, només sents el teu cor. » — Mar, 11 anys'],
    ['« Je veux être capitaine et protéger la mer. » — Iker, 8 ans', '« Vull ser capità i protegir el mar. » — Iker, 8 anys'],
    ["Lire une parole d'enfant", "Llegir una frase d'un infant"],
    ['<span>Contact</span>', '<span>Contacte</span>'], ['<span>Téléphone</span>', '<span>Telèfon</span>'],
    ['<p class="foot-h">Contact</p>', '<p class="foot-h">Contacte</p>'],
    ['aria-label="Sponsors"', 'aria-label="Patrocinadors"'], ['aria-label="Nos sponsors"', 'aria-label="Els nostres patrocinadors"'],
    ['Site du sponsor', 'Web del patrocinador'], ['Logo sponsor', 'Logotip del patrocinador'],
    ['Aller à devenir sponsor', 'Ves a fer-te patrocinador'], ['aria-label="Navigation"', 'aria-label="Navegació"'],
    ['Sponsors · la surface', 'Patrocinadors · la superfície'],
    ["Chaque sortie en mer a un coût&nbsp;: le bateau, le carburant, l'équipement, l'encadrement. Nos sponsors le rendent possible — et permettent d'inviter plus d'enfants à bord.", "Cada sortida al mar té un cost&nbsp;: el vaixell, el combustible, l'equipament i l'acompanyament. Els patrocinadors la fan possible i permeten convidar més infants a bord."],
    ['Votre soutien finance directement des journées en mer pour des enfants de 8 à 12&nbsp;ans — pas des frais de structure.', 'El vostre suport finança directament dies al mar per a infants de 8 a 12&nbsp;anys, no despeses d\'estructura.'],
    ['Votre logo sur cette page, sur nos supports, et associé à chaque sortie que vous rendez possible.', 'El vostre logotip en aquesta pàgina, als nostres materials i associat a cada sortida que feu possible.'],
    ['Photos des sorties, bilan simple en fin de saison&nbsp;: de quoi montrer à vos clients et vos équipes ce que votre soutien a permis.', 'Fotos de les sortides i un balanç senzill a final de temporada&nbsp;: per mostrar als vostres clients i equips què ha permès el vostre suport.'],
    ['Ou par téléphone&nbsp;:', 'O per telèfon&nbsp;:'],
    ['Ils font flotter le projet : les sponsors de Pulpo Azul permettent d\'emmener plus d\'enfants en mer. Devenez sponsor.', 'Fan surar el projecte: els patrocinadors de Pulpo Azul permeten portar més infants al mar. Fes-te patrocinador.'],
    ['Votre nom navigue avec nous : sponsorisez des journées en mer pour des enfants de 8 à 12 ans.', 'El teu nom navega amb nosaltres: patrocina dies al mar per a infants de 8 a 12 anys.'],
    ['Chaque don finance directement une journée en mer pour un enfant. Plongez.', 'Cada donació finança directament un dia al mar per a un infant. Submergeix-te.'],
    ['Pulpo Azul emmène des enfants de 8 à 12 ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger.', 'Pulpo Azul porta infants de 8 a 12 anys a la mar per descobrir la Mediterrània i aprendre a protegir-la.']
  ],
  es: [
    ["Siège&nbsp;: Calle Bisbe Pont, 4 – 07400 Alcúdia · NIF&nbsp;: G19754712 · Registre des associations des Baléares&nbsp;: n°&nbsp;311000011901, Section&nbsp;1", "Sede&nbsp;: Calle Bisbe Pont, 4 – 07400 Alcúdia · NIF&nbsp;: G19754712 · Registro de asociaciones de las Islas Baleares&nbsp;: n.º&nbsp;311000011901, Sección&nbsp;1"],
    ['<a href="#sponsors">Sponsors</a>', '<a href="#sponsors">Patrocinadores</a>'], ['— 29 m · Sponsors', '— 29 m · Patrocinadores'],
    ["Chaque sortie en mer plante une graine&nbsp;: un enfant qui a nagé au-dessus d'un herbier ne le regardera plus jamais comme un simple fond.", "Cada salida al mar planta una semilla&nbsp;: un niño que ha nadado sobre una pradera ya nunca la verá como un simple fondo."],
    ["Vous préférez donner autrement, ou en parler d'abord&nbsp;? Écrivez-nous&nbsp;:", "¿Prefieres donar de otra forma o hablarlo antes? Escríbenos&nbsp;:"],
    ["Entreprises locales, clubs nautiques, commerces&nbsp;: votre soutien permet d'inviter plus d'enfants à bord — et votre nom navigue avec nous.", "Empresas locales, clubes náuticos, comercios&nbsp;: vuestro apoyo permite invitar a más niños a bordo, y vuestro nombre navega con nosotros."],
    ['Voir nos sponsors&nbsp;→', 'Ver nuestros patrocinadores&nbsp;→'],
    ['Pulpo Azul · Association', 'Pulpo Azul · Asociación'],
    ["— 15 m · Pélagie passe — on l'admire de loin", "— 15 m · Pasa una pelagia — la admiramos de lejos"],
    ["— 21 m · Ici, on n'entend plus que soi", "— 21 m · Aquí ya solo te oyes a ti mismo"],
    ["« J'ai vu un poisson plus grand que mon bras ! » — Léo, 9 ans", "« ¡Vi un pez más grande que mi brazo! » — Léo, 9 años"],
    ['« En dessous, on entend juste son cœur. » — Mar, 11 ans', '« Debajo, solo oyes tu corazón. » — Mar, 11 años'],
    ['« Je veux être capitaine et protéger la mer. » — Iker, 8 ans', '« Quiero ser capitán y proteger el mar. » — Iker, 8 años'],
    ["Lire une parole d'enfant", "Leer una frase de un niño"],
    ['<span>Contact</span>', '<span>Contacto</span>'], ['<span>Téléphone</span>', '<span>Teléfono</span>'],
    ['<p class="foot-h">Contact</p>', '<p class="foot-h">Contacto</p>'],
    ['aria-label="Sponsors"', 'aria-label="Patrocinadores"'], ['aria-label="Nos sponsors"', 'aria-label="Nuestros patrocinadores"'],
    ['Site du sponsor', 'Web del patrocinador'], ['Logo sponsor', 'Logotipo del patrocinador'],
    ['Aller à devenir sponsor', 'Ir a hacerse patrocinador'], ['aria-label="Navigation"', 'aria-label="Navegación"'],
    ['Sponsors · la surface', 'Patrocinadores · la superficie'],
    ["Chaque sortie en mer a un coût&nbsp;: le bateau, le carburant, l'équipement, l'encadrement. Nos sponsors le rendent possible — et permettent d'inviter plus d'enfants à bord.", "Cada salida al mar tiene un coste&nbsp;: el barco, el combustible, el equipo y el acompañamiento. Nuestros patrocinadores la hacen posible y permiten invitar a más niños a bordo."],
    ['Votre soutien finance directement des journées en mer pour des enfants de 8 à 12&nbsp;ans — pas des frais de structure.', 'Vuestro apoyo financia directamente días en el mar para niños de 8 a 12&nbsp;años, no gastos de estructura.'],
    ['Votre logo sur cette page, sur nos supports, et associé à chaque sortie que vous rendez possible.', 'Vuestro logotipo en esta página, en nuestros materiales y asociado a cada salida que hacéis posible.'],
    ['Photos des sorties, bilan simple en fin de saison&nbsp;: de quoi montrer à vos clients et vos équipes ce que votre soutien a permis.', 'Fotos de las salidas y un balance sencillo a final de temporada&nbsp;: para mostrar a vuestros clientes y equipos lo que ha permitido vuestro apoyo.'],
    ['Ou par téléphone&nbsp;:', 'O por teléfono&nbsp;:'],
    ['Ils font flotter le projet : les sponsors de Pulpo Azul permettent d\'emmener plus d\'enfants en mer. Devenez sponsor.', 'Hacen flotar el proyecto: los patrocinadores de Pulpo Azul permiten llevar a más niños al mar. Hazte patrocinador.'],
    ['Votre nom navigue avec nous : sponsorisez des journées en mer pour des enfants de 8 à 12 ans.', 'Tu nombre navega con nosotros: patrocina días en el mar para niños de 8 a 12 años.'],
    ['Chaque don finance directement une journée en mer pour un enfant. Plongez.', 'Cada donación financia directamente un día en el mar para un niño. Sumérgete.'],
    ['Pulpo Azul emmène des enfants de 8 à 12 ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger.', 'Pulpo Azul lleva a niños de 8 a 12 años al mar para descubrir el Mediterráneo y aprender a protegerlo.']
  ],
  en: [
    ["Siège&nbsp;: Calle Bisbe Pont, 4 – 07400 Alcúdia · NIF&nbsp;: G19754712 · Registre des associations des Baléares&nbsp;: n°&nbsp;311000011901, Section&nbsp;1", "Registered office&nbsp;: Calle Bisbe Pont, 4 – 07400 Alcúdia · NIF&nbsp;: G19754712 · Balearic Islands Register of Associations&nbsp;: no.&nbsp;311000011901, Section&nbsp;1"],
    ["Chaque sortie en mer plante une graine&nbsp;: un enfant qui a nagé au-dessus d'un herbier ne le regardera plus jamais comme un simple fond.", "Every sea trip plants a seed: a child who has swum over a seagrass meadow will never again see it as just the seabed."],
    ["Vous préférez donner autrement, ou en parler d'abord&nbsp;? Écrivez-nous&nbsp;:", "Prefer to give another way, or talk first? Write to us:"],
    ["Entreprises locales, clubs nautiques, commerces&nbsp;: votre soutien permet d'inviter plus d'enfants à bord — et votre nom navigue avec nous.", "Local businesses, sailing clubs, shops: your support lets us welcome more children aboard — and your name sails with us."],
    ['Voir nos sponsors&nbsp;→', 'See our sponsors&nbsp;→'],
    ['Pulpo Azul · Association', 'Pulpo Azul · Non-profit'],
    ["— 15 m · Pélagie passe — on l'admire de loin", "— 15 m · A jellyfish drifts by — admired from afar"],
    ["— 21 m · Ici, on n'entend plus que soi", "— 21 m · Down here, all you hear is yourself"],
    ["« J'ai vu un poisson plus grand que mon bras ! » — Léo, 9 ans", "“I saw a fish bigger than my arm!” — Léo, 9"],
    ['« En dessous, on entend juste son cœur. » — Mar, 11 ans', '“Underneath, you only hear your heart.” — Mar, 11'],
    ['« Je veux être capitaine et protéger la mer. » — Iker, 8 ans', '“I want to be a captain and protect the sea.” — Iker, 8'],
    ["Lire une parole d'enfant", "Read what a child said"],
    ['<span>Téléphone</span>', '<span>Phone</span>'],
    ['aria-label="Nos sponsors"', 'aria-label="Our sponsors"'],
    ['Site du sponsor', 'Sponsor website'], ['Logo sponsor', 'Sponsor logo'],
    ['Aller à devenir sponsor', 'Go to become a sponsor'],
    ['Sponsors · la surface', 'Sponsors · the surface'],
    ["Chaque sortie en mer a un coût&nbsp;: le bateau, le carburant, l'équipement, l'encadrement. Nos sponsors le rendent possible — et permettent d'inviter plus d'enfants à bord.", "Every sea trip has a cost: the boat, fuel, equipment and supervision. Our sponsors make it possible — and let us welcome more children aboard."],
    ['Votre soutien finance directement des journées en mer pour des enfants de 8 à 12&nbsp;ans — pas des frais de structure.', 'Your support directly funds days at sea for children aged 8 to 12 — not overheads.'],
    ['Votre logo sur cette page, sur nos supports, et associé à chaque sortie que vous rendez possible.', 'Your logo on this page, on our materials, and tied to every trip you make possible.'],
    ['Photos des sorties, bilan simple en fin de saison&nbsp;: de quoi montrer à vos clients et vos équipes ce que votre soutien a permis.', 'Photos from the trips and a simple end-of-season report: enough to show your customers and teams what your support made possible.'],
    ['Ou par téléphone&nbsp;:', 'Or by phone:'],
    ['Ils font flotter le projet : les sponsors de Pulpo Azul permettent d\'emmener plus d\'enfants en mer. Devenez sponsor.', 'They keep the project afloat: Pulpo Azul sponsors let us take more children to sea. Become a sponsor.'],
    ['Votre nom navigue avec nous : sponsorisez des journées en mer pour des enfants de 8 à 12 ans.', 'Your name sails with us: sponsor days at sea for children aged 8 to 12.'],
    ['Chaque don finance directement une journée en mer pour un enfant. Plongez.', 'Every donation directly funds a day at sea for a child. Dive in.'],
    ['Pulpo Azul emmène des enfants de 8 à 12 ans en sortie en mer pour découvrir la Méditerranée et apprendre à la protéger.', 'Pulpo Azul takes children aged 8 to 12 out to sea to discover the Mediterranean and learn how to protect it.']
  ]
};

async function localize(sourceFile, outputFile, locale, page) {
  let html = await readFile(sourceFile, 'utf8');
  for (const [from, to] of locale.replacements) html = html.replaceAll(from, to);
  const shared = {
    ca: [
      ['Aller au soutien', 'Ves al suport'], ['Navigation par profondeur', 'Navegació per profunditat'], ['Les sorties', 'Les sortides'], ['La mission', 'La missió'], ['Soutenir', 'Dona suport'], ["L'équipe", "L'equip"], ['Plongée de nuit', 'Immersió nocturna'], ['Son ambiant', 'So ambiental'], ['Inspirez…', 'Inspira…'], ['La posidonie commence ici', 'La posidònia comença aquí'], ['Les saupes voyagent en bancs', 'Les salpes neden en banc'], ['Ici, on n’entend plus que soi', "Aquí ja només s'escolta un mateix"], ['Presque au fond', 'Gairebé al fons'], ["Pulpo Azul est une association à but non lucratif.", 'Pulpo Azul és una associació sense ànim de lucre.'], ['Elle est portée par des bénévoles passionnés de mer, encadrés pour accueillir des enfants à bord en toute sécurité.', 'La impulsa un voluntariat apassionat pel mar, preparat per acollir infants a bord amb tota seguretat.'], ['Entreprises locales, clubs nautiques, commerces&nbsp;: votre soutien permet d’inviter plus d’enfants à bord — et votre nom navigue avec nous.', 'Empreses locals, clubs nàutics i comerços: el vostre suport permet convidar més infants a bord i el vostre nom navega amb nosaltres.'], ['Des sorties en mer pour les enfants,<br>et une Méditerranée mieux protégée.', 'Sortides al mar per a infants,<br>i una Mediterrània més protegida.'], ['brins de posidonie — un par donateur. Le vôtre brillera ici.', 'brins de posidònia — un per donant. El teu brillarà aquí.'], ['Association à but non lucratif.', 'Associació sense ànim de lucre.'], ['Ils font flotter<br>le projet.', 'Fan surar<br>el projecte.'], ['Chaque sortie en mer a un coût&nbsp;: le bateau, le carburant, l’équipement, l’encadrement. Nos sponsors le rendent possible — et permettent d’inviter plus d’enfants à bord.', 'Cada sortida al mar té un cost: el vaixell, el combustible, l’equipament i l’acompanyament. Els patrocinadors la fan possible i permeten convidar més infants a bord.'], ['Un impact concret et local.', 'Un impacte concret i local.'], ['Une visibilité qui a du sens.', 'Una visibilitat amb sentit.'], ['Une histoire à raconter.', 'Una història per explicar.'], ['Choisir une langue', 'Tria una llengua']
    ],
    es: [
      ['Aller au soutien', 'Ir a apoyar'], ['Navigation par profondeur', 'Navegación por profundidad'], ['Les sorties', 'Las salidas'], ['La mission', 'La misión'], ['Soutenir', 'Apoyar'], ["L'équipe", 'El equipo'], ['Plongée de nuit', 'Inmersión nocturna'], ['Son ambiant', 'Sonido ambiente'], ['Inspirez…', 'Inspira…'], ['La posidonie commence ici', 'La posidonia empieza aquí'], ['Les saupes voyagent en bancs', 'Las salemas nadan en bancos'], ['Presque au fond', 'Casi en el fondo'], ["Pulpo Azul est une association à but non lucratif.", 'Pulpo Azul es una asociación sin ánimo de lucro.'], ['Elle est portée par des bénévoles passionnés de mer, encadrés pour accueillir des enfants à bord en toute sécurité.', 'La impulsan voluntarios apasionados por el mar, preparados para recibir a niños a bordo con total seguridad.'], ['Des sorties en mer pour les enfants,<br>et une Méditerranée mieux protégée.', 'Salidas al mar para niños,<br>y un Mediterráneo mejor protegido.'], ['brins de posidonie — un par donateur. Le vôtre brillera ici.', 'briznas de posidonia — una por donante. La tuya brillará aquí.'], ['Association à but non lucratif.', 'Asociación sin ánimo de lucro.'], ['Ils font flotter<br>le projet.', 'Hacen flotar<br>el proyecto.'], ['Chaque sortie en mer a un coût&nbsp;: le bateau, le carburant, l’équipement, l’encadrement. Nos sponsors le rendent possible — et permettent d’inviter plus d’enfants à bord.', 'Cada salida al mar tiene un coste: el barco, el combustible, el equipo y el acompañamiento. Nuestros patrocinadores la hacen posible e invitan a más niños a bordo.'], ['Un impact concret et local.', 'Un impacto concreto y local.'], ['Une visibilité qui a du sens.', 'Una visibilidad con sentido.'], ['Une histoire à raconter.', 'Una historia que contar.'], ['Choisir une langue', 'Elegir idioma']
    ],
    en: [
      ['Aller au soutien', 'Go to support'], ['Navigation par profondeur', 'Depth navigation'], ['Les sorties', 'The trips'], ['La mission', 'The mission'], ['Soutenir', 'Support'], ["L'équipe", 'The team'], ['Plongée de nuit', 'Night dive'], ['Son ambiant', 'Ambient sound'], ['Inspirez…', 'Breathe in…'], ['La posidonie commence ici', 'Seagrass starts here'], ['Les saupes voyagent en bancs', 'Saupes swim in shoals'], ['Presque au fond', 'Almost at the seabed'], ["Pulpo Azul est une association à but non lucratif.", 'Pulpo Azul is a non-profit association.'], ['Elle est portée par des bénévoles passionnés de mer, encadrés pour accueillir des enfants à bord en toute sécurité.', 'It is led by sea-loving volunteers, trained to welcome children safely on board.'], ['Des sorties en mer pour les enfants,<br>et une Méditerranée mieux protégée.', 'Sea trips for children,<br>and a better protected Mediterranean.'], ['brins de posidonie — un par donateur. Le vôtre brillera ici.', 'seagrass blades — one for each donor. Yours will shine here.'], ['Association à but non lucratif.', 'Non-profit association.'], ['Ils font flotter<br>le projet.', 'They keep<br>the project afloat.'], ['Chaque sortie en mer a un coût&nbsp;: le bateau, le carburant, l’équipement, l’encadrement. Nos sponsors le rendent possible — et permettent d’inviter plus d’enfants à bord.', 'Every sea trip has a cost: the boat, fuel, equipment and supervision. Our sponsors make it possible and welcome more children aboard.'], ['Un impact concret et local.', 'A tangible local impact.'], ['Une visibilité qui a du sens.', 'Visibility with purpose.'], ['Une histoire à raconter.', 'A story to tell.'], ['Choisir une langue', 'Choose a language']
    ]
  };
  for (const [from, to] of shared[outputFile.split('/')[0]]) html = html.replaceAll(from, to);
  for (const [from, to] of extra[outputFile.split('/')[0]]) html = html.replaceAll(from, to);
  html = html.replace('<html lang="fr">', `<html lang="${outputFile.split('/')[0]}">`);
  html = html.replace(/<link rel="canonical" href="[^"]+">[\s\S]*?<link rel="alternate" hreflang="x-default" href="[^"]+">/, `<link rel="canonical" href="${origin}/${outputFile.replace('index.html', '')}">\n${alternates(page)}`);
  html = html.replace(/<p class="fine language-links"[\s\S]*?<\/p>/, languageLinks(page, outputFile.split('/')[0]));
  html = html.replace(/<nav class="lang-switch"[\s\S]*?<\/nav>/, languageSwitch(page, outputFile.split('/')[0]));
  html = html.replace('href="styles.css"', 'href="../styles.css"').replace('src="script.js"', 'src="../script.js"');
  await mkdir(outputFile.split('/').slice(0, -1).join('/'), { recursive: true });
  await writeFile(outputFile, html);
}

for (const [code, locale] of Object.entries(languages)) {
  await localize('index.html', `${code}/index.html`, locale, '/');
  await localize('sponsors.html', `${code}/sponsors.html`, locale, '/sponsors.html');
}
