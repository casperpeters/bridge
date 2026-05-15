# Bridgetafel Domain Context

Dit document bewaakt domeintaal voor Bridgetafel zodat lesroutes, oefenhanden en engine-uitleg niet door elkaar gaan lopen.

## Language

**SMB1-lesroute**: De cursusstructuur uit `Start met Bridge 1`, met lesnummers en hoofdstuktitels zoals vastgelegd in `docs/smb1.md`.
_Avoid_: huidige app-lesroute, losse lespagina

**App-les**: Een bestaande interactieve les in Bridgetafel, met eigen huidige nummering en tafelkoppeling.
_Avoid_: SMB1-les als de les nog niet naar de SMB1-structuur is hernummerd

**Oefenhandencatalogus**: Een verzameling reproduceerbare handen met stabiele ids, leerdoel, verwachte engineactie en reviewfocus.
_Avoid_: lesdata, willekeurige deal

**SMB1-oefenhand**: Een oefenhand die is geordend volgens de SMB1-lesroute, ook wanneer hij nog niet aan een app-les is gekoppeld.
_Avoid_: app-leshand

## Relationships

- Een **SMB1-lesroute** kan meerdere **SMB1-oefenhanden** per les bevatten.
- Een **App-les** kan tijdelijk naar bestaande oefenhanden blijven verwijzen, ook als die nog niet volledig volgens de **SMB1-lesroute** zijn geordend.
- Een **Oefenhandencatalogus** mag eerder volgens SMB1 worden gestructureerd dan de **App-les**-route.

## Flagged Ambiguities

- "Les" kan zowel **SMB1-lesroute** als **App-les** betekenen. Resolved: behandel SMB1-oefenhanden en bestaande app-lessen voorlopig als twee aparte sporen; herstructureer app-lessen later naar SMB1.
