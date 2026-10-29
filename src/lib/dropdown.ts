// Dropdown (SbDropdown.astro; Figma Dropdown 262:133 and Dropdown menu 262:141): a button that opens a menu of
// choices (role="menuitemradio"). Used by the engineer Storybook and the header's "View as" switch on small screens.
// Click opens, Escape or a click outside closes, arrow keys move in the menu, picking a choice closes it.

const parts = (dd: HTMLElement) => ({
  btn: dd.querySelector<HTMLButtonElement>('[data-sb-dd-btn]')!,
  menu: dd.querySelector<HTMLElement>('[role="menu"]')!,
  items: [...dd.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')],
});

/** Opens or closes the menu. `focus` moves focus to the checked choice (keyboard and click opening). */
export function setDropdown(dd: HTMLElement, open: boolean, focus = false) {
  const { btn, menu, items } = parts(dd);
  menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
  if (open && focus) (items.find((i) => i.getAttribute('aria-checked') === 'true') ?? items[0]).focus();
}

/** Shows `v` as the chosen value (checked choice, button text and the button's accessible name). */
export function setDropdownValue(dd: HTMLElement, v: string) {
  const { btn, menu, items } = parts(dd);
  items.forEach((i) => i.setAttribute('aria-checked', String(i.dataset.value === v)));
  dd.querySelector('[data-sb-dd-value]')!.textContent = v;
  btn.setAttribute('aria-label', `${menu.getAttribute('aria-label')}: ${v}`);
}

/** Wires a set of dropdowns. Only one is open at a time. `onPick` gets the dropdown and the picked value. */
export function bindDropdowns(dds: HTMLElement[], onPick: (dd: HTMLElement, v: string) => void, focusOnOpen = false) {
  dds.forEach((dd) => {
    const { btn, menu, items } = parts(dd);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      dds.forEach((d) => d !== dd && setDropdown(d, false));
      setDropdown(dd, open, focusOnOpen);
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setDropdown(dd, true, true); } else if (e.key === 'Escape') setDropdown(dd, false); });
    items.forEach((i) => i.addEventListener('click', () => { setDropdownValue(dd, i.dataset.value!); setDropdown(dd, false); btn.focus(); onPick(dd, i.dataset.value!); }));
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { setDropdown(dd, false); btn.focus(); return; }
      const n = items.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(n + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus(); }
    });
  });
  document.addEventListener('click', (e) => dds.forEach((dd) => { if (!dd.contains(e.target as Node)) setDropdown(dd, false); }));
}
