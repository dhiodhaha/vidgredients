# Toast Notification Skill

Toast notifications provide lightweight feedback for user actions. This skill covers the complete implementation pattern for integrating toast notifications into React Native components.

## When to Use

- Confirm successful actions (recipe added, meal plan generated)
- Notify errors without blocking the UI
- Display brief informational messages
- Provide non-intrusive user feedback

## Components & Hooks

### Toast Component (`Toast.tsx`)

The visual Toast component that renders the notification.

**Props:**
- `message: string` - The notification text
- `type?: 'success' | 'error' | 'info' | 'warning'` - Toast variant (default: 'info')
- `duration?: number` - Display duration in ms (default: 3000)
- `onDismiss: () => void` - Callback when toast closes

**Example:**
```tsx
<Toast
  message="Recipe added successfully!"
  type="success"
  duration={3000}
  onDismiss={() => setShowToast(false)}
/>
```

### useToast Hook (`hooks/useToast.ts`)

React hook for managing toast state and showing notifications.

**Returns:**
- `toasts: ToastMessage[]` - Current toast queue
- `show(message, options?)` - Show generic toast
- `success(message, duration?)` - Show success toast
- `error(message, duration?)` - Show error toast
- `warning(message, duration?)` - Show warning toast
- `info(message, duration?)` - Show info toast
- `dismiss(id)` - Remove specific toast

## Basic Pattern

### Step 1: Add Hook to Component

```tsx
import { useToast } from '../../hooks/useToast';

export function MyRecipeComponent() {
  const { toasts, show, success, error, dismiss } = useToast();
  // ...
}
```

### Step 2: Render Toast Queue

```tsx
return (
  <>
    <View style={styles.content}>
      {/* Component content */}
    </View>

    {/* Render toasts */}
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onDismiss={() => dismiss(toast.id)}
      />
    ))}
  </>
);
```

### Step 3: Trigger Toasts from Actions

```tsx
const handleAddRecipe = async () => {
  try {
    await addRecipe(recipe);
    success('Recipe added successfully!');
  } catch (error) {
    error('Failed to add recipe');
  }
};
```

## Common Use Cases

### Async Action Feedback

```tsx
const { success, error } = useToast();

const handleAnalyzeVideo = async () => {
  try {
    setIsLoading(true);
    const result = await analyzeVideo(url);
    success('Video analyzed successfully!');
    return result;
  } catch (err) {
    error(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Form Validation

```tsx
const { warning } = useToast();

const handleSubmit = () => {
  if (!formData.title) {
    warning('Recipe title is required');
    return;
  }
  // Submit...
};
```

### Batch Operations

```tsx
const { success } = useToast();

const handleMultipleActions = async () => {
  try {
    await Promise.all([
      action1(),
      action2(),
      action3(),
    ]);
    success('All operations completed!');
  } catch (err) {
    error('One or more operations failed');
  }
};
```

## Styling

Toast types have predefined color schemes:

| Type    | Background | Icon              | Usage                   |
| ------- | ---------- | ----------------- | ----------------------- |
| success | Green      | CheckCircle       | Successful actions      |
| error   | Red        | AlertCircle       | Failures, errors        |
| info    | Blue       | Info              | General information     |
| warning | Amber      | AlertCircle       | Warnings, validations   |

## Best Practices

### ✅ DO

- Use success toasts after async operations complete
- Show error toasts with helpful messages
- Keep messages brief and actionable
- Use appropriate duration (3-5 seconds typical)
- Stack multiple toasts if needed

### ❌ DON'T

- Override toast duration < 1000ms (too fast to read)
- Show same toast multiple times (batch into one)
- Use toasts for critical confirmations (use Modal instead)
- Show more than 3 toasts simultaneously
- Include long technical error messages (summarize)

## Integration with AddVideoModal

The AddVideoModal component shows errors directly in the UI, but you can enhance it with toasts:

```tsx
const { success, error } = useToast();

const handleSubmit = async () => {
  try {
    await onSubmit(url);
    success('Recipe extracted successfully!');
    onClose();
  } catch (err) {
    error('Failed to extract recipe');
  }
};
```

## Accessibility

- Toast messages announce automatically on screen readers
- Include close button for dismissal
- Don't rely solely on color (icon + text)
- Sufficient contrast ratios for text

## Performance Considerations

- Toasts use Reanimated for smooth animations
- Only active toasts render in the queue
- Automatic cleanup on dismiss
- No memory leaks from timers

## Framework Rules

Follows the vercel-react-native-skills rules:
- Uses Reanimated for animations (gpu-properties)
- Implements proper memo patterns
- Leverages useSharedValue for animation state
- Follows React Native best practices
