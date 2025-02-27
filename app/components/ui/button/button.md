# Button Component

A highly customizable, accessible button component with support for multiple variants, sizes, and responsive behavior.

![Button Variants](https://github.com/user-attachments/assets/c4f05aff-4d81-4c9d-87ac-8ca07b411bd9)

## Importing

```tsx
import * as Button from '~/components/ui/button';
```

## Props

### Button.Root

| Prop         | Type                                              | Default     | Description                                              |
| ------------ | ------------------------------------------------- | ----------- | -------------------------------------------------------- |
| `variant`    | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Controls the visual style of the button                  |
| `size`       | `'lg' \| 'md' \| 'sm'`                            | `'md'`      | Determines the button's height and text size             |
| `responsive` | `boolean`                                         | `false`     | When true, text size adjusts based on screen width       |
| `asChild`    | `boolean`                                         | `false`     | Merges props onto child instead of rendering a button    |
| `className`  | `string`                                          | -           | Additional CSS classes to apply                          |
| ...others    | `ButtonHTMLAttributes<HTMLButtonElement>`         | -           | All standard button attributes (onClick, disabled, etc.) |

### Button.Icon

| Prop        | Type          | Default | Description                                               |
| ----------- | ------------- | ------- | --------------------------------------------------------- |
| `as`        | `ElementType` | `'div'` | The component or HTML element to render                   |
| `className` | `string`      | -       | Additional CSS classes to apply                           |
| `children`  | `ReactNode`   | -       | Icon content (optional if using `as` with icon component) |

## Variants

### Primary

The main call-to-action button with high visual prominence.

- Black background with white text
- Hover: 80% opacity
- Focus: Black outline with offset

### Secondary

Used for secondary actions with medium visual prominence.

- Light gray background with black text
- Hover: 80% opacity
- Focus: Gray outline with offset

### Ghost

For subtle actions that don't need visual emphasis.

- Transparent background with black text
- Hover: Light gray background
- Focus: Gray outline

### Danger

For destructive actions that need warning emphasis.

- Red background with white text
- Hover: 80% opacity
- Focus: Red outline with offset

## Sizes

| Size | Height      | Text Style   | Use Case                      |
| ---- | ----------- | ------------ | ----------------------------- |
| `lg` | 56px (h-14) | text-body-lg | Hero buttons, primary CTAs    |
| `md` | 48px (h-12) | text-body-md | Standard buttons (default)    |
| `sm` | 40px (h-10) | text-body-sm | Compact UI, secondary actions |

## Width Handling

Button widths are **not pre-defined** in the component. This provides flexibility to handle different design requirements:

- For specific widths, use `className="w-[130px]"` or similar
- For full-width buttons, use `className="w-full"`
- For padding-based widths, use `className="px-4"` or responsive variants like `className="sm:px-6 px-4"`

## Responsive Text

The component includes a `responsive` prop that automatically scales text size based on screen width:

| Size | Small Screen | ≥640px (sm breakpoint) |
| ---- | ------------ | ---------------------- |
| `lg` | text-body-md | text-body-lg           |
| `md` | text-body-sm | text-body-md           |
| `sm` | text-body-sm | text-body-sm           |

To enable responsive text:

```tsx
<Button.Root size='md' responsive>
  Responsive Text Button
</Button.Root>
```

## Using Icons

Icons can be added in two ways:

1. **Using an Icon Component**:

```tsx
<Button.Root>
  <Button.Icon as={PlusIcon} />
  Add Item
</Button.Root>
```

2. **Using Custom Children**:

```tsx
<Button.Root>
  <Button.Icon>
    <svg>...</svg>
  </Button.Icon>
  With Custom Icon
</Button.Root>
```

## Examples

### Basic Usage

```tsx
// Primary button (default)
<Button.Root>
  Submit
</Button.Root>

// Secondary button
<Button.Root variant="secondary">
  Cancel
</Button.Root>

// Danger button
<Button.Root variant="danger">
  Delete
</Button.Root>

// Ghost button
<Button.Root variant="ghost">
  Learn More
</Button.Root>
```

### With Icons

```tsx
// Primary button with icon on the right (typical for primary actions)
<Button.Root>
  Next Step
  <Button.Icon as={ArrowRightIcon} />
</Button.Root>

// Secondary button with icon on the left (typical for secondary actions)
<Button.Root variant="secondary">
  <Button.Icon as={BackArrowIcon} />
  Previous Step
</Button.Root>
```

### Sizes

```tsx
// Large button
<Button.Root size="lg">
  Create Account
</Button.Root>

// Medium button (default)
<Button.Root size="md">
  Sign In
</Button.Root>

// Small button
<Button.Root size="sm">
  Edit
</Button.Root>
```

### Custom Width

```tsx
// Full width
<Button.Root className="w-full">
  Continue
</Button.Root>

// Fixed width
<Button.Root className="w-[180px]">
  Centered Text
</Button.Root>

// Padding-based
<Button.Root className="px-8">
  Extra Padding
</Button.Root>

// Responsive padding
<Button.Root className="sm:px-6 px-4">
  Adaptive Width
</Button.Root>
```

### With Responsive Text

```tsx
<Button.Root size='lg' responsive>
  This text will be smaller on mobile devices
</Button.Root>
```

### Disabled State

```tsx
<Button.Root disabled>Cannot Proceed</Button.Root>
```

## Best Practices

1. **Width considerations**: Avoid fixed widths when possible to accommodate different text lengths and translations. Use padding for more natural sizing.

2. **Responsive behavior**: Use the responsive prop for buttons that appear in both mobile and desktop layouts to ensure appropriate text sizing.
