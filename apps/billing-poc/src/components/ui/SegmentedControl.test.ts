import { expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import BinaryToggle from "./BinaryToggle"
import SegmentedControl from "./SegmentedControl"

it("exposes all three states and exactly one selected state for every payment percentage", () => {
  for (const value of [0, 50, 100]) {
    const html = renderToStaticMarkup(
      createElement(SegmentedControl<number>, {
        value,
        ariaLabel: "Payment progress",
        onChange: () => {},
        options: [
          { value: 0, label: "0%" },
          { value: 50, label: "50%" },
          { value: 100, label: "100%" },
        ],
      })
    )
    expect(html.match(/<button /g)).toHaveLength(3)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html).toContain(`>${value}%</button>`)
    expect(html).toContain(">0%</button>")
    expect(html).toContain(">50%</button>")
    expect(html).toContain(">100%</button>")
  }
})
it("preserves binary labels, selection, leading content and per-option tones", () => {
  const html = renderToStaticMarkup(
    createElement(BinaryToggle, {
      value: "right",
      leftLabel: "Show",
      rightLabel: "Hide",
      ariaLabel: "Toggle charts",
      onChange: () => {},
      leading: "📊",
      rightIndicatorClassName: "bg-emerald-600",
      rightSelectedTextClassName: "text-white",
    })
  )
  expect(html.match(/<button /g)).toHaveLength(2)
  expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
  expect(html).toContain(">Show</button>")
  expect(html).toContain(">Hide</button>")
  expect(html).toContain("bg-emerald-600")
  expect(html).toContain("📊")
})
