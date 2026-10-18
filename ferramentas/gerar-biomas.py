# Gera biomas-mapa.js: o contorno do Brasil e a forma de cada bioma, usados pelo mapa
# "Fogo no Brasil" (página 5). Só precisa rodar de novo se os contornos abaixo mudarem.
#
#   python -I -X utf8 ferramentas/gerar-biomas.py
#
# Precisa da biblioteca shapely (pip install shapely).
#
# Como funciona: o contorno do Brasil vem dos limites estaduais do IBGE
# (ferramentas/brasil-contorno.json). Os biomas abaixo são contornos APROXIMADOS, desenhados
# à mão pela equipe. O script recorta cada bioma pelo contorno do Brasil e entrega a cada
# bioma as sobras vizinhas, para os seis juntos cobrirem o país inteiro, sem buracos e sem
# sobreposição. Os biomas pequenos vêm primeiro: nas bordas, eles têm preferência.

import json
import os

from shapely.geometry import MultiPolygon, Polygon
from shapely.ops import polylabel, unary_union

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)

# [longitude, latitude]; contornos aproximados (a ordem importa: pequenos primeiro)
BIOMAS = {
    "Pantanal": [[-58.3, -15.9], [-56.6, -16], [-55.4, -17.5], [-55.3, -19.5], [-56.2, -21], [-57.4, -22.2], [-58.3, -20.3], [-57.9, -18]],
    "Pampa": [[-56.5, -28], [-55.6, -28.8], [-54.5, -29.2], [-53, -29.6], [-51.5, -29.9], [-50, -29.9], [-49.6, -29.7], [-50.5, -31.5], [-52, -33], [-53.3, -34.2], [-54.5, -33], [-56.5, -32], [-58.2, -31], [-58.5, -29.5]],
    "Caatinga": [[-42.5, -2.8], [-41.5, -2.5], [-40, -2.5], [-38.5, -3.2], [-37, -4.5], [-35.9, -5.2], [-35.8, -6.5], [-36, -8], [-36.8, -9.3], [-37.8, -10.6], [-38.8, -12], [-39.7, -13.5], [-40.6, -15.2], [-42, -16.2], [-43.6, -16], [-44.2, -14.5], [-44, -12], [-43, -10], [-42, -8.5], [-42.8, -6.5], [-42.2, -4]],
    "Mata Atlântica": [[-35.9, -5.2], [-34.5, -5], [-34.3, -7.2], [-34.8, -9], [-36.5, -11], [-38, -13], [-38.6, -15.5], [-39.2, -18], [-40, -20.5], [-41, -22.5], [-43, -23.6], [-45.5, -24.5], [-48, -26], [-48.3, -28.5], [-49.6, -29.7], [-50, -29.9], [-51.5, -29.9], [-53, -29.6], [-54.5, -29.2], [-55.6, -28.8], [-56.5, -28], [-55, -27], [-54.6, -25.6], [-54.3, -24], [-55.6, -22.6], [-54, -22.8], [-52, -22.5], [-50, -22.3], [-47.5, -22.2], [-45.5, -21.2], [-43.8, -20], [-43.2, -18], [-43.6, -16], [-42, -16.2], [-40.6, -15.2], [-39.7, -13.5], [-38.8, -12], [-37.8, -10.6], [-36.8, -9.3], [-36, -8], [-35.8, -6.5]],
    "Cerrado": [[-44.3, -2.6], [-42.5, -2.8], [-42.2, -4], [-42.8, -6.5], [-42, -8.5], [-43, -10], [-44, -12], [-44.2, -14.5], [-43.6, -16], [-43.2, -18], [-43.8, -20], [-45.5, -21.2], [-47.5, -22.2], [-50, -22.3], [-52, -22.5], [-54, -22.8], [-55.6, -22.6], [-57.4, -22.2], [-56.2, -21], [-55.3, -19.5], [-55.4, -17.5], [-56.6, -16], [-58.3, -15.9], [-59.5, -15], [-60.2, -14], [-58.5, -14], [-56, -13.5], [-54, -13], [-52, -12.5], [-50.5, -11], [-49.5, -8.5], [-48, -6], [-46, -4.5]],
    "Amazônia": [[-44.3, -2.6], [-46, -0.7], [-48.5, 0.2], [-50, 1], [-50.5, 2.8], [-51.5, 4.7], [-52.8, 6], [-56, 6.5], [-60, 6.5], [-64, 5.5], [-67, 3.5], [-70.5, 2.5], [-74.5, -1], [-75, -7], [-74.5, -10], [-70, -11.5], [-66, -11], [-65, -12.5], [-62, -14.2], [-60.2, -14], [-58.5, -14], [-56, -13.5], [-54, -13], [-52, -12.5], [-50.5, -11], [-49.5, -8.5], [-48, -6], [-46, -4.5]],
}


def poligonos(g):
    if g.is_empty:
        return []
    if isinstance(g, Polygon):
        return [g]
    return [p for p in getattr(g, "geoms", []) if isinstance(p, Polygon)]


def aneis(g):
    # cada polígono vira uma lista de anéis (o primeiro é o contorno; os outros, buracos)
    saida = []
    for p in poligonos(g):
        if p.area < 1e-4:
            continue
        r = [[[round(x, 3), round(y, 3)] for x, y in p.exterior.coords]]
        r += [[[round(x, 3), round(y, 3)] for x, y in i.coords] for i in p.interiors]
        saida.append(r)
    return saida


def main():
    dados = json.load(open(os.path.join(AQUI, "brasil-contorno.json"), encoding="utf-8"))
    brasil = Polygon(dados["contorno"]).buffer(0)

    formas = {}
    ocupado = Polygon()
    for nome, pts in BIOMAS.items():
        g = Polygon(pts).buffer(0).intersection(brasil).difference(ocupado)
        formas[nome] = g
        ocupado = unary_union([ocupado, g])

    # sobras dentro do Brasil: vão para o bioma vizinho com a maior fronteira em comum
    for sobra in poligonos(brasil.difference(ocupado)):
        if sobra.area < 1e-9:
            continue
        borda = sobra.boundary
        melhor = max(formas, key=lambda n: borda.intersection(formas[n].buffer(1e-6)).length)
        formas[melhor] = unary_union([formas[melhor], sobra])

    saida = {"contorno": aneis(brasil), "biomas": {}}
    for nome, g in formas.items():
        maior = max(poligonos(g), key=lambda p: p.area)
        rot = polylabel(maior, tolerance=0.05)
        saida["biomas"][nome] = {"forma": aneis(g), "rotulo": [round(rot.x, 2), round(rot.y, 2)]}

    texto = (
        "// Gerado por ferramentas/gerar-biomas.py; não edite à mão.\n"
        "// Contorno do Brasil: limites estaduais do IBGE, simplificados. Biomas: contornos\n"
        "// aproximados da equipe, recortados pelo contorno do país. Coordenadas: [longitude, latitude].\n"
        "const BIOMAS_MAPA = " + json.dumps(saida, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    destino = os.path.join(RAIZ, "biomas-mapa.js")
    with open(destino, "w", encoding="utf-8") as f:
        f.write(texto)
    print(f"{destino}: {len(texto) // 1024} KB")
    for nome, g in formas.items():
        print(f"  {nome}: {g.area:.1f} graus²")


if __name__ == "__main__":
    main()
