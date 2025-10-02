## 1. Icon Registry Updates

- [x] 1.1 Add missing Lucide icons to shared/iconography/registry.ts (link,
      briefcase)
- [x] 1.2 Add missing Simple Icons to shared/iconography/registry.ts (sveltekit,
      nuxt, nextdotjs, vapor, gin, actix, remix, docker)
- [x] 1.3 Add icon renderers to client/src/lib/icon-registry.tsx for all new
      icons
- [x] 1.4 Verify all icons render correctly with test command outputs

## 2. Database Command Template Updates

- [x] 2.1 Update whoami command template (replace GitHub: with lucide/link icon,
      Status: with lucide/hammer icon)
- [x] 2.2 Update help command template (remove emoji tip, update heading,
      replace section headers with icons)
- [x] 2.3 Update ls command template (change numbered list to bullet list with
      lucide/dot icons)
- [x] 2.4 Update grep command template (abbreviate heading, replace all labels
      with icon tokens)
- [x] 2.5 Write database migration SQL file with all template updates

## 3. Recent Projects Pane Layout Fix

- [x] 3.1 Locate Recent Projects pane component in
      client/src/components/terminal/system-info-pane.tsx
- [x] 3.2 Compare layout with Personal Website pane to identify differences
- [x] 3.3 Fix API schema and component to properly handle tech_stack array
- [ ] 3.4 Test pane displays correctly at various zoom levels

## 4. Validation

- [x] 4.1 Run TypeScript type checking (npm run check:types)
- [x] 4.2 Run ESLint (npm run check:lint)
- [x] 4.3 Run Prettier format check (npm run check:format)
- [ ] 4.4 Test all terminal commands render icons correctly in browser
- [ ] 4.5 Verify Recent Projects pane layout is fixed in browser
