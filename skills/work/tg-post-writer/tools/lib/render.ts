import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { computeFontSize, truncateTitle } from "./title.ts";

const CANVAS = 1080;
const PADDING = 88;
const STRIPE_WIDTH = 8;
const TITLE_TOP = 120;
const DOTS_SIZE_SMALL = 24;
const DOTS_SIZE_LARGE = 36;
const DOTS_GAP = 20;

const COLORS = {
  bg: "#F7F4EE",
  accent: "#C0632A",
  textPrimary: "#1A1510",
} as const;

type JSXNode = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: JSXNode | JSXNode[] | string;
  };
};

function buildElement(displayTitle: string, fontSize: number): JSXNode {
  return {
    type: "div",
    props: {
      style: {
        width: CANVAS,
        height: CANVAS,
        background: COLORS.bg,
        display: "flex",
        position: "relative",
        fontFamily: "Literata",
      },
      children: [
        // Левая полоска
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              left: 0,
              top: 0,
              width: STRIPE_WIDTH,
              height: "100%",
              background: COLORS.accent,
            },
          },
        },
        // Title-блок
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              top: TITLE_TOP,
              left: PADDING,
              right: PADDING,
              fontSize: fontSize,
              fontWeight: 600,
              color: COLORS.textPrimary,
              letterSpacing: -1,
              lineHeight: 1.08,
            },
            children: displayTitle,
          },
        },
        // Нижние точки-акценты справа
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              right: PADDING,
              bottom: PADDING,
              alignItems: "center",
              gap: DOTS_GAP,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: DOTS_SIZE_SMALL,
                    height: DOTS_SIZE_SMALL,
                    borderRadius: "50%",
                    background: COLORS.accent,
                    opacity: 0.25,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: DOTS_SIZE_LARGE,
                    height: DOTS_SIZE_LARGE,
                    borderRadius: "50%",
                    background: COLORS.accent,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function loadFont(): Promise<ArrayBuffer> {
  const here = dirname(fileURLToPath(import.meta.url));
  // NOTE: Satori uses @shuding/opentype.js which fails to parse variable TTF
  // (fvar table name-id lookup crashes). We instantiate weight 600 as a static TTF
  // via fonttools: python3 -c "from fontTools.varLib.instancer import instantiateVariableFont; ..."
  // See assets/fonts/Literata-Variable.ttf (source) vs Literata-SemiBold.ttf (static instance).
  const fontPath = resolve(here, "../../assets/fonts/Literata-SemiBold.ttf");
  const buf = await readFile(fontPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength); // buf.buffer is a shared pool — must slice to own bytes
}

export async function renderCover(title: string, outPath: string): Promise<void> {
  const displayTitle = truncateTitle(title);
  // fontSize scaled against final (possibly truncated) length, not original
  const fontSize = computeFontSize(displayTitle);

  const fontData = await loadFont();

  // satori types expect ReactNode but accept plain {type, props} objects;
  // cast via Parameters avoids pulling in React types
  const svg = await satori(buildElement(displayTitle, fontSize) as Parameters<typeof satori>[0], {
    width: CANVAS,
    height: CANVAS,
    fonts: [
      {
        name: "Literata",
        data: fontData,
        weight: 600,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    background: COLORS.bg,
    fitTo: { mode: "width", value: CANVAS },
  });
  const png = resvg.render().asPng();

  await writeFile(outPath, png);
}
