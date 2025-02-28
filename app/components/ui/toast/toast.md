## Usage

### Showing Toasts

Use the `showToast` function to display notifications:

```tsx
// Basic toast with title and description
showToast({
  emoji: '✅',
  title: 'Success!',
  description: 'Your changes have been saved',
  duration: 3000,
});

// Toast with action link
showToast({
  emoji: '🔔',
  title: 'New Notification',
  description: 'You have a new message',
  actionLink: '/messages',
  actionText: 'View',
  duration: 5000,
});
```

## Component API

### `CustomToaster`

Component that renders the toast container.

#### Props

| Prop     | Type   | Description                                                                                                                         | Default     |
| -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| position | string | Position of the toast on the screen. Options: 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right' | 'top-right' |

### `showToast`

Function that displays a toast notification.

#### Parameters

| Parameter   | Type   | Description                                                | Default |
| ----------- | ------ | ---------------------------------------------------------- | ------- |
| emoji       | string | Emoji to be displayed on the left side of the toast        | -       |
| title       | string | Main title of the toast                                    | -       |
| description | string | Additional description text                                | -       |
| actionLink  | string | URL for the action button to navigate to                   | -       |
| actionText  | string | Text for the action button                                 | -       |
| duration    | number | How long the toast should remain visible (in milliseconds) | 1000    |

## Features

### Conditional Dismiss Button

- When both `actionLink` and `actionText` are provided, the "OK" dismiss button is automatically hidden
- When no action is provided, an "OK" button is shown to dismiss the toast

## Examples

### Success Notification

```tsx
showToast({
  emoji: '✅',
  title: 'Success',
  description: 'Your profile has been updated',
  duration: 3000,
});
```

### Notification with Action

```tsx
showToast({
  emoji: '📢',
  title: 'New Feature',
  description: 'Check out our latest feature update',
  actionLink: '/whats-new',
  actionText: 'Learn More',
  duration: 5000,
});
```

## Customization

You can customize the toast appearance by modifying the TailwindCSS classes in the `CustomToast.tsx` file.
