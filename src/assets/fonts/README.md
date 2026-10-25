# Fonts for build-time images

`InstrumentSans-Variable.ttf` is Instrument Sans, the guides' text face, as a
TrueType file for `sharp`'s text rendering (src/lib/share-image.ts: the sports
pages' share cards, drawn at build). The @fontsource package ships woff2 only,
which fontconfig cannot load. From google/fonts (ofl/instrumentsans,
`InstrumentSans[wdth,wght].ttf`, 25 October 2026), under the SIL Open Font
License 1.1 (`InstrumentSans-OFL.txt`).
