# Why the dollar is a world currency

A 30-second, 960 × 540, 24 fps 3D explainer, adapted from the `3d-animator` skill in the repository ZIP. The MP4 is `why-the-dollar-is-the-world-currency.mp4`. It has readable on-screen text and an original synthesized instrumental soundtrack, not narration. The globe and currency imagery are original stylized illustrations, not geographical data.

## Re-render

Requirements: Node.js 22+, FFmpeg on `PATH`, and a Chromium-compatible browser with its operating system libraries. The bundled `@sparticuz/chromium` binary is intended for Linux; on another platform set `CHROME_PATH` to a local Chromium or Chrome executable. Set `FFMPEG` to the binary's path if it is not on `PATH`.

```sh
PUPPETEER_SKIP_DOWNLOAD=1 npm ci
python3 make_music.py              # creates sound/mix.wav
npm run stills                     # six sample frames
npm run final                      # full 30-second MP4
```

For a single shot (for example, seconds 10–15):

```sh
node render.mjs --video --from=10 --to=15 --fps=24 --n=2 --audio=sound/mix.wav --out=out/trade.mp4
```

Each frame is a function of time, so individual segments can be rendered independently. The `--n` flag controls sub-frame sampling; a higher number improves antialiasing and motion blur at the cost of render time. The supplied MP4 was rendered with two samples because the available GPU was software-based. The soundtrack is normalized when encoded.

## Further reading

- [Federal Reserve: The International Role of the U.S. Dollar](https://www.federalreserve.gov/econres/notes/feds-notes/the-international-role-of-the-us-dollar-20211006.html)
- [IMF: The International Monetary System and the IMF](https://www.imf.org/en/About/Factsheets/Sheets/2023/international-monetary-system-and-the-imf)
