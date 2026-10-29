# Makes the browser icons from the ❖ master glyph (src/lib/glyphs.ts) in the Figma component purple
# (--color-figma-component in src/styles/tokens.css: light #8c38f2, dark #a879ff).
# Run again if the glyph or that token changes:  python3 scripts/make-icons.py  (needs Pillow)
from PIL import Image, ImageDraw

LIGHT, DARK = '#8c38f2', '#a879ff'
# The four diamonds of the master glyph on its 12x12 grid: centre x, centre y, radius.
DIAMONDS = [(6, 2.75, 2.55), (9.25, 6, 2.55), (6, 9.25, 2.55), (2.75, 6, 2.55)]

def path(cx, cy, r):
    n = lambda v: f'{v:g}'
    return f'M{n(cx)} {n(cy - r)}L{n(cx + r)} {n(cy)}L{n(cx)} {n(cy + r)}L{n(cx - r)} {n(cy)}Z'

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
  <style>path{{fill:{LIGHT}}}@media (prefers-color-scheme:dark){{path{{fill:{DARK}}}}}</style>
  <path d="{''.join(path(*d) for d in DIAMONDS)}"/>
</svg>
'''
open('public/favicon.svg', 'w').write(svg)

def draw(size, pad, bg=None):
    big = size * 8  # draw large, then shrink, for smooth edges
    im = Image.new('RGBA', (big, big), bg or (0, 0, 0, 0))
    g = ImageDraw.Draw(im)
    s = (big - 2 * pad * 8) / 12
    o = pad * 8
    for cx, cy, r in DIAMONDS:
        g.polygon([(o + cx * s, o + (cy - r) * s), (o + (cx + r) * s, o + cy * s),
                   (o + cx * s, o + (cy + r) * s), (o + (cx - r) * s, o + cy * s)], fill=LIGHT)
    return im.resize((size, size), Image.LANCZOS)

draw(48, 0).save('public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
# iOS fills see-through icons with black, so the home screen icon gets a white square.
draw(180, 34, bg='#ffffff').convert('RGB').save('public/apple-touch-icon.png')
print('wrote public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png')
