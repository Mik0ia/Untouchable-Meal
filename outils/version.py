"""
Met à jour les numéros de version des fichiers dans index.html.

Les navigateurs gardent en mémoire les fichiers JS et CSS : sans ça, un joueur
peut continuer à voir l'ancienne version du jeu après une modification.
Ce script donne à chaque fichier un numéro calculé à partir de son contenu ;
seuls les fichiers modifiés changent de numéro.

Utilisation (depuis la racine du projet) :   python3 outils/version.py
"""
import hashlib, json, pathlib, re

racine = pathlib.Path(__file__).resolve().parent.parent
index = racine / "index.html"

def empreinte(fichier):
    return hashlib.md5(fichier.read_bytes()).hexdigest()[:8]

imports = {}
for f in sorted((racine / "js").rglob("*.js")):
    chemin = "./" + f.relative_to(racine).as_posix()
    imports[chemin] = f"{chemin}?v={empreinte(f)}"

html = index.read_text(encoding="utf-8")
carte = json.dumps({"imports": imports}, indent=2, ensure_ascii=False)
bloc = f'<script type="importmap">\n{carte}\n</script>'
html = re.sub(r'<script type="importmap">.*?</script>', lambda m: bloc, html, flags=re.S)

# Feuilles de style et script principal
def versionner(m):
    attr, chemin = m.group(1), m.group(2)
    f = racine / chemin
    return f'{attr}="{chemin}?v={empreinte(f)}"' if f.exists() else m.group(0)
html = re.sub(r'(href|src)="((?:css|js)/[^"?]+)(?:\?v=[^"]*)?"', versionner, html)

index.write_text(html, encoding="utf-8")
print(f"{len(imports)} fichiers JS versionnés.")
