# CodeTeller design system

The interface should feel like a calm architecture workbench: approachable and visual, but not toy-like. Keep the same color meanings in both themes and use color together with labels and shapes.

## Color palette

### Light theme

| Role | Color | Usage |
| --- | --- | --- |
| Canvas | `#F6F4EF` | Main page background |
| Sidebar | `#FBFAF7` | Mission panel |
| Surface | `#FFFFFF` | Cards and controls |
| Subtle surface | `#F5F7F6` | Code and secondary controls |
| Primary text | `#242A35` | Headings and important copy |
| Secondary text | `#4C5664` | Body copy |
| Muted text | `#65707B` | Labels and secondary information |
| Core / application | `#005B96` | Application core and primary actions |
| Contract surface | `#EAF2F8` | Contracts and abstractions |
| Implementation | `#286575` | Concrete implementations |
| Implementation surface | `#E8F0F0` | Implementation cards and highlights |
| Warning | `#C65D4D` | Coupling and incomplete states |
| Success | `#28745F` | Passing checks |

### Dark theme

| Role | Color | Usage |
| --- | --- | --- |
| Canvas | `#171C21` | Main page background |
| Sidebar | `#1B2228` | Mission panel |
| Surface | `#20272E` | Cards and controls |
| Subtle surface | `#293139` | Secondary controls |
| Primary text | `#E8EEF1` | Headings and important copy |
| Secondary text | `#C4CDD3` | Body copy |
| Muted text | `#9AA6AD` | Labels and secondary information |
| Core / application | `#8BC7E7` | Application core and contracts |
| Primary action | `#07527D` | Buttons with light text |
| Implementation | `#8AC9BC` | Concrete implementations |
| Warning | `#F09584` | Coupling and incomplete states |
| Success | `#8BD2AC` | Passing checks |

The dark theme uses its own surface and accent values; it is not a simple inversion of the light theme. Shared semantic roles are defined as CSS custom properties in `src/index.css`.

## Typography

- **DM Sans** is used for the interface, headings, and explanatory text. Use regular weight for body copy, medium/semibold for controls and headings, and bold sparingly for labels.
- **JetBrains Mono** is reserved for code snippets, identifiers, and inline code.
- Both fonts are loaded in `index.html`; their CSS stacks are defined in `src/index.css`.

When adding component styles, use the shared custom properties instead of introducing near-duplicate colors. Check text contrast in both themes, especially for small labels.
