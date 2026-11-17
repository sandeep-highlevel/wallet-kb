// jsdom lacks these browser APIs; the app degrades without them, but GSAP and scroll code call them.
window.scrollTo = () => {}
window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as unknown as typeof window.matchMedia
Element.prototype.scrollIntoView ??= function () {}
