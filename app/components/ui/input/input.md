# Input Component

A customizable, accessible text input component with support for labels and icons.

## Importing

```tsx
import * as Input from '~/components/ui/input';
```

## Props

### Input.Root

| Prop        | Type                             | Default | Description                              |
| ----------- | -------------------------------- | ------- | ---------------------------------------- |
| `className` | `string`                         | -       | Additional CSS classes to apply          |
| `children`  | `ReactNode`                      | -       | The label, wrapper, and input components |
| ...others   | `HTMLAttributes<HTMLDivElement>` | -       | All standard div attributes              |

### Input.Label

| Prop        | Type                                    | Default | Description                               |
| ----------- | --------------------------------------- | ------- | ----------------------------------------- |
| `htmlFor`   | `string`                                | -       | ID of the input element this label is for |
| `className` | `string`                                | -       | Additional CSS classes to apply           |
| `children`  | `ReactNode`                             | -       | Label text content                        |
| ...others   | `LabelHTMLAttributes<HTMLLabelElement>` | -       | All standard label attributes             |

### Input.Input

| Prop        | Type                                    | Default  | Description                                          |
| ----------- | --------------------------------------- | -------- | ---------------------------------------------------- |
| `type`      | `string`                                | `'text'` | Input type (text, email, password, etc.)             |
| `className` | `string`                                | -        | Additional CSS classes to apply                      |
| `asChild`   | `boolean`                               | `false`  | Merges props onto child instead of creating an input |
| ...others   | `InputHTMLAttributes<HTMLInputElement>` | -        | All standard input attributes                        |

### Input.Wrapper

| Prop        | Type                             | Default | Description                     |
| ----------- | -------------------------------- | ------- | ------------------------------- |
| `className` | `string`                         | -       | Additional CSS classes to apply |
| `children`  | `ReactNode`                      | -       | Icon and input components       |
| ...others   | `HTMLAttributes<HTMLDivElement>` | -       | All standard div attributes     |

### Input.Icon

| Prop        | Type          | Default | Description                             |
| ----------- | ------------- | ------- | --------------------------------------- |
| `as`        | `ElementType` | `'div'` | The component or HTML element to render |
| `className` | `string`      | -       | Additional CSS classes to apply         |
| ...others   | -             | -       | Props for the specified element type    |

## Styling

The Input component uses a consistent styling approach with:

- **Gradient background**: `bg-gradient-1`
- **Text**: `text-body-md text-neutral-02`
- **Padding**: `py-3 px-3.5`
- **Border radius**: `rounded-xl`
- **Label**: `text-body-sm font-semibold text-neutral-01`

## Examples

### Basic Usage

```tsx
<Input.Root>
  <Input.Label htmlFor='email'>Email Address</Input.Label>
  <Input.Input id='email' type='email' placeholder='example@domain.com' />
</Input.Root>
```

### With Icon

```tsx
<Input.Root>
  <Input.Label htmlFor='search'>Search</Input.Label>
  <Input.Wrapper>
    <Input.Icon as={SearchIcon} />
    <Input.Input id='search' type='search' placeholder='Search for something...' />
  </Input.Wrapper>
</Input.Root>
```

### With Additional Props

```tsx
<Input.Root>
  <Input.Label htmlFor='password'>Password</Input.Label>
  <Input.Input id='password' type='password' placeholder='Enter your password' minLength={8} required />
</Input.Root>
```

### Combined with Other Form Elements

```tsx
<form onSubmit={handleSubmit}>
  <Input.Root className='mb-4'>
    <Input.Label htmlFor='username'>Username</Input.Label>
    <Input.Input id='username' type='text' placeholder='Choose a username' />
  </Input.Root>

  <Button.Root type='submit'>Register</Button.Root>
</form>
```

## Best Practices

1. **Always use labels**: Provide a label for every input for better accessibility.

2. **Use appropriate types**: Use the correct input type (email, password, number, etc.) to provide the right keyboard on mobile devices.

3. **Use wrapper for icons**: When adding an icon, always wrap the input in the `Input.Wrapper` component.

4. **Form validation**: Add appropriate validation attributes (required, minLength, pattern) to improve form usability.

5. **Connect labels to inputs**: Always use the `htmlFor` attribute on labels and corresponding `id` on inputs to connect them for accessibility.
