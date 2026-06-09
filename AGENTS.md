Expo web is not used in this project.

## Foundation Docs

When changing UI, design-system primitives, or product copy, reference these project-adapted foundation docs:

- [Elevation](docs/foundation/elevation.md)
- [Iconography](docs/foundation/iconography.md)
- [International Design](docs/foundation/international-design.md)
- [Loading](docs/foundation/loading.md)
- [State](docs/foundation/state.md)
- [Voice and Tone](docs/foundation/voice-and-tone.md)
- [Writing](docs/foundation/writing.md)

## Layout

Build layouts only with `Box`, `Flex`, `Grid`, `VStack`, `HStack`, and `Float`.

- In `components/**`, prefer Layout component props. Style overrides are allowed only for component-local visual expression that cannot be represented by tokens.
- In `app/**` and `pages/**`, do not use `style` overrides for layout or visual styling outside Layout component props.
- Use design tokens for spacing, sizing, color, radius, and shadow values. Avoid raw visual numbers such as `gap={6}`, `padding: 16`, or `borderRadius: 8`.
- Raw numbers are allowed only for structural values such as `flex={1}`, `columns={2}`, `zIndex`, and `maxLines`.

Bad:

```tsx
<View style={{ display: 'flex', gap: 8, padding: 16 }} />
<Box style={{ marginTop: 16, borderRadius: 8 }} />
```

Good:

```tsx
<VStack gap="x2" p="spacingX.globalGutter">
  <HStack justify="spaceBetween">
    <Grid columns={2} gap="x2" />
  </HStack>
</VStack>
```

If an expression is difficult with existing Layout props or tokens, ask before adding an ad hoc implementation.
