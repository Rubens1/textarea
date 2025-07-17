# Pure JS Rich Text Editor

A modern, CKEditor-like rich text editor built with **pure HTML, CSS, and JavaScript**. Easily inject the editor into any `<div>` by ID, making it a plug-and-play component for any web project—no frameworks required.

## Features

- **Toolbar** with bold, italic, underline, strikethrough, alignment, lists, undo/redo, font family/size, colors, and more
- **Image support**: paste images (Ctrl+V), resize with handles (Photoshop-like UX), maintain aspect ratio or distort
- **Link and image modals** for easy insertion
- **Placeholder** when editor is empty
- **Keyboard shortcuts** (Ctrl+B/I/U/Z/Y/A)
- **Fully customizable** via CSS and HTML
- **No dependencies** (except optional FontAwesome for icons)

## Project Structure

```
project-root/
│
├── ckeditor/
│   ├── editor.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js   
├── js/
│   └── injetarEditor.js   # (optional, for your own integration)
├── index.html
├── README.md
```

- All editor source files are inside the `ckeditor/` folder.
- Use the correct paths in your HTML and scripts (e.g., `ckeditor/js/injetarEditor.js`).

## Usage

### 1. Prepare Your HTML
Add a container div where you want the editor:

```html
<div id="myEditor"></div>
```

### 2. Inject the Editor via JavaScript
Use the provided loader script to load the editor dynamically:

```html
<script src="ckeditor/js/injetarEditor.js"></script>
<script>
  injetarEditor('myEditor');
</script>
```

This will:
- Fetch the editor HTML and inject it into the div
- Dynamically load the required CSS and FontAwesome
- Dynamically load and initialize the editor JavaScript

### 3. Customization
- **Toolbar**: Edit `ckeditor/editor.html` to add/remove buttons or features
- **Styles**: Edit `ckeditor/css/styles.css` for custom look and feel
- **Icons**: Uses FontAwesome CDN (can be replaced or removed)

### 4. Features in Detail
- **Paste images**: Ctrl+V to insert images as base64
- **Resize images**: Click image to show handles, drag to resize (corners = aspect ratio, sides = free)
- **Formatting**: Bold, italic, underline, strikethrough, lists, alignment, colors, font family/size
- **Modals**: For inserting links and images
- **Placeholder**: Shows when editor is empty
- **Keyboard shortcuts**: Ctrl+B/I/U/Z/Y/A

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR for improvements or bug fixes.

## License
MIT License. Free for personal and commercial use. 

<img width="1905" height="927" alt="image" src="https://github.com/user-attachments/assets/4f378f07-45f4-48ae-be87-6530ccba9932" />
