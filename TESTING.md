# Testing Tutorial

This guide covers how to run and write tests for the Video to Ingredients project.

## 🚀 Quick Start

### API (Backend)
The API uses [Vitest](https://vitest.dev/) for unit and integration testing.

```bash
cd apps/api
npm run test
```

### Mobile (Frontend)
The mobile app uses [Jest](https://jestjs.io/) with [Jest Expo](https://docs.expo.dev/develop/unit-testing/) and [React Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/).

```bash
cd apps/mobile
npm run test
```

---

## 📱 Mobile Best Practices (Skill-Aligned)

When testing components in the mobile app, we follow the best practices defined in our [React Native Skills](.agents/skills/vercel-react-native-skills/SKILL.md).

### 1. Snapshot Testing
Use snapshots sparingly. They are great for ensuring large components don't change unexpectedly, but can be brittle.

### 2. Component Testing (React Testing Library)
Prefer testing behavior over implementation.

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import MyButton from './MyButton';

test('calls onPress when clicked', () => {
  const onPress = jest.fn();
  render(<MyButton onPress={onPress} title="Click Me" />);
  
  fireEvent.press(screen.getByText('Click Me'));
  expect(onPress).toHaveBeenCalled();
});
```

### 3. Performance-Aware Testing
Referencing `vercel-react-native-skills`, ensure you are testing that high-performance components are used:
- **`list-performance-virtualize`**: Verify that `FlashList` is used for long lists instead of `FlatList`.
- **`ui-expo-image`**: Verify that `expo-image` is used for optimized image rendering.

### 4. Native Mocking
Since we use many Expo modules (SecureStore, Clipboard, etc.), use the provided mocks in `jest-expo` or define your own in a `jest.setup.js`.

---

## 🛠 Backend (API) Best Practices

### 1. Database Mocking
We use Drizzle ORM. For unit tests, mock the database connection to avoid side effects.

### 2. Integration Tests
For critical paths like authentication, use integration tests that hit a local database (if available) or use heavy mocking to simulate the full request/response cycle in Hono.

---

## 📋 Checklist for New Tests
- [ ] Test covers the "happy path".
- [ ] Test covers edge cases (empty states, errors).
- [ ] Component tests are accessible (use `getByRole` or `getByText` where possible).
- [ ] API tests verify both status codes and response bodies.
- [ ] Performance-critical mobile components use `FlashList` and `expo-image`.
